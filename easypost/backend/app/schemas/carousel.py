from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class TopicsRequest(BaseModel):
    niche: str


class TopicsResponse(BaseModel):
    topics: List[str]


class CarouselRequest(BaseModel):
    topic: str
    niche: str


class SlideData(BaseModel):
    slide_type: Literal["cover", "content", "cta"] = Field(alias="slideType")
    title: str
    content: str
    
    class Config:
        populate_by_name = True


class CarouselResponse(BaseModel):
    slides: List[SlideData]
    caption: str


class AudienceConfig(BaseModel):
    age: Optional[str] = None
    interests: Optional[str] = None


class BrandColors(BaseModel):
    colors: List[str]
    logo_data_url: Optional[str] = Field(None, alias="logoDataUrl")
    
    class Config:
        populate_by_name = True


class ImagesRequest(BaseModel):
    slides: List[SlideData]
    visual_style: str = Field(alias="visualStyle")
    color_palette: str = Field(alias="colorPalette")
    brand_colors: BrandColors = Field(alias="brandColors")
    audience: AudienceConfig
    custom_prompt: Optional[str] = Field(None, alias="customPrompt")

    class Config:
        populate_by_name = True


class ImagesResponse(BaseModel):
    images: List[str]
