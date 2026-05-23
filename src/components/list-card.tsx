import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ListCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function ListCard({ children, className, onClick }: ListCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-2",
        onClick && "cursor-pointer transition-colors active:bg-muted/50 hover:bg-muted/30",
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
