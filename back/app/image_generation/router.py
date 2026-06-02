import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.firebase.dependencies import get_current_user
from app.image_generation.prompt import build_pokemon_prompt
from app.image_generation.reference_images import image_tuple, prompt_reference_images
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


@router.post("/pokemon", response_model=ImageGenerationResponse)
async def generate_pokemon_image(
    current_user: dict = Depends(get_current_user),
    reference_image: UploadFile = File(...),
    prompt_template: str = Form("pokemon"),
    universe_label: str = Form("Pokémon"),
    trainer_name: str = Form("Portugal"),
    personal_characteristics: str = Form(""),
    copa_name: str = Form(""),
    copa_birth_date: str = Form(""),
    copa_height: str = Form(""),
    copa_weight: str = Form(""),
    copa_club: str = Form(""),
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
    reference_images = [await image_tuple(reference_image, "reference_image")]

    try:
        request_data = PokemonImageGenerationInput(
            prompt_template=prompt_template,
            universe_label=universe_label,
            trainer_name=trainer_name,
            personal_characteristics=personal_characteristics,
            copa_name=copa_name,
            copa_birth_date=copa_birth_date,
            copa_height=copa_height,
            copa_weight=copa_weight,
            copa_club=copa_club,
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
    reference_images: list[UploadFile] | None = File(None),
    prompt_template: str = Form(...),
    universe_label: str = Form(""),
    trainer_name: str = Form("Portugal"),
    personal_characteristics: str = Form(""),
    copa_name: str = Form(""),
    copa_birth_date: str = Form(""),
    copa_height: str = Form(""),
    copa_weight: str = Form(""),
    copa_club: str = Form(""),
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
    reference_images_payload, reference_notes = await prompt_reference_images(
        prompt_template=prompt_template,
        reference_image=reference_image,
        reference_images=reference_images,
    )
    _validate_copa_fields(
        prompt_template=prompt_template,
        copa_name=copa_name,
        copa_birth_date=copa_birth_date,
        copa_height=copa_height,
        copa_weight=copa_weight,
        copa_club=copa_club,
    )

    try:
        request_data = PokemonImageGenerationInput(
            prompt_template=prompt_template,
            universe_label=universe_label,
            trainer_name=trainer_name,
            personal_characteristics=personal_characteristics,
            copa_name=copa_name,
            copa_birth_date=copa_birth_date,
            copa_height=copa_height,
            copa_weight=copa_weight,
            copa_club=copa_club,
            reference_image_notes=reference_notes,
            background=background,
            image_format=_effective_image_format(prompt_template, image_format),
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
            size=_effective_image_size(prompt_template, size),
            quality=quality,
            output_format=output_format,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    prompt = build_pokemon_prompt(request_data)
    try:
        return await generate_image_with_reference(
            reference_images=reference_images_payload,
            prompt=prompt,
            request_data=request_data,
        )
    except OpenAIImageGenerationTimeout as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except OpenAIImageGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


def _effective_image_format(prompt_template: str, image_format: str) -> str:
    return "Retrato 3:4" if prompt_template == "copa" else image_format


def _effective_image_size(prompt_template: str, size: str) -> str:
    return "1024x1536" if prompt_template == "copa" else size


def _validate_copa_fields(
    *,
    prompt_template: str,
    copa_name: str,
    copa_birth_date: str,
    copa_height: str,
    copa_weight: str,
    copa_club: str,
) -> None:
    if prompt_template != "copa":
        return
    if all(value.strip() for value in [copa_name, copa_birth_date, copa_height, copa_weight, copa_club]):
        return
    raise HTTPException(status_code=422, detail="copa fields are required")
