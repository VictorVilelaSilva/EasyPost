# Design: Tabela de Logs de Erros de Processamento de Pagamentos

**Data:** 2026-04-27
**Escopo:** Persistência de erros internos do processamento de webhooks Asaas

---

## Contexto

O endpoint `POST /payments/webhook` recebe eventos do Asaas e delega o processamento para `process_webhook_in_background`. Atualmente, qualquer exceção nesse fluxo é capturada, o rollback é feito e o erro é emitido apenas para o logger da aplicação (stdout/arquivo). Não há visibilidade persistida desses erros — se o servidor reiniciar ou os logs rotacionarem, a informação se perde.

---

## Objetivo

Criar uma tabela `payment_processing_errors` para persistir erros que ocorrem dentro de `process_webhook_in_background`, permitindo diagnóstico posterior via SQL sem depender de logs voláteis.

---

## Fora do escopo

- Erros do `steam_poller` e outros workers
- Erros nas chamadas externas para a API Asaas (criação de cobrança, saque)
- Endpoint de API para listar erros
- Campo `resolved` para rastreamento de resolução

---

## Schema

**Tabela:** `payment_processing_errors`

| Coluna | Tipo SQLAlchemy | Nullable | Descrição |
|--------|-----------------|----------|-----------|
| `id` | `Integer PK autoincrement` | não | Chave primária |
| `transaction_id` | `Integer` | sim | ID da transação afetada; null se o erro ocorreu antes do parse do `externalReference` |
| `event_type` | `String` | sim | Tipo do evento Asaas (ex: `PAYMENT_RECEIVED`); null se indisponível |
| `error_type` | `String` | não | Nome da classe da exceção (ex: `ValueError`, `IntegrityError`) |
| `error_message` | `Text` | não | `str(exception)` |
| `traceback` | `Text` | não | Stack trace completo via `traceback.format_exc()` |
| `payload` | `JSON` | sim | Payload do webhook que originou o erro |
| `created_at` | `DateTime(timezone=True)` | não | Timestamp com fuso, gerado pelo servidor DB |

**Índice:** `payment_processing_errors_transaction_id_idx` em `transaction_id` para facilitar consultas por transação.

---

## Arquitetura

### Modelo (`app/payment/models.py`)

Novo modelo `PaymentProcessingError` seguindo o mesmo padrão de `PaymentEvent`.

### Função auxiliar (`app/payment/service.py`)

Nova função `_persist_processing_error(payload, exc)` que:
1. Extrai `transaction_id` e `event_type` do payload (com fallback para `None`)
2. Abre uma **nova sessão independente** via `async_session()` — isolada do rollback da sessão principal
3. Cria e persiste o registro `PaymentProcessingError`
4. Loga qualquer falha ao persistir o próprio erro (evita loop)

### Integração em `process_webhook_in_background`

O bloco `except` existente passa a chamar `_persist_processing_error` antes (ou em paralelo ao) `logger.exception`. O comportamento atual de rollback e log não muda — apenas somamos a persistência.

```
process_webhook_in_background
  └── try: process_webhook(db, payload)
      except Exception as exc:
          db.rollback()                         # existente
          _persist_processing_error(payload, exc)  # novo
          logger.exception(...)                 # existente
```

### Migração Alembic

Nova migração gerada via `task rev "add payment_processing_errors table"` com `alembic --autogenerate`.

---

## Decisão de design chave: sessão separada

Quando `process_webhook` falha, a sessão `db` está em estado de erro e será revertida. Tentar usar essa mesma sessão para salvar o erro resultaria em falha silenciosa ou outra exceção. Por isso `_persist_processing_error` abre sua própria `async_session` independente.

---

## Consultas úteis

```sql
-- Últimos 20 erros
SELECT id, created_at, transaction_id, event_type, error_type, error_message
FROM payment_processing_errors
ORDER BY created_at DESC
LIMIT 20;

-- Erros por transação específica
SELECT * FROM payment_processing_errors WHERE transaction_id = 42;

-- Erros agrupados por tipo
SELECT error_type, COUNT(*) FROM payment_processing_errors GROUP BY error_type ORDER BY 2 DESC;
```

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `app/payment/models.py` | Adicionar modelo `PaymentProcessingError` |
| `app/payment/service.py` | Adicionar `_persist_processing_error`, atualizar `process_webhook_in_background` |
| `alembic/versions/<hash>_add_payment_processing_errors_table.py` | Nova migração |
