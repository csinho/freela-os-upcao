import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MobileCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: "default" | "primary";
};

export function MobileCard({ children, className, onClick, accent = "default" }: MobileCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm transition-all",
        accent === "primary" && "border-primary/20 bg-primary/[0.03]",
        onClick && "cursor-pointer active:scale-[0.99] hover:shadow-md",
        className,
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
