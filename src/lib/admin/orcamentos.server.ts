import { getSupabaseServer } from "@/integrations/supabase/server";
import { normalizeEmpresaCategoria } from "@/lib/empresa-categorias";
import { mapOrcamento, ORC_SELECT } from "@/lib/repository";
import type { AdminOrcamentoListItem, AdminOrcamentoPdfData } from "./types";
import type { Cliente, Empresa } from "@/lib/types";
import { calcTotal, parseRedesSociais } from "@/lib/types";

function mapEmpresaRow(data: Record<string, unknown>): Empresa {
  return {
    id: data.id as string,
    nome: data.nome as string,
    categoria: normalizeEmpresaCategoria(data.categoria as string | null),
    logo_url: (data.logo_url as string | null) ?? undefined,
    documento: (data.documento as string | null) ?? undefined,
    telefone: (data.telefone as string | null) ?? undefined,
    email: (data.email as string | null) ?? undefined,
    endereco: (data.endereco as Record<string, string>) ?? {},
    site: (data.site as string | null) ?? undefined,
    redes_sociais: parseRedesSociais(data.redes_sociais),
    dados_bancarios: (data.dados_bancarios as string | null) ?? undefined,
    condicoes_padrao: (data.condicoes_padrao as string | null) ?? undefined,
    observacoes_padrao: (data.observacoes_padrao as string | null) ?? undefined,
  };
}

function mapClienteRow(r: Record<string, unknown>): Cliente {
  return {
    id: r.id as string,
    nome: r.nome as string,
    telefone: (r.telefone as string | null) ?? undefined,
    email: (r.email as string | null) ?? undefined,
    documento: (r.documento as string | null) ?? undefined,
    endereco: (r.endereco as Record<string, string>) ?? {},
    observacoes: (r.observacoes as string | null) ?? undefined,
    created_at: r.created_at as string | undefined,
  };
}

export async function listarOrcamentosEmpresaAdmin(
  empresaId: string,
  env?: Record<string, string | undefined>,
): Promise<AdminOrcamentoListItem[]> {
  const sb = getSupabaseServer(env);
  const { data, error } = await sb
    .from("orcamentos")
    .select(ORC_SELECT)
    .eq("empresa_id", empresaId)
    .order("data_criacao", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const orcamento = mapOrcamento(row);
    return {
      id: orcamento.id,
      numero: orcamento.numero,
      status: orcamento.status,
      valorTotal: calcTotal(orcamento),
      dataCriacao: orcamento.data_criacao,
    };
  });
}

export async function obterOrcamentoPdfAdmin(
  empresaId: string,
  orcamentoId: string,
  env?: Record<string, string | undefined>,
): Promise<AdminOrcamentoPdfData> {
  const sb = getSupabaseServer(env);

  const [{ data: orcRow, error: orcError }, { data: empRow, error: empError }] = await Promise.all([
    sb
      .from("orcamentos")
      .select(ORC_SELECT)
      .eq("id", orcamentoId)
      .eq("empresa_id", empresaId)
      .maybeSingle(),
    sb.from("empresas").select("*").eq("id", empresaId).maybeSingle(),
  ]);

  if (orcError) throw new Error(orcError.message);
  if (empError) throw new Error(empError.message);
  if (!orcRow) throw new Error("Orçamento não encontrado.");
  if (!empRow) throw new Error("Empresa não encontrada.");

  const orcamento = mapOrcamento(orcRow);
  const empresa = mapEmpresaRow(empRow);

  let cliente: Cliente | undefined;
  if (orcamento.cliente_id) {
    const { data: cliRow, error: cliError } = await sb
      .from("clientes")
      .select("*")
      .eq("id", orcamento.cliente_id)
      .eq("empresa_id", empresaId)
      .maybeSingle();
    if (cliError) throw new Error(cliError.message);
    if (cliRow) cliente = mapClienteRow(cliRow);
  }

  return { orcamento, empresa, cliente };
}
