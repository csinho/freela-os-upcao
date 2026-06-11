import { useCallback, useEffect, useState, type ComponentType } from "react";
import type { Cliente, Empresa, Orcamento } from "@/lib/types";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";
import {
  listarOrcamentosEmpresaAdminRemote,
  obterOrcamentoPdfAdminRemote,
} from "@/lib/api/admin.functions";
import type { AdminOrcamentoListItem, AdminOrcamentoPdfData } from "@/lib/admin/types";
import type { EmpresaCategoria } from "@/lib/empresa-categorias/types";
import { getStatusLabel } from "@/lib/empresa-categorias";
import { formatBRL } from "@/lib/types";
import { formatDatePt } from "@/lib/billing/dates";
import { getClientSessao } from "@/lib/auth/client-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  empresaId: string;
  categoria: EmpresaCategoria;
  refreshKey?: number;
};

function PdfDialog({
  open,
  onOpenChange,
  pdfData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: AdminOrcamentoPdfData | null;
}) {
  const [Preview, setPreview] = useState<ComponentType<{
    orcamento: Orcamento;
    empresa: Empresa;
    cliente?: Cliente;
  }> | null>(null);

  useEffect(() => {
    if (!open) return;
    void import("@/components/pdf-preview").then((m) => setPreview(() => m.PDFPreview));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>PDF — {pdfData?.orcamento.numero ?? "Orçamento"}</DialogTitle>
          <DialogDescription>
            Pré-visualização do documento da empresa {pdfData?.empresa.nome}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 border-t">
          {pdfData && Preview ? (
            <Preview
              orcamento={pdfData.orcamento}
              empresa={pdfData.empresa}
              cliente={pdfData.cliente}
            />
          ) : (
            <p className="p-8 text-sm text-muted-foreground text-center">Carregando PDF…</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminEmpresaOrcamentos({ empresaId, categoria, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<AdminOrcamentoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<AdminOrcamentoPdfData | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const load = useCallback(async () => {
    const sessao = getClientSessao();
    if (!sessao) return;
    setLoading(true);
    try {
      const list = await listarOrcamentosEmpresaAdminRemote({
        data: { adminWhatsapp: sessao.id, empresaId },
      });
      setItems(list);
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }, [empresaId, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const abrirPdf = async (orcamentoId: string) => {
    const sessao = getClientSessao();
    if (!sessao) return;
    setPdfLoadingId(orcamentoId);
    try {
      const data = await obterOrcamentoPdfAdminRemote({
        data: { adminWhatsapp: sessao.id, empresaId, orcamentoId },
      });
      setPdfData(data);
      setPdfOpen(true);
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao gerar PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const baixarPdf = async (orcamentoId: string) => {
    const sessao = getClientSessao();
    if (!sessao) return;
    setPdfLoadingId(orcamentoId);
    try {
      const data = await obterOrcamentoPdfAdminRemote({
        data: { adminWhatsapp: sessao.id, empresaId, orcamentoId },
      });
      const pdf = await import("@/lib/pdfmake-client");
      await pdf.downloadOrcamentoPdf(data.orcamento, data.empresa, data.cliente);
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao baixar PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando orçamentos…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum orçamento cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.numero}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate" title={o.id}>
                  {o.id}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getStatusLabel(o.status, categoria)}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{formatDatePt(o.dataCriacao)}</p>
                </TableCell>
                <TableCell className="text-right font-medium">{formatBRL(o.valorTotal)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pdfLoadingId === o.id}
                      onClick={() => void abrirPdf(o.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pdfLoadingId === o.id}
                      onClick={() => void baixarPdf(o.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PdfDialog
        open={pdfOpen}
        onOpenChange={(open) => {
          setPdfOpen(open);
          if (!open) setPdfData(null);
        }}
        pdfData={pdfData}
      />
    </>
  );
}
