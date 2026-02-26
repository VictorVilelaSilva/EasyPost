"""EasyPost Authentication Backend — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.firebase import initialize_firebase

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown events."""
    # Startup
    settings = get_settings()
    logger.info("Initializing Firebase Admin SDK...")

    try:
        initialize_firebase()
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.warning(
            f"Firebase initialization failed: {e}. "
            "Auth endpoints will not work until Firebase is properly configured."
        )

    yield

    # Shutdown
    logger.info("Shutting down...")


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""
    settings = get_settings()

    app = FastAPI(
        title="EasyPost Auth API",
        description="Authentication backend for EasyPost — Firebase Authentication integration",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware — allows the Next.js frontend to make requests
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check (no auth required)
    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Health check endpoint."""
        return {"status": "healthy"}

    # Include API v1 router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


# Application instance used by uvicorn
app = create_app()
