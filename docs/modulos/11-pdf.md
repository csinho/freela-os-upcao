# Módulo — PDF de Orçamento

## Resumo

Geração client-side de PDF profissional do orçamento/pedido usando **pdfmake**.

## Onde é usado

Tela `/orcamentos/$id` — botões **Visualizar PDF** e **Baixar PDF**.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/lib/pdf-orcamento.ts` | Monta `docDefinition` (layout, tabelas, totais) |
| `src/lib/pdfmake-client.ts` | Carrega pdfmake + fontes VFS, gera blob/download |
| `src/components/pdf-preview.tsx` | `PDFPreview` (iframe) e `DownloadBtn` |

Import dinâmico em `orcamentos.$id.tsx` — só executa no navegador (SSR-safe).

Plugin Vite: `vite.client-pdf-plugin.ts` — evita bundling server-side do pdfmake.

## Layout do PDF

1. **Cabeçalho** — logo + dados da empresa; bloco ORÇAMENTO/PEDIDO, número, datas
2. **Cliente + Projeto** — dois cards lado a lado
3. **Tabela de itens** — #, serviço, un., qtd, valor, subtotal
4. **Totais** — subtotal, desconto (% e R$), acréscimo, total
5. **Condições + Observações**
6. **Rodapé** — linhas de aceite/assinatura + texto da empresa

## Customização

Editar `buildOrcamentoPdfDoc()` em `src/lib/pdf-orcamento.ts`.

Referência: [pdfmake Document definition](https://pdfmake.github.io/docs/0.3/document-definition-object/)

## Dados necessários

- `Empresa` (logo, contato, condições)
- `Orcamento` + `OrcamentoItem[]`
- `Cliente`

Helpers de formatação: `formatBRL`, `formatDate`, `formatPercentLabel` em `types.ts`.

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção PDF em Orçamentos

Documento legado: [pdf.md](../pdf.md)
