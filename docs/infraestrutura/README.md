# Infraestrutura

Banco de dados, Supabase, deploy, migrations e variáveis de ambiente.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [supabase.md](./supabase.md) | Setup Supabase, camada de dados, segurança |
| [banco-de-dados.md](./banco-de-dados.md) | Schema completo, tabelas e relacionamentos |
| [migrations.md](./migrations.md) | Histórico de alterações SQL incrementais |
| [variaveis-ambiente.md](./variaveis-ambiente.md) | Todas as env vars (client + server) |
| [deploy-cloudflare.md](./deploy-cloudflare.md) | Deploy primário — Workers + GitHub Actions |
| [deploy-docker.md](./deploy-docker.md) | Deploy legado — Docker / EasyPanel |

## Arquivos SQL

| Arquivo | Uso |
|---------|-----|
| [`../setup-supabase.sql`](../setup-supabase.sql) | Schema inicial completo (primeira execução) |
| [`../migrations/`](../migrations/) | Alterações incrementais por data |

## Ordem de setup (novo ambiente)

1. Criar projeto no [Supabase](https://supabase.com)
2. Executar `setup-supabase.sql` no SQL Editor
3. Executar migrations em ordem cronológica (ver [migrations.md](./migrations.md))
4. Configurar `.env` local (ver [variaveis-ambiente.md](./variaveis-ambiente.md))
5. `npm install && npm run dev`
6. Deploy Cloudflare (ver [deploy-cloudflare.md](./deploy-cloudflare.md))

## Diagrama de tabelas (resumo)

```
auth.users (1) ── (1) empresas
                        │
        ┌───────────────┼───────────────┬──────────────┐
        ▼               ▼               ▼              ▼
    clientes        servicos       orcamentos    billing_payments
        │               │               │
        │               │         orcamento_itens
        │               │               │
        └───────────────┴─────── financeiro
                                historico_status

login_otp          system_settings       billing_events
admin_otp_codes
```
