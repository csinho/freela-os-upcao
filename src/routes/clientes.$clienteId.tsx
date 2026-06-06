import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { pageTitle } from "@/lib/app-brand";
import { useClientes, useUpsertCliente } from "@/lib/store";
import { ClienteFormFields } from "@/components/clientes/cliente-form-fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clientes/$clienteId")({
  head: () => ({ meta: [{ title: pageTitle("Editar cliente") }] }),
  component: ClienteEditPage,
});

function ClienteEditPage() {
  const { clienteId } = Route.useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile === false) void navigate({ to: "/clientes" });
  }, [isMobile, navigate]);

  const { data: clientes = [], isLoading } = useClientes();
  const upsert = useUpsertCliente();
  const cliente = clientes.find((c) => c.id === clienteId);

  if (isMobile === undefined) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!isMobile) return null;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!cliente) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Cliente não encontrado.</p>
        <Button type="button" onClick={() => void navigate({ to: "/clientes" })}>
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
          onClick={() => void navigate({ to: "/clientes" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate">Editar cliente</h1>
      </div>
      <ClienteFormFields
        key={cliente.id}
        value={cliente}
        layout="page"
        saving={upsert.isPending}
        onSave={(c) =>
          upsert.mutate(c, {
            onSuccess: () => void navigate({ to: "/clientes" }),
          })
        }
      />
    </div>
  );
}
