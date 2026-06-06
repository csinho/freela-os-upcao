# Módulo — Autenticação

## Resumo

Login por OTP no WhatsApp, cadastro de empresa, sessão multi-tenant com Supabase Auth e e-mail sintético.

## Rotas

| Rota | Arquivo | Função |
|------|---------|--------|
| `/login` | `src/routes/login.tsx` | Login unificado (empresa + admin) |
| `/cadastro/empresa` | `src/routes/cadastro.empresa.tsx` | Primeiro acesso |

## Fluxo — Cadastro (`/cadastro/empresa`)

1. Nome da empresa + WhatsApp (máscara BR)
2. Valida WhatsApp na Evolution
3. Server cria `auth.users` (e-mail sintético) + linha em `empresas`
4. Trial 7 dias (`billing_status: trial`)
5. Sessão Supabase + redirect ao dashboard (sem OTP no cadastro)

## Fluxo — Login (`/login`)

1. Informar WhatsApp
2. Servidor resolve papel (`resolveLoginRoleRemote`):
   - **Allowlist admin** (env + `evolution.connection_phone` no banco) → OTP `admin_login` → `/admin/dashboard`
   - **Empresa cadastrada** → OTP `login` → `/`
   - **Não cadastrado** → link para cadastro
3. OTP 6 dígitos via Evolution (mock em dev)
4. Confirmar → `confirmLoginOtpRemote`
5. Sessão Supabase Auth + `localStorage`

## E-mail sintético

```
freela_os_empresa_71996755745@auth.freelaos.local
```

Gerado em `src/lib/auth/synthetic-email.ts`. Senha aleatória rotacionada no servidor a cada login OTP.

## Sessão no browser

`src/lib/auth/client-session.ts`:

```ts
{ tipo: "empresa" | "admin", id: string, nome: string }
```

Chave: `freela_os_sessao` em `localStorage`.

## Guards

| Componente | Protege |
|------------|---------|
| `RequireEmpresa` | Rotas ERP |
| `RequireAdmin` | Rotas `/admin/*` |

## Server Functions

`src/lib/api/auth.functions.ts`:

- `resolveLoginRoleRemote`
- `registerEmpresaWithAuthRemote`
- `confirmLoginOtpRemote`
- `sendLoginOtpRemote`

## Biblioteca auth

```
src/lib/auth/
  empresa-auth.server.ts    # Lógica principal OTP
  otp-store.server.ts       # Hash SHA-256 em login_otp
  supabase-auth.server.ts   # createUser, signIn
  synthetic-email.ts
  client-session.ts
  client-auth.ts            # Supabase client-side auth
```

## Tabelas

- `login_otp` — OTP empresa (hash, expiração)
- `empresas.auth_user_id` — vínculo Auth

Migration: `docs/migrations/2026-06-06-auth-login.sql`

## Variáveis

```env
# Opcional após 1º setup — bootstrap ou admins extras
ADMIN_WHATSAPP_ALLOWLIST=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=
```

O número salvo ao configurar Evolution (`connection_phone`) também autoriza login admin.

## Bloqueios

- `empresas.status = inativo` → login empresa falha
- Admin fora da allowlist efetiva (env ∪ banco) → OTP não enviado

## Spec relacionada

[specs/erp-autenticacao-evolution-admin.md](../specs/erp-autenticacao-evolution-admin.md)

Documento legado: [AUTENTICACAO.md](../AUTENTICACAO.md)
