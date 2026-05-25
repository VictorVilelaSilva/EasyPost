# Inventory Routes

## `GET /api/inventory/sync`
Busca o inventário de Dota 2 (AppID 570) do utilizador autenticado via Steam API. Retorna apenas itens trocáveis (tradable), filtrando automaticamente itens com trade lock ou non-tradable.
- **Auth:** Bearer JWT
- **Response:** Lista de `SteamItem`

## `POST /api/inventory/refresh`
Invalida o cache do inventário do utilizador autenticado. O próximo `/sync` força nova leitura na Steam API.
- **Auth:** Bearer JWT
- **Response:** `204 No Content`

## `GET /api/inventory/item-details/{class_id}`
Retorna metadados detalhados de um item por `class_id` (nome, descrição, preço sugerido e dados auxiliares, conforme disponibilidade da fonte).
- **Auth:** Nenhuma
- **Response:** `ItemDetailsResponse`

```json
[
  {
    "asset_id": "12345678",
    "class_id": "87654321",
    "item_name": "Manifold Paradox",
    "icon_url": "https://community.akamai.steamstatic.com/economy/image/...",
    "rarity": "Arcana",
    "tradable": true,
    "tradable_after": null
  }
]
```
