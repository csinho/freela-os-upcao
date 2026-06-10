import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const faviconSource = path.join(root, "src", "images", "favicon.png");
const iconBackground = "#ffffff";

if (!fs.existsSync(faviconSource)) {
  console.error("ERRO: src/images/favicon.png não encontrado.");
  process.exit(1);
}

const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });

async function iconOnBackground(size) {
  const logo = await sharp(faviconSource)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: iconBackground,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Favicon principal (aba do navegador). */
const faviconOut = path.join(publicDir, "favicon.png");
await sharp(await iconOnBackground(192)).toFile(faviconOut);
console.log("gerado:", path.relative(root, faviconOut));

const sizes = [
  { size: 180, name: "pwa-180x180.png" },
  { size: 192, name: "pwa-192x192.png" },
  { size: 512, name: "pwa-512x512.png" },
];

for (const { size, name } of sizes) {
  const out = path.join(publicDir, name);
  await sharp(await iconOnBackground(size)).toFile(out);
  console.log("gerado:", path.relative(root, out));
}

/** Ícone maskable com margem de segurança (~20%) em fundo branco. */
const maskableOut = path.join(publicDir, "pwa-512x512-maskable.png");
const maskableSize = 512;
const inner = Math.round(maskableSize * 0.72);
const innerBuffer = await sharp(faviconSource)
  .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: iconBackground,
  },
})
  .composite([{ input: innerBuffer, gravity: "center" }])
  .png()
  .toFile(maskableOut);
console.log("gerado:", path.relative(root, maskableOut));

/** Manifest estático para dev (`vite dev`) e fallback em produção. */
const manifest = {
  name: "Up Serviços",
  short_name: "Up Serviços",
  description: "Gestão de orçamentos, pedidos e financeiro para prestadores de serviço",
  lang: "pt-BR",
  dir: "ltr",
  start_url: "/login",
  scope: "/",
  display: "standalone",
  orientation: "portrait-primary",
  theme_color: iconBackground,
  background_color: iconBackground,
  categories: ["business", "productivity"],
  icons: [
    { src: "/favicon.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/pwa-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

const manifestPath = path.join(publicDir, "manifest.webmanifest");
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("gerado:", path.relative(root, manifestPath));
