import time

_store: dict[str, tuple[float | None, str]] = {}


class InMemoryCache:
    """Cache em memória com TTL, com a sub-interface de Redis usada pelo proxy."""

    async def get(self, key: str) -> str | None:
        entry = _store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at is not None and expires_at < time.monotonic():
            _store.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        expires_at = time.monotonic() + ex if ex else None
        _store[key] = (expires_at, value)


_cache = InMemoryCache()


def get_cache() -> InMemoryCache:
    return _cache
