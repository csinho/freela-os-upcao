import type { Cliente, Empresa, Orcamento } from "@/lib/types";
import { newId } from "@/lib/id";
import { saveOrcamentoDraft } from "@/lib/orcamento-draft";

export function buildNovoOrcamento(
  orcamentos: Orcamento[],
  clientes: Cliente[],
  empresa: Empresa | undefined,
  gerarNumero: (list: Orcamento[]) => string,
): Orcamento {
  return {
    id: newId(),
    numero: gerarNumero(orcamentos),
    cliente_id: clientes[0]?.id ?? "",
    nome_projeto: "Novo projeto",
    status: "orcamento",
    itens: [],
    desconto_percentual: 0,
    acrescimo: 0,
    condicoes: empresa?.condicoes_padrao,
    observacoes: empresa?.observacoes_padrao,
    data_criacao: new Date().toISOString(),
    historico: [],
  };
}

export function startNovoOrcamento(
  orcamentos: Orcamento[],
  clientes: Cliente[],
  empresa: Empresa | undefined,
  gerarNumero: (list: Orcamento[]) => string,
): Orcamento {
  const o = buildNovoOrcamento(orcamentos, clientes, empresa, gerarNumero);
  saveOrcamentoDraft(o);
  return o;
}
