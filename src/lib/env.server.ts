import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getRuntimeEnv } from "./worker-env.server";

type EnvSource = Record<string, string | undefined>;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

let dotenvBootstrapped = false;

/** Garante .env carregado em server functions do Vite (process.env às vezes vem vazio). */
function ensureDotenvLoaded(): void {
  if (dotenvBootstrapped || typeof process === "undefined") return;
  dotenvBootstrapped = true;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;

  try {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) return;

    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      const value = unquote(line.slice(eq + 1));
      if (key && !process.env[key]?.trim()) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore — requireServerEnv falhará com mensagem clara
  }
}

function readEnv(name: string, source?: EnvSource): string | undefined {
  const fromExplicit = source?.[name]?.trim();
  if (fromExplicit) return fromExplicit;

  const fromWorker = getRuntimeEnv()?.[name]?.trim();
  if (fromWorker) return fromWorker;

  ensureDotenvLoaded();

  const fromProcess = process.env?.[name]?.trim();
  if (fromProcess) return fromProcess;

  return undefined;
}

export function requireServerEnv(name: string, source?: EnvSource): string {
  const value = readEnv(name, source);
  if (!value) {
    throw new Error(`${name} não está definida no servidor.`);
  }
  return value;
}

export function getServerEnv(name: string, source?: EnvSource): string | undefined {
  return readEnv(name, source);
}

export function getSupabaseUrl(source?: EnvSource): string {
  const url =
    getServerEnv("VITE_SUPABASE_URL", source) ?? getServerEnv("SUPABASE_URL", source);
  if (!url) {
    throw new Error("VITE_SUPABASE_URL ou SUPABASE_URL não está definida no servidor.");
  }
  return url;
}
