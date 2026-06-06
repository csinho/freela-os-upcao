# Migrations SQL

Histórico de alterações incrementais ao schema. Executar no **SQL Editor** do Supabase, em ordem cronológica, após o `setup-supabase.sql` inicial.

## Índice

| Data | Arquivo | Módulo | O que faz |
|------|---------|--------|-----------|
| 2026-05-22 | [`2026-05-22-desconto-percentual.sql`](../migrations/2026-05-22-desconto-percentual.sql) | Orçamentos | Coluna `desconto_percentual` em `orcamentos` |
| 2026-06-05 | [`2026-06-05-empresa-billing.sql`](../migrations/2026-06-05-empresa-billing.sql) | Billing | Colunas billing em `empresas`, tabelas `billing_payments` e `billing_events` |
| 2026-06-06 | [`2026-06-06-auth-login.sql`](../migrations/2026-06-06-auth-login.sql) | Auth | `auth_user_id`, `login_otp`, `empresa_id` nas tabelas ERP |
| 2026-06-06 | [`2026-06-06-admin-panel.sql`](../migrations/2026-06-06-admin-panel.sql) | Admin | `empresas.status`, `system_settings`, `admin_otp_codes`, Realtime |
| 2026-06-06 | [`2026-06-06-fix-login-otp-rls.sql`](../migrations/2026-06-06-fix-login-otp-rls.sql) | Auth | ~~Desabilita RLS em `login_otp`~~ — substituído pela migration RLS multi-tenant |
| 2026-06-06 | [`2026-06-06-system-settings-authenticated-read.sql`](../migrations/2026-06-06-system-settings-authenticated-read.sql) | Billing | Policy `authenticated_read` em `system_settings` |
| 2026-06-06 | [`2026-06-06-rls-multi-tenant.sql`](../migrations/2026-06-06-rls-multi-tenant.sql) | Segurança | RLS por `empresa_id`, `login_otp` protegido, `empresa_id` NOT NULL |
| 2026-06-06 | [`2026-06-06-trial-3-dias-empresas-existentes.sql`](../migrations/2026-06-06-trial-3-dias-empresas-existentes.sql) | Billing | Recalcula trial de empresas em `trial` para 3 dias desde `created_at` |

## Ordem de execução (ambiente novo)

```
1. setup-supabase.sql
2. 2026-05-22-desconto-percentual.sql
3. 2026-06-05-empresa-billing.sql
4. 2026-06-06-auth-login.sql
5. 2026-06-06-admin-panel.sql
6. 2026-06-06-fix-login-otp-rls.sql
```

## Módulos afetados

| Migration | Docs de módulo |
|-----------|----------------|
| desconto-percentual | [05-orcamentos](../modulos/05-orcamentos.md), [11-pdf](../modulos/11-pdf.md) |
| empresa-billing | [08-plano-billing](../modulos/08-plano-billing.md) |
| auth-login | [09-autenticacao](../modulos/09-autenticacao.md) |
| admin-panel | [10-admin](../modulos/10-admin.md) |
| fix-login-otp-rls | [09-autenticacao](../modulos/09-autenticacao.md) |

## Specs relacionadas

- [specs/erp-core.md](../specs/erp-core.md)
- [specs/woovi-integracao.md](../specs/woovi-integracao.md)
- [specs/erp-autenticacao-evolution-admin.md](../specs/erp-autenticacao-evolution-admin.md)
- [specs/painel-admin.md](../specs/painel-admin.md)
