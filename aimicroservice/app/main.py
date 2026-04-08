from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes.enhance import router as enhance_router
from app.routes.house_price import router as house_price_router
from app.routes.house_validation import router as house_validation_router
from app.routes.rag import router as rag_router
from app.queue.consumer import start_consumer
from app.queue.rabbitmq import check_rabbitmq_connection
from app.services.model_bootstrap import ensure_all_models_available
from app.databases.qdrant import check_qdrant_connection
from app.databases.redis import check_redis_connection
import threading
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Ensuring AI models are available...")
    try:
        ensure_all_models_available()
        print("[Startup] Model availability check passed")
        print("[Startup] Running external services connectivity checks...")
        check_rabbitmq_connection()
        check_qdrant_connection()
        await check_redis_connection()
        print("[Startup] Qdrant connected successfully")
        print("[Startup] All connectivity checks passed")
    except Exception as exc:
        print(f"[Startup] Connectivity check failed: {exc}")
        raise

    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
    print("[Startup] RabbitMQ consumer thread started")
    yield


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CLIENT_URL", "http://localhost:5173"),  # HTTP Frontend URL
        os.getenv("CLIENT_URL_HTTPS", "https://localhost:5173")  # HTTPS Frontend URL
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  # HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(enhance_router, prefix="/api")
app.include_router(house_price_router, prefix="/api")
app.include_router(house_validation_router, prefix="/api")
app.include_router(rag_router, prefix="/api")

