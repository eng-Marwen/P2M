"""Prometheus metrics for FastAPI, designed for Kubernetes."""
import os
import time

from fastapi import FastAPI
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    Counter,
    Gauge,
    Histogram,
    Info,
    generate_latest,
    multiprocess,
)
from starlette.responses import Response
from starlette.types import ASGIApp, Message, Receive, Scope, Send

# --------------------------------------------------------------------------- #
# HTTP metrics
# --------------------------------------------------------------------------- #
LATENCY_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10)
SIZE_BUCKETS = (100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000)

HTTP_REQUESTS = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)
HTTP_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
    buckets=LATENCY_BUCKETS,
)
HTTP_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "HTTP requests currently being processed",
    ["method"],
    multiprocess_mode="livesum",
)
HTTP_REQUEST_SIZE = Histogram(
    "http_request_size_bytes",
    "HTTP request body size (Content-Length)",
    ["method", "path"],
    buckets=SIZE_BUCKETS,
)
HTTP_RESPONSE_SIZE = Histogram(
    "http_response_size_bytes",
    "HTTP response body size",
    ["method", "path"],
    buckets=SIZE_BUCKETS,
)
HTTP_EXCEPTIONS = Counter(
    "http_unhandled_exceptions_total",
    "Unhandled exceptions raised while serving requests",
    ["method", "path", "exception"],
)

APP_INFO = Info("app", "Application information")

# --------------------------------------------------------------------------- #
# Custom metrics (examples: adapt or delete)
# --------------------------------------------------------------------------- #
DEPENDENCY_LATENCY = Histogram(
    "dependency_call_duration_seconds",
    "Latency of calls to downstream dependencies (DB, cache, external APIs)",
    ["dependency", "operation"],
    buckets=LATENCY_BUCKETS,
)
DEPENDENCY_ERRORS = Counter(
    "dependency_call_errors_total",
    "Failed calls to downstream dependencies",
    ["dependency", "operation"],
)
BUSINESS_EVENTS = Counter(
    "business_events_total",
    "Domain events (orders created, logins, etc.)",
    ["event"],
)


# --------------------------------------------------------------------------- #
# Middleware
# --------------------------------------------------------------------------- #
class PrometheusMiddleware:
    """Pure ASGI middleware (safe with streaming, unlike BaseHTTPMiddleware)."""

    def __init__(self, app: ASGIApp, excluded_paths: tuple[str, ...] = ()) -> None:
        self.app = app
        self.excluded_paths = set(excluded_paths)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["path"] in self.excluded_paths:
            await self.app(scope, receive, send)
            return

        method = scope["method"]
        status = 500
        response_size = 0
        request_size = 0
        for name, value in scope.get("headers", []):
            if name == b"content-length":
                try:
                    request_size = int(value)
                except ValueError:
                    pass
                break

        async def send_wrapper(message: Message) -> None:
            nonlocal status, response_size
            if message["type"] == "http.response.start":
                status = message["status"]
            elif message["type"] == "http.response.body":
                response_size += len(message.get("body", b""))
            await send(message)

        HTTP_IN_PROGRESS.labels(method).inc()
        start = time.perf_counter()
        exception_name = None
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            exception_name = type(exc).__name__
            raise
        finally:
            duration = time.perf_counter() - start
            # The route is only known after routing has run. Use the template
            # (/items/{id}) instead of the raw path to keep label cardinality low.
            route = scope.get("route")
            path = getattr(route, "path", None) or "unmatched"

            HTTP_IN_PROGRESS.labels(method).dec()
            HTTP_REQUESTS.labels(method, path, str(status)).inc()
            HTTP_LATENCY.labels(method, path).observe(duration)
            HTTP_REQUEST_SIZE.labels(method, path).observe(request_size)
            HTTP_RESPONSE_SIZE.labels(method, path).observe(response_size)
            if exception_name:
                HTTP_EXCEPTIONS.labels(method, path, exception_name).inc()


# --------------------------------------------------------------------------- #
# Endpoint + setup
# --------------------------------------------------------------------------- #
def _render_metrics() -> Response:
    if os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        # Only needed with several workers per pod. Aggregates across processes.
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
        data = generate_latest(registry)
    else:
        data = generate_latest()
    return Response(data, media_type=CONTENT_TYPE_LATEST)


def setup_metrics(
    app: FastAPI,
    app_name: str = "fastapi-app",
    version: str = "0.0.0",
    endpoint: str = "/metrics",
    excluded_paths: tuple[str, ...] = ("/healthz", "/readyz"),
) -> None:
    """Attach the middleware and the /metrics endpoint to `app`."""
    APP_INFO.info(
        {
            "name": app_name,
            "version": version,
            "pod": os.environ.get("HOSTNAME", "unknown"),
        }
    )
    app.add_middleware(
        PrometheusMiddleware, excluded_paths=(endpoint, *excluded_paths)
    )
    app.add_api_route(
        endpoint, _render_metrics, methods=["GET"], include_in_schema=False
    )