# Listings Routes

## `GET /api/listings`
Lista anúncios ativos com paginação por página. Endpoint público.
- **Auth:** Nenhuma
- **Query params:**
	- `page` (int, >= 1, default 1)
	- `limit` (int, 1-100, default 24)
	- `rarity` (lista de string, opcional)
	- `name` (string, opcional)
- **Response:** `{ "items": [ListingResponse], "total": int, "page": int, "total_pages": int }`

## `GET /api/listings/grouped`
Lista anúncios ativos agrupados por `class_id` para exibição no marketplace (média de preço e quantidade de ofertas). Endpoint público.
- **Auth:** Nenhuma
- **Query params:**
	- `page` (int, >= 1, default 1)
	- `limit` (int, 1-100, default 24)
	- `rarity` (lista de string, opcional)
	- `name` (string, opcional)
- **Response:** `{ "items": [GroupedListingResponse], "total": int, "page": int, "total_pages": int }`

## `GET /api/listings/by-class/{class_id}`
Lista ofertas ativas de um `class_id`, ordenadas por menor preço. Endpoint público.
- **Auth:** Nenhuma
- **Response:** Lista de `ListingWithSellerResponse`

## `GET /api/listings/search`
Busca anúncios ativos por nome com paginação cursor-based. Endpoint público.
- **Auth:** Nenhuma
- **Query params:**
	- `q` (string, obrigatório, min 1)
	- `cursor` (int, opcional)
	- `limit` (int, 1-100, default 20)
- **Response:** Lista de `ListingResponse`

## `GET /api/listings/{listing_id}`
Retorna os detalhes de um anúncio específico. Endpoint público.
- **Auth:** Nenhuma
- **Response:** `ListingResponse`
- **Erros:** 404 se não encontrado

## `POST /api/listings`
Cria um novo anúncio. O utilizador precisa ter `trade_url` configurado. Não permite duplicar anúncios ativos do mesmo `asset_id`.
- **Auth:** Bearer JWT
- **Body:** `{ "asset_id": string, "class_id": string, "item_name": string, "icon_url?": string, "rarity?": string, "hero?": string, "price": float>0, "delivery_type?": "trade"|"gift" }`
- **Response:** `ListingResponse` (status 201)
- **Erros:** 400 se sem trade_url ou item já listado

## `DELETE /api/listings/{listing_id}`
Cancela um anúncio próprio. Só funciona se o status for `active`.
- **Auth:** Bearer JWT
- **Response:** `ListingResponse` com status `cancelled`
- **Erros:** 403 se não for o dono, 400 se não estiver ativo

## `PATCH /api/listings/{listing_id}`
Atualiza o preço de um anúncio próprio.
- **Auth:** Bearer JWT
- **Body:** `{ "price": float>0 }`
- **Response:** `ListingResponse`
- **Erros:** 403 se não for o dono, 400 se não estiver ativo

## `GET /api/listings/me`
Lista todos os anúncios do vendedor autenticado (todos os status).
- **Auth:** Bearer JWT
- **Response:** Lista de `ListingResponse`
