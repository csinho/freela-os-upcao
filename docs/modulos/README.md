# Módulos — Implementação

Documentação de **como cada módulo foi implementado**: rotas, arquivos, tabelas, regras de negócio e dependências.

## ERP (área da empresa)

| # | Módulo | Rota | Arquivo |
|---|--------|------|---------|
| 01 | [Dashboard](./01-dashboard.md) | `/` | `src/routes/index.tsx` |
| 02 | [Kanban](./02-kanban.md) | `/kanban` | `src/routes/kanban.tsx` |
| 03 | [Clientes](./03-clientes.md) | `/clientes` | `src/routes/clientes.tsx` |
| 04 | [Serviços](./04-servicos.md) | `/servicos` | `src/routes/servicos.tsx` |
| 05 | [Orçamentos](./05-orcamentos.md) | `/orcamentos`, `/orcamentos/$id` | `src/routes/orcamentos.*.tsx` |
| 06 | [Financeiro](./06-financeiro.md) | `/financeiro` | `src/routes/financeiro.tsx` |
| 07 | [Empresa](./07-empresa.md) | `/empresa` | `src/routes/empresa.tsx` |
| 08 | [Plano / Billing](./08-plano-billing.md) | `/plano` | `src/routes/plano.tsx` |
| 11 | [PDF](./11-pdf.md) | (em orçamentos) | `src/lib/pdf-orcamento.ts` |

## Auth e plataforma

| # | Módulo | Rota | Arquivo |
|---|--------|------|---------|
| 09 | [Autenticação](./09-autenticacao.md) | `/login`, `/cadastro/empresa` | `src/routes/login.tsx`, `cadastro.empresa.tsx` |
| 10 | [Admin](./10-admin.md) | `/admin/*` | `src/routes/admin.*.tsx` |
| 12 | [Setup WhatsApp](./12-setup-whatsapp.md) | `/setup/whatsapp` | `src/routes/setup.whatsapp.tsx` |

## Camada compartilhada

Todos os módulos ERP usam:

| Camada | Arquivo | Função |
|--------|---------|--------|
| Tipos | `src/lib/types.ts` | Interfaces + `calcTotal`, `formatBRL` |
| Repository | `src/lib/repository.ts` | CRUD Supabase filtrado por `empresa_id` |
| Store | `src/lib/store.ts` | Hooks TanStack Query + mutations |
| Layout | `src/components/app-shell.tsx` | Sidebar, nav, logout, billing banner |
| Guard | `src/components/auth/RequireEmpresa.tsx` | Proteção de rotas ERP |
| Sessão | `src/lib/auth/client-session.ts` | `empresa_id` do `localStorage` |

## Specs relacionadas

- ERP core → [specs/erp-core.md](../specs/erp-core.md)
- Auth → [specs/erp-autenticacao-evolution-admin.md](../specs/erp-autenticacao-evolution-admin.md)
- Admin → [specs/painel-admin.md](../specs/painel-admin.md)
- Billing → [specs/woovi-integracao.md](../specs/woovi-integracao.md)
