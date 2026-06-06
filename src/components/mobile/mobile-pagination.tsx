import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobilePaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

export function MobilePagination({
  page,
  totalPages,
  totalItems,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  className,
}: MobilePaginationProps) {
  if (totalItems <= 10) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5",
        className,
      )}
    >
      <Button type="button" variant="outline" size="sm" disabled={!hasPrev} onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <Button type="button" variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
