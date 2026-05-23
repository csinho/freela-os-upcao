import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  KanbanSquare,
  FileText,
  Users,
  Wrench,
  Wallet,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmpresaBranding } from "@/hooks/use-empresa-branding";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kanban", label: "Kanban", icon: KanbanSquare },
  { to: "/orcamentos", label: "Orçamentos e pedidos", icon: FileText },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/servicos", label: "Serviços", icon: Wrench },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/empresa", label: "Empresa", icon: Building2 },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logoUrl, nome, isLoading } = useEmpresaBranding();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden md:flex w-60 flex-col border-r bg-card min-h-0">
        <div className="h-14 flex items-center px-5 border-b shrink-0">
          <span className="font-semibold tracking-tight truncate">{nome}</span>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 p-4 border-t bg-muted/20">
          {logoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full flex justify-center rounded-md bg-background/80 border p-2">
                <img
                  src={logoUrl}
                  alt={`Logo ${nome}`}
                  className="h-12 w-auto max-w-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center truncate w-full" title={nome}>
                {nome}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              {isLoading ? "Carregando…" : "Adicione a logo em Empresa"}
            </p>
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-14 border-b bg-card flex items-center px-4 md:px-6 shrink-0">
          <nav className="md:hidden flex gap-3 text-sm overflow-x-auto min-w-0">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 flex flex-col p-4 md:p-8 min-w-0 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
