# Spec — Painel Administrativo

> Resumo da spec completa. Documento original: [`ESPECIFICACAO-PAINEL-ADMIN-ERP.md`](../ESPECIFICACAO-PAINEL-ADMIN-ERP.md)

## Objetivo

Módulo para o **operador da plataforma** gerenciar tenants, billing e configurações globais.

## Capacidades

1. Ver **todas as empresas** cadastradas
2. Abrir detalhe com **situação de pagamento** (trial, ativo, pendente, inadimplente)
3. **Ativar/desativar** empresa manualmente (independente do billing)
4. Configurar **valor do plano** e contato de suporte
5. Login exclusivo via **allowlist de WhatsApp**
6. Persistência Supabase com **Realtime** onde aplicável

## Dois eixos de status (conceito central)

| Eixo | Campo | Valores | Quem controla |
|------|-------|---------|---------------|
| Operacional | `empresas.status` | `ativo` / `inativo` | Admin (pausa manual) |
| Pagamento | `empresas.billing_status` | `trial` / `ativo` / `pendente` / `inadimplente` | Billing automático |

São **independentes**: empresa pode ter plano ativo e estar pausada pelo admin.

## Telas mínimas

| Rota | Função |
|------|--------|
| `/admin/dashboard` | Métricas agregadas (filtro de datas BRT) |
| `/admin/empresas` | Listagem com busca, toggle pausar/ativar |
| `/admin/empresas/{id}` | Detalhe + histórico de pagamentos PIX |
| `/admin/configuracoes` | Valor do plano, contato, Evolution |

## Segurança

- `ADMIN_WHATSAPP_ALLOWLIST` — lista de 11 dígitos separados por vírgula
- Toda server function revalida allowlist
- Sessão admin em `localStorage` (`tipo: "admin"`)

## Configurações globais

Tabela `system_settings` — chave `billing`:

```json
{
  "plan_value_cents": 3990,
  "support_whatsapp": "..."
}
```

Alterações propagam via Supabase Realtime para `/plano` e painel admin.

## Tabelas

| Tabela | Função |
|--------|--------|
| `system_settings` | Config global (billing, admin, evolution) |
| `billing_payments` | Histórico PIX por empresa |
| `billing_events` | Idempotência webhooks |

Migration: `docs/migrations/2026-06-06-admin-panel.sql`

## Implementação

[modulos/10-admin.md](../modulos/10-admin.md)

## Arquivos-chave

```
src/routes/admin.*
src/components/admin/
src/lib/admin/
  metrics.server.ts
  empresas.server.ts
  system-settings.server.ts
  allowlist.server.ts
src/lib/api/admin.functions.ts
```
