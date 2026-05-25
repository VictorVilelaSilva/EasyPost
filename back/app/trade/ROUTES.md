# Trade (Transactions) Routes

## `POST /api/transactions`
Inicia uma compra. Reserva o listing e cria a transação com status `pending_payment`. Calcula automaticamente a comissão de 10% e gera um código de segurança de 8 caracteres.
- **Auth:** Bearer JWT (comprador)
- **Body:** `{ "listing_id": int }`
- **Response:** `TransactionResponse` (status 201)
- **Erros:** 404 listing não encontrado, 400 se não estiver ativo ou se tentar comprar próprio item

## `GET /api/transactions/{transaction_id}`
Retorna os detalhes de uma transação. Apenas o comprador ou vendedor podem ver.
- **Auth:** Bearer JWT
- **Response:** `TransactionResponse`
- **Erros:** 403 se não for buyer nem seller, 404 se não encontrada

## `POST /api/transactions/{transaction_id}/mark-sent`
O vendedor marca que enviou a proposta de troca. Avança o status de `trade_pending` para `trade_sent`.
- **Auth:** Bearer JWT (vendedor)
- **Body:** nenhum
- **Response:** `TransactionResponse`
- **Erros:** 403 se não for o seller, 400 se transição inválida

## `POST /api/transactions/{transaction_id}/confirm-offer`
O comprador confirma a oferta recebida e informa o `trade_offer_id`. Avança o status de `trade_sent` para `offer_confirmed`.
- **Auth:** Bearer JWT (comprador)
- **Body:** `{ "trade_offer_id": string }`
- **Response:** `TransactionResponse`
- **Erros:** 403 se não for o buyer, 400 se transição inválida

## `POST /api/transactions/{transaction_id}/confirm-sale`
Fluxo gift: vendedor confirma a venda e avança de `seller_confirming` para `friend_pending`.
- **Auth:** Bearer JWT (vendedor)
- **Body:** nenhum
- **Response:** `TransactionResponse`

## `POST /api/transactions/{transaction_id}/friend-request-sent`
Endpoint cosmético no fluxo gift para registrar que o vendedor enviou pedido de amizade (sem mudança de estado).
- **Auth:** Bearer JWT
- **Body:** nenhum
- **Response:** `TransactionResponse`

## `POST /api/transactions/{transaction_id}/gift-sent`
Fluxo gift: vendedor marca item como enviado. Avança de `gift_pending` para `gift_sent`.
- **Auth:** Bearer JWT (vendedor)
- **Body:** nenhum
- **Response:** `TransactionResponse`

## `POST /api/transactions/{transaction_id}/confirm-receipt`
Fluxo gift: comprador confirma recebimento quando estiver em `buyer_confirming`, finalizando a transação em `completed`.
- **Auth:** Bearer JWT (comprador)
- **Body:** nenhum
- **Response:** `TransactionResponse`

## `GET /api/transactions/me`
Lista todas as transações do utilizador (como comprador ou vendedor).
- **Auth:** Bearer JWT
- **Response:** Lista de `TransactionListItem`

---

## Máquina de Estados

```
pending_payment → paid → trade_pending → trade_sent → offer_confirmed → completed
       │                │              │                 │
       └──────────────→ cancelled ←────┴─────────────────┘
                              │
                              └→ refunded

Fluxo gift:
paid → seller_confirming → friend_pending → friendship_cooling → gift_pending → gift_sent → buyer_confirming → completed
                  │                 │              │                │
                  └────────────────→ cancelled ←───┴────────────────┘
                                         │
                                         └→ refunded
```

| Transição | Trigger |
|-----------|---------|
| pending_payment → paid | Webhook Asaas (PAYMENT_RECEIVED) |
| paid → trade_pending | Automático após pagamento |
| paid → seller_confirming | Automático após pagamento (delivery_type=`gift`) |
| trade_pending → trade_sent | Seller chama `mark-sent` |
| trade_sent → offer_confirmed | Buyer chama `confirm-offer` com `trade_offer_id` |
| offer_confirmed → completed | Worker detecta trade aceite na Steam |
| seller_confirming → friend_pending | Seller chama `confirm-sale` |
| friend_pending → friendship_cooling/gift_pending | Worker verifica amizade na Steam |
| friendship_cooling → gift_pending | Worker após 30 dias de amizade |
| gift_pending → gift_sent | Seller chama `gift-sent` |
| gift_sent → buyer_confirming | Worker detecta item no inventário do buyer |
| buyer_confirming → completed | Buyer chama `confirm-receipt` |
| trade_pending/friend_pending/gift_pending/seller_confirming → cancelled | Timeout |
| offer_confirmed → cancelled | Trade recusada/expirada/cancelada na Steam |
| cancelled → refunded | Estorno automático via Asaas |
