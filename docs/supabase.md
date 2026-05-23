# Integração com Supabase

Persistência em nuvem via **Supabase** (PostgreSQL). O client lê credenciais de variáveis de ambiente — não há URL/chave no código-fonte.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública (publishable ou anon) |

Arquivo de referência: `.env.example` na raiz do repositório.

Implementação: `src/integrations/supabase/client.ts`.

## Setup do banco (uma vez)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Abra **SQL Editor** → **New query**
3. Cole o conteúdo de `docs/setup-supabase.sql` e execute **Run**

Isso cria:

- Tabelas: `empresas`, `clientes`, `servicos`, `orcamentos`, `orcamento_itens`, `financeiro`, `historico_status`
- Índices
- RLS com policy `anon_all` (uso pessoal)
- Dados de exemplo (opcional — pode apagar depois)

### Migrações posteriores

Se o banco já existia antes de uma alteração de schema, rode os arquivos em `docs/migrations/`:

| Arquivo | Conteúdo |
|---------|----------|
| `2026-05-22-desconto-percentual.sql` | Coluna `desconto_percentual` em `orcamentos` |

## Camada de dados

| Arquivo | Papel |
|---------|--------|
| `src/lib/repository.ts` | CRUD tipado + `move` de orçamentos + financeiro automático |
| `src/lib/store.ts` | Hooks TanStack Query (`useEmpresa`, `useClientes`, …) |

## Regras automáticas

- **Em produção:** `data_aprovacao`, histórico de status, cria/atualiza conta **a receber** no financeiro
- **Entregue:** `data_entrega` + marca lançamento vinculado como **pago**

## Segurança

Hoje as policies permitem **leitura e escrita total** para o role `anon` (`using (true)`). Isso é aceitável apenas se:

- a URL do app não for divulgada, ou
- você confia que só você acessa.

Para uso público ou multiusuário:

1. Ative **Auth** no Supabase
2. Substitua policies por `auth.uid() is not null` (e `user_id` nas tabelas, se multi-tenant)
3. Adicione tela de login (`supabase.auth.signInWithPassword`)

**Nunca** use a chave `service_role` no front-end ou no repositório Git.

## Adicionar login depois

1. Auth → Email no Supabase
2. Ajuste RLS nas tabelas
3. Crie rota `/login` e proteja o `AppShell` com sessão
