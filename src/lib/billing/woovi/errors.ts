import type { WooviFetchError } from "./client.server";

export function mensagemErroPixParaEmpresa(err: unknown): string {
  if (typeof err === "object" && err && "status" in err) {
    const e = err as WooviFetchError;
    if (e.status === 401) {
      return "Pagamento temporariamente indisponível. Tente novamente mais tarde.";
    }
    if (e.status === 503) return e.message;
    return "Não foi possível gerar o PIX. Verifique os dados da empresa e tente de novo.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Não foi possível gerar o PIX. Tente novamente.";
}
