# 🛡️ Épico: Marketplace P2P de Itens Dota 2 com Sistema de Escrow

## 1. Resumo (Contexto)

Desenvolver uma plataforma SaaS de compra e venda de itens cosméticos de Dota 2 baseada no modelo P2P (Peer-to-Peer). O diferencial central é a eliminação de intermediários físicos (bots de depósito) em favor de uma integração via Steam API que garante o pagamento apenas após a confirmação técnica da entrega do item.

## 2. Objetivo de Negócio

Reduzir a taxa de golpes em transações de itens digitais a zero, oferecendo uma alternativa segura e com liquidez (saque via Pix) ao Mercado da Comunidade Steam, onde o saldo fica preso na plataforma da Valve.

## 3. Personas Envolvidas

- **Vendedor (Trader)**: Possui itens valiosos e quer vendê-los por dinheiro real sem risco de sofrer chargeback.
- **Comprador (Player)**: Busca itens específicos (Arcanas, Imortais) com garantia de recebimento ou estorno imediato.
- **Mediador (Admin)**: Atua apenas em casos de discrepância nos dados da API (disputas).

## 4. Escopo de Funcionalidades (User Stories)

### A. Autenticação e Inventário

- **US1**: Eu, como usuário, quero logar via Steam OpenID para que meu perfil seja vinculado de forma oficial e segura.
- **US2**: Eu, como vendedor, quero que o sistema leia meu inventário via Steam API para listar meus itens automaticamente com preços sugeridos.

### B. O Motor de Troca (Core)

- **US3**: Eu, como comprador, quero pagar pelo item e saber que o dinheiro ficará retido na plataforma (Escrow) até que eu receba o item.
- **US4**: Eu, como vendedor, quero ser notificado via e-mail/WhatsApp quando houver uma compra, recebendo o link direto para a proposta de troca na Steam.
- **US5**: Eu, como sistema, devo monitorar o status da TradeOfferID via API para detectar o estado "Accepted" e liberar o saldo automaticamente.

### C. Gestão de Trade Lock (7 Dias)

- **US6**: Eu, como usuário, quero ver claramente quais itens estão em "Cooldown" de troca e quando estarão disponíveis para venda.

## 5. Requisitos Técnicos

- **Arquitetura**: P2P API-Assisted (Sem bots de inventário para evitar banimentos da Valve)
- **Integração Principal**: Steam Web API (IEconService para monitorar trocas)
- **Segurança de Transação**: Implementar verificação de "API Key" do usuário para evitar o API Scam
- **Backend**: Node.js ou Go (pela natureza assíncrona das requisições de API)
- **Pagamentos**: Integração com Gateway de Pagamento (Stripe ou Efí/Asaas para Pix) com suporte a split de pagamento e retenção

## 6. Critérios de Aceite (Definition of Done)

- O usuário consegue logar e ver seus itens de Dota 2 em menos de 5 segundos
- O sistema bloqueia a listagem de itens que não são trocáveis (Non-tradable)
- O fluxo de pagamento retém o valor e só marca a transação como "Concluída" após o trade_status retornar Accepted na Steam
- O vendedor não consegue sacar o valor antes de 24h após a entrega (margem de segurança)
- Se a troca for recusada ou expirar (48h), o estorno ao comprador deve ser automático

## 7. Fluxo de Sucesso (Happy Path)

1. Vendedor anuncia Arcana de PA
2. Comprador paga R$ 100,00 via Pix
3. Sistema retém R$ 100,00 e gera link de troca
4. Vendedor envia o item pela Steam
5. Comprador aceita o item
6. Sistema detecta a confirmação via API
7. Sistema credita R$ 90,00 ao Vendedor (10% de taxa) e libera o saque
