import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.firebase.dependencies import get_current_user
from app.image_generation.prompt import build_pokemon_prompt
from app.image_generation.schemas import (
    ImageGenerationResponse,
    PokemonImageGenerationInput,
)
from app.image_generation.service import (
    OpenAIImageGenerationError,
    OpenAIImageGenerationTimeout,
    generate_image_with_reference,
)

router = APIRouter(prefix="/image-generations", tags=["image-generations"])


async def _image_tuple(upload: UploadFile, field_name: str) -> tuple[str, bytes, str]:
    image_bytes = await upload.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")

    content_type = upload.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail=f"{field_name} must be an image")

    return (upload.filename or f"{field_name}.png", image_bytes, content_type)


@router.post("/pokemon", response_model=ImageGenerationResponse)
async def generate_pokemon_image(
    current_user: dict = Depends(get_current_user),
    reference_image: UploadFile = File(...),
    prompt_template: str = Form("pokemon"),
    universe_label: str = Form("Pokémon"),
    trainer_name: str = Form("Portugal"),
    personal_characteristics: str = Form(""),
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
    reference_images = [await _image_tuple(reference_image, "reference_image")]

    try:
        request_data = PokemonImageGenerationInput(
            prompt_template=prompt_template,
            universe_label=universe_label,
            trainer_name=trainer_name,
            personal_characteristics=personal_characteristics,
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
            reference_images=reference_images,
            prompt=prompt,
            request_data=request_data,
        )
    except OpenAIImageGenerationTimeout as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except OpenAIImageGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/prompt", response_model=ImageGenerationResponse)
async def generate_prompt_image(
    current_user: dict = Depends(get_current_user),
    reference_image: UploadFile | None = File(None),
    face_image: UploadFile | None = File(None),
    body_images: list[UploadFile] | None = File(None),
    prompt_template: str = Form(...),
    universe_label: str = Form(""),
    trainer_name: str = Form("Portugal"),
    personal_characteristics: str = Form(""),
    background: str = Form("#1A1A2E"),
    image_format: str = Form("Quadrado 1:1"),
    outfit_mode: str = Form("photo"),
    torso: str = Form(""),
    legs: str = Form(""),
    shoes: str = Form(""),
    hat: str = Form(""),
    glasses: str = Form("Sem óculos"),
    size: str = Form("1024x1024"),
    quality: str = Form("high"),
    output_format: str = Form("png"),
) -> ImageGenerationResponse:
    if not reference_image:
        raise HTTPException(status_code=422, detail="reference_image is required")

    reference_images = [await _image_tuple(reference_image, "reference_image")]
    reference_notes = (
        "foto enviada é uma referência de corpo inteiro da pessoa presenteada."
        if prompt_template == "couple"
        else ""
    )

    try:
        request_data = PokemonImageGenerationInput(
            prompt_template=prompt_template,
            universe_label=universe_label,
            trainer_name=trainer_name,
            personal_characteristics=personal_characteristics,
            reference_image_notes=reference_notes,
            background=background,
            image_format=image_format,
            badges_enabled=False,
            outfit={
                "mode": outfit_mode,
                "torso": torso,
                "legs": legs,
                "shoes": shoes,
                "hat": hat,
                "glasses": glasses,
            },
            pokemon=[],
            size=size,
            quality=quality,
            output_format=output_format,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    prompt = build_pokemon_prompt(request_data)
    try:
        return await generate_image_with_reference(
            reference_images=reference_images,
            prompt=prompt,
            request_data=request_data,
        )
    except OpenAIImageGenerationTimeout as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except OpenAIImageGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
