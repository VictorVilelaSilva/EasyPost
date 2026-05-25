# Auth Routes

## `GET /api/auth/steam/login`
Redireciona o utilizador para a página de login do Steam OpenID.
- **Auth:** Nenhuma
- **Response:** Redirect 302 para `steamcommunity.com/openid/login`

## `GET /api/auth/steam/callback`
Callback chamado pela Steam após o login. Valida a resposta OpenID, cria ou atualiza o utilizador no banco, gera JWT access token e refresh token.
- **Auth:** Nenhuma
- **Response:** Redirect 302 para `{FRONTEND_URL}/auth/callback` com cookies:
	- `access_token` (não httpOnly)
	- `refresh_token` (httpOnly)

## `POST /api/auth/refresh`
Renova o access token usando o refresh token armazenado no cookie.
- **Auth:** Cookie `refresh_token`
- **Response:** `{ "access_token": "...", "token_type": "bearer" }`

## `POST /api/auth/logout`
Remove os cookies de sessão (`refresh_token` e `access_token`).
- **Auth:** Nenhuma
- **Response:** `{ "detail": "Logged out" }`

---

## `GET /api/users/me`
Retorna o perfil do utilizador autenticado.
- **Auth:** Bearer JWT
- **Response:** `UserResponse` (`id`, `steam_id`, `display_name`, `avatar_url`, `trade_url`, `is_trade_banned`, `reputation`, `balance`, `email`, `cpf`, `asaas_customer_id`)

## `PATCH /api/users/me`
Atualiza `trade_url`, `email` e/ou `cpf` do utilizador.
- **Auth:** Bearer JWT
- **Body:** `{ "trade_url?": string, "email?": string, "cpf?": string }`
- **Response:** `UserResponse` atualizado
- **Erros:** 422 para CPF inválido

Observação: quando `email` e `cpf` ficam preenchidos pela primeira vez, a API tenta criar automaticamente o cliente no Asaas e preencher `asaas_customer_id`.
