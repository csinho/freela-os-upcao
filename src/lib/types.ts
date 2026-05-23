export type StatusOrcamento = "orcamento" | "em_producao" | "vistoria" | "entregue";

export const STATUS_LABEL: Record<StatusOrcamento, string> = {
  orcamento: "Orçamento",
  em_producao: "Em produção",
  vistoria: "Vistoria",
  entregue: "Entregue",
};

export const STATUS_ORDER: StatusOrcamento[] = ["orcamento", "em_producao", "vistoria", "entregue"];

/** Enquanto status é `orcamento`, o documento é um orçamento; depois vira pedido. */
export function isFaseOrcamento(status: StatusOrcamento): boolean {
  return status === "orcamento";
}

export function labelDocumento(status: StatusOrcamento): "Orçamento" | "Pedido" {
  return isFaseOrcamento(status) ? "Orçamento" : "Pedido";
}

export function labelDocumentoLower(status: StatusOrcamento): "orçamento" | "pedido" {
  return isFaseOrcamento(status) ? "orçamento" : "pedido";
}

export type StatusFinanceiro = "pendente" | "pago" | "atrasado" | "parcial";
export type TipoFinanceiro = "pagar" | "receber";
export type UnidadeServico = "serviço" | "hora" | "mensalidade" | "pacote";

export interface Endereco {
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export type RedeSocialTipo = "facebook" | "instagram" | "youtube" | "linkedin";

export interface RedeSocial {
  rede: RedeSocialTipo;
  url: string;
}

export const REDE_SOCIAL_LABEL: Record<RedeSocialTipo, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export const REDES_SOCIAIS_OPCOES: RedeSocialTipo[] = [
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
];

export function parseRedesSociais(raw?: string | null): RedeSocial[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RedeSocial =>
        typeof r === "object" &&
        r !== null &&
        "rede" in r &&
        "url" in r &&
        typeof (r as RedeSocial).url === "string" &&
        REDES_SOCIAIS_OPCOES.includes((r as RedeSocial).rede),
    );
  } catch {
    return [];
  }
}

export function serializeRedesSociais(redes: RedeSocial[]): string | undefined {
  if (!redes.length) return undefined;
  return JSON.stringify(redes);
}

export interface Empresa {
  id: string;
  nome: string;
  logo_url?: string; // data URL
  documento?: string;
  telefone?: string;
  email?: string;
  endereco: Endereco;
  site?: string;
  redes_sociais?: RedeSocial[];
  dados_bancarios?: string;
  condicoes_padrao?: string;
  observacoes_padrao?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  documento?: string;
  endereco: Endereco;
  observacoes?: string;
  created_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor_padrao: number;
  unidade: UnidadeServico;
  ativo: boolean;
  observacoes?: string;
}

export interface OrcamentoItem {
  id: string;
  servico_id?: string;
  nome: string;
  descricao?: string;
  unidade: UnidadeServico;
  quantidade: number;
  valor_unitario: number;
}

export interface HistoricoStatus {
  data: string;
  de: StatusOrcamento;
  para: StatusOrcamento;
}

export interface Orcamento {
  id: string;
  numero: string;
  cliente_id: string;
  nome_projeto: string;
  descricao?: string;
  status: StatusOrcamento;
  itens: OrcamentoItem[];
  /** Percentual sobre o subtotal (0–100). */
  desconto_percentual: number;
  acrescimo: number;
  forma_pagamento?: string;
  prazo_entrega?: string;
  validade?: string;
  observacoes?: string;
  condicoes?: string;
  data_criacao: string;
  data_aprovacao?: string;
  data_entrega?: string;
  historico: HistoricoStatus[];
}

export interface Financeiro {
  id: string;
  tipo: TipoFinanceiro;
  descricao: string;
  cliente_id?: string;
  orcamento_id?: string;
  valor: number;
  vencimento: string;
  pagamento?: string;
  status: StatusFinanceiro;
  forma_pagamento?: string;
  observacoes?: string;
}

export function calcSubtotal(itens: OrcamentoItem[]): number {
  return itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
}

export function calcDescontoValor(
  subtotal: number,
  percentual: number,
): number {
  if (!percentual || subtotal <= 0) return 0;
  return Math.round(((subtotal * percentual) / 100) * 100) / 100;
}

export function calcTotal(
  o: Pick<Orcamento, "itens" | "desconto_percentual" | "acrescimo">,
): number {
  const sub = calcSubtotal(o.itens);
  return sub - calcDescontoValor(sub, o.desconto_percentual ?? 0) + (o.acrescimo || 0);
}

export function formatPercentLabel(percentual: number): string {
  if (!percentual) return "0%";
  return `${percentual.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}
