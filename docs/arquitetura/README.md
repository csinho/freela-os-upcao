# Arquitetura — Up Serviços

## Visão geral

O **Up Serviços** é um monólito full-stack: uma única aplicação TanStack Start com SSR no Cloudflare Workers. Não há backend separado — a lógica de servidor vive em **Server Functions** (`createServerFn`) e em rotas API do Worker.

```
Browser
   │
   ▼
Cloudflare Worker (src/server.ts)
   ├── /api/webhooks/woovi  → webhook PIX
   ├── /api/cron/billing   → job diário
   └── TanStack Start SSR  → páginas React
           │
           ├── 
           │       ├── Server Functions (src/lib/api/*.functions.ts)Supabase (service role)
           │       ├── Evolution API (WhatsApp)
           │       └── Woovi (PIX)
           │
           └── Cliente React
                   ├── TanStack Query (src/lib/store.ts)
                   ├── Repository (src/lib/repository.ts)
                   └── Supabase client (anon key)
```

## Pontos de entrada


| Arquivo                 | Função                                                               |
| ----------------------- | -------------------------------------------------------------------- |
| `src/server.ts`         | Entry do Cloudflare Worker: API routes, cron `scheduled`, delega SSR |
| `src/start.ts`          | Instância TanStack Start + middleware de erro                        |
| `src/router.tsx`        | Cria router + QueryClient                                            |
| `src/routes/__root.tsx` | Layout raiz, guards de auth, AppShell                                |
| `src/routeTree.gen.ts`  | Árvore de rotas (gerada automaticamente)                             |


## Padrões de código

### 1. File-based routing

Cada página em `src/routes/*.tsx` exporta `Route = createFileRoute(...)`. Sub-rotas usam convenção de arquivo (`orcamentos.$id.tsx` → `/orcamentos/:id`).

### 2. Repository + TanStack Query

- `**src/lib/repository.ts**` — CRUD tipado contra Supabase (client-side, filtrado por `empresa_id` da sessão)
- `**src/lib/store.ts**` — hooks `useClientes`, `useOrcamentos`, `useMoveOrcamento`, etc.

### 3. Server Functions (RPC)

Lógica sensível (auth, billing, admin) em `src/lib/api/*.functions.ts`:


| Arquivo                | Responsabilidade                                |
| ---------------------- | ----------------------------------------------- |
| `auth.functions.ts`    | Cadastro, login OTP, resolução de papel         |
| `billing.functions.ts` | Gerar PIX, mover orçamento com guard de billing |
| `admin.functions.ts`   | Dashboard, empresas, Evolution admin            |
| `setup.functions.ts`   | QR Code Evolution em `/setup/whatsapp`          |


### 4. Multi-tenant

- Cada empresa é um tenant (`empresas` com `auth_user_id`)
- Dados ERP filtrados por `empresa_id` (clientes, serviços, orçamentos, financeiro)
- Sessão no browser: `localStorage` (`freela_os_sessao`) via `src/lib/auth/client-session.ts`
- Tipos de sessão: `empresa` ou `admin`

### 5. Supabase dual client


| Arquivo                               | Uso                                          |
| ------------------------------------- | -------------------------------------------- |
| `src/integrations/supabase/client.ts` | Browser — chave publishable (`VITE_*`)       |
| `src/integrations/supabase/server.ts` | Servidor — service role (auth, billing, OTP) |


## Estrutura de `src/`

```
src/
├── routes/              # Páginas + API routes
├── components/
│   ├── ui/              # shadcn/ui (45+ componentes)
│   ├── auth/            # RequireEmpresa, RequireAdmin, PhoneField
│   ├── admin/           # AdminLayout, tabelas, Evolution settings
│   ├── empresa/         # Billing banner, pagamentos
│   ├── app-shell.tsx    # Sidebar ERP
│   ├── pdf-preview.tsx
│   └── crud-dialog.tsx
├── lib/
│   ├── types.ts         # Tipos + calcTotal, formatBRL
│   ├── repository.ts    # Acesso Supabase (client)
│   ├── store.ts         # Hooks TanStack Query
│   ├── validators.ts    # Máscaras CPF, telefone, CEP
│   ├── auth/            # OTP, sessão, Supabase Auth server
│   ├── billing/         # Woovi, guards, cron, notificações
│   ├── admin/           # Métricas, empresas, allowlist
│   ├── evolution/       # Client Evolution API
│   └── api/             # Server Functions + request-handlers
├── integrations/supabase/
├── hooks/
├── server.ts
├── start.ts
└── router.tsx
```

## Fluxos críticos

### Orçamento → Pedido → Financeiro

1. Usuário move card no Kanban ou altera status em `/orcamentos/$id`
2. `useMoveOrcamento` chama `moverOrcamentoComBillingRemote` (verifica billing)
3. `orcamentosRepo.move` atualiza status, datas e histórico
4. Ao entrar em **Em produção**: cria conta a receber no financeiro (sem duplicar)
5. Ao entrar em **Entregue**: marca lançamento como pago

### Cadastro de empresa

1. `/cadastro/empresa` → nome + WhatsApp
2. Server cria `auth.users` (e-mail sintético) + linha em `empresas`
3. Trial de 7 dias (`billing_status: trial`)
4. Sessão Supabase + redirect ao dashboard

### Billing SaaS

1. Trial expira → cron diário gera cobrança PIX (Woovi)
2. Empresa paga → webhook `/api/webhooks/woovi` confirma
3. `billing_status` → `ativo`, +30 dias de acesso
4. Inadimplência bloqueia novo orçamento e aprovação no Kanban

## Guards de rota


| Componente       | Onde                     | O que protege                          |
| ---------------- | ------------------------ | -------------------------------------- |
| `RequireEmpresa` | `__root.tsx` (rotas ERP) | Exige sessão `tipo: empresa`           |
| `RequireAdmin`   | `admin.tsx`              | Exige sessão `tipo: admin` + allowlist |


Rotas públicas: `/login`, `/cadastro/empresa`, `/setup/whatsapp`, `/api/`*.

## Deploy


| Método                        | Doc                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Cloudflare Workers (primário) | [infraestrutura/deploy-cloudflare.md](../infraestrutura/deploy-cloudflare.md) |
| Docker / EasyPanel (legado)   | [infraestrutura/deploy-docker.md](../infraestrutura/deploy-docker.md)         |


Worker: `freela-os`. Cron billing: `0 12 * * *` UTC (09:00 BRT).