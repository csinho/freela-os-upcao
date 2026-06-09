import { useMemo, useState } from "react";
import type { Cliente } from "@/lib/types";
import { ensureUuid } from "@/lib/id";
import { buscarCep } from "@/lib/viacep";
import {
  documentoTipo,
  maskCep,
  maskDocumento,
  maskTelefone,
  validateCep,
  validateDocumento,
  validateEmail,
  validateTelefone,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileFormFooter } from "@/components/mobile/mobile-form-footer";

function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

type ClienteFormFieldsProps = {
  value: Cliente;
  onSave: (c: Cliente) => void;
  layout?: "dialog" | "page";
  saving?: boolean;
};

export function ClienteFormFields({
  value,
  onSave,
  layout = "dialog",
  saving,
}: ClienteFormFieldsProps) {
  const [c, setC] = useState(value);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErro, setCepErro] = useState<string | null>(null);

  const telErro = useMemo(() => validateTelefone(c.telefone || ""), [c.telefone]);
  const emailErro = useMemo(() => validateEmail(c.email || ""), [c.email]);
  const docErro = useMemo(() => validateDocumento(c.documento || ""), [c.documento]);
  const docHint = useMemo(() => {
    const tipo = documentoTipo(c.documento || "");
    if (!tipo) return null;
    return tipo === "cpf" ? "CPF" : "CNPJ";
  }, [c.documento]);
  const cepErroFmt = useMemo(() => validateCep(c.endereco.cep || ""), [c.endereco.cep]);

  const onCepChange = async (raw: string) => {
    const masked = maskCep(raw);
    setC((cur) => ({ ...cur, endereco: { ...cur.endereco, cep: masked } }));
    setCepErro(null);
    const digits = masked.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const data = await buscarCep(masked);
      if (!data) {
        setCepErro("CEP não encontrado");
        return;
      }
      setC((cur) => ({
        ...cur,
        endereco: {
          ...cur.endereco,
          cep: data.cep || masked,
          rua: data.logradouro || cur.endereco.rua,
          bairro: data.bairro || cur.endereco.bairro,
          cidade: data.localidade || cur.endereco.cidade,
          estado: data.uf || cur.endereco.estado,
          complemento: data.complemento || cur.endereco.complemento,
        },
      }));
    } catch {
      setCepErro("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const podeSalvar =
    !!c.nome.trim() && !telErro && !emailErro && !docErro && !cepErroFmt && !cepErro;

  const submit = () => {
    if (podeSalvar) onSave({ ...c, id: ensureUuid(c.id) });
  };

  const fields = (
    <div className={layout === "page" ? "space-y-6 pb-28" : "space-y-6"}>
      <div className="space-y-4">
        <p className="text-sm font-medium">Dados do cliente</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>Nome*</Label>
            <Input
              className="h-11"
              value={c.nome}
              onChange={(e) => setC({ ...c, nome: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input
              value={c.telefone || ""}
              onChange={(e) => setC({ ...c, telefone: maskTelefone(e.target.value) })}
              placeholder="(11) 9 9999-9999"
              inputMode="tel"
              aria-invalid={!!telErro}
              className={telErro ? "border-destructive h-11" : "h-11"}
            />
            <FieldError msg={telErro} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={c.email || ""}
              onChange={(e) => setC({ ...c, email: e.target.value })}
              placeholder="contato@email.com"
              aria-invalid={!!emailErro}
              className={emailErro ? "border-destructive h-11" : "h-11"}
            />
            <FieldError msg={emailErro} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              CPF/CNPJ
              {docHint && !docErro && (
                <span className="text-xs font-normal text-muted-foreground">({docHint})</span>
              )}
            </Label>
            <Input
              className={docErro ? "border-destructive h-11" : "h-11"}
              value={c.documento || ""}
              onChange={(e) => setC({ ...c, documento: maskDocumento(e.target.value) })}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              inputMode="numeric"
              aria-invalid={!!docErro}
            />
            <FieldError msg={docErro} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-5">
        <p className="text-sm font-medium">Endereço</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>CEP</Label>
            <Input
              value={c.endereco.cep || ""}
              onChange={(e) => void onCepChange(e.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              disabled={cepLoading}
              aria-invalid={!!(cepErro || cepErroFmt)}
              className={cepErro || cepErroFmt ? "border-destructive h-11" : "h-11"}
            />
            {cepLoading && (
              <p className="text-xs text-muted-foreground mt-1">Buscando endereço…</p>
            )}
            <FieldError msg={cepErroFmt || cepErro} />
          </div>
          <div className="space-y-1.5">
            <Label>Rua</Label>
            <Input
              className="h-11"
              value={c.endereco.rua || ""}
              onChange={(e) => setC({ ...c, endereco: { ...c.endereco, rua: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Número</Label>
            <Input
              className="h-11"
              value={c.endereco.numero || ""}
              onChange={(e) =>
                setC({ ...c, endereco: { ...c.endereco, numero: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bairro</Label>
            <Input
              className="h-11"
              value={c.endereco.bairro || ""}
              onChange={(e) =>
                setC({ ...c, endereco: { ...c.endereco, bairro: e.target.value } })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input
                className="h-11"
                value={c.endereco.cidade || ""}
                onChange={(e) =>
                  setC({ ...c, endereco: { ...c.endereco, cidade: e.target.value } })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>UF</Label>
              <Input
                className="h-11"
                value={c.endereco.estado || ""}
                maxLength={2}
                onChange={(e) =>
                  setC({
                    ...c,
                    endereco: { ...c.endereco, estado: e.target.value.toUpperCase() },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 border-t pt-5">
        <Label>Observações</Label>
        <Textarea
          rows={3}
          value={c.observacoes || ""}
          onChange={(e) => setC({ ...c, observacoes: e.target.value })}
        />
      </div>
    </div>
  );

  if (layout === "page") {
    return (
      <>
        {fields}
        <MobileFormFooter
          onSave={submit}
          disabled={!podeSalvar}
          loading={saving}
          label={value.nome ? "Salvar alterações" : "Criar cliente"}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="space-y-0 text-left">
        <DialogTitle>{value.nome ? "Editar cliente" : "Novo cliente"}</DialogTitle>
      </DialogHeader>
      {fields}
      <DialogFooter className="pt-2 sm:justify-end">
        <Button type="button" disabled={!podeSalvar || saving} onClick={submit}>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </div>
  );
}
