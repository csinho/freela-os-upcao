import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFinanceiro, useClientes, useOrcamentos } from "@/lib/store";
import type { TipoFinanceiro } from "@/lib/types";
import { formatBRL, formatDate } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Freela OS" }] }),
  component: FinanceiroPage,
});

const statusVariant = {
  pago: "default",
  pendente: "secondary",
  parcial: "outline",
  atrasado: "destructive",
} as const;

function FinanceiroPage() {
  const { data: financeiro = [], isLoading } = useFinanceiro();
  const { data: clientes = [] } = useClientes();
  const { data: orcamentos = [] } = useOrcamentos();
  const [filter, setFilter] = useState<"todos" | TipoFinanceiro>("todos");

  const list = financeiro
    .filter((f) => f.orcamento_id)
    .filter((f) => filter === "todos" || f.tipo === filter);

  const totals = {
    receber: financeiro
      .filter((f) => f.tipo === "receber" && f.status !== "pago" && f.orcamento_id)
      .reduce((a, f) => a + f.valor, 0),
    recebido: financeiro
      .filter((f) => f.tipo === "receber" && f.status === "pago" && f.orcamento_id)
      .reduce((a, f) => a + f.valor, 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Lançamentos gerados automaticamente quando o orçamento vira pedido (em produção). Marcados
            como pagos ao entregar.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "Carregando…"
              : `A receber: ${formatBRL(totals.receber)} · Recebido: ${formatBRL(totals.recebido)}`}
          </p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as "todos" | TipoFinanceiro)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="receber">A receber</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((f) => {
              const cli = clientes.find((c) => c.id === f.cliente_id);
              const ped = orcamentos.find((o) => o.id === f.orcamento_id);
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">
                    {ped ? (
                      <Link
                        to="/orcamentos/$id"
                        params={{ id: ped.id }}
                        className="text-primary hover:underline"
                      >
                        {ped.numero}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{f.descricao}</TableCell>
                  <TableCell>{cli?.nome ?? "—"}</TableCell>
                  <TableCell>{formatDate(f.vencimento)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(f.valor)}</TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  Nenhum lançamento. Mova um orçamento para &quot;Em produção&quot; para gerar a entrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
