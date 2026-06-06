# Variáveis de Ambiente

Referência: `.env.example` na raiz do projeto.

## Client-side (build-time `VITE_*`)

Embutidas no bundle no momento do **build**. Configure antes de `npm run build`.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publishable (ou anon legada) |

Usadas em: `src/integrations/supabase/client.ts`

## Server-only (runtime)

**Nunca** usar prefixo `VITE_` em credenciais sensíveis.

### Supabase

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — auth, billing, OTP |

### Auth / Admin

| Variável | Descrição |
|----------|-----------|
| `ADMIN_WHATSAPP_ALLOWLIST` | Bootstrap e admins extras (11 dígitos, vírgula). O número salvo em `system_settings.evolution.connection_phone` (admin ou `/setup/whatsapp`) **também** entra na allowlist de login — não é preciso duplicar aqui após o 1º setup. |

**Allowlist efetiva** = env ∪ `connection_phone` do banco. Ver [ADMIN.md](../ADMIN.md).

### Evolution API (WhatsApp)

| Variável | Descrição |
|----------|-----------|
| `EVOLUTION_API_URL` | Base URL da API |
| `EVOLUTION_API_KEY` | Chave de API |
| `EVOLUTION_INSTANCE` | Nome da instância |

### Billing (Woovi)

| Variável | Descrição |
|----------|-----------|
| `WOOVI_APP_ID` | AppID Woovi/OpenPix |
| `BILLING_CRON_SECRET` | Protege `GET /api/cron/billing` |
| `PUBLIC_APP_URL` | URL pública do app (webhooks, links) |
| `WOOVI_WEBHOOK_AUTHORIZATION` | Opcional — header do webhook |

## Onde configurar

| Ambiente | Como |
|----------|------|
| Local | `.env` (copiar de `.env.example`) |
| Cloudflare Workers | Secrets no dashboard ou `wrangler secret put` |
| GitHub Actions | Repository secrets |
| Docker/EasyPanel | Environment variables no painel |

## Cloudflare (`wrangler.jsonc`)

`PUBLIC_APP_URL` pode estar em `vars` do wrangler para o Worker.

Cron billing configurado em `triggers.crons`: `0 12 * * *`.

## Cloudflare Worker — o que manter

| Variável | Necessária? | Motivo |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | **Sim** | Build (GitHub Actions) + runtime do Worker (server functions) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Sim** | Build + client Supabase no SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sim** | Auth OTP, billing, admin, webhooks |
| `ADMIN_WHATSAPP_ALLOWLIST` | **Opcional*** | Bootstrap / admins extras; número da Evolution no banco também autoriza login |
| `BILLING_CRON_SECRET` | **Sim** | Cron diário de billing |
| `WOOVI_APP_ID` | **Sim** | Cobrança PIX |
| `EVOLUTION_API_URL` | **Sim** | OTP WhatsApp |
| `EVOLUTION_API_KEY` | **Sim** | OTP WhatsApp |
| `EVOLUTION_INSTANCE` | **Sim** | Fallback da instância (também em `system_settings`) |
| `PUBLIC_APP_URL` | **Opcional** | Já definida em `wrangler.jsonc` → `vars`. Não é lida no código hoje — pode ficar só no `wrangler.jsonc` |
| `EVOLUTION_MOCK` | **Remover** | Não existe no código — legado |
| `WOOVI_WEBHOOK_AUTHORIZATION` | Opcional | Só se configurar header no painel Woovi |
| `WOOVI_API_URL` | Opcional | Default: `https://api.openpix.com.br/api/v1` |
| `ADMIN_SETUP_SECRET` | Opcional | Usa `BILLING_CRON_SECRET` como fallback em `/setup/whatsapp` |

\* `ADMIN_WHATSAPP_ALLOWLIST` é obrigatória apenas no **primeiro deploy** (antes de salvar a instância Evolution no banco). Depois, o número do QR em `/admin/configuracoes` ou `/setup/whatsapp` basta para login admin.
