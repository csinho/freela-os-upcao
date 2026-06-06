# Spec — Integração Woovi (Billing SaaS)

> Resumo da spec completa. Documento original: [`PROMPT-WOOVI-INTEGRACAO.md`](../PROMPT-WOOVI-INTEGRACAO.md)

## Escopo

Assinatura mensal do **próprio Up Serviços** via PIX (Woovi/OpenPix). **Não** é cobrança de pedidos dos clientes do freelancer.

## Modelo comercial

| Item | Valor |
|------|-------|
| Trial | 7 dias no cadastro |
| Plano | R$ 39,90/mês (configurável em `system_settings`) |
| Meio | PIX dinâmico (link + QR) |
| Renovação | +30 dias por pagamento confirmado |
| Lembretes | Dias 5, 3 e 1 antes do vencimento (WhatsApp stub) |
| Inadimplência | Bloqueia novo orçamento e aprovação no Kanban |

## Endpoints

| Rota | Método | Função |
|------|--------|--------|
| `/api/webhooks/woovi` | POST | Confirma pagamento / reembolso |
| `/api/cron/billing` | GET | Job diário (lembretes, pendente, PIX auto) |

## Variáveis de ambiente (servidor)

| Variável | Uso |
|----------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Escritas de billing |
| `WOOVI_APP_ID` | API Woovi |
| `BILLING_CRON_SECRET` | Protege cron HTTP |
| `PUBLIC_APP_URL` | Links em notificações |

## Fluxo de pagamento

1. Empresa acessa `/plano` → gera cobrança PIX
2. Woovi retorna QR + link
3. Pagamento confirmado → webhook `OPENPIX:CHARGE_COMPLETED`
4. Servidor atualiza `billing_payments`, `empresas.billing_status`, `billing_next_due`
5. UI atualiza via Realtime

## Guards de inadimplência

- `moverOrcamentoComBillingRemote` — bloqueia aprovação se inadimplente
- Criação de novo orçamento também verificada

## Cron

- Cloudflare: `wrangler.jsonc` → `0 12 * * *` + `scheduled` em `src/server.ts`
- Docker: HTTP externo com `?secret=BILLING_CRON_SECRET`

## Tabelas

Migration: `docs/migrations/2026-06-05-empresa-billing.sql`

Colunas em `empresas`: `billing_status`, `billing_trial_ends`, `billing_next_due`, `billing_last_paid_at`, etc.

## Implementação

[modulos/08-plano-billing.md](../modulos/08-plano-billing.md)

## Arquivos-chave

```
src/lib/billing/
  billing.server.ts       # Cron diário, trial, renovação
  guards.server.ts        # Bloqueio inadimplência
  woovi/                  # Cliente API, charge, webhook, receipt
src/lib/api/billing.functions.ts
src/lib/api/request-handlers.ts
src/routes/plano.tsx
src/routes/api/webhooks/woovi.ts
src/routes/api/cron/billing.ts
```
