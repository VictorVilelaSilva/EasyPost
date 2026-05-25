# Payment Routes

## `POST /api/payments/webhook`
Recebe webhooks do Asaas. Valida o token enviado no header, registra o evento na tabela `payment_events` e atualiza o status da transação conforme o tipo de evento.
- **Auth:** Header `asaas-access-token` (comparação com `ASAAS_WEBHOOK_TOKEN`)
- **Body:** Payload do Asaas (JSON)
- **Response:** `{ "ok": true }`
- **Eventos tratados:**
  - `PAYMENT_RECEIVED` → avança transação para `paid` e depois:
    - `trade_pending` (quando `delivery_type=trade`)
    - `seller_confirming` (quando `delivery_type=gift`)

## `POST /api/payments/withdraw`
O vendedor solicita saque do seu saldo via Pix. Verifica saldo total e saldo disponível (descontando valores ainda em hold de transações completadas com `seller_payout_after` no futuro), e cria transferência no Asaas.
- **Auth:** Bearer JWT
- **Body:** `{ "amount": decimal>0, "pix_key": string }`
- **Response:** `{ "detail": "Withdrawal requested", "transfer": {...} }`
- **Erros:** 400 se saldo insuficiente ou saldo disponível insuficiente (hold ativo)
