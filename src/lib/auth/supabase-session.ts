import { supabase } from "@/integrations/supabase/client";

const SESSAO_EXPIRADA_MSG =
  "Sessão expirada. Saia (menu Mais → Sair) e entre novamente com o WhatsApp.";

/** Garante JWT ativo para operações com RLS; tenta refresh antes de falhar. */
export async function ensureSupabaseSession(): Promise<void> {
  const { data: current, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (current.session) return;

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session) {
    throw new Error(SESSAO_EXPIRADA_MSG);
  }
}

export async function hasSupabaseSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  const { data: refreshed } = await supabase.auth.refreshSession();
  return !!refreshed.session;
}
