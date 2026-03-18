from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes.enhance import router as enhance_router
from app.routes.house_validation import router as house_validation_router
from app.queue.consumer import start_consumer
import threading
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()
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
app.include_router(house_validation_router, prefix="/api")

