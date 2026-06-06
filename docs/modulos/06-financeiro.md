# Módulo — Financeiro

## Resumo

Lista lançamentos financeiros **automáticos**, vinculados a pedidos. Não há criação manual — tudo deriva do fluxo de orçamentos.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/financeiro` |
| Arquivo | `src/routes/financeiro.tsx` |

## Regras de negócio

### Criação automática

Ao mover orçamento para **Em produção**:

- Cria lançamento `tipo: receber`, `status: pendente`
- Valor = total do orçamento
- `orcamento_id` e `cliente_id` preenchidos
- Se já existir lançamento vinculado → **não duplica**

### Pagamento automático

Ao mover para **Entregue**:

- Lançamento vinculado → `status: pago`

### Sem CRUD manual

A tela é somente leitura + filtros. Totais alimentam o Dashboard.

## Implementação

Lógica em `orcamentosRepo.move()` dentro de `src/lib/repository.ts`:

```ts
// Pseudofluxo
if (novoStatus === "em_producao") → financeiroRepo.ensureReceivable(...)
if (novoStatus === "entregue") → financeiroRepo.markPaid(...)
```

## Hooks

| Hook | Função |
|------|--------|
| `useFinanceiro` | Lista todos os lançamentos do tenant |

## Tabela

### `financeiro`

| Campo | Uso |
|-------|-----|
| `empresa_id` | FK tenant |
| `orcamento_id` | FK pedido |
| `cliente_id` | FK cliente |
| `tipo` | `receber` / `pagar` |
| `status` | `pendente` / `pago` / `parcial` |
| `valor` | numeric |
| `vencimento` | timestamptz |
| `descricao` | texto |

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Financeiro
