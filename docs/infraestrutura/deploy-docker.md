# Deploy — Docker / EasyPanel (legado)

> Método **legado**, substituído por Cloudflare Workers. Mantido para referência.

## Quando usar

- Ambiente que não suporta Cloudflare Workers
- EasyPanel ou VPS com Docker

## Arquivos

| Arquivo | Função |
|---------|--------|
| `Dockerfile` | Build Vite + execução Wrangler no container (porta 3000) |
| `deploy/wrangler.server.json` | Config Wrangler para runtime Docker |
| `scripts/docker-entrypoint.sh` | Entrypoint do container |

## Variáveis no painel

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...
WOOVI_APP_ID=...
BILLING_CRON_SECRET=...
PUBLIC_APP_URL=https://seu-dominio.com
ADMIN_WHATSAPP_ALLOWLIST=...
EVOLUTION_API_URL=...
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE=...
```

**Importante:** `VITE_*` devem estar disponíveis no **build**, não só no runtime.

## Cron billing (Docker)

Agendar HTTP externo (cron do sistema ou serviço):

```bash
curl "https://SEU-DOMINIO/api/cron/billing?secret=SEU_BILLING_CRON_SECRET"
```

Sugestão: `0 12 * * *` UTC.

## Documento legado

[deploy.md](../deploy.md)
