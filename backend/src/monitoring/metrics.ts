import client from "prom-client";

const { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } = client;

// Dedicated Prometheus registry for the Samsar backend
export const register = new Registry();

// Collect Node.js and process metrics automatically
collectDefaultMetrics({
  register,
  prefix: "samsar_backend_",
});

// ─────────────────────────────────────────────
// HTTP Requests
// ─────────────────────────────────────────────

export const httpRequestsTotal = new Counter({
  name: "samsar_backend_http_requests_total",
  help: "Total number of HTTP requests received by the backend",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// ─────────────────────────────────────────────
// HTTP Request Duration
// ─────────────────────────────────────────────

export const httpRequestDuration = new Histogram({
  name: "samsar_backend_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [
    0.005,
    0.01,
    0.025,
    0.05,
    0.1,
    0.25,
    0.5,
    1,
    2.5,
    5,
    10,
  ],
  registers: [register],
});

// ─────────────────────────────────────────────
// Active Requests
// ─────────────────────────────────────────────

export const httpActiveRequests = new Gauge({
  name: "samsar_backend_http_active_requests",
  help: "Number of HTTP requests currently being processed",
  registers: [register],
});