# Geração de PDF

> **Documentação reorganizada:** ver [modulos/11-pdf.md](./modulos/11-pdf.md).

Implementada com **[pdfmake](https://pdfmake.github.io/docs/0.3/)** (client-side, JavaScript puro).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/lib/pdf-orcamento.ts` | Monta o `docDefinition` (layout, tabelas, totais) |
| `src/lib/pdfmake-client.ts` | Carrega pdfmake + fontes VFS, gera blob/download |
| `src/components/pdf-preview.tsx` | `PDFPreview` (iframe) e `DownloadBtn` |

Em `orcamentos.$id.tsx` o módulo é importado com `import()` dinâmico — só roda no navegador.

## Layout do PDF

1. **Cabeçalho** — logo + empresa; bloco ORÇAMENTO/PEDIDO, número, datas
2. **Cliente + Projeto** — dois cards
3. **Tabela de itens** — #, serviço, un., qtd, valor, subtotal
4. **Totais** — subtotal, desconto (% e R$), acréscimo, total
5. **Condições + Observações**
6. **Rodapé** — linhas de aceite/assinatura + texto da empresa

## Customizar

Edite `buildOrcamentoPdfDoc()` em `src/lib/pdf-orcamento.ts`. Referência da API: [Document definition](https://pdfmake.github.io/docs/0.3/document-definition-object/).

## Playground

Para testar blocos isolados: [pdfmake playground](https://pdfmake.org/playground.html).
