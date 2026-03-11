from fastapi import FastAPI
from app.routes.enhance import router as enhance_router

app = FastAPI()

app.include_router(enhance_router, prefix="/api")