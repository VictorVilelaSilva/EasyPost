from pathlib import Path

from fastapi import HTTPException, UploadFile

ReferenceImage = tuple[str, bytes, str]

COPA_REFERENCE_PATH = Path(__file__).resolve().parents[3] / "front/public/exemplar_copa.jpeg"


async def image_tuple(upload: UploadFile, field_name: str) -> ReferenceImage:
    image_bytes = await upload.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")

    content_type = upload.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail=f"{field_name} must be an image")

    return (upload.filename or f"{field_name}.png", image_bytes, content_type)


async def prompt_reference_images(
    *,
    prompt_template: str,
    reference_image: UploadFile | None,
    reference_images: list[UploadFile] | None,
) -> tuple[list[ReferenceImage], str]:
    if prompt_template == "couple":
        return await _couple_references(reference_images)

    if not reference_image:
        raise HTTPException(status_code=422, detail="reference_image is required")

    images = [await image_tuple(reference_image, "reference_image")]
    if prompt_template != "copa":
        return images, ""

    return [
        _file_image_tuple(COPA_REFERENCE_PATH, "copa_reference_image"),
        *images,
    ], "foto 1 é o modelo fixo da figurinha da copa; foto 2 é a pessoa que deve virar jogador da figurinha."


async def _couple_references(
    reference_images: list[UploadFile] | None,
) -> tuple[list[ReferenceImage], str]:
    if not reference_images:
        raise HTTPException(status_code=422, detail="reference_images requires at least 1 file")
    if len(reference_images) > 3:
        raise HTTPException(status_code=422, detail="reference_images accepts at most 3 files")

    images = [await image_tuple(image, "reference_images") for image in reference_images]
    notes = f"{len(images)} foto(s) enviada(s) como referência de corpo inteiro da pessoa presenteada."
    return images, notes


def _file_image_tuple(path: Path, field_name: str) -> ReferenceImage:
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"{field_name} was not found")
    return (path.name, path.read_bytes(), "image/jpeg")
