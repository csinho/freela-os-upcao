# Painel administrativo — Up Serviços

> **Documentação reorganizada:** ver [modulos/10-admin.md](./modulos/10-admin.md) e [specs/painel-admin.md](./specs/painel-admin.md).

Operador da plataforma gerencia **empresas** (tenants), billing e configurações globais.

## Rotas

| Rota | Função |
|------|--------|
| `/login` | Login unificado — admin (allowlist) ou empresa |
| `/admin/login` | Redireciona para `/login` |
| `/admin/dashboard` | Métricas agregadas |
| `/admin/empresas` | Listagem de todas as empresas |
| `/admin/empresas/{id}` | Detalhe + histórico de pagamentos |
| `/admin/configuracoes` | Valor do plano, suporte e WhatsApp Evolution |
| `/setup/whatsapp` | Setup Evolution sem login (chave `BILLING_CRON_SECRET`) |

## Três papéis do WhatsApp (não confundir)

| Onde | Campo / variável | Função |
|------|------------------|--------|
| Env (`.env`, GitHub, Cloudflare) | `ADMIN_WHATSAPP_ALLOWLIST` | Bootstrap do primeiro deploy e **admins extras** (vírgula). Opcional após configurar Evolution. |
| Supabase `system_settings` → `evolution` | `connection_phone` | Número do aparelho que conecta na Evolution (QR). **Também autoriza login admin** após salvar. |
| Supabase `system_settings` → `admin` | `contact_whatsapp` | Contato de suporte exibido para empresas. Sincronizado ao salvar a instância Evolution. |

**Allowlist efetiva** (quem pode logar como admin):

```
números da env ∪ connection_phone do banco
```

Implementação: `src/lib/admin/allowlist.server.ts`.

### Trocar o número admin

1. Em **/admin/configuracoes** ou **/setup/whatsapp**, informe o novo número, recrie a instância e escaneie o QR.
2. Faça login em **/login** com o **mesmo** número — não é obrigatório editar GitHub/Cloudflare.
3. Use `ADMIN_WHATSAPP_ALLOWLIST` na env apenas para o **primeiro** acesso (banco vazio) ou para **vários** admins (`71911111111,71922222222`).

## Variáveis de ambiente (servidor)

```env
# Opcional após 1º setup — bootstrap ou admins extras (11 dígitos, vírgula)
ADMIN_WHATSAPP_ALLOWLIST=71911111111,71922222222
```

Toda server function revalida a allowlist efetiva (env + banco).

## Migration

Execute no Supabase:

```
docs/migrations/2026-06-06-admin-panel.sql
```

Cria `empresas.status`, `system_settings`, `admin_otp_codes` (legado) e publicação Realtime.

## Login (OTP)

1. Acesse `/login`
2. Informe WhatsApp da allowlist efetiva
3. Código OTP enviado via Evolution
4. Confirme o código de 6 dígitos
5. Sessão gravada em `localStorage` (`freela_os_sessao`, `tipo: "admin"`)

## Dois eixos de status

- **Operacional** (`empresas.status`): `ativo` / `inativo` — pausa manual pelo admin
- **Pagamento** (`empresas.billing_status`): `trial` / `ativo` / `pendente` / `inadimplente`

São independentes: empresa pode ter plano ativo e estar pausada pelo admin.

## Valor do plano

Configurado em `/admin/configuracoes` → `system_settings` chave `billing` (`plan_value_cents`).

Novas cobranças Woovi usam o valor atualizado. Pagamentos já registrados não são alterados.

## Realtime

Canal Supabase escuta `empresas`, `billing_payments` e `system_settings` — UI admin e página `/plano` atualizam sem F5.
