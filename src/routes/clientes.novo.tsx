import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { pageTitle } from "@/lib/app-brand";
import { useUpsertCliente } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { newId } from "@/lib/id";
import { ClienteFormFields } from "@/components/clientes/cliente-form-fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clientes/novo")({
  head: () => ({ meta: [{ title: pageTitle("Novo cliente") }] }),
  component: ClienteNovoPage,
});

const empty = (): Cliente => ({
  id: newId(),
  nome: "",
  endereco: {},
  created_at: new Date().toISOString(),
});

function ClienteNovoPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const upsert = useUpsertCliente();

  useEffect(() => {
    if (isMobile === false) void navigate({ to: "/clientes" });
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
          onClick={() => void navigate({ to: "/clientes" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Novo cliente</h1>
      </div>
      <ClienteFormFields
        key="novo"
        value={empty()}
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
