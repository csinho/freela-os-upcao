# Up Serviços — Documentação

ERP SaaS multi-tenant para freelancers: orçamentos, pedidos (Kanban), clientes, serviços, financeiro, PDF, autenticação por WhatsApp, painel admin e assinatura PIX.

## Como navegar

A documentação está organizada em quatro áreas:

| Pasta | Conteúdo |
|-------|----------|
| [arquitetura/](./arquitetura/README.md) | Visão geral, stack, fluxo de requisição, padrões de código |
| [specs/](./specs/README.md) | Especificações originais (requisitos e decisões de produto) |
| [modulos/](./modulos/README.md) | Implementação módulo a módulo (rotas, arquivos, regras) |
| [infraestrutura/](./infraestrutura/README.md) | Banco, Supabase, deploy, migrations, variáveis de ambiente |

## Início rápido

```bash
cp .env.example .env   # preencha VITE_SUPABASE_* e variáveis de servidor
npm install
npm run dev
```

Sem `.env`, o servidor retorna erro 500 (variáveis `VITE_*` ausentes no build).

## Stack resumida

| Camada | Tecnologia |
|--------|------------|
| Framework | TanStack Start + React 19 + TypeScript |
| Roteamento | TanStack Router (file-based) |
| Dados | Supabase + TanStack Query |
| UI | Tailwind CSS v4 + shadcn/ui |
| Auth | Supabase Auth + OTP WhatsApp (Evolution API) |
| Billing SaaS | Woovi/OpenPix (PIX) |
| Deploy | Cloudflare Workers (primário) ou Docker/EasyPanel |

## Mapa de módulos

### ERP (empresa logada)

| Módulo | Rota | Doc |
|--------|------|-----|
| Dashboard | `/` | [modulos/01-dashboard.md](./modulos/01-dashboard.md) |
| Kanban | `/kanban` | [modulos/02-kanban.md](./modulos/02-kanban.md) |
| Clientes | `/clientes` | [modulos/03-clientes.md](./modulos/03-clientes.md) |
| Serviços | `/servicos` | [modulos/04-servicos.md](./modulos/04-servicos.md) |
| Orçamentos | `/orcamentos`, `/orcamentos/$id` | [modulos/05-orcamentos.md](./modulos/05-orcamentos.md) |
| Financeiro | `/financeiro` | [modulos/06-financeiro.md](./modulos/06-financeiro.md) |
| Empresa | `/empresa` | [modulos/07-empresa.md](./modulos/07-empresa.md) |
| Plano (billing) | `/plano` | [modulos/08-plano-billing.md](./modulos/08-plano-billing.md) |
| PDF | (dentro de orçamentos) | [modulos/11-pdf.md](./modulos/11-pdf.md) |

### Auth e onboarding

| Módulo | Rota | Doc |
|--------|------|-----|
| Login | `/login` | [modulos/09-autenticacao.md](./modulos/09-autenticacao.md) |
| Cadastro | `/cadastro/empresa` | [modulos/09-autenticacao.md](./modulos/09-autenticacao.md) |
| Setup WhatsApp | `/setup/whatsapp` | [modulos/12-setup-whatsapp.md](./modulos/12-setup-whatsapp.md) |

### Painel admin

| Módulo | Rota | Doc |
|--------|------|-----|
| Dashboard admin | `/admin/dashboard` | [modulos/10-admin.md](./modulos/10-admin.md) |
| Empresas | `/admin/empresas` | [modulos/10-admin.md](./modulos/10-admin.md) |
| Configurações | `/admin/configuracoes` | [modulos/10-admin.md](./modulos/10-admin.md) |

## Documentos legados (raiz de `docs/`)

Arquivos mantidos na raiz por compatibilidade. O conteúdo atualizado está nas pastas acima.

| Arquivo legado | Nova localização |
|----------------|------------------|
| `modulos.md` | [modulos/](./modulos/) |
| `AUTENTICACAO.md` | [modulos/09-autenticacao.md](./modulos/09-autenticacao.md) |
| `ADMIN.md` | [modulos/10-admin.md](./modulos/10-admin.md) |
| `BILLING.md` | [modulos/08-plano-billing.md](./modulos/08-plano-billing.md) |
| `pdf.md` | [modulos/11-pdf.md](./modulos/11-pdf.md) |
| `supabase.md` | [infraestrutura/supabase.md](./infraestrutura/supabase.md) |
| `banco-de-dados.md` | [infraestrutura/banco-de-dados.md](./infraestrutura/banco-de-dados.md) |
| `deploy.md` / `DEPLOY-CLOUDFLARE.md` | [infraestrutura/](./infraestrutura/) |
| `ESPECIFICACAO-*.md` / `PROMPT-WOOVI-*.md` | [specs/](./specs/) |
