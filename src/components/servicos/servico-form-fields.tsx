import { useState } from "react";
import type { Servico, UnidadeServico } from "@/lib/types";
import { ensureUuid } from "@/lib/id";
import { formatBRLInput, parseBRL } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileFormFooter } from "@/components/mobile/mobile-form-footer";

const UNIDADES: UnidadeServico[] = ["serviço", "hora", "mensalidade", "pacote"];

type ServicoFormFieldsProps = {
  value: Servico;
  onSave: (s: Servico) => void;
  layout?: "dialog" | "page";
  saving?: boolean;
};

export function ServicoFormFields({
  value,
  onSave,
  layout = "dialog",
  saving,
}: ServicoFormFieldsProps) {
  const [s, setS] = useState(value);
  const podeSalvar = !!s.nome.trim();

  const submit = () => {
    if (podeSalvar) onSave({ ...s, id: ensureUuid(s.id) });
  };

  const fields = (
    <div className={layout === "page" ? "space-y-4 pb-28" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Nome*</Label>
        <Input className="h-11" value={s.nome} onChange={(e) => setS({ ...s, nome: e.target.value })} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Descrição</Label>
        <Textarea
          value={s.descricao || ""}
          onChange={(e) => setS({ ...s, descricao: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Unidade</Label>
        <Select value={s.unidade} onValueChange={(v) => setS({ ...s, unidade: v as UnidadeServico })}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIDADES.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Valor padrão</Label>
        <Input
          className="h-11"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={formatBRLInput(s.valor_padrao)}
          onChange={(e) => setS({ ...s, valor_padrao: parseBRL(e.target.value) })}
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3 py-1">
        <Switch checked={s.ativo} onCheckedChange={(v) => setS({ ...s, ativo: v })} />
        <Label>Ativo</Label>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Observações</Label>
        <Textarea
          value={s.observacoes || ""}
          onChange={(e) => setS({ ...s, observacoes: e.target.value })}
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
          label={value.nome ? "Salvar alterações" : "Criar serviço"}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader className="space-y-0 text-left">
        <DialogTitle>{value.nome ? "Editar serviço" : "Novo serviço"}</DialogTitle>
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
