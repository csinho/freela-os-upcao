-- Permite que empresas logadas (role authenticated) leiam o valor do plano em system_settings.
-- Sem isso, só anon consegue SELECT; após login Supabase Auth a leitura falha silenciosamente.

drop policy if exists "authenticated_read" on system_settings;
create policy "authenticated_read" on system_settings
  for select to authenticated
  using (true);
