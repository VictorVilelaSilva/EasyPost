import base64

from httpx import ASGITransport, AsyncClient

from app.config import settings
from app.main import app


async def test_create_generation_saves_image_and_lists_recent(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "user_files_dir", str(tmp_path))
    image_base64 = base64.b64encode(b"fake-image").decode("ascii")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/generations",
            json={
                "image_base64": image_base64,
                "mime_type": "image/png",
                "universe_label": "Pokemon",
                "format": "Quadrado 1:1",
            },
        )
        recent_response = await client.get("/generations/recent?limit=3")

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["universe_label"] == "Pokemon"
    assert created["format"] == "Quadrado 1:1"
    assert created["image_url"].startswith("http://test/user-files/generations/")

    image_files = list(tmp_path.glob("public/generations/**/*.png"))
    assert len(image_files) == 1
    assert image_files[0].read_bytes() == b"fake-image"

    assert recent_response.status_code == 200
    recent = recent_response.json()
    assert recent["generations"][0]["id"] == created["id"]


async def test_create_generation_rejects_invalid_base64(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "user_files_dir", str(tmp_path))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/generations",
            json={
                "image_base64": "not base64",
                "mime_type": "image/png",
                "universe_label": "Pokemon",
                "format": "Quadrado 1:1",
            },
        )

    assert response.status_code == 422
    assert response.json()["detail"] == "image_base64 is invalid"
