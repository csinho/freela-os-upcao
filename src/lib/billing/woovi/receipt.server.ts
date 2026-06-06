import { wooviFetch } from "./client.server";

export async function fetchWooviReceiptPdf(
  endToEndId: string,
  env?: Record<string, string | undefined>,
): Promise<ArrayBuffer> {
  return wooviFetch<ArrayBuffer>(
    `/receipt/pix-in/${encodeURIComponent(endToEndId)}`,
    { headers: { Accept: "application/pdf" } },
    env,
  );
}
