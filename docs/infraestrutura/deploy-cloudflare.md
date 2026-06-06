# Deploy — Cloudflare Workers

> Método **primário** de deploy. Documento completo legado: [DEPLOY-CLOUDFLARE.md](../DEPLOY-CLOUDFLARE.md)

## Fluxo

```
Push na main → GitHub Actions → wrangler deploy → Worker freela-os
```

## Pré-requisitos (uma vez)

1. **API Token** Cloudflare (template Edit Cloudflare Workers)
2. **Account ID** da conta Cloudflare
3. Secrets no GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. Variáveis `VITE_*` configuradas no build (GitHub Actions ou wrangler)
5. Secrets do Worker: `SUPABASE_SERVICE_ROLE_KEY`, `WOOVI_APP_ID`, etc.

## Arquivos de deploy

| Arquivo | Função |
|---------|--------|
| `wrangler.jsonc` | Config Worker, cron, vars |
| `src/server.ts` | Entry Worker + handler `scheduled` |
| `.github/workflows/deploy-cloudflare.yml` | CI/CD automático |
| `vite.config.ts` | Plugin Cloudflare + TanStack Start |

## Domínio

Worker: `freela-os`. Domínio alvo: `upservicos.com` (custom domain no dashboard Cloudflare).

## Cron billing

- Schedule: `0 12 * * *` UTC (09:00 BRT)
- Handler: `scheduled` em `src/server.ts` → `runBillingDailyJob`

## Comandos locais

```bash
npm run build
npm run deploy          # build + wrangler deploy
npm run preview         # build + wrangler dev local
```

## Documento legado

[DEPLOY-CLOUDFLARE.md](../DEPLOY-CLOUDFLARE.md)
