# Módulo — Orçamentos

## Resumo

Núcleo do ERP: criação, edição e gestão de orçamentos/pedidos com itens, descontos, status e integração com Kanban, financeiro e PDF.

## Rotas

| Rota | Arquivo | Função |
|------|---------|--------|
| `/orcamentos` | `src/routes/orcamentos.index.tsx` | Lista tabular |
| `/orcamentos/$id` | `src/routes/orcamentos.$id.tsx` | Edição completa + PDF |

## Fluxo de criação

1. **Novo orçamento** → cria registro com `numero` automático (`ORC-YYYYMMDD-NNNNN`)
2. Status inicial: `orcamento`
3. Selecionar cliente, nome do projeto, itens
4. Itens: do catálogo (`useServicos`) ou em branco
5. Editar quantidade/valor → subtotal em tempo real
6. Desconto em **%** (`desconto_percentual`) → valor em R$ calculado
7. Acréscimo em R$
8. Forma de pagamento, prazo, validade, condições, observações
9. Textos padrão da empresa (`useEmpresa`) pré-preenchidos
10. **Salvar** → `useSaveOrcamento`

## Aprovação → Pedido

Alterar status para **Em produção** (select na topbar ou Kanban):

- `data_aprovacao` preenchida
- Histórico em `historico_status`
- Conta a receber no financeiro (sem duplicar)

## Cálculos

```ts
// src/lib/types.ts
calcSubtotal(itens)
calcDescontoValor(subtotal, desconto_percentual)
calcTotal(subtotal, desconto_percentual, acrescimo)
```

Persistência: `desconto` (R$) e `desconto_percentual` (%) em `orcamentos`.

Migration: `docs/migrations/2026-05-22-desconto-percentual.sql`

## Rascunho local

`src/lib/orcamento-draft.ts` — sessionStorage para preservar edição em andamento.

## Hooks principais

| Hook | Função |
|------|--------|
| `useOrcamentos` | Lista |
| `useOrcamento(id)` | Detalhe + itens |
| `useSaveOrcamento` | Upsert orçamento + itens |
| `useMoveOrcamento` | Mudança de status (com billing guard) |
| `useCreateOrcamento` | Novo com número automático |

## Tabelas

- `orcamentos` — cabeçalho, status, totais, datas
- `orcamento_itens` — linhas (FK cascade)
- `historico_status` — auditoria
- `financeiro` — gerado na aprovação

## PDF

Ver [11-pdf.md](./11-pdf.md).

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Orçamentos
