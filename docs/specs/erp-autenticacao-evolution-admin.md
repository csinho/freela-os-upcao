# Spec — Auth, Evolution API e Admin

> Resumo da spec completa. Documento original: [`ESPECIFICACAO-IMPLEMENTACAO-ERP.md`](../ESPECIFICACAO-IMPLEMENTACAO-ERP.md)

## Princípios

- Usuário **nunca digita e-mail** — login sempre pelo WhatsApp
- Supabase Auth com **e-mail sintético** invisível (`freela_os_empresa_{whatsapp}@auth.freelaos.local`)
- OTP de 6 dígitos, válido 10 minutos, via **Evolution API**
- Máscara brasileira de telefone em cadastro e login
- Login unificado em `/login` (empresa ou admin via allowlist)

## Telas obrigatórias

| Tela | Rota | Requisitos |
|------|------|------------|
| Login | `/login` | WhatsApp → OTP → sessão → dashboard |
| Cadastro | `/cadastro/empresa` | Nome + WhatsApp → cria Auth + empresa → trial 7 dias |
| Setup WhatsApp | `/setup/whatsapp` | QR Code Evolution com chave de acesso |
| Admin login | `/admin/login` | Redireciona para `/login` (unificado) |

## Fluxo de login empresa

1. Informar WhatsApp (11 dígitos)
2. Servidor verifica cadastro e envia OTP
3. Confirmar código de 6 dígitos
4. Validar hash SHA-256 em `login_otp`
5. `signInWithPassword` com senha rotacionada no servidor
6. Gravar sessão `{ tipo: "empresa", id, nome }` em `localStorage`
7. Redirect ao dashboard `/`

## Fluxo de login admin

1. Mesmo `/login`, servidor detecta allowlist (`ADMIN_WHATSAPP_ALLOWLIST`)
2. OTP com propósito `admin_login`
3. Sessão `{ tipo: "admin", id, nome }`
4. Redirect `/admin/dashboard`

## Bloqueios

- `empresas.status = inativo` → login empresa falha
- WhatsApp não cadastrado → link para `/cadastro/empresa`

## Evolution API

- Instância dedicada (não reutilizar de outros projetos)
- Configurável pelo admin em `/admin/configuracoes`
- Envio de OTP e notificações de billing (stub em dev)

## Tabelas

| Tabela | Função |
|--------|--------|
| `login_otp` | Hash OTP login empresa |
| `admin_otp_codes` | OTP admin (legado) |
| `empresas.auth_user_id` | Vínculo com `auth.users` |

Migration: `docs/migrations/2026-06-06-auth-login.sql`

## Implementação

| Área | Doc |
|------|-----|
| Auth (código) | [modulos/09-autenticacao.md](../modulos/09-autenticacao.md) |
| Setup WhatsApp | [modulos/12-setup-whatsapp.md](../modulos/12-setup-whatsapp.md) |
| Admin | [modulos/10-admin.md](../modulos/10-admin.md) |

## Arquivos-chave

```
src/lib/auth/
  empresa-auth.server.ts    # Resolve papel, envia/confirma OTP
  synthetic-email.ts        # E-mail sintético
  client-session.ts         # localStorage
  otp-store.server.ts       # Persistência OTP
  supabase-auth.server.ts   # signIn, createUser

src/lib/evolution/
  client.server.ts          # Envio de mensagens
  instance.server.ts        # Gestão de instância
  admin.server.ts           # Config admin

src/lib/api/auth.functions.ts
src/routes/login.tsx
src/routes/cadastro.empresa.tsx
```
