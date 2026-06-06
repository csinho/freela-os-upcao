import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { pageTitle } from "@/lib/app-brand";
import { useUpsertServico } from "@/lib/store";
import type { Servico } from "@/lib/types";
import { newId } from "@/lib/id";
import { ServicoFormFields } from "@/components/servicos/servico-form-fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/novo")({
  head: () => ({ meta: [{ title: pageTitle("Novo serviço") }] }),
  component: ServicoNovoPage,
});

const empty = (): Servico => ({
  id: newId(),
  nome: "",
  valor_padrao: 0,
  unidade: "serviço",
  ativo: true,
});

function ServicoNovoPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const upsert = useUpsertServico();

  useEffect(() => {
    if (isMobile === false) void navigate({ to: "/servicos" });
  }, [isMobile, navigate]);

  if (isMobile === undefined) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!isMobile) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void navigate({ to: "/servicos" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Novo serviço</h1>
      </div>
      <ServicoFormFields
        key="novo"
        value={empty()}
        layout="page"
        saving={upsert.isPending}
        onSave={(s) =>
          upsert.mutate(s, {
            onSuccess: () => void navigate({ to: "/servicos" }),
          })
        }
      />
    </div>
  );
}
