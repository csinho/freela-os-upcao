-- Up Serviços — RLS multi-tenant + login_otp protegido + empresa_id NOT NULL
-- Execute após 2026-06-06-system-settings-authenticated-read.sql

-- ============ Função auxiliar: empresa do usuário autenticado ============

create or replace function public.auth_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.empresas where auth_user_id = auth.uid() limit 1;
$$;

revoke all on function public.auth_empresa_id() from public;
grant execute on function public.auth_empresa_id() to authenticated;

-- ============ login_otp: só service role (sem policies) ============

alter table login_otp enable row level security;

-- ============ empresa_id obrigatório ============

alter table clientes alter column empresa_id set not null;
alter table servicos alter column empresa_id set not null;
alter table orcamentos alter column empresa_id set not null;
alter table financeiro alter column empresa_id set not null;

-- ============ Remover policies permissivas antigas ============

drop policy if exists "anon_all" on empresas;
drop policy if exists "anon_all" on clientes;
drop policy if exists "anon_all" on servicos;
drop policy if exists "anon_all" on orcamentos;
drop policy if exists "anon_all" on orcamento_itens;
drop policy if exists "anon_all" on financeiro;
drop policy if exists "anon_all" on historico_status;
drop policy if exists "anon_read" on billing_events;
drop policy if exists "anon_read" on billing_payments;
drop policy if exists "anon_read" on billing_reminder_log;
drop policy if exists "anon_read" on system_settings;

-- ============ empresas: só a própria linha ============

create policy "empresa_select_own" on empresas
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy "empresa_update_own" on empresas
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ============ Tabelas ERP com empresa_id ============

create policy "tenant_all" on clientes
  for all to authenticated
  using (empresa_id = auth_empresa_id())
  with check (empresa_id = auth_empresa_id());

create policy "tenant_all" on servicos
  for all to authenticated
  using (empresa_id = auth_empresa_id())
  with check (empresa_id = auth_empresa_id());

create policy "tenant_all" on orcamentos
  for all to authenticated
  using (empresa_id = auth_empresa_id())
  with check (empresa_id = auth_empresa_id());

create policy "tenant_all" on financeiro
  for all to authenticated
  using (empresa_id = auth_empresa_id())
  with check (empresa_id = auth_empresa_id());

-- ============ Itens / histórico via orçamento do tenant ============

create policy "tenant_via_orcamento" on orcamento_itens
  for all to authenticated
  using (
    exists (
      select 1 from orcamentos o
      where o.id = orcamento_itens.orcamento_id
        and o.empresa_id = auth_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from orcamentos o
      where o.id = orcamento_itens.orcamento_id
        and o.empresa_id = auth_empresa_id()
    )
  );

create policy "tenant_via_orcamento" on historico_status
  for all to authenticated
  using (
    exists (
      select 1 from orcamentos o
      where o.id = historico_status.orcamento_id
        and o.empresa_id = auth_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from orcamentos o
      where o.id = historico_status.orcamento_id
        and o.empresa_id = auth_empresa_id()
    )
  );

-- ============ Billing: empresa vê só os próprios pagamentos ============

create policy "tenant_billing_payments" on billing_payments
  for select to authenticated
  using (empresa_id = auth_empresa_id());

-- ============ system_settings: leitura do valor do plano ============

create policy "authenticated_read" on system_settings
  for select to authenticated
  using (true);
