import httpx
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.pokemon import service


class _FakeResponse:
    def __init__(self, data: dict, status_code: int = 200):
        self._data = data
        self.status_code = status_code

    def json(self) -> dict:
        return self._data

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            request = httpx.Request("GET", "https://pokeapi.test")
            response = httpx.Response(self.status_code, request=request)
            raise httpx.HTTPStatusError("error", request=request, response=response)


class _FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        self.base_url = kwargs.get("base_url")

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def get(self, url: str, params: dict | None = None):
        if url == "/pokemon":
            return _FakeResponse(
                {
                    "count": 3,
                    "results": [
                        {
                            "name": "bulbasaur",
                            "url": "https://pokeapi.co/api/v2/pokemon/1/",
                        },
                        {
                            "name": "pikachu",
                            "url": "https://pokeapi.co/api/v2/pokemon/25/",
                        },
                        {
                            "name": "mr-mime",
                            "url": "https://pokeapi.co/api/v2/pokemon/122/",
                        },
                    ],
                }
            )

        if url == "/pokemon/pikachu":
            return _FakeResponse(
                {
                    "id": 25,
                    "name": "pikachu",
                    "height": 4,
                    "weight": 60,
                    "sprites": {
                        "front_default": "https://img.test/pikachu.png",
                        "other": {
                            "official-artwork": {
                                "front_default": "https://img.test/pikachu-art.png"
                            }
                        },
                    },
                    "types": [{"type": {"name": "electric"}}],
                    "abilities": [{"ability": {"name": "static"}}],
                    "stats": [{"base_stat": 90, "stat": {"name": "speed"}}],
                }
            )

        return _FakeResponse({}, status_code=404)


@pytest.fixture(autouse=True)
def _mock_pokemon_client(monkeypatch):
    monkeypatch.setattr(service, "get_cache", lambda: None)
    monkeypatch.setattr(httpx, "AsyncClient", _FakeAsyncClient)


async def test_list_pokemon_filters_by_search():
    result = await service.fetch_pokemon_list(search="pika", limit=10)

    assert result.count == 1
    assert result.results[0].id == 25
    assert result.results[0].name == "pikachu"
    assert result.results[0].display_name == "Pikachu"
    assert result.results[0].artwork_url is not None


async def test_fetch_pokemon_detail_maps_types_abilities_and_stats():
    result = await service.fetch_pokemon_detail("pikachu")

    assert result.id == 25
    assert result.display_name == "Pikachu"
    assert result.types == ["electric"]
    assert result.abilities == ["static"]
    assert result.stats == {"speed": 90}
    assert result.artwork_url == "https://img.test/pikachu-art.png"


async def test_pokemon_router_returns_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/pokemon", params={"search": "mime", "limit": 5})

    assert resp.status_code == 200
    assert resp.json()["results"][0]["display_name"] == "Mr Mime"
