# Módulo — Setup WhatsApp (Evolution)

## Resumo

Tela pública para configurar a instância Evolution API via QR Code, protegida por chave de acesso.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/setup/whatsapp` |
| Arquivo | `src/routes/setup.whatsapp.tsx` |

## Fluxo

1. Operador acessa com chave de acesso (query param ou campo)
2. Server valida chave (`src/lib/evolution/setup-auth.server.ts`)
3. Exibe QR Code para parear WhatsApp
4. Polling de status da instância até conectado

## Server Functions

`src/lib/api/setup.functions.ts`:

- Obter status da instância
- Gerar/renovar QR Code

## Biblioteca Evolution

```
src/lib/evolution/
  client.server.ts        # Envio de mensagens (OTP, notificações)
  instance.server.ts      # Gestão de instância
  instance-api.server.ts  # API REST Evolution
  setup-auth.server.ts    # Proteção da rota setup
  admin.server.ts         # Config pelo painel admin
```

## Relação com auth

- OTP de login enviado via Evolution (`empresa-auth.server.ts`)
- Instância também configurável em `/admin/configuracoes`
- Notificações de billing (lembretes) — stub em dev

## Variáveis

```env
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=
```

## Spec relacionada

[specs/erp-autenticacao-evolution-admin.md](../specs/erp-autenticacao-evolution-admin.md) — seção Evolution API
