# Módulo — Kanban

## Resumo

Quadro visual de pedidos com drag-and-drop entre colunas de status. Integra com financeiro automático e guard de billing.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/kanban` |
| Arquivo | `src/routes/kanban.tsx` |

## Colunas

| Coluna | Status DB |
|--------|-----------|
| Orçamento | `orcamento` |
| Em produção | `em_producao` |
| Vistoria | `vistoria` |
| Entregue | `entregue` |

## Comportamento

### Drag-and-drop

- Biblioteca: **@dnd-kit** (`DndContext`, `SortableContext`, `useSortable`)
- Ao soltar: chama `useMoveOrcamento` → `moverOrcamentoComBillingRemote` → `orcamentosRepo.move`

### Aprovação automática (→ Em produção)

- Registra `data_aprovacao`
- Adiciona entrada em `historico_status`
- Cria conta **a receber** no financeiro (se ainda não existir vinculada)

### Entrega (→ Entregue)

- Registra `data_entrega`
- Marca lançamento financeiro vinculado como **pago**

### Card

Exibe: cliente, valor total, prazo, indicador financeiro (Pago/Parcial/Pendente).

Clique abre `/orcamentos/$id`.

## Guard de billing

`moverOrcamentoComBillingRemote` em `src/lib/api/billing.functions.ts` verifica `billing_status` antes de aprovar. Empresa inadimplente não pode mover para produção.

## Arquivos-chave

| Arquivo | Função |
|---------|--------|
| `src/routes/kanban.tsx` | UI do quadro |
| `src/lib/store.ts` | `useMoveOrcamento` |
| `src/lib/repository.ts` | `orcamentosRepo.move` |
| `src/lib/api/billing.functions.ts` | Guard billing |
| `src/lib/billing/guards.server.ts` | Regras de bloqueio |

## Tabelas

- `orcamentos`, `historico_status`, `financeiro`

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Kanban
