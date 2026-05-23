import { useEffect, useMemo, useState } from "react";
import type { Cliente, Empresa, Orcamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

type PdfProps = { orcamento: Orcamento; empresa: Empresa; cliente?: Cliente };

async function pdfClient() {
  return import("@/lib/pdfmake-client");
}

/** iOS e muitos browsers mobile não exibem blob PDF dentro de iframe. */
function prefersExternalPdfView(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  return ios || mobile;
}

export function PDFPreview({ orcamento, empresa, cliente }: PdfProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const externalView = useMemo(() => prefersExternalPdfView(), []);

  useEffect(() => {
    let revoked: string | null = null;
    setError(null);
    setUrl(null);
    pdfClient()
      .then((m) => m.openOrcamentoPdf(orcamento, empresa, cliente))
      .then((u) => {
        revoked = u;
        setUrl(u);
      })
      .catch((e) => setError((e as Error).message ?? "Erro ao gerar PDF"));
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [orcamento, empresa, cliente]);

  if (error) {
    return <div className="p-8 text-center text-sm text-destructive">{error}</div>;
  }
  if (!url) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Gerando PDF…</div>;
  }

  if (externalView) {
    return (
      <div className="p-6 flex flex-col items-stretch gap-3 max-w-sm mx-auto min-h-[40vh] justify-center">
        <p className="text-sm text-muted-foreground text-center">
          No celular, o navegador não permite exibir o PDF aqui dentro. Abra em uma nova aba ou
          baixe o arquivo.
        </p>
        <Button
          type="button"
          className="w-full"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir PDF
        </Button>
        <Button type="button" variant="outline" className="w-full" asChild>
          <a href={url} download={`${orcamento.numero}.pdf`}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </a>
        </Button>
      </div>
    );
  }

  return (
    <iframe
      title="Pré-visualização do PDF"
      src={url}
      className="w-full h-full min-h-[70vh] border-0"
    />
  );
}

export function DownloadBtn({ orcamento, empresa, cliente }: PdfProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const m = await pdfClient();
          await m.downloadOrcamentoPdf(orcamento, empresa, cliente);
        } finally {
          setLoading(false);
        }
      }}
    >
      <Download className="h-4 w-4 mr-1" />
      {loading ? "Gerando…" : "Baixar PDF"}
    </Button>
  );
}
