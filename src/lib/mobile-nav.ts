import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  FileText,
  Users,
  Wrench,
  Wallet,
  Building2,
  CreditCard,
} from "lucide-react";

export type MobileNavItem = {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description?: string;
  desktopOnly?: boolean;
};

export type MobileHubSection = {
  title: string;
  items: MobileNavItem[];
};

/** Itens do menu lateral — fonte única para desktop e hub mobile. */
export const EMPRESA_NAV: MobileNavItem[] = [
  { to: "/", label: "Dashboard", short: "Dashboard", icon: LayoutDashboard, description: "Visão geral" },
  { to: "/kanban", label: "Kanban", short: "Kanban", icon: KanbanSquare, description: "Quadro visual", desktopOnly: true },
  { to: "/orcamentos", label: "Orçamentos e pedidos", short: "Orçamentos", icon: FileText, description: "Propostas e pedidos" },
  { to: "/clientes", label: "Clientes", short: "Clientes", icon: Users, description: "Cadastro de clientes" },
  { to: "/servicos", label: "Serviços", short: "Serviços", icon: Wrench, description: "Catálogo de serviços" },
  { to: "/financeiro", label: "Financeiro", short: "Financeiro", icon: Wallet, description: "Contas a receber" },
  { to: "/plano", label: "Plano", short: "Plano", icon: CreditCard, description: "Assinatura e PIX" },
  { to: "/empresa", label: "Empresa", short: "Empresa", icon: Building2, description: "Dados e logo" },
];

/** Cards do hub “Mais” no mobile (sem Kanban e sem Dashboard). */
export const MOBILE_HUB_NAV = EMPRESA_NAV.filter((n) => !n.desktopOnly && n.to !== "/");

/** Hub “Mais” agrupado por área — layout em grade no mobile. */
export const MOBILE_HUB_SECTIONS: MobileHubSection[] = [
  {
    title: "Operacional",
    items: [
      EMPRESA_NAV.find((n) => n.to === "/orcamentos")!,
      EMPRESA_NAV.find((n) => n.to === "/clientes")!,
      EMPRESA_NAV.find((n) => n.to === "/servicos")!,
    ],
  },
  {
    title: "Financeiro",
    items: [
      EMPRESA_NAV.find((n) => n.to === "/financeiro")!,
      EMPRESA_NAV.find((n) => n.to === "/plano")!,
    ],
  },
  {
    title: "Configuração",
    items: [EMPRESA_NAV.find((n) => n.to === "/empresa")!],
  },
];

export const MOBILE_HUB_ROUTES = MOBILE_HUB_NAV.map((n) => n.to);

/** Listas do hub onde o menu inferior ainda faz sentido (sem botão fixo no rodapé). */
const BOTTOM_NAV_LIST_ROUTES = ["/orcamentos", "/clientes", "/servicos", "/financeiro"];

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Telas de formulário / edição — menu inferior oculto. */
export function isMobileFormFocusPath(pathname: string): boolean {
  const p = normalizePath(pathname);
  if (/^\/orcamentos\/[^/]+/.test(p)) return true;
  if (p === "/clientes/novo" || /^\/clientes\/[^/]+/.test(p)) return true;
  if (p === "/servicos/novo" || /^\/servicos\/[^/]+/.test(p)) return true;
  return false;
}

/** Página filha do hub “Mais” (voltar para /menu). */
export function isMobileHubChildPage(pathname: string): boolean {
  const p = normalizePath(pathname);
  if (p === "/menu") return false;
  if (isMobileFormFocusPath(p)) return false;
  return MOBILE_HUB_ROUTES.some((route) => p === route || p.startsWith(`${route}/`));
}

/** Destino do botão voltar no header mobile; null = ocultar. */
export function getMobileHeaderBackTarget(pathname: string): string | null {
  const p = normalizePath(pathname);
  if (/^\/orcamentos\/[^/]+/.test(p)) return "/orcamentos";
  if (p === "/clientes/novo" || /^\/clientes\/[^/]+/.test(p)) return "/clientes";
  if (p === "/servicos/novo" || /^\/servicos\/[^/]+/.test(p)) return "/servicos";
  if (p === "/menu") return null;
  if (MOBILE_HUB_ROUTES.some((route) => p === route)) return "/menu";
  return null;
}

export function getMobileHeaderBackLabel(pathname: string): string {
  const p = normalizePath(pathname);
  if (p.startsWith("/orcamentos/")) return "Voltar para orçamentos";
  if (p.startsWith("/clientes")) return "Voltar para clientes";
  if (p.startsWith("/servicos")) return "Voltar para serviços";
  return "Voltar para Mais opções";
}

/** Menu flutuante visível apenas onde não atrapalha botões fixos no rodapé. */
export function shouldShowMobileBottomNav(pathname: string): boolean {
  const p = normalizePath(pathname);
  if (isMobileFormFocusPath(p)) return false;
  if (p === "/empresa" || p === "/plano") return false;
  if (p === "/" || p === "/menu") return true;
  return BOTTOM_NAV_LIST_ROUTES.includes(p);
}

/** @deprecated use shouldShowMobileBottomNav */
export function shouldHideMobileBottomNav(pathname: string): boolean {
  return !shouldShowMobileBottomNav(pathname);
}
