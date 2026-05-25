import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.pokemon.router import router as pokemon_router

logging.basicConfig(level=logging.INFO)


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


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

