import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) throw new Error(".env não encontrado");
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

async function hashOtp(code) {
  const data = new TextEncoder().encode(code);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const role = JSON.parse(Buffer.from(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()).role;
console.log("jwt_role", role);

const sb = createClient(url, key, { auth: { persistSession: false }, db: { schema: "public" } });
const whatsapp = "71999419508";
const code = "123456";
const codeHash = await hashOtp(code);

const del = await sb.from("login_otp").delete().eq("whatsapp", whatsapp).eq("purpose", "login");
console.log("delete", del.error?.message ?? "ok");

const ins = await sb.from("login_otp").insert({
  whatsapp,
  purpose: "login",
  code_hash: codeHash,
  expires_at: new Date(Date.now() + 600000).toISOString(),
  created_at: new Date().toISOString(),
});
console.log("insert", ins.error?.message ?? "ok");

const sel = await sb.from("login_otp").select("code_hash").eq("whatsapp", whatsapp).eq("purpose", "login").maybeSingle();
console.log("select", sel.error?.message ?? "ok", !!sel.data);

await sb.from("login_otp").delete().eq("whatsapp", whatsapp).eq("purpose", "login");
console.log("done");
