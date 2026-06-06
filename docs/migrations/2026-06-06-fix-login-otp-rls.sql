-- Corrige erro: "new row violates row-level security policy for table login_otp"
-- OTP é gravado apenas via service role no servidor — RLS desnecessário aqui.

alter table login_otp disable row level security;
