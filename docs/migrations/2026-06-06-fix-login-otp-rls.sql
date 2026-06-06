-- Corrige erros em login_otp (RLS / permission denied)
-- OTP é gravado apenas via service role no servidor — RLS desnecessário.

alter table public.login_otp disable row level security;

revoke all on table public.login_otp from anon;
revoke all on table public.login_otp from authenticated;
revoke all on table public.login_otp from public;

grant all on table public.login_otp to service_role;
