import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.image_generation.prompt import build_pokemon_prompt
from app.image_generation.schemas import ImageGenerationResponse, PokemonImageGenerationInput
from app.image_generation.service import (
    OpenAIImageGenerationError,
    OpenAIImageGenerationTimeout,
    generate_image_with_reference,
)

router = APIRouter(prefix="/image-generations", tags=["image-generations"])


@router.post("/pokemon", response_model=ImageGenerationResponse)
async def generate_pokemon_image(
    reference_image: UploadFile = File(...),
    trainer_name: str = Form("Portugal"),
    background: str = Form("#1A1A2E"),
    image_format: str = Form("Quadrado 1:1"),
    badges_enabled: bool = Form(True),
    outfit_mode: str = Form("photo"),
    torso: str = Form("Jaqueta tática verde escura"),
    legs: str = Form("Calça cargo preta"),
    shoes: str = Form("Tênis técnico branco"),
    hat: str = Form(""),
    glasses: str = Form("Sem óculos"),
    pokemon: str = Form("[]"),
    size: str = Form("1024x1024"),
    quality: str = Form("high"),
    output_format: str = Form("png"),
) -> ImageGenerationResponse:
    image_bytes = await reference_image.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail="reference_image is required")

    content_type = reference_image.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="reference_image must be an image")

    try:
        request_data = PokemonImageGenerationInput(
            trainer_name=trainer_name,
            background=background,
            image_format=image_format,
            badges_enabled=badges_enabled,
            outfit={
                "mode": outfit_mode,
                "torso": torso,
                "legs": legs,
                "shoes": shoes,
                "hat": hat,
                "glasses": glasses,
            },
            pokemon=json.loads(pokemon),
            size=size,
            quality=quality,
            output_format=output_format,
        )
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    prompt = build_pokemon_prompt(request_data)

    try:
        return await generate_image_with_reference(
            image_bytes=image_bytes,
            image_filename=reference_image.filename or "reference.png",
            image_content_type=content_type,
            prompt=prompt,
            request_data=request_data,
        )
    except OpenAIImageGenerationTimeout as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except OpenAIImageGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
