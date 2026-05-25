# Design: Sistema de Avaliações entre Usuários

**Data:** 2026-04-27
**Escopo:** Avaliação mútua entre comprador e vendedor após conclusão de trade ou gift

---

## Contexto

Ao chegar no status `completed`, ambos os participantes de uma negociação (buyer e seller) podem avaliar um ao outro. A avaliação consiste em uma nota de 0 a 5 estrelas e um comentário opcional. Cada usuário pode avaliar apenas uma vez por transação. A nota impacta diretamente o campo `reputation` do avaliado.

---

## Fora do escopo

- Prazo para submissão de avaliação após conclusão
- Moderação ou remoção de comentários
- Avaliações para transações canceladas ou reembolsadas
- Ponderação de avaliações por data (todas têm peso igual)

---

## Schema

**Tabela:** `ratings`

| Coluna | Tipo SQLAlchemy | Nullable | Descrição |
|--------|-----------------|----------|-----------|
| `id` | `Integer PK autoincrement` | não | Chave primária |
| `transaction_id` | `ForeignKey("transactions.id")` | não | Transação da negociação |
| `rater_id` | `ForeignKey("users.id")` | não | Usuário que avaliou |
| `ratee_id` | `ForeignKey("users.id")` | não | Usuário que recebeu a avaliação |
| `stars` | `Integer` | não | Nota de 0 a 5 (CHECK 0 ≤ stars ≤ 5) |
| `comment` | `Text` | sim | Descrição opcional da negociação |
| `created_at` | `DateTime(timezone=True)` | não | Timestamp automático |

**Constraints:**
- Unique: `(transaction_id, rater_id)` — impede segunda avaliação na mesma transação pelo mesmo usuário
- CheckConstraint: `stars BETWEEN 0 AND 5`

**Índices:**
- `ratings_transaction_id_idx` em `transaction_id`
- `ratings_ratee_id_idx` em `ratee_id` (para query de perfil)

---

## API

### `POST /transactions/{transaction_id}/rate`

**Auth:** obrigatória (`CurrentUser`)

**Body:**
```json
{ "stars": 4, "comment": "Negociação rápida e segura" }
```

**Validações (em ordem):**
1. Transação existe → 404 se não
2. `transaction.status == "completed"` → 400 se não
3. Usuário autenticado é `buyer_id` ou `seller_id` → 403 se não
4. `(transaction_id, rater_id)` único → 409 se já existe

**Lógica:**
- Se rater é buyer → ratee é seller; se rater é seller → ratee é buyer
- Insere `Rating`
- Recalcula `reputation` do ratee (ver fórmula abaixo)
- Retorna 201 + `RatingResponse`

**Response (201):**
```json
{
  "id": 1,
  "transaction_id": 42,
  "stars": 4,
  "comment": "Negociação rápida e segura",
  "created_at": "2026-04-27T10:00:00Z"
}
```

---

### `GET /users/{user_id}/ratings`

**Auth:** pública (sem autenticação)

**Response (200):**
```json
[
  {
    "id": 1,
    "transaction_id": 42,
    "rater_display_name": "PlayerXYZ",
    "rater_avatar_url": "https://...",
    "stars": 5,
    "comment": "Vendedor confiável",
    "created_at": "2026-04-27T10:00:00Z"
  }
]
```

---

## Fórmula de reputação

```
reputation = floor(count(stars >= 4) / count(*) * 100)
```

- Recalculada em `_recalculate_reputation(db, ratee_id)` após cada nova avaliação
- Usa duas queries COUNT sobre `ratings WHERE ratee_id = ?`
- Se o usuário não tem avaliações: `reputation` permanece 100 (valor default do modelo `User`)
- Range resultante: 0–100

---

## Estrutura do módulo

```
app/ratings/
├── __init__.py
├── models.py      # Rating ORM model
├── schemas.py     # RatingRequest, RatingResponse, RatingListItem
├── service.py     # submit_rating(), get_user_ratings(), _recalculate_reputation()
└── router.py      # rotas POST e GET
```

Registrado em `app/main.py` via `app.include_router(ratings_router)`.

---

## Fluxo de `submit_rating`

```
submit_rating(db, current_user, transaction_id, stars, comment)
  1. SELECT Transaction WHERE id = transaction_id → 404 se None
  2. tx.status != "completed" → 400
  3. current_user.id not in (tx.buyer_id, tx.seller_id) → 403
  4. ratee_id = tx.seller_id if current_user.id == tx.buyer_id else tx.buyer_id
  5. INSERT Rating → IntegrityError (unique) → 409
  6. _recalculate_reputation(db, ratee_id)
  7. COMMIT
  8. return rating
```

## `_recalculate_reputation`

```
SELECT COUNT(*) FROM ratings WHERE ratee_id = ?              → total
SELECT COUNT(*) FROM ratings WHERE ratee_id = ? AND stars >= 4 → positives
reputation = floor(positives / total * 100) if total > 0 else deixa como está
UPDATE users SET reputation = reputation WHERE id = ratee_id
```

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `app/ratings/__init__.py` | Novo (vazio) |
| `app/ratings/models.py` | Novo — modelo `Rating` |
| `app/ratings/schemas.py` | Novo — schemas de request/response |
| `app/ratings/service.py` | Novo — `submit_rating`, `get_user_ratings`, `_recalculate_reputation` |
| `app/ratings/router.py` | Novo — 2 rotas |
| `app/main.py` | Adicionar `include_router` |
| `alembic/versions/<hash>_add_ratings_table.py` | Nova migração |
