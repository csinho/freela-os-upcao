import { fetchEmpresaBilling } from "./empresa.server";
import { billingBlocksMutation, getBillingUiState } from "./state";

export async function assertBillingAllowsMutation(
  empresaId?: string,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const empresa = await fetchEmpresaBilling(empresaId, env);
  const state = getBillingUiState(empresa);
  if (billingBlocksMutation(state)) {
    throw new Error("Plano pendente — acesse Plano para pagar e liberar novas ações.");
  }
}

export async function getBillingMutationAllowed(
  empresaId?: string,
  env?: Record<string, string | undefined>,
): Promise<{ allowed: boolean; message?: string }> {
  const empresa = await fetchEmpresaBilling(empresaId, env);
  const state = getBillingUiState(empresa);
  if (billingBlocksMutation(state)) {
    return {
      allowed: false,
      message: "Plano pendente — acesse Plano para pagar e liberar novas ações.",
    };
  }
  return { allowed: true };
}
