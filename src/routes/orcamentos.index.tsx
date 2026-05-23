import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useOrcamentos,
  useClientes,
  useEmpresa,
  gerarNumeroOrcamento,
} from "@/lib/store";
import type { Orcamento } from "@/lib/types";
import { calcTotal, formatBRL, formatDate, labelDocumento, STATUS_LABEL } from "@/lib/types";
import { newId } from "@/lib/id";
import { saveOrcamentoDraft } from "@/lib/orcamento-draft";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/orcamentos/")({
  head: () => ({ meta: [{ title: "Orçamentos e pedidos — Freela OS" }] }),
  component: OrcamentosList,
});

function OrcamentosList() {
  const { data: orcamentos = [], isLoading } = useOrcamentos();
  const { data: clientes = [] } = useClientes();
  const { data: empresa } = useEmpresa();
  const navigate = useNavigate();

  const novo = () => {
    const o: Orcamento = {
      id: newId(),
      numero: gerarNumeroOrcamento(orcamentos),
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
    saveOrcamentoDraft(o);
    navigate({ to: "/orcamentos/$id", params: { id: o.id } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orçamentos e pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Carregando…" : `${orcamentos.length} registros`}
          </p>
        </div>
        <Button type="button" onClick={novo}>
          <Plus className="h-4 w-4 mr-1" /> Novo orçamento
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orcamentos.map((o) => {
              const cli = clientes.find((c) => c.id === o.cliente_id);
              return (
                <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate({ to: "/orcamentos/$id", params: { id: o.id } })}>
                  <TableCell>
                    <Badge variant={o.status === "orcamento" ? "outline" : "default"} className="text-[10px]">
                      {labelDocumento(o.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{o.numero}</TableCell>
                  <TableCell className="font-medium">{o.nome_projeto}</TableCell>
                  <TableCell>{cli?.nome ?? "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{STATUS_LABEL[o.status]}</Badge></TableCell>
                  <TableCell>{formatDate(o.data_criacao)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(calcTotal(o))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
