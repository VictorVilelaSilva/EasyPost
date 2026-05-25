# Worker (Background Jobs)

O worker roda automaticamente ao iniciar a aplicação via lifespan event. Não expõe rotas HTTP.

## Jobs

### `poll_steam_trades`
Consulta a Steam API (`IEconService/GetTradeOffer`) para transações com status `offer_confirmed` e `trade_offer_id` preenchido. Usa `steam_api_key` do vendedor.
- **TradeOfferState 3 (Accepted):** completa transação, credita saldo ao vendedor e marca listing como `sold`
- **TradeOfferState 6/7/8/11 (Cancelled/Declined/Invalid items/Expired):** cancela transação e restaura listing para `active`

### `check_trade_deadlines`
Verifica transações em `trade_pending` com `trade_deadline` expirado (default 12h). Cancela automaticamente e restaura o listing.

### `process_refunds`
Processa transações em `cancelled`: se tiver `payment_id`, chama estorno na API do Asaas e depois marca como `refunded`.

### `poll_friend_requests`
Fluxo gift: verifica transações em `friend_pending` e consulta amizade na Steam entre seller e buyer.
- Se já forem amigos há >=30 dias: avança para `gift_pending` (com novo deadline)
- Se amizade <30 dias: avança para `friendship_cooling`

### `check_friendship_cooling`
Fluxo gift: para transações em `friendship_cooling`, avança para `gift_pending` quando completar 30 dias de amizade.

### `poll_gift_deliveries`
Fluxo gift: para transações em `gift_sent`, verifica inventários Steam.
- Se `class_id` aparece no buyer e `asset_id` não aparece mais no seller: avança para `buyer_confirming`

### `check_gift_deadlines`
Fluxo gift: cancela transações expiradas nos estados `seller_confirming`, `friend_pending` ou `gift_pending`.

## Frequência de execução

Todos os jobs rodam sequencialmente dentro do loop do worker e o intervalo entre ciclos é controlado por `STEAM_POLL_INTERVAL_SECONDS` (default 120s).
