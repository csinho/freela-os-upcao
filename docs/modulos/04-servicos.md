# Módulo — Serviços

## Resumo

Catálogo de serviços com preço padrão e unidade. Alimenta o combobox "Adicionar do catálogo" na edição de orçamentos.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/servicos` |
| Arquivo | `src/routes/servicos.tsx` |

## Funcionalidades

- CRUD completo (tabela + `CrudDialog`)
- Campos: nome, descrição, `valor_padrao`, `unidade`, ativo, observações
- Unidades permitidas: `serviço`, `hora`, `mensalidade`, `pacote`

## Uso em orçamentos

Em `/orcamentos/$id`, combobox lista serviços ativos. Ao selecionar, copia para o item:

- nome, descrição, unidade, valor unitário

## Camada de dados

| Função | Arquivo |
|--------|---------|
| `useServicos` | `store.ts` |
| `useUpsertServico` / `useRemoveServico` | `store.ts` |
| `servicosRepo` | `repository.ts` |

## Tabela

### `servicos`

| Campo | Tipo |
|-------|------|
| `empresa_id` | FK tenant |
| `nome` | text not null |
| `valor_padrao` | numeric(12,2) |
| `unidade` | check constraint |
| `ativo` | boolean default true |

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Serviços
