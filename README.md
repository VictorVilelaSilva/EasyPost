# trade

## Banco de dados PostgreSQL

Este repositório tem um compose separado só para o Postgres. Para subir apenas o banco:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

O banco sobe com estes dados padrão:

- Host: `localhost`
- Porta: `5432`
- Banco: `trade`
- Usuário: `root`
- Senha: `root123`

### `.env` da aplicação

No backend, use esta string em `DATABASE_URL`:

```env
DATABASE_URL=postgresql+asyncpg://root:root123@localhost:5432/trade
DATABASE_SCHEMA=trade
```

Se você estiver usando o backend fora do Docker, essa configuração funciona direto com o Postgres exposto na porta 5432 da sua máquina.

### Gerenciador de banco

Para conectar em ferramentas como DBeaver, pgAdmin ou TablePlus, use os mesmos dados:

- Host: `localhost` ou `127.0.0.1`
- Porta: `5432`
- Database: `trade`
- User: `root`
- Password: `root123`

Se a ferramenta pedir URL de conexão, use:

```text
postgresql://root:root123@localhost:5432/trade
```

Se o gerenciador rodar dentro de outro container na mesma rede do compose, o host passa a ser `postgres`.