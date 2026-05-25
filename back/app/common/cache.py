import logging

from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

_redis: Redis | None = None


def setup_cache() -> None:
    global _redis
    _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    logger.info("Cache Redis configurado: %s", settings.redis_url)


def get_cache() -> Redis | None:
    return _redis
