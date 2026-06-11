import { getSupabaseServer } from "@/integrations/supabase/server";
import { getBillingUiState } from "@/lib/billing/state";
import type { BillingStatus } from "@/lib/billing/types";
import { normalizeEmpresaCategoria, type EmpresaCategoria } from "@/lib/empresa-categorias";
import type { AdminEmpresaDetalhe, AdminEmpresaListItem, EmpresaOperacionalStatus } from "./types";

function normalizeSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function countByEmpresa(
  sb: ReturnType<typeof getSupabaseServer>,
  table: "orcamentos" | "clientes",
): Promise<Map<string, number>> {
  const { data, error } = await sb.from(table).select("empresa_id");
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const empresaId = row.empresa_id as string;
    counts.set(empresaId, (counts.get(empresaId) ?? 0) + 1);
  }
  return counts;
}

async function countForEmpresa(
  sb: ReturnType<typeof getSupabaseServer>,
  table: "orcamentos" | "clientes",
  empresaId: string,
): Promise<number> {
  const { count, error } = await sb
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresaId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

function matchesSearch(
  empresa: { nome: string; telefone?: string | null },
  query: string,
): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const nome = normalizeSearch(empresa.nome);
  if (nome.includes(q)) return true;
  const phoneDigits = (empresa.telefone ?? "").replace(/\D/g, "");
  const qDigits = query.replace(/\D/g, "");
  if (qDigits && phoneDigits.includes(qDigits)) return true;
  return false;
}

export async function listarEmpresasAdmin(
  search?: string,
  env?: Record<string, string | undefined>,
): Promise<AdminEmpresaListItem[]> {
  const sb = getSupabaseServer(env);
  const { data: empresas, error } = await sb
    .from("empresas")
    .select(
      "id, nome, categoria, telefone, email, status, billing_status, trial_ends_at, next_billing_at, last_payment_at, created_at",
    )
    .order("nome");

  if (error) throw new Error(error.message);

  const [orcamentosPorEmpresa, clientesPorEmpresa] = await Promise.all([
    countByEmpresa(sb, "orcamentos"),
    countByEmpresa(sb, "clientes"),
  ]);

  return (empresas ?? [])
    .filter((e) => matchesSearch(e, search ?? ""))
    .map((e) => ({
      id: e.id,
      nome: e.nome,
      categoria: normalizeEmpresaCategoria(e.categoria),
      telefone: e.telefone ?? null,
      email: e.email ?? null,
      status: (e.status ?? "ativo") as EmpresaOperacionalStatus,
      billingStatus: (e.billing_status ?? "trial") as BillingStatus,
      trialEndsAt: e.trial_ends_at ?? null,
      nextBillingAt: e.next_billing_at ?? null,
      lastPaymentAt: e.last_payment_at ?? null,
      createdAt: e.created_at ?? null,
      orcamentosCount: orcamentosPorEmpresa.get(e.id) ?? 0,
      clientesCount: clientesPorEmpresa.get(e.id) ?? 0,
    }));
}

export async function obterEmpresaAdmin(
  empresaId: string,
  env?: Record<string, string | undefined>,
): Promise<AdminEmpresaDetalhe> {
  const sb = getSupabaseServer(env);
  const { data: e, error } = await sb
    .from("empresas")
    .select(
      "id, nome, categoria, telefone, email, logo_url, documento, status, billing_status, trial_ends_at, next_billing_at, billing_period_ends_at, last_payment_at, created_at",
    )
    .eq("id", empresaId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!e) throw new Error("Empresa não encontrada.");

  const [orcCount, cliCount] = await Promise.all([
    countForEmpresa(sb, "orcamentos", empresaId),
    countForEmpresa(sb, "clientes", empresaId),
  ]);

  const billingState = getBillingUiState({
    id: e.id,
    nome: e.nome,
    billing_status: e.billing_status,
    trial_ends_at: e.trial_ends_at,
    next_billing_at: e.next_billing_at,
    billing_period_ends_at: e.billing_period_ends_at,
  });

  return {
    id: e.id,
    nome: e.nome,
    categoria: normalizeEmpresaCategoria(e.categoria),
    telefone: e.telefone ?? null,
    email: e.email ?? null,
    logoUrl: e.logo_url ?? null,
    documento: e.documento ?? null,
    status: (e.status ?? "ativo") as EmpresaOperacionalStatus,
    billingStatus: billingState.billingStatus,
    trialEndsAt: e.trial_ends_at ?? null,
    nextBillingAt: e.next_billing_at ?? null,
    lastPaymentAt: e.last_payment_at ?? null,
    createdAt: e.created_at ?? null,
    billingPeriodEndsAt: e.billing_period_ends_at ?? null,
    orcamentosCount: orcCount,
    clientesCount: cliCount,
  };
}

export async function setEmpresaPausadaAdmin(
  empresaId: string,
  pausada: boolean,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const sb = getSupabaseServer(env);
  const status: EmpresaOperacionalStatus = pausada ? "inativo" : "ativo";
  const { error } = await sb.from("empresas").update({ status }).eq("id", empresaId);
  if (error) throw new Error(error.message);
}

export async function setEmpresaCategoriaAdmin(
  empresaId: string,
  categoria: EmpresaCategoria,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const sb = getSupabaseServer(env);
  const { error } = await sb.from("empresas").update({ categoria }).eq("id", empresaId);
  if (error) throw new Error(error.message);
}
