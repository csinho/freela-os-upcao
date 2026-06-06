import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import type { Servico } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ServicoCatalogoPickerProps = {
  servicos: Servico[];
  value: string;
  onValueChange: (id: string) => void;
  /** Incrementar após adicionar ao orçamento para limpar busca e dropdown. */
  resetKey?: number;
  className?: string;
  children?: ReactNode;
};

export function ServicoCatalogoPicker({
  servicos,
  value,
  onValueChange,
  resetKey = 0,
  className,
  children,
}: ServicoCatalogoPickerProps) {
  const servicosAtivos = useMemo(() => servicos.filter((s) => s.ativo), [servicos]);
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return servicosAtivos;
    return servicosAtivos.filter((s) => s.nome.toLowerCase().includes(q));
  }, [busca, servicosAtivos]);

  useEffect(() => {
    setBusca("");
    setBuscaAberta(false);
  }, [resetKey]);

  useEffect(() => {
    if (!value) {
      setBusca("");
      return;
    }
    const selecionado = servicosAtivos.find((s) => s.id === value);
    if (selecionado) setBusca(selecionado.nome);
  }, [value, servicosAtivos]);

  const selecionar = (id: string) => {
    const servico = servicosAtivos.find((s) => s.id === id);
    onValueChange(id);
    setBusca(servico?.nome ?? "");
    setBuscaAberta(false);
  };

  const onBuscaChange = (texto: string) => {
    setBusca(texto);
    setBuscaAberta(true);
    if (!texto.trim()) {
      onValueChange("");
      return;
    }
    const selecionado = value ? servicosAtivos.find((s) => s.id === value) : undefined;
    if (selecionado && texto !== selecionado.nome) {
      onValueChange("");
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center",
        className,
      )}
    >
      <Popover open={buscaAberta} onOpenChange={setBuscaAberta}>
        <PopoverAnchor asChild>
          <div className="relative w-full md:max-w-sm md:flex-1 md:min-w-[12rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={busca}
              placeholder="Buscar pelo nome do serviço"
              className="pl-9"
              onChange={(e) => onBuscaChange(e.target.value)}
              onFocus={() => setBuscaAberta(true)}
              autoComplete="off"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="z-[200] w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
              <CommandGroup>
                {filtrados.map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.nome}
                    onSelect={() => selecionar(s.id)}
                  >
                    {s.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Select key={resetKey} value={value} onValueChange={selecionar}>
        <SelectTrigger className="w-full md:w-56 shrink-0">
          <SelectValue placeholder="Ou escolher na lista" />
        </SelectTrigger>
        <SelectContent>
          {servicosAtivos.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {children}
    </div>
  );
}
