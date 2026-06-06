import { Download, Share } from "lucide-react";
import { APP_NAME } from "@/lib/app-brand";
import { usePwaInstallPrompt } from "@/hooks/use-pwa-install-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Banner de instalação do PWA — oculto quando o app já está instalado. */
export function PwaInstallPrompt() {
  const { visible, canInstall, showIosGuide, install } = usePwaInstallPrompt();

  if (!visible) return null;

  return (
    <Card className="w-full max-w-md border-primary/20 bg-primary/5 shadow-md rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4 shrink-0" aria-hidden />
          Instale o {APP_NAME}
        </CardTitle>
        <CardDescription>
          Acesso rápido na tela inicial, como um app nativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canInstall ? (
          <Button
            type="button"
            className="w-full h-11 rounded-xl"
            onClick={() => void install()}
          >
            Instalar app
          </Button>
        ) : showIosGuide ? (
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Share className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            <span>
              No Safari, toque em <strong>Compartilhar</strong> e depois em{" "}
              <strong>Adicionar à Tela de Início</strong>.
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
