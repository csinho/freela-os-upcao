import { getSupabaseServer } from "@/integrations/supabase/server";
import type { StatusOrcamento } from "./types";

export async function moverOrcamentoServer(
  id: string,
  status: StatusOrcamento,
  env?: Record<string, string | undefined>,
): Promise<void> {
  const sb = getSupabaseServer(env);

  const { data: atual, error: getErr } = await sb
    .from("orcamentos")
    .select("*, orcamento_itens(*)")
    .eq("id", id)
    .maybeSingle();

  if (getErr) throw new Error(getErr.message);
  if (!atual || atual.status === status) return;

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
    const { data: existentes } = await sb
      .from("financeiro")
      .select("id")
      .eq("orcamento_id", id)
      .eq("tipo", "receber");

    if (!existentes?.length) {
      const { error: eFin } = await sb.from("financeiro").insert({
        tipo: "receber",
        descricao: `Pedido — ${atual.nome_projeto} (${atual.numero})`,
        cliente_id: atual.cliente_id || null,
        orcamento_id: id,
        valor: total,
        vencimento: atual.prazo_entrega ?? new Date().toISOString(),
        status: "pendente",
        forma_pagamento: atual.forma_pagamento ?? null,
      });
      if (eFin) throw new Error(eFin.message);
    } else {
      const { error: eUpFin } = await sb
        .from("financeiro")
        .update({
          valor: total,
          descricao: `Pedido — ${atual.nome_projeto} (${atual.numero})`,
          vencimento: atual.prazo_entrega ?? new Date().toISOString(),
        })
        .eq("orcamento_id", id)
        .eq("tipo", "receber");
      if (eUpFin) throw new Error(eUpFin.message);
    }
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
