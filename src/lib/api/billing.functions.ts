import { createServerFn } from "@tanstack/react-start";
import { gerarPixPlano, runBillingDailyJob } from "@/lib/billing/billing.server";
import { EMPRESA_ID, PLAN_LABEL, PLAN_VALUE_CENTS, TRIAL_DAYS } from "@/lib/billing/constants";
import { fetchEmpresaBilling, resolveEmpresaId } from "@/lib/billing/empresa.server";
import { getBillingMutationAllowed, assertBillingAllowsMutation } from "@/lib/billing/guards.server";
import { baixarReciboPagamento, listarPagamentosPlano } from "@/lib/billing/payments.server";
import { getBillingUiState } from "@/lib/billing/state";
import { moverOrcamentoServer } from "@/lib/orcamentos.server";
import type { StatusOrcamento } from "@/lib/types";

export const gerarPixPlanoRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { empresaId?: string }) => data)
  .handler(async ({ data }) => {
    const empresaId = resolveEmpresaId(data.empresaId);
    return gerarPixPlano(empresaId);
  });

export const obterBillingStatusRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { empresaId?: string }) => data)
  .handler(async ({ data }) => {
    const empresaId = resolveEmpresaId(data.empresaId);
    const empresa = await fetchEmpresaBilling(empresaId);
    return getBillingUiState(empresa);
  });

export const listarPagamentosPlanoRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { empresaId?: string; dateFrom?: string; dateTo?: string }) => data)
  .handler(async ({ data }) => {
    const empresaId = resolveEmpresaId(data.empresaId);
    return listarPagamentosPlano({
      empresaId,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
    });
  });

export const baixarReciboPagamentoRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { empresaId?: string; paymentId: string }) => data)
  .handler(async ({ data }) => {
    const empresaId = resolveEmpresaId(data.empresaId);
    return baixarReciboPagamento({ empresaId, paymentId: data.paymentId });
  });

export const getPublicPlanSettingsRemote = createServerFn({ method: "GET" }).handler(async () => ({
  planLabel: PLAN_LABEL,
  planValueCents: PLAN_VALUE_CENTS,
  trialDays: TRIAL_DAYS,
}));

export const verificarBillingMutationRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { empresaId?: string }) => data)
  .handler(async ({ data }) => getBillingMutationAllowed(resolveEmpresaId(data.empresaId)));

export const moverOrcamentoComBillingRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; status: StatusOrcamento; empresaId?: string }) => data)
  .handler(async ({ data }) => {
    if (data.status === "em_producao") {
      await assertBillingAllowsMutation(resolveEmpresaId(data.empresaId));
    }
    await moverOrcamentoServer(data.id, data.status);
    return { ok: true };
  });

export { EMPRESA_ID };
