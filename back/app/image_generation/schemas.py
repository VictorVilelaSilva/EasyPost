from typing import Literal

from pydantic import BaseModel, Field


ImageSize = Literal["1024x1024", "1024x1536", "1536x1024", "auto"]
ImageQuality = Literal["low", "medium", "high", "auto"]
ImageOutputFormat = Literal["png", "webp", "jpeg"]


class PokemonPlacement(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    position: str = Field(min_length=1, max_length=80)


class PokemonOutfit(BaseModel):
    mode: Literal["photo", "custom"] = "photo"
    torso: str = "Jaqueta tática verde escura"
    legs: str = "Calça cargo preta"
    shoes: str = "Tênis técnico branco"
    hat: str = ""
    glasses: str = "Sem óculos"


class PokemonImageGenerationInput(BaseModel):
    trainer_name: str = Field(default="Portugal", max_length=80)
    background: str = Field(default="#1A1A2E", max_length=80)
    image_format: str = Field(default="Quadrado 1:1", max_length=40)
    badges_enabled: bool = True
    outfit: PokemonOutfit = Field(default_factory=PokemonOutfit)
    pokemon: list[PokemonPlacement] = Field(default_factory=list, max_length=5)
    size: ImageSize = "1024x1024"
    quality: ImageQuality = "high"
    output_format: ImageOutputFormat = "png"


class ImageGenerationResponse(BaseModel):
    image_base64: str
    mime_type: str
    model: str
    size: str
    output_format: str
