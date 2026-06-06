# Spec — ERP Core (orçamentos, Kanban, financeiro)

> Requisitos dos módulos operacionais do freelancer. Baseado em `modulos.md`.

## Objetivo

Sistema interno para gerenciar **orçamentos, pedidos, clientes, serviços e financeiro**, com Kanban visual e geração de PDF profissional.

## Módulos e requisitos

### Dashboard

- Cards: totais por status (orçamento, produção, entregue)
- Cards financeiros: a receber, recebido, a pagar
- Últimos 5 orçamentos (clicáveis)
- Próximos vencimentos financeiros

### Kanban

- Colunas: Orçamento → Em produção → Vistoria → Entregue
- Drag-and-drop (@dnd-kit)
- Aprovação automática ao mover para produção (data + financeiro)
- Entrega automática ao mover para entregue
- Indicador financeiro no card (Pago/Parcial/Pendente)

### Clientes

- CRUD simples
- Vinculação por `cliente_id` em orçamentos e financeiro
- ViaCEP para endereço

### Serviços

- Catálogo com `valor_padrao` e `unidade`
- Usado no orçamento via combobox "Adicionar do catálogo"

### Orçamentos

- Numeração automática: `ORC-YYYYMMDD-NNNNN`
- Itens com quantidade, valor unitário, subtotal em tempo real
- Desconto em **percentual** (exibe % e R$ no PDF)
- Acréscimo em R$
- Forma de pagamento, prazo, validade, condições, observações
- Textos padrão da empresa pré-preenchidos
- PDF: visualizar (modal) e baixar

### Financeiro

- Lançamentos **somente automáticos** (vinculados a `orcamento_id`)
- Criado ao aprovar pedido; marcado pago ao entregar
- Sem criação manual

### Empresa

- Cadastro único por tenant
- Logo (sidebar + favicon + PDF)
- Dados bancários, Pix, redes sociais
- Condições e observações padrão para novos orçamentos

## Cálculos

```
subtotal = Σ (quantidade × valor_unitario)
desconto (R$) = subtotal × (desconto_percentual / 100)
total = subtotal - desconto + acrescimo
```

Helpers: `calcSubtotal`, `calcDescontoValor`, `calcTotal` em `src/lib/types.ts`.

## Implementação

| Requisito | Doc de implementação |
|-----------|---------------------|
| Dashboard | [modulos/01-dashboard.md](../modulos/01-dashboard.md) |
| Kanban | [modulos/02-kanban.md](../modulos/02-kanban.md) |
| Clientes | [modulos/03-clientes.md](../modulos/03-clientes.md) |
| Serviços | [modulos/04-servicos.md](../modulos/04-servicos.md) |
| Orçamentos | [modulos/05-orcamentos.md](../modulos/05-orcamentos.md) |
| Financeiro | [modulos/06-financeiro.md](../modulos/06-financeiro.md) |
| Empresa | [modulos/07-empresa.md](../modulos/07-empresa.md) |
| PDF | [modulos/11-pdf.md](../modulos/11-pdf.md) |

## Banco de dados

Tabelas: `empresas`, `clientes`, `servicos`, `orcamentos`, `orcamento_itens`, `financeiro`, `historico_status`.

Script: `docs/setup-supabase.sql` + `docs/migrations/2026-05-22-desconto-percentual.sql`.
