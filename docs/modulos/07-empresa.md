# Módulo — Empresa

## Resumo

Cadastro dos dados do tenant (freelancer/empresa): identidade visual, contato, endereço, dados bancários e textos padrão para orçamentos.

## Rota

| Item | Valor |
|------|-------|
| Rota | `/empresa` |
| Arquivo | `src/routes/empresa.tsx` |

## Funcionalidades

- Nome, documento (CPF/CNPJ), telefone, e-mail
- Endereço completo (ViaCEP)
- Site e redes sociais (array JSON)
- Dados bancários / Pix
- **Logo** — upload como Data URL, salvo em `logo_url`
- Condições padrão e observações padrão (pré-preenchidos em novos orçamentos)

## Branding

| Onde a logo aparece | Como |
|---------------------|------|
| Sidebar (`AppShell`) | `useEmpresaBranding` |
| Favicon | `src/hooks/use-empresa-branding.ts` |
| PDF do orçamento | `pdf-orcamento.ts` |

## Hooks

| Hook | Função |
|------|--------|
| `useEmpresa` | Carrega dados |
| `useSaveEmpresa` | Upsert em `empresas` |

## Tabela

### `empresas`

Campos principais documentados em [infraestrutura/banco-de-dados.md](../infraestrutura/banco-de-dados.md).

Campos adicionais (auth/billing):

- `auth_user_id` — vínculo Supabase Auth
- `status` — operacional (`ativo`/`inativo`)
- `billing_status`, `billing_trial_ends`, `billing_next_due` — ver [08-plano-billing.md](./08-plano-billing.md)

## Spec relacionada

[specs/erp-core.md](../specs/erp-core.md) — seção Empresa
