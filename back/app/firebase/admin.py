import logging

import firebase_admin
from firebase_admin import auth as admin_auth
from firebase_admin import credentials

from app.config import settings

logger = logging.getLogger(__name__)


def _init_app() -> None:
    if firebase_admin._apps:
        return

    if settings.firebase_admin_client_email and settings.firebase_admin_private_key:
        cred = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": settings.firebase_admin_project_id,
                "client_email": settings.firebase_admin_client_email,
                "private_key": settings.firebase_admin_private_key.replace("\\n", "\n"),
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        )
        firebase_admin.initialize_app(cred)
    elif settings.firebase_admin_project_id:
        firebase_admin.initialize_app(
            options={"projectId": settings.firebase_admin_project_id}
        )
    else:
        firebase_admin.initialize_app()


try:
    _init_app()
except Exception:  # noqa: BLE001 — init não deve derrubar o import (ex.: testes sem credenciais)
    logger.exception("Falha ao inicializar o Firebase Admin")

__all__ = ["admin_auth"]
