from datetime import datetime

from pydantic import BaseModel, Field


class GenerationCreate(BaseModel):
    image_base64: str = Field(min_length=1)
    mime_type: str = Field(pattern=r"^image/(png|jpeg|jpg|webp)$")
    universe_label: str = Field(min_length=1, max_length=80)
    format: str = Field(min_length=1, max_length=40)


class GenerationResponse(BaseModel):
    id: str
    universe_label: str
    format: str
    image_url: str
    created_at: datetime


class GenerationListResponse(BaseModel):
    generations: list[GenerationResponse]
