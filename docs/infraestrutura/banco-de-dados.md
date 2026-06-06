# Banco de Dados — Schema

> Consolidado de `docs/banco-de-dados.md`. Tipos espelhados em `src/lib/types.ts`.

## Tabelas ERP

### `empresas` (tenant)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `nome` | text | obrigatório |
| `logo_url` | text | Data URL ou URL pública |
| `documento` | text | CPF/CNPJ |
| `telefone`, `email` | text | |
| `endereco` | jsonb | rua, número, bairro, cidade, estado, CEP |
| `site`, `redes_sociais` | text/json | |
| `dados_bancarios` | text | Pix, banco |
| `condicoes_padrao`, `observacoes_padrao` | text | |
| `auth_user_id` | uuid | FK `auth.users` |
| `status` | text | `ativo` / `inativo` |
| `billing_status` | text | `trial` / `ativo` / `pendente` / `inadimplente` |
| `billing_trial_ends` | timestamptz | |
| `billing_next_due` | timestamptz | |
| `billing_last_paid_at` | timestamptz | |

### `clientes`

| Campo | Tipo |
|-------|------|
| `id` | uuid PK |
| `empresa_id` | uuid FK |
| `nome` | text not null |
| `telefone`, `email`, `documento` | text |
| `endereco` | jsonb |
| `observacoes` | text |

### `servicos`

| Campo | Tipo |
|-------|------|
| `id` | uuid PK |
| `empresa_id` | uuid FK |
| `nome` | text not null |
| `descricao` | text |
| `valor_padrao` | numeric(12,2) |
| `unidade` | text (serviço, hora, mensalidade, pacote) |
| `ativo` | boolean |

### `orcamentos`

| Campo | Tipo |
|-------|------|
| `id` | uuid PK |
| `empresa_id` | uuid FK |
| `numero` | text unique (`ORC-YYYYMMDD-NNNNN`) |
| `cliente_id` | uuid FK |
| `nome_projeto`, `descricao` | text |
| `status` | orcamento / em_producao / vistoria / entregue |
| `desconto_percentual` | numeric(5,2) |
| `desconto` | numeric(12,2) — valor R$ |
| `acrescimo` | numeric(12,2) |
| `forma_pagamento` | text |
| `prazo_entrega`, `validade` | timestamptz |
| `data_criacao`, `data_aprovacao`, `data_entrega` | timestamptz |

### `orcamento_itens`

| Campo | Tipo |
|-------|------|
| `orcamento_id` | uuid FK (cascade) |
| `servico_id` | uuid FK (opcional) |
| `nome`, `descricao`, `unidade` | text |
| `quantidade`, `valor_unitario` | numeric |
| `ordem` | int |

### `financeiro`

| Campo | Tipo |
|-------|------|
| `empresa_id` | uuid FK |
| `orcamento_id` | uuid FK |
| `cliente_id` | uuid FK |
| `tipo` | receber / pagar |
| `status` | pendente / pago / parcial |
| `valor` | numeric |
| `vencimento` | timestamptz |

### `historico_status`

Auditoria de mudanças de status em orçamentos.

## Tabelas auth

| Tabela | Função |
|--------|--------|
| `login_otp` | Hash SHA-256 OTP login empresa |
| `admin_otp_codes` | OTP admin |

## Tabelas billing / admin

| Tabela | Função |
|--------|--------|
| `billing_payments` | Histórico PIX por empresa |
| `billing_events` | Idempotência webhooks Woovi |
| `system_settings` | Config global (billing, evolution) |

## Relacionamentos

```
empresas (1) ──< (N) clientes, servicos, orcamentos, financeiro, billing_payments
clientes (1) ──< (N) orcamentos, financeiro
orcamentos (1) ──< (N) orcamento_itens, financeiro, historico_status
```

## Scripts

- Inicial: `docs/setup-supabase.sql`
- Incrementais: `docs/migrations/` — ver [migrations.md](./migrations.md)

## Documento legado

[banco-de-dados.md](../banco-de-dados.md)
