import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.upload import router as upload_router
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router
from app.routers.settings import router as settings_router
from app.routers.analytics import router as analytics_router

def create_app() -> FastAPI:
    app = FastAPI(title="AI Research Assistant Backend")
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth_router)
    app.include_router(upload_router)
    app.include_router(chat_router)
    app.include_router(analytics_router)
    app.include_router(settings_router)
    return app

app = create_app()