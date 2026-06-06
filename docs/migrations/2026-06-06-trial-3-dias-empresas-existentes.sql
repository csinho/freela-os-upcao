-- Up Serviços — Alinha empresas já cadastradas ao trial de 3 dias
-- Execute após deploy do código com TRIAL_DAYS = 3
--
-- Regras:
-- 1. Empresas em trial → trial_ends_at = created_at + 3 dias
-- 2. next_billing_at acompanha trial_ends_at
-- 3. Se o novo fim do trial já passou → billing_status = 'pendente'
-- 4. Empresas ativo / pendente / inadimplente → não alteradas

-- ============ Recalcular trial (3 dias desde o cadastro) ============

update empresas
set
  trial_ends_at = coalesce(created_at, now()) + interval '3 days',
  next_billing_at = coalesce(created_at, now()) + interval '3 days',
  woovi_charge_correlation_id = null,
  woovi_payment_link_url = null
where billing_status = 'trial';

-- ============ Trial já expirado no novo critério ============

update empresas
set billing_status = 'pendente'
where billing_status = 'trial'
  and trial_ends_at < now();
