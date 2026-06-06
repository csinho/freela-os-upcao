# Supabase — Integração

> Consolidado de `docs/supabase.md`. Detalhes de schema em [banco-de-dados.md](./banco-de-dados.md).

## Clientes Supabase

| Arquivo | Uso | Chave |
|---------|-----|-------|
| `src/integrations/supabase/client.ts` | Browser (TanStack Query, repository) | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `src/integrations/supabase/server.ts` | Server Functions (auth, billing, OTP) | `SUPABASE_SERVICE_ROLE_KEY` |

Nenhuma URL ou chave fica hardcoded — tudo via `.env`.

## Setup inicial

1. Criar projeto em [supabase.com](https://supabase.com)
2. SQL Editor → colar `docs/setup-supabase.sql` → Run
3. Aplicar migrations em `docs/migrations/` (ver [migrations.md](./migrations.md))

## Camada de dados (client)

| Arquivo | Papel |
|---------|--------|
| `src/lib/repository.ts` | CRUD tipado + `move` orçamentos + financeiro automático |
| `src/lib/store.ts` | Hooks TanStack Query |

Filtro multi-tenant: `empresa_id` da sessão em todas as queries ERP.

## Regras automáticas (repository)

- **Em produção:** `data_aprovacao`, histórico, cria conta a receber
- **Entregue:** `data_entrega`, marca lançamento como pago

## Realtime

`src/lib/supabase/realtime.ts` — canal para admin e `/plano`:

- `empresas`
- `billing_payments`
- `system_settings`

## Segurança (RLS multi-tenant)

Migration: `docs/migrations/2026-06-06-rls-multi-tenant.sql` (aplicada no projeto remoto).

| Tabela | Quem acessa (client) | Regra |
|--------|----------------------|-------|
| `empresas` | `authenticated` | Só a linha com `auth_user_id = auth.uid()` |
| `clientes`, `servicos`, `orcamentos`, `financeiro` | `authenticated` | `empresa_id = auth_empresa_id()` |
| `orcamento_itens`, `historico_status` | `authenticated` | Via orçamento do tenant |
| `billing_payments` | `authenticated` | SELECT só da própria empresa |
| `system_settings` | `authenticated` | SELECT (valor do plano) |
| `login_otp`, `admin_otp_codes`, `billing_events` | — | Sem policy pública; só **service role** |

Função auxiliar: `auth_empresa_id()` — resolve `empresas.id` a partir de `auth.uid()`.

Admin, billing, OTP e webhooks continuam via **service role** (ignora RLS).

## Documento legado

[supabase.md](../supabase.md)
