# Módulo — Dashboard

## Resumo

Página inicial do ERP (`/`). Exibe indicadores agregados de orçamentos e financeiro, últimos orçamentos e próximos vencimentos.

## Rota e proteção

| Item | Valor |
|------|-------|
| Rota | `/` |
| Arquivo | `src/routes/index.tsx` |
| Guard | `RequireEmpresa` (via `__root.tsx`) |

## O que exibe

### Cards de status (orçamentos)

Soma dos totais (`calcTotal`) agrupados por status:

- Em orçamento
- Em produção
- Entregue

### Cards financeiros

Calculados sobre lançamentos em `financeiro`:

- A receber (pendente)
- Recebido (pago)
- A pagar

### Listas

- **Últimos orçamentos** — 5 mais recentes, link para `/orcamentos/$id`
- **Próximos vencimentos** — lançamentos pendentes ordenados por data

## Dados e hooks

| Hook | Origem |
|------|--------|
| `useOrcamentos` | `src/lib/store.ts` → `orcamentosRepo.list()` |
| `useFinanceiro` | `src/lib/store.ts` → `financeiroRepo.list()` |

Filtro multi-tenant: `empresa_id` da sessão em `repository.ts`.

## Tabelas envolvidas

- `orcamentos` — status, totais, datas
- `orcamento_itens` — cálculo de total
- `financeiro` — valores e status de pagamento

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Dashboard

## Como foi criado

1. Rota file-based em `index.tsx` com `createFileRoute("/")`
2. Cards com componentes shadcn (`Card`, `Badge`)
3. Agregações feitas no componente a partir dos dados do TanStack Query
4. Links via `Link` do TanStack Router
