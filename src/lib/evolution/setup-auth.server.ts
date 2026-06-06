import { getServerEnv } from "@/lib/env.server";

export function assertSetupKey(
  key: string,
  env?: Record<string, string | undefined>,
): void {
  const secret =
    getServerEnv("ADMIN_SETUP_SECRET", env) ?? getServerEnv("BILLING_CRON_SECRET", env);
  if (!secret) {
    throw new Error(
      "Setup não configurado no servidor (ADMIN_SETUP_SECRET ou BILLING_CRON_SECRET).",
    );
  }
  if (key !== secret) {
    throw new Error("Chave de setup inválida.");
  }
}
