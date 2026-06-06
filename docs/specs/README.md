# Especificações (Specs)

Documentos de requisitos e decisões de produto usados para implementar o Up Serviços. Servem como referência de **o que** foi pedido e **por quê** — a implementação concreta está em [modulos/](../modulos/).

## Índice de specs

| Spec | Arquivo | Escopo | Status |
|------|---------|--------|--------|
| ERP — Auth, Evolution, Admin | [erp-autenticacao-evolution-admin.md](./erp-autenticacao-evolution-admin.md) | Cadastro, login OTP WhatsApp, Supabase Auth, Evolution API, painel admin | Implementado |
| Painel Admin | [painel-admin.md](./painel-admin.md) | Listagem de empresas, billing, configurações globais, dois eixos de status | Implementado |
| Integração Woovi | [woovi-integracao.md](./woovi-integracao.md) | Assinatura SaaS via PIX, webhooks, cron, guards | Implementado |
| ERP core (orçamentos, Kanban, financeiro) | [erp-core.md](./erp-core.md) | Módulos operacionais do freelancer | Implementado |

## Origem das specs

| Spec organizada | Arquivo original (raiz `docs/`) |
|-----------------|----------------------------------|
| erp-autenticacao-evolution-admin | `ESPECIFICACAO-IMPLEMENTACAO-ERP.md` |
| painel-admin | `ESPECIFICACAO-PAINEL-ADMIN-ERP.md` |
| woovi-integracao | `PROMPT-WOOVI-INTEGRACAO.md` |
| erp-core | `modulos.md` (regras de negócio) |

Os arquivos originais permanecem na raiz de `docs/` para histórico. As versões nesta pasta resumem o escopo e apontam para a implementação.

## Ordem de implementação (histórico)

1. **ERP core** — Supabase, CRUD, Kanban, PDF, financeiro automático
2. **Auth multi-tenant** — OTP WhatsApp, e-mail sintético, `empresa_id` nas tabelas
3. **Billing Woovi** — Trial, PIX, webhooks, cron, guards
4. **Painel admin** — Métricas, empresas, configurações, Realtime
5. **Evolution admin** — Setup de instância WhatsApp pelo painel

## Como usar

- Para entender **requisitos de produto** → leia a spec correspondente
- Para entender **como foi codificado** → vá para [modulos/](../modulos/)
- Para **schema e deploy** → vá para [infraestrutura/](../infraestrutura/)
