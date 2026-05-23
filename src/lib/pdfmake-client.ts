import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { buildOrcamentoPdfDoc } from "./pdf-orcamento";
import type { Cliente, Empresa, Orcamento } from "./types";

type PdfMake = typeof import("pdfmake/build/pdfmake").default;

let pdfMakeReady: Promise<PdfMake> | null = null;

async function loadPdfMake(): Promise<PdfMake> {
  if (!pdfMakeReady) {
    pdfMakeReady = (async () => {
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const vfsModule = await import("pdfmake/build/vfs_fonts");
      const vfs =
        (vfsModule as { pdfMake?: { vfs: PdfMake["vfs"] } }).pdfMake?.vfs ??
        (vfsModule as { default?: { pdfMake?: { vfs: PdfMake["vfs"] } } }).default?.pdfMake
          ?.vfs;
      if (vfs) pdfMake.vfs = vfs;
      return pdfMake;
    })();
  }
  return pdfMakeReady;
}

export async function createOrcamentoPdfBlob(
  orcamento: Orcamento,
  empresa: Empresa,
  cliente?: Cliente,
): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  const doc = buildOrcamentoPdfDoc(orcamento, empresa, cliente);
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(doc).getBlob((blob: Blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao gerar PDF"));
    });
  });
}

export async function downloadOrcamentoPdf(
  orcamento: Orcamento,
  empresa: Empresa,
  cliente?: Cliente,
): Promise<void> {
  const pdfMake = await loadPdfMake();
  const doc = buildOrcamentoPdfDoc(orcamento, empresa, cliente);
  pdfMake.createPdf(doc).download(`${orcamento.numero}.pdf`);
}

export async function openOrcamentoPdf(
  orcamento: Orcamento,
  empresa: Empresa,
  cliente?: Cliente,
): Promise<string> {
  const blob = await createOrcamentoPdfBlob(orcamento, empresa, cliente);
  return URL.createObjectURL(blob);
}

/** Para testes ou extensão futura */
export function getOrcamentoDocDefinition(
  orcamento: Orcamento,
  empresa: Empresa,
  cliente?: Cliente,
): TDocumentDefinitions {
  return buildOrcamentoPdfDoc(orcamento, empresa, cliente);
}
