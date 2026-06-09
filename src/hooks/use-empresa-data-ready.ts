import { useEffect, useState } from "react";
import { hasSupabaseSession } from "@/lib/auth/supabase-session";
import { getClientSessao, isEmpresaSessao } from "@/lib/auth/client-session";
import { supabase } from "@/integrations/supabase/client";

/** Aguarda sessão local + JWT do Supabase antes de buscar dados da empresa. */
export function useEmpresaDataReady(): { ready: boolean; empresaId: string | null } {
  const [state, setState] = useState({ ready: false, empresaId: null as string | null });

  useEffect(() => {
    const sessao = getClientSessao();
    if (!isEmpresaSessao(sessao)) {
      setState({ ready: false, empresaId: null });
      return;
    }

    const empresaId = sessao.id;
    let cancelled = false;

    const sync = (hasJwt: boolean) => {
      if (!cancelled) {
        setState({ ready: hasJwt, empresaId: hasJwt ? empresaId : null });
      }
    };

    void hasSupabaseSession().then(sync);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(!!session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
