from json import JSONDecodeError

from fastapi import APIRouter, BackgroundTasks, Header, Request

from app.common.dependencies import CurrentUser, DbSession
from app.common.exceptions import BadRequestError, UnauthorizedError
from app.payment.schemas import WithdrawRequest
from app.payment.service import process_webhook_in_background, request_withdrawal, verify_webhook_signature

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/webhook")
async def asaas_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    asaas_access_token: str = Header("", alias="asaas-access-token", convert_underscores=False),
) -> dict:
    if not verify_webhook_signature(asaas_access_token):
        raise UnauthorizedError("Invalid webhook token")

    body = await request.body()
    if not body:
        payload = {}
    else:
        try:
            payload = await request.json()
        except JSONDecodeError as exc:
            raise BadRequestError("Invalid JSON payload") from exc

    background_tasks.add_task(process_webhook_in_background, payload)
    return {"ok": True}


@router.post("/withdraw")
async def withdraw(body: WithdrawRequest, user: CurrentUser, db: DbSession) -> dict:
    result = await request_withdrawal(db, user, body.amount, body.pix_key)
    return {"detail": "Withdrawal requested", "transfer": result}
