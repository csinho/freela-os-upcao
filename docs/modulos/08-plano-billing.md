# Módulo — Plano / Billing SaaS

## Resumo

Assinatura mensal do Up Serviços via PIX (Woovi). Trial de 7 dias, renovação automática, guards de inadimplência.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/plano` |
| Arquivo | `src/routes/plano.tsx` |

## Modelo

| Item | Valor |
|------|-------|
| Trial | 7 dias no cadastro |
| Plano | R$ 39,90/mês (configurável em `system_settings`) |
| Meio | PIX dinâmico (QR + link) |
| Renovação | +30 dias por pagamento |

## Status de billing (`empresas.billing_status`)

| Status | Significado |
|--------|-------------|
| `trial` | Período de teste |
| `ativo` | Plano em dia |
| `pendente` | Vencimento próximo, aguardando pagamento |
| `inadimplente` | Bloqueio de funcionalidades |

## UI da página `/plano`

- Status atual, trial até, próximo vencimento
- Botão **Gerar PIX** → `gerarPixPlanoRemote`
- QR Code e link de pagamento
- Histórico de pagamentos
- Atualização via Supabase Realtime (`src/lib/supabase/realtime.ts`)

## Banner no AppShell

`src/components/empresa/EmpresaBillingBanner.tsx` — alerta quando pendente ou inadimplente.

## Guards

`src/lib/billing/guards.server.ts`:

- Bloqueia **novo orçamento** se inadimplente
- Bloqueia **aprovação** (Kanban → produção) se inadimplente

Chamado via `moverOrcamentoComBillingRemote`.

## Endpoints servidor

| Rota | Função |
|------|--------|
| `POST /api/webhooks/woovi` | Confirma PIX / reembolso |
| `GET /api/cron/billing` | Job diário |

Cron Cloudflare: `0 12 * * *` em `wrangler.jsonc`.

## Server Functions

`src/lib/api/billing.functions.ts`:

- `gerarPixPlanoRemote`
- `moverOrcamentoComBillingRemote`

## Biblioteca billing

```
src/lib/billing/
  billing.server.ts      # Cron, trial, renovação
  empresa.server.ts      # Leitura status empresa
  payments.server.ts     # Histórico pagamentos
  notifications.server.ts  # Lembretes WhatsApp (stub)
  guards.server.ts       # Bloqueios
  woovi/                 # Cliente API Woovi
```

## Tabelas

- `empresas` (colunas billing)
- `billing_payments`
- `billing_events` (idempotência webhook)
- `system_settings` (valor do plano)

Migration: `docs/migrations/2026-06-05-empresa-billing.sql`

## Variáveis de ambiente

```
WOOVI_APP_ID
BILLING_CRON_SECRET
PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Spec relacionada

[specs/woovi-integracao.md](../specs/woovi-integracao.md)

Documento legado: [BILLING.md](../BILLING.md)
