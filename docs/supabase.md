# Integração com Supabase

O sistema está conectado ao seu projeto **Supabase externo** usando a *publishable key* (chave pública, segura no client).

## Setup (uma vez)

1. Acesse o **SQL Editor** do seu projeto: https://supabase.com/dashboard/project/tdtmxddukuqsxsiiwzqp/sql
2. Cole o conteúdo de `docs/setup-supabase.sql` em uma **New query**.
3. Clique em **Run**.

Isso cria todas as tabelas (`empresas`, `clientes`, `servicos`, `orcamentos`, `orcamento_itens`, `financeiro`, `historico_status`), índices, ativa RLS com policies liberadas para o role `anon` (adequado para uso pessoal) e insere os dados de exemplo.

## Cliente

`src/integrations/supabase/client.ts` — instancia o client com URL + publishable key.

## Camada de dados

- `src/lib/repository.ts` — funções tipadas para cada tabela (list/upsert/remove + `move` para orçamentos)
- `src/lib/store.ts` — hooks `useEmpresa`, `useClientes`, `useServicos`, `useOrcamentos`, `useOrcamento(id)`, `useFinanceiro` e mutações correspondentes, baseadas em **TanStack Query**

## Regras automáticas

- Ao mover um orçamento para **Em produção**, o repositório registra `data_aprovacao`, grava em `historico_status` e cria uma conta a receber em `financeiro` (se ainda não existir).
- Ao mover para **Entregue**, registra `data_entrega`.

## Adicionar login depois

Se quiser proteger com email/senha:
1. Ative Auth no Supabase (já vem habilitado).
2. Troque as policies de `using (true)` por `using (auth.uid() is not null)` (e adicione coluna `user_id` se for multi-tenant).
3. Implemente tela de login com `supabase.auth.signInWithPassword`.
