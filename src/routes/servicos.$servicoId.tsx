import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { pageTitle } from "@/lib/app-brand";
import { useServicos, useUpsertServico } from "@/lib/store";
import { ServicoFormFields } from "@/components/servicos/servico-form-fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicos/$servicoId")({
  head: () => ({ meta: [{ title: pageTitle("Editar serviço") }] }),
  component: ServicoEditPage,
});

function ServicoEditPage() {
  const { servicoId } = Route.useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile === false) void navigate({ to: "/servicos" });
  }, [isMobile, navigate]);

  const { data: servicos = [], isLoading } = useServicos();
  const upsert = useUpsertServico();
  const servico = servicos.find((s) => s.id === servicoId);

  if (isMobile === undefined) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!isMobile) return null;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!servico) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Serviço não encontrado.</p>
        <Button type="button" onClick={() => void navigate({ to: "/servicos" })}>
          Voltar
        </Button>
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold truncate">Editar serviço</h1>
      </div>
      <ServicoFormFields
        key={servico.id}
        value={servico}
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
