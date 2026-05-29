import httpx

from app.config import settings
from app.image_generation.schemas import (
    ImageGenerationResponse,
    PokemonImageGenerationInput,
)

ReferenceImage = tuple[str, bytes, str]


class OpenAIImageGenerationError(RuntimeError):
    pass


class OpenAIImageGenerationTimeout(OpenAIImageGenerationError):
    pass


async def generate_image_with_reference(
    *,
    reference_images: list[ReferenceImage],
    prompt: str,
    request_data: PokemonImageGenerationInput,
) -> ImageGenerationResponse:
    if not settings.openai_api_key:
        raise OpenAIImageGenerationError("OPENAI_API_KEY is not configured")

    data = {
        "model": settings.openai_image_model,
        "prompt": prompt,
        "size": request_data.size,
        "quality": request_data.quality,
        "output_format": request_data.output_format,
    }
    files = [("image", image) for image in reference_images]
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}

    timeout = httpx.Timeout(
        connect=30.0,
        read=settings.openai_image_timeout_seconds,
        write=60.0,
        pool=30.0,
    )

    try:
        async with httpx.AsyncClient(
            base_url=settings.openai_base_url, timeout=timeout
        ) as client:
            response = await client.post(
                "/images/edits", data=data, files=files, headers=headers
            )
    except httpx.TimeoutException as exc:
        raise OpenAIImageGenerationTimeout(
            "OpenAI image generation timed out. Try again or use a lighter image/quality."
        ) from exc
    except httpx.HTTPError as exc:
        raise OpenAIImageGenerationError(
            f"OpenAI image generation request failed: {exc}"
        ) from exc

    if response.status_code >= 400:
        raise OpenAIImageGenerationError(_openai_error_message(response))

    payload = response.json()
    image = (payload.get("data") or [{}])[0]
    image_base64 = image.get("b64_json")
    if not image_base64:
        raise OpenAIImageGenerationError("OpenAI response did not include image data")

    return ImageGenerationResponse(
        image_base64=image_base64,
        mime_type=f"image/{request_data.output_format}",
        model=settings.openai_image_model,
        size=request_data.size,
        output_format=request_data.output_format,
    )


def _openai_error_message(response: httpx.Response) -> str:
    try:
        error = response.json().get("error", {})
        message = error.get("message")
        if message:
            return f"OpenAI image generation failed: {message}"
    except ValueError:
        pass

    return f"OpenAI image generation failed with status {response.status_code}"
