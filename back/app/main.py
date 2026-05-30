import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.generations.router import router as generations_router
from app.image_generation.router import router as image_generation_router
from app.pokemon.router import router as pokemon_router

logging.basicConfig(level=logging.INFO)

public_user_files_dir = Path(settings.user_files_dir) / "public"
public_user_files_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Trade API",
    description="Minimal API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pokemon_router)
app.include_router(image_generation_router)
app.include_router(generations_router)
app.mount("/user-files", StaticFiles(directory=public_user_files_dir), name="user-files")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
