import asyncio
import logging

from fastapi import Request
from fastapi.responses import Response

from app.config import settings
from app.database import async_session
from app.observability.models import RequestLog

logger = logging.getLogger(__name__)

EXCLUDED_PATHS = {"/health"}
WEBHOOK_PATH = "/payments/webhook"
MAX_BODY_SIZE = 10_000
MAX_HEADER_VALUE_SIZE = 500
SENSITIVE_HEADERS = {
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "access_token",
    "asaas-access-token",
}


def sanitize_headers(headers: dict[str, str]) -> dict[str, str]:
    sanitized: dict[str, str] = {}
    for key, value in headers.items():
        normalized_key = key.lower()
        if normalized_key in SENSITIVE_HEADERS:
            sanitized[normalized_key] = "[REDACTED]"
            continue
        sanitized[normalized_key] = value[:MAX_HEADER_VALUE_SIZE]
    return sanitized


async def save_log(
    *,
    method: str,
    endpoint: str,
    status_code: int,
    payload: str | None,
    headers: dict[str, str] | None,
    response_text: str | None,
    ip: str,
) -> None:
    try:
        async with async_session() as session:
            log = RequestLog(
                http_method=method,
                endpoint=endpoint,
                status_code=status_code,
                payload=payload,
                headers=headers,
                response=response_text,
                ip=ip,
            )
            session.add(log)
            await session.commit()
    except Exception:
        logger.warning("Failed to save request log for %s %s", method, endpoint)


async def log_requests(request: Request, call_next) -> Response:
    path = request.url.path

    if path in EXCLUDED_PATHS:
        return await call_next(request)

    if path == WEBHOOK_PATH and settings.environment != "development":
        return await call_next(request)

    # Read and re-inject request body so the endpoint handler can still access it
    try:
        body_bytes = await request.body()
    except Exception:  # pragma: no cover
        logger.warning("Failed to read request body for %s", path)  # pragma: no cover
        body_bytes = b""  # pragma: no cover

    async def receive():
        return {"type": "http.request", "body": body_bytes, "more_body": False}  # pragma: no cover

    request._receive = receive

    # Build payload string
    if request.method in ("POST", "PATCH", "PUT"):
        payload: str | None = body_bytes.decode("utf-8", errors="replace")[:MAX_BODY_SIZE] or None
    else:
        query = str(request.url.query)
        payload = query[:MAX_BODY_SIZE] if query else None

    headers = sanitize_headers(dict(request.headers))

    # Execute the endpoint
    response = await call_next(request)

    # Buffer response body
    try:
        resp_body = b""
        async for chunk in response.body_iterator:
            resp_body += chunk
        response_text: str | None = resp_body.decode("utf-8", errors="replace")[:MAX_BODY_SIZE]
    except Exception:  # pragma: no cover
        logger.warning("Failed to read response body for %s", path)  # pragma: no cover
        resp_body = b""  # pragma: no cover
        response_text = None  # pragma: no cover

    ip = request.client.host if request.client else "unknown"

    asyncio.create_task(
        save_log(
            method=request.method,
            endpoint=path,
            status_code=response.status_code,
            payload=payload,
            headers=headers,
            response_text=response_text,
            ip=ip,
        )
    )

    return Response(
        content=resp_body,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type,
    )
