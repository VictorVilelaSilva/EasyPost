from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # CORS / frontend
    allowed_origins: list[str] = ["http://localhost:8005"]
    frontend_url: str = "http://localhost:8005"
    environment: str = "production"

    # PokéAPI proxy
    pokemon_api_base_url: str = "https://pokeapi.co/api/v2"
    pokemon_cache_ttl_seconds: int = 86400

    # OpenAI image generation
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_image_model: str = "gpt-image-2"
    openai_image_timeout_seconds: float = 300.0

    # Firebase Admin (verificação de ID token)
    firebase_admin_project_id: str = ""
    firebase_admin_client_email: str = ""
    firebase_admin_private_key: str = ""


settings = Settings()  # type: ignore[call-arg]
