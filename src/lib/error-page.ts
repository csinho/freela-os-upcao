function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderErrorPage(detail?: string): string {
  const detailBlock = detail
    ? `<pre class="detail">${escapeHtml(detail)}</pre>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Erro ao carregar</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #11214D; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #067EF4; color: #fff; }
      .secondary { background: #fff; color: #11214D; border-color: #d1d5db; }
      .detail { text-align: left; font-size: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.75rem; margin: 0 0 1rem; white-space: pre-wrap; word-break: break-word; color: #374151; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Não foi possível carregar a página</h1>
      <p>Algo falhou no servidor. Tente atualizar ou volte ao início.</p>
      ${detailBlock}
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar de novo</button>
        <a class="secondary" href="/">Início</a>
      </div>
    </div>
  </body>
</html>`;
}
