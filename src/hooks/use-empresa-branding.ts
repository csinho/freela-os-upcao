import { useEffect } from "react";
import { useEmpresa } from "@/lib/store";
import { syncFavicon } from "@/lib/branding";

/** Sincroniza favicon com a logo da empresa e expõe dados para o shell. */
export function useEmpresaBranding() {
  const { data: empresa, isLoading } = useEmpresa();

  useEffect(() => {
    syncFavicon(empresa?.logo_url);
  }, [empresa?.logo_url]);

  return {
    empresa,
    isLoading,
    logoUrl: empresa?.logo_url,
    nome: empresa?.nome ?? "Freela OS",
  };
}
