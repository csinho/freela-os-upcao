type EnvSource = Record<string, string | undefined>;

function readEnv(name: string, source?: EnvSource): string | undefined {
  const fromBinding = source?.[name];
  if (fromBinding) return fromBinding;
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
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
