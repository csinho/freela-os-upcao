import logoMarca from "@/images/logo_marca.png";
import { APP_NAME, APP_NAME_ADMIN } from "@/lib/app-brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  variant?: "default" | "admin";
  size?: "default" | "compact" | "hero";
  className?: string;
  showAdminBadge?: boolean;
};

export function AppLogo({
  variant = "default",
  size = "default",
  className,
  showAdminBadge = true,
}: AppLogoProps) {
  const alt = variant === "admin" ? APP_NAME_ADMIN : APP_NAME;
  const imageSize =
    size === "compact"
      ? "h-8 max-w-[132px]"
      : size === "hero"
        ? "h-16 sm:h-20 max-w-[280px]"
        : "h-12 max-w-[200px]";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "default" && "justify-center",
        className,
      )}
    >
      <img
        src={logoMarca}
        alt={alt}
        className={cn("w-auto shrink-0 object-contain", imageSize)}
        width={size === "compact" ? 132 : size === "hero" ? 280 : 200}
        height={size === "compact" ? 32 : size === "hero" ? 80 : 48}
        decoding="async"
      />
      {variant === "admin" && showAdminBadge && (
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Admin
        </span>
      )}
    </div>
  );
}
