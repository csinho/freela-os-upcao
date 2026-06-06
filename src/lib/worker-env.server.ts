type EnvRecord = Record<string, string | undefined>;

const GLOBAL_KEY = "__UP_SERVICOS_WORKER_ENV__";

/** Injeta bindings do Cloudflare Worker (chamado em src/server.ts a cada request). */
export function setWorkerEnv(env: EnvRecord | undefined): void {
  if (!env) return;
  (globalThis as Record<string, unknown>)[GLOBAL_KEY] = env;

  for (const [key, value] of Object.entries(env)) {
    if (value?.trim() && !process.env[key]?.trim()) {
      process.env[key] = value;
    }
  }
}

/** Env efetivo para server functions (bindings do Worker + process.env). */
export function getRuntimeEnv(): EnvRecord | undefined {
  const fromGlobal = (globalThis as Record<string, unknown>)[GLOBAL_KEY];
  if (fromGlobal && typeof fromGlobal === "object") {
    return fromGlobal as EnvRecord;
  }
  return undefined;
}
