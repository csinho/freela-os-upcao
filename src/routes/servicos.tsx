import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { pageTitle } from "@/lib/app-brand";
import { useMemo, useState } from "react";
import { useServicos, useUpsertServico, useRemoveServico } from "@/lib/store";
import type { Servico } from "@/lib/types";
import { formatBRL } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobilePagination } from "@/components/mobile/mobile-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ServicoFormFields } from "@/components/servicos/servico-form-fields";
import { usePagination } from "@/hooks/use-pagination";
import { isViewportMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/servicos")({
  head: () => ({ meta: [{ title: pageTitle("Serviços") }] }),
  component: ServicosPage,
});

const empty = (): Servico => ({
  id: newId(),
  nome: "",
  valor_padrao: 0,
  unidade: "serviço",
  ativo: true,
});

function ServicosPage() {
  const navigate = useNavigate();
  const isChildRoute = useRouterState({
    select: (s) => s.location.pathname !== "/servicos",
  });
  const { data: servicos = [], isLoading } = useServicos();
  const upsert = useUpsertServico();
  const remove = useRemoveServico();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Servico | null>(null);
  const [toDelete, setToDelete] = useState<Servico | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return servicos;
    return servicos.filter(
      (s) =>
        s.nome.toLowerCase().includes(term) ||
        (s.descricao?.toLowerCase().includes(term) ?? false),
    );
  }, [servicos, q]);

  const pagination = usePagination(filtered, 10, q);

  const openNew = () => {
    if (isViewportMobile()) {
      void navigate({ to: "/servicos/novo" });
      return;
    }
    setEditing(empty());
  };

  const openEdit = (s: Servico) => {
    if (isViewportMobile()) {
      void navigate({ to: "/servicos/$servicoId", params: { servicoId: s.id } });
      return;
    }
    setEditing(s);
  };

  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Serviços"
        description={isLoading ? "Carregando…" : `${servicos.length} cadastrados`}
      >
        <Button type="button" className="w-full sm:w-auto rounded-xl md:rounded-md" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo serviço
        </Button>
      </PageHeader>

      <Input
        placeholder="Buscar por nome..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full sm:max-w-sm h-11 rounded-xl md:rounded-md"
      />

      <div className="md:hidden space-y-3">
        {pagination.pageItems.map((s) => (
          <MobileCard key={s.id} onClick={() => openEdit(s)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{s.nome}</div>
                {s.descricao && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.descricao}</div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{s.unidade}</span>
                  <span>·</span>
                  <span className="font-semibold text-foreground">{formatBRL(s.valor_padrao)}</span>
                </div>
                <Badge variant={s.ativo ? "default" : "secondary"} className="mt-2 text-[10px]">
                  {s.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(s);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </MobileCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhum serviço.</p>
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
              <TableHead>Serviço</TableHead>
              <TableHead className="w-28">Valor</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.nome}</div>
                  {s.descricao && (
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{s.descricao}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">{s.unidade}</div>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">{formatBRL(s.valor_padrao)}</TableCell>
                <TableCell>
                  <Badge variant={s.ativo ? "default" : "secondary"} className="text-[10px]">
                    {s.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button type="button" size="icon" variant="ghost" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setToDelete(s)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                  Nenhum serviço.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir serviço?"
        description={toDelete ? `O serviço "${toDelete.nome}" será removido permanentemente.` : ""}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
        }}
      />

      <CrudDialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)} className="hidden md:block">
        {editing && (
          <ServicoFormFields
            key={editing.id}
            value={editing}
            saving={upsert.isPending}
            onSave={(s) => upsert.mutate(s, { onSuccess: () => setEditing(null) })}
          />
        )}
      </CrudDialog>
    </div>
  );
}
