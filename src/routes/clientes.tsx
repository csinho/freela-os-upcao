import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { pageTitle } from "@/lib/app-brand";
import { useState } from "react";
import { useClientes, useUpsertCliente, useRemoveCliente } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { newId } from "@/lib/id";
import { CrudDialog } from "@/components/crud-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobilePagination } from "@/components/mobile/mobile-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ClienteFormFields } from "@/components/clientes/cliente-form-fields";
import { usePagination } from "@/hooks/use-pagination";
import { isViewportMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: pageTitle("Clientes") }] }),
  component: ClientesPage,
});

const empty = (): Cliente => ({
  id: newId(),
  nome: "",
  endereco: {},
  created_at: new Date().toISOString(),
});

function ClientesPage() {
  const navigate = useNavigate();
  const isChildRoute = useRouterState({
    select: (s) => s.location.pathname !== "/clientes",
  });
  const { data: clientes = [], isLoading } = useClientes();
  const upsert = useUpsertCliente();
  const remove = useRemoveCliente();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);

  const filtered = clientes.filter((c) => c.nome.toLowerCase().includes(q.toLowerCase()));
  const pagination = usePagination(filtered, 10, q);

  const openNew = () => {
    if (isViewportMobile()) {
      void navigate({ to: "/clientes/novo" });
      return;
    }
    setEditing(empty());
  };

  const openEdit = (c: Cliente) => {
    if (isViewportMobile()) {
      void navigate({ to: "/clientes/$clienteId", params: { clienteId: c.id } });
      return;
    }
    setEditing(c);
  };

  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clientes"
        description={isLoading ? "Carregando…" : `${clientes.length} cadastrados`}
      >
        <Button type="button" className="w-full sm:w-auto rounded-xl md:rounded-md" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo cliente
        </Button>
      </PageHeader>

      <Input
        placeholder="Buscar..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full sm:max-w-sm h-11 rounded-xl md:rounded-md"
      />

      <div className="md:hidden space-y-3">
        {pagination.pageItems.map((c) => (
          <MobileCard key={c.id} onClick={() => openEdit(c)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{c.nome}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.telefone || c.email || "—"}
                </div>
                {c.documento && <div className="text-xs text-muted-foreground">{c.documento}</div>}
                {c.endereco.cidade && (
                  <div className="text-xs text-muted-foreground">
                    {c.endereco.cidade}/{c.endereco.estado || ""}
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(c);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </MobileCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhum cliente.</p>
        )}
        <MobilePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onPrev={pagination.goPrev}
          onNext={pagination.goNext}
        />
      </div>

      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.telefone || c.email || "—"}</TableCell>
                <TableCell>{c.documento || "—"}</TableCell>
                <TableCell>
                  {c.endereco.cidade ? `${c.endereco.cidade}/${c.endereco.estado || ""}` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button type="button" size="icon" variant="ghost" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setToDelete(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  Nenhum cliente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir cliente?"
        description={
          toDelete
            ? `O cliente "${toDelete.nome}" será removido permanentemente. Orçamentos vinculados podem ficar sem cliente.`
            : ""
        }
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
        }}
      />

      <CrudDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        className="max-w-3xl hidden md:block"
      >
        {editing && (
          <ClienteFormFields
            key={editing.id}
            value={editing}
            saving={upsert.isPending}
            onSave={(c) => upsert.mutate(c, { onSuccess: () => setEditing(null) })}
          />
        )}
      </CrudDialog>
    </div>
  );
}
