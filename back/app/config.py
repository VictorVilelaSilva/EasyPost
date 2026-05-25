from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    database_schema: str = "public"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    steam_api_key: str = ""
    asaas_api_key: str = ""
    asaas_base_url: str = "https://sandbox.asaas.com/api/v3"
    asaas_webhook_token: str = ""
    frontend_url: str = "http://localhost:3000"
    backend_public_url: str = ""
    cookie_domain: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]
    platform_fee_percent: int = 10
    trade_deadline_hours: int = 12
    payout_hold_hours: int = 24
    steam_poll_interval_seconds: int = 120
    deadline_check_interval_seconds: int = 300
    redis_url: str = "redis://localhost:6379"
    inventory_cache_ttl_seconds: int = 300
    item_details_cache_ttl_seconds: int = 1800
    pokemon_cache_ttl_seconds: int = 86400
    pokemon_api_base_url: str = "https://pokeapi.co/api/v2"
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_image_model: str = "gpt-image-2"
    openai_image_timeout_seconds: float = 300.0
    environment: str = "production"


settings = Settings()  # type: ignore[call-arg]
