# Módulo — Painel Admin

## Resumo

Backoffice para o operador da plataforma: métricas, gestão de empresas (tenants), billing e configurações globais.

## Rotas

| Rota | Arquivo | Função |
|------|---------|--------|
| `/admin` | `admin.index.tsx` | Redirect → dashboard |
| `/admin/login` | `admin.login.tsx` | Redirect → `/login` |
| `/admin/dashboard` | `admin.dashboard.tsx` | Métricas agregadas |
| `/admin/empresas` | `admin.empresas.index.tsx` | Listagem + criar empresa |
| `/admin/empresas/$id` | `admin.empresas.$empresaId.tsx` | Detalhe + pagamentos |
| `/admin/configuracoes` | `admin.configuracoes.tsx` | Plano, suporte, Evolution |

Layout: `src/routes/admin.tsx` → `AdminLayout` + `RequireAdmin`.

## Dois eixos de status

| Eixo | Campo | Controle |
|------|-------|----------|
| Operacional | `empresas.status` | Admin pausa/ativa manualmente |
| Pagamento | `empresas.billing_status` | Billing automático (Woovi) |

Independentes: plano ativo + empresa pausada é possível.

## Dashboard

Métricas em `src/lib/admin/metrics.server.ts`:

- Empresas ativas
- Receita no período
- Ticket médio
- Taxa de plano ativo

Filtro De/Até em BRT. Gráficos com Recharts.

## Listagem de empresas

`AdminEmpresasTable.tsx`:

- Busca por nome ou telefone
- Toggle pausar/ativar
- Status de billing
- Link para detalhe

## Criar empresa (admin)

Admin pode criar empresa sem OTP — mesmo backend do cadastro (`registerEmpresaWithAuthRemote`). Cliente faz login depois em `/login`.

## Configurações globais

`/admin/configuracoes`:

- Valor do plano (`system_settings.billing.plan_value_cents`)
- WhatsApp de suporte
- Configuração Evolution (instância, QR)

`AdminEvolutionSettings.tsx` — criar instância WhatsApp + exibir QR.

## Realtime

Canal Supabase em `src/lib/supabase/realtime.ts` escuta:

- `empresas`
- `billing_payments`
- `system_settings`

UI admin e `/plano` atualizam sem refresh.

## Server Functions

`src/lib/api/admin.functions.ts`:

- `getAdminDashboardRemote`
- `listarEmpresasAdminRemote`
- `toggleEmpresaStatusRemote`
- Funções Evolution admin

## Biblioteca admin

```
src/lib/admin/
  allowlist.server.ts       # env ∪ evolution.connection_phone
  metrics.server.ts
  empresas.server.ts
  system-settings.server.ts
  types.ts
```

## Tabelas

- `empresas` (+ `status`)
- `system_settings`
- `billing_payments`
- `admin_otp_codes`

Migration: `docs/migrations/2026-06-06-admin-panel.sql`

## Variáveis

```env
# Opcional após 1º setup — bootstrap ou admins extras
ADMIN_WHATSAPP_ALLOWLIST=71911111111,71922222222
```

O número salvo na Evolution (`connection_phone`) também autoriza login admin.

## Spec relacionada

[specs/painel-admin.md](../specs/painel-admin.md)

Documento legado: [ADMIN.md](../ADMIN.md)
