import { getSupabaseServer } from "@/integrations/supabase/server";
import { resolveEmpresaId } from "@/lib/billing/empresa.server";
import type { StatusOrcamento } from "./types";

async function garantirLancamentoReceber(
  sb: ReturnType<typeof getSupabaseServer>,
  params: {
    orcamentoId: string;
    empresaId: string;
    nomeProjeto: string;
    numero: string;
    clienteId?: string | null;
    prazoEntrega?: string | null;
    formaPagamento?: string | null;
    total: number;
  },
): Promise<void> {
  const { data: existentes } = await sb
    .from("financeiro")
    .select("id")
    .eq("orcamento_id", params.orcamentoId)
    .eq("tipo", "receber");

  const payload = {
    tipo: "receber" as const,
    empresa_id: params.empresaId,
    descricao: `Pedido — ${params.nomeProjeto} (${params.numero})`,
    cliente_id: params.clienteId || null,
    orcamento_id: params.orcamentoId,
    valor: params.total,
    vencimento: params.prazoEntrega ?? new Date().toISOString(),
    status: "pendente" as const,
    forma_pagamento: params.formaPagamento ?? null,
  };

  if (!existentes?.length) {
    const { error: eFin } = await sb.from("financeiro").insert(payload);
    if (eFin) throw new Error(eFin.message);
    return;
  }

  const { error: eUpFin } = await sb
    .from("financeiro")
    .update({
      valor: payload.valor,
      descricao: payload.descricao,
      vencimento: payload.vencimento,
    })
    .eq("orcamento_id", params.orcamentoId)
    .eq("tipo", "receber");
  if (eUpFin) throw new Error(eUpFin.message);
}

export async function moverOrcamentoServer(
  id: string,
  status: StatusOrcamento,
  empresaIdExplicit?: string,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const sb = getSupabaseServer(env);

  const { data: atual, error: getErr } = await sb
    .from("orcamentos")
    .select("*, orcamento_itens(*)")
    .eq("id", id)
    .maybeSingle();

  if (getErr) throw new Error(getErr.message);
  if (!atual) return;

  const empresaId = String(atual.empresa_id ?? resolveEmpresaId(empresaIdExplicit));
  const itensPreview = (atual.orcamento_itens ?? []).map((i: Record<string, unknown>) => ({
    quantidade: Number(i.quantidade) || 0,
    valor_unitario: Number(i.valor_unitario) || 0,
  }));
  const subPreview = itensPreview.reduce(
    (s: number, i: { quantidade: number; valor_unitario: number }) =>
      s + i.quantidade * i.valor_unitario,
    0,
  );
  const descontoPctPreview = Number(atual.desconto_percentual) || 0;
  const totalPreview =
    subPreview - subPreview * (descontoPctPreview / 100) + (Number(atual.acrescimo) || 0);

  // Corrige lançamento ausente se um movimento anterior falhou após gravar o status.
  if (atual.status === status && status === "em_producao") {
    await garantirLancamentoReceber(sb, {
      orcamentoId: id,
      empresaId,
      nomeProjeto: atual.nome_projeto ?? "",
      numero: atual.numero,
      clienteId: atual.cliente_id,
      prazoEntrega: atual.prazo_entrega,
      formaPagamento: atual.forma_pagamento,
      total: totalPreview,
    });
    return;
  }

  if (atual.status === status) return;

  const patch: Record<string, unknown> = { status };
  if (status === "em_producao" && !atual.data_aprovacao) {
    patch.data_aprovacao = new Date().toISOString();
  }
  if (status === "entregue" && !atual.data_entrega) {
    patch.data_entrega = new Date().toISOString();
  }

  const { error: eUp } = await sb.from("orcamentos").update(patch).eq("id", id);
  if (eUp) throw new Error(eUp.message);

  const { error: eHist } = await sb.from("historico_status").insert({
    orcamento_id: id,
    status_anterior: atual.status,
    status_novo: status,
    data: new Date().toISOString(),
  });
  if (eHist) throw new Error(eHist.message);

  const itens = (atual.orcamento_itens ?? []).map((i: Record<string, unknown>) => ({
    quantidade: Number(i.quantidade) || 0,
    valor_unitario: Number(i.valor_unitario) || 0,
  }));
  const sub = itens.reduce((s: number, i: { quantidade: number; valor_unitario: number }) => s + i.quantidade * i.valor_unitario, 0);
  const descontoPct = Number(atual.desconto_percentual) || 0;
  const descontoValor = sub * (descontoPct / 100);
  const total = sub - descontoValor + (Number(atual.acrescimo) || 0);

  if (status === "em_producao") {
    await garantirLancamentoReceber(sb, {
      orcamentoId: id,
      empresaId,
      nomeProjeto: atual.nome_projeto ?? "",
      numero: atual.numero,
      clienteId: atual.cliente_id,
      prazoEntrega: atual.prazo_entrega,
      formaPagamento: atual.forma_pagamento,
      total,
    });
  }

  if (status === "entregue") {
    const { error: ePago } = await sb
      .from("financeiro")
      .update({
        status: "pago",
        pagamento: new Date().toISOString(),
      })
      .eq("orcamento_id", id)
      .eq("tipo", "receber");
    if (ePago) throw new Error(ePago.message);
  }
}
