import json

import httpx
from httpx import ASGITransport, AsyncClient

from app.config import settings
from app.image_generation import service
from app.image_generation.prompt import build_pokemon_prompt
from app.image_generation.schemas import PokemonImageGenerationInput
from app.main import app


class _FakeOpenAIResponse:
    status_code = 200

    def json(self) -> dict:
        return {
            "data": [{"b64_json": "ZmFrZS1pbWFnZQ=="}],
            "usage": {"total_tokens": 123},
        }


class _FakeOpenAIClient:
    last_request: dict | None = None

    def __init__(self, *args, **kwargs):
        self.base_url = kwargs.get("base_url")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def post(self, url: str, data: dict, files: dict, headers: dict):
        self.__class__.last_request = {
            "url": url,
            "data": data,
            "files": files,
            "headers": headers,
        }
        return _FakeOpenAIResponse()


class _TimeoutOpenAIClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def post(self, *args, **kwargs):
        raise httpx.ReadTimeout("timed out")


def test_build_pokemon_prompt_uses_variable_values():
    prompt = build_pokemon_prompt(
        PokemonImageGenerationInput(
            trainer_name="Victor",
            background="#050505",
            image_format="Quadrado 1:1",
            badges_enabled=False,
            outfit={
                "mode": "custom",
                "torso": "camiseta preta",
                "legs": "calça jeans",
                "shoes": "tênis branco",
                "hat": "boné preto",
                "glasses": "óculos redondos",
            },
            pokemon=[{"name": "Pikachu", "position": "no ombro"}],
        )
    )

    assert "pokemon.md" not in prompt
    assert "Trainer name/title: Victor" in prompt
    assert "Background: #050505" in prompt
    assert "badges" not in prompt.lower() or "disabled" in prompt
    assert "Pikachu sitting on his shoulder" in prompt
    assert "camiseta preta" in prompt
    assert "português do Brasil" in prompt


def test_build_generic_prompt_uses_selected_template_and_pt_br_text_rule():
    prompt = build_pokemon_prompt(
        PokemonImageGenerationInput(
            prompt_template="lego",
            universe_label="LEGO",
            trainer_name="Victor",
            background="#E8E2D8",
            image_format="Retrato 3:4",
        )
    )

    assert "universo LEGO" in prompt
    assert "Universo/estilo escolhido: LEGO" in prompt
    assert "Nome/título do personagem" in prompt
    assert "Resumo pessoal" in prompt
    assert "português do Brasil" in prompt


def test_build_generic_prompt_adds_personal_characteristics_only_when_needed():
    prompt = build_pokemon_prompt(
        PokemonImageGenerationInput(
            prompt_template="monster_high",
            personal_characteristics="criativa, tímida, coleciona acessórios antigos",
        )
    )

    assert "Resumo pessoal informado pelo usuário" in prompt
    assert "criativa, tímida, coleciona acessórios antigos" in prompt


def test_san_andreas_prompt_ignores_personal_characteristics():
    prompt = build_pokemon_prompt(
        PokemonImageGenerationInput(
            prompt_template="san_andreas",
            personal_characteristics="não deve aparecer no prompt",
        )
    )

    assert "Yo como personaje jugable" in prompt
    assert "Resumo pessoal" not in prompt
    assert "não deve aparecer no prompt" not in prompt


async def test_generate_pokemon_image_route_calls_openai(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")
    monkeypatch.setattr(settings, "openai_image_model", "gpt-image-2")
    monkeypatch.setattr(service.httpx, "AsyncClient", _FakeOpenAIClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/pokemon",
            data={
                "trainer_name": "Portugal",
                "pokemon": json.dumps(
                    [{"name": "Mewtwo", "position": "atrás do treinador"}]
                ),
            },
            files={"reference_image": ("face.png", b"fake-image", "image/png")},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload == {
        "image_base64": "ZmFrZS1pbWFnZQ==",
        "mime_type": "image/png",
        "model": "gpt-image-2",
        "size": "1024x1024",
        "output_format": "png",
    }

    request = _FakeOpenAIClient.last_request
    assert request is not None
    assert request["url"] == "/images/edits"
    assert request["data"]["model"] == "gpt-image-2"
    assert request["files"][0][0] == "image"
    assert request["files"][0][1][0] == "face.png"
    assert request["headers"]["Authorization"] == "Bearer test-key"


async def test_generate_prompt_image_route_uses_selected_prompt(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")
    monkeypatch.setattr(settings, "openai_image_model", "gpt-image-2")
    monkeypatch.setattr(service.httpx, "AsyncClient", _FakeOpenAIClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/prompt",
            data={
                "prompt_template": "rick_morty",
                "universe_label": "Rick and Morty",
                "trainer_name": "Victor",
                "personal_characteristics": "irônico, curioso e fã de tecnologia",
            },
            files={"reference_image": ("face.png", b"fake-image", "image/png")},
        )

    assert response.status_code == 200
    request = _FakeOpenAIClient.last_request
    assert request is not None
    assert "Universo/estilo escolhido: Rick and Morty" in request["data"]["prompt"]
    assert "Rick and Morty" in request["data"]["prompt"]
    assert "irônico, curioso e fã de tecnologia" in request["data"]["prompt"]
    assert "português do Brasil" in request["data"]["prompt"]


async def test_generate_couple_prompt_accepts_up_to_three_reference_images(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")
    monkeypatch.setattr(service.httpx, "AsyncClient", _FakeOpenAIClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/prompt",
            data={
                "prompt_template": "couple",
                "personal_characteristics": "amo o sorriso e o jeito carinhoso",
            },
            files=[
                ("reference_images", ("full-body-1.png", b"full-body-1", "image/png")),
                ("reference_images", ("full-body-2.png", b"full-body-2", "image/png")),
                ("reference_images", ("full-body-3.png", b"full-body-3", "image/png")),
            ],
        )

    assert response.status_code == 200
    request = _FakeOpenAIClient.last_request
    assert request is not None
    assert [item[1][0] for item in request["files"]] == [
        "full-body-1.png",
        "full-body-2.png",
        "full-body-3.png",
    ]
    assert "obsessed fan artist filled an entire sketchbook page" in request["data"]["prompt"]
    assert "3 foto(s) enviada(s) como referência de corpo inteiro" in request["data"]["prompt"]
    assert "amo o sorriso e o jeito carinhoso" in request["data"]["prompt"]
    assert "Fundo/cor/direção visual" not in request["data"]["prompt"]
    assert "corpo inteiro do casal" not in request["data"]["prompt"]


async def test_generate_couple_prompt_requires_reference_image(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/prompt",
            data={"prompt_template": "couple"},
        )

    assert response.status_code == 422
    assert "reference_images requires at least 1 file" in response.json()["detail"]


async def test_generate_couple_prompt_rejects_more_than_three_images(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/prompt",
            data={"prompt_template": "couple"},
            files=[
                ("reference_images", ("full-body-1.png", b"full-body-1", "image/png")),
                ("reference_images", ("full-body-2.png", b"full-body-2", "image/png")),
                ("reference_images", ("full-body-3.png", b"full-body-3", "image/png")),
                ("reference_images", ("full-body-4.png", b"full-body-4", "image/png")),
            ],
        )

    assert response.status_code == 422
    assert "reference_images accepts at most 3 files" in response.json()["detail"]


async def test_generate_pokemon_image_route_handles_openai_timeout(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")
    monkeypatch.setattr(service.httpx, "AsyncClient", _TimeoutOpenAIClient)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/image-generations/pokemon",
            data={"pokemon": "[]"},
            files={"reference_image": ("face.png", b"fake-image", "image/png")},
        )

    assert response.status_code == 504
    assert "timed out" in response.json()["detail"]
