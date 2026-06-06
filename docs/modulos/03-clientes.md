# Módulo — Clientes

## Resumo

CRUD de clientes do freelancer. Cada cliente pertence ao tenant (`empresa_id`) e é referenciado em orçamentos e financeiro.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/clientes` |
| Arquivo | `src/routes/clientes.tsx` |

## Funcionalidades

- Listagem em tabela
- Criar / editar via `CrudDialog`
- Excluir com confirmação
- Endereço com autocomplete **ViaCEP** (`src/lib/viacep.ts`)
- Validações: CPF, telefone (`src/lib/validators.ts`)

## Camada de dados

| Função | Arquivo |
|--------|---------|
| `useClientes` | `store.ts` |
| `useUpsertCliente` | `store.ts` |
| `useRemoveCliente` | `store.ts` |
| `clientesRepo.list/upsert/remove` | `repository.ts` |

Todas as queries filtram por `empresa_id` via `getEmpresaIdFromSessao()`.

## Tabela

### `clientes`

| Campo | Uso |
|-------|-----|
| `id` | UUID |
| `empresa_id` | FK tenant |
| `nome` | Obrigatório |
| `telefone`, `email`, `documento` | Contato |
| `endereco` | JSONB (rua, cidade, CEP…) |
| `observacoes` | Texto livre |

Migration multi-tenant: `docs/migrations/2026-06-06-auth-login.sql`

## Componentes

- `CrudDialog` — dialog genérico reutilizado em serviços e clientes
- Formulário com `react-hook-form` + campos shadcn

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Clientes
