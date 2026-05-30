import base64
import binascii
import json
import secrets
from datetime import UTC, datetime
from pathlib import Path

from fastapi import HTTPException, Request

from app.config import settings
from app.generations.schemas import GenerationCreate, GenerationResponse


EXTENSIONS_BY_MIME_TYPE = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def save_generation(
    *,
    current_user: dict,
    payload: GenerationCreate,
    request: Request,
) -> GenerationResponse:
    uid = _current_user_uid(current_user)
    extension = EXTENSIONS_BY_MIME_TYPE[payload.mime_type]
    image_id = f"{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}_{secrets.token_urlsafe(8)}"
    filename = f"{image_id}.{extension}"
    image_dir = _user_image_dir(uid)
    metadata_dir = _user_metadata_dir(uid)
    image_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)

    try:
        image_bytes = base64.b64decode(payload.image_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=422, detail="image_base64 is invalid") from exc

    image_path = image_dir / filename
    image_path.write_bytes(image_bytes)

    created_at = datetime.now(UTC)
    metadata = {
        "id": image_id,
        "filename": filename,
        "universe_label": payload.universe_label,
        "format": payload.format,
        "created_at": created_at.isoformat(),
    }
    _metadata_path(metadata_dir, image_id).write_text(
        json.dumps(metadata, ensure_ascii=False), encoding="utf-8"
    )

    return _metadata_to_response(metadata, uid, request)


def list_recent_generations(
    *,
    current_user: dict,
    limit: int,
    request: Request,
) -> list[GenerationResponse]:
    uid = _current_user_uid(current_user)
    metadata_dir = _user_metadata_dir(uid)
    if not metadata_dir.exists():
        return []

    generations = []
    for metadata_path in metadata_dir.glob("*.json"):
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            generations.append(_metadata_to_response(metadata, uid, request))
        except (json.JSONDecodeError, KeyError, ValueError):
            continue

    generations.sort(key=lambda item: item.created_at, reverse=True)
    return generations[:limit]


def _current_user_uid(current_user: dict) -> str:
    uid = current_user.get("uid")
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")
    return uid


def _user_image_dir(uid: str) -> Path:
    return Path(settings.user_files_dir) / "public" / "generations" / _user_dir_name(uid)


def _user_metadata_dir(uid: str) -> Path:
    return (
        Path(settings.user_files_dir) / "metadata" / "generations" / _user_dir_name(uid)
    )


def _metadata_path(user_dir: Path, image_id: str) -> Path:
    return user_dir / f"{image_id}.json"


def _metadata_to_response(
    metadata: dict,
    uid: str,
    request: Request,
) -> GenerationResponse:
    created_at = datetime.fromisoformat(metadata["created_at"])
    filename = metadata["filename"]
    user_dir_name = _user_dir_name(uid)
    base_url = str(request.base_url).rstrip("/")
    return GenerationResponse(
        id=metadata["id"],
        universe_label=metadata["universe_label"],
        format=metadata["format"],
        image_url=f"{base_url}/user-files/generations/{user_dir_name}/{filename}",
        created_at=created_at,
    )


def _user_dir_name(uid: str) -> str:
    return base64.urlsafe_b64encode(uid.encode("utf-8")).decode("ascii").rstrip("=")
