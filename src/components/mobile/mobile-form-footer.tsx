import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileFormFooterProps = {
  label?: string;
  onSave: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function MobileFormFooter({
  label = "Salvar",
  onSave,
  disabled,
  loading,
  className,
}: MobileFormFooterProps) {
  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t bg-background/95 backdrop-blur-md p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <Button
        type="button"
        className="w-full h-12 text-base font-semibold rounded-xl shadow-lg"
        disabled={disabled || loading}
        onClick={onSave}
      >
        {loading ? "Salvando…" : label}
      </Button>
    </div>
  );
}
