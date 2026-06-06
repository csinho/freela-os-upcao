import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { baixarReciboPagamentoRemote, listarPagamentosPlanoRemote } from "@/lib/api/billing.functions";
import type { BillingPaymentListItem } from "@/lib/billing/types";
import { formatDatePt } from "@/lib/billing/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatBRLCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function downloadBase64Pdf(filename: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EmpresaPlanoPagamentosList() {
  const [items, setItems] = useState<BillingPaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listarPagamentosPlanoRemote({
        data: {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      setItems(list);
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDownload = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      const { filename, base64 } = await baixarReciboPagamentoRemote({ data: { paymentId } });
      downloadBase64Pdf(filename, base64);
      toast.success("Comprovante baixado.");
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao baixar comprovante");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 items-end">
        <div className="space-y-1">
          <Label htmlFor="pay-from">De</Label>
          <Input id="pay-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-to">Até</Label>
          <Input id="pay-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Filtrar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando histórico…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Comprovante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDatePt(p.paidAt)}</TableCell>
                <TableCell>{formatBRLCents(p.valueCents)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "pago" ? "default" : "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {p.status === "pago" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={downloadingId === p.id}
                      onClick={() => void onDownload(p.id)}
                    >
                      PDF
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
