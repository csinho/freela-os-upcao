import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLogo } from "@/components/AppLogo";
import { PhoneField } from "@/components/auth/PhoneField";
import { pageTitle } from "@/lib/app-brand";
import {
  setupGetEvolutionQrRemote,
  setupRefreshEvolutionRemote,
  setupSaveEvolutionRemote,
} from "@/lib/api/setup.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SETUP_KEY_STORAGE = "up_servicos_setup_key";

export const Route = createFileRoute("/setup/whatsapp")({
  validateSearch: (search: Record<string, unknown>) => ({
    key: typeof search.key === "string" ? search.key : undefined,
  }),
  head: () => ({ meta: [{ title: pageTitle("Setup WhatsApp") }] }),
  component: SetupWhatsappPage,
});

function SetupWhatsappPage() {
  const { key: keyFromUrl } = Route.useSearch();
  const [setupKey, setSetupKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [instanceName, setInstanceName] = useState("notificacao-upservicos");
  const [connectionPhone, setConnectionPhone] = useState("");
  const [recreate, setRecreate] = useState(true);
  const [connectionState, setConnectionState] = useState("unknown");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SETUP_KEY_STORAGE);
    const initial = keyFromUrl ?? stored ?? "";
    if (initial) {
      setSetupKey(initial);
      setUnlocked(true);
      sessionStorage.setItem(SETUP_KEY_STORAGE, initial);
    }
  }, [keyFromUrl]);

  const unlock = () => {
    if (!setupKey.trim()) {
      toast.error("Informe a chave de setup.");
      return;
    }
    sessionStorage.setItem(SETUP_KEY_STORAGE, setupKey.trim());
    setUnlocked(true);
  };

  const createInstance = async () => {
    if (!unlocked || connectionPhone.length < 11) {
      toast.error("Informe a chave de setup e o WhatsApp com 11 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const result = await setupSaveEvolutionRemote({
        data: { setupKey, instanceName, connectionPhone, recreate },
      });
      setQrBase64(result.base64);
      setPairingCode(result.pairingCode);
      setConnectionState(result.connectionState);
      if (result.base64) toast.success("Instância criada. Escaneie o QR Code.");
      else if (result.pairingCode) toast.success("Instância criada. Use o código de pareamento.");
      else toast.success("Instância salva. Clique em Gerar novo QR se precisar.");
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao criar instância");
    } finally {
      setLoading(false);
    }
  };

  const generateQr = async () => {
    setLoading(true);
    try {
      const result = await setupGetEvolutionQrRemote({ data: { setupKey } });
      setQrBase64(result.base64);
      setPairingCode(result.pairingCode);
      setConnectionState(result.connectionState);
      if (result.base64) toast.success("QR Code gerado.");
      else toast.success("Código de pareamento gerado.");
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao gerar QR");
    } finally {
      setLoading(false);
    }
  };

  const refreshState = async () => {
    setLoading(true);
    try {
      const result = await setupRefreshEvolutionRemote({ data: { setupKey } });
      setConnectionState(result.connectionState);
      if (result.connectionState === "open") {
        toast.success("WhatsApp conectado! Agora faça login em /login");
        setQrBase64(null);
        setPairingCode(null);
      } else {
        toast.message(`Estado: ${result.connectionState}`);
      }
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao verificar conexão");
    } finally {
      setLoading(false);
    }
  };

  const stateVariant =
    connectionState === "open" ? "default" : connectionState === "connecting" ? "secondary" : "destructive";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          <AppLogo size="hero" className="mx-auto" />
          <CardTitle className="text-center">Setup WhatsApp (sem login)</CardTitle>
          <CardDescription className="text-center">
            Use quando a instância Evolution foi apagada e você não consegue receber OTP para entrar no admin.
            O WhatsApp informado aqui também autoriza login admin após salvar. Protegido pela chave{" "}
            <code className="text-xs">BILLING_CRON_SECRET</code> do servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!unlocked ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="setup-key">Chave de setup</Label>
                <Input
                  id="setup-key"
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="Mesma chave do BILLING_CRON_SECRET"
                />
              </div>
              <Button type="button" className="w-full" onClick={unlock}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Estado da conexão</span>
                <Badge variant={stateVariant}>{connectionState}</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-instance">Nome da instância</Label>
                <Input
                  id="setup-instance"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp que vai conectar</Label>
                <PhoneField value={connectionPhone} onChange={setConnectionPhone} />
                <p className="text-xs text-muted-foreground">
                  Após criar a instância, este número autoriza login admin em /login (allowlist).
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recreate} onCheckedChange={(v) => setRecreate(v === true)} />
                Recriar instância na Evolution
              </label>

              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={loading} onClick={() => void createInstance()}>
                  Criar instância e gerar QR
                </Button>
                <Button type="button" variant="secondary" disabled={loading} onClick={() => void generateQr()}>
                  Gerar novo QR
                </Button>
                <Button type="button" variant="outline" disabled={loading} onClick={() => void refreshState()}>
                  Verificar conexão
                </Button>
              </div>

              {pairingCode && (
                <p className="text-sm rounded-md border bg-muted/40 px-4 py-3">
                  Código de pareamento: <strong>{pairingCode}</strong>
                </p>
              )}

              {qrBase64 && (
                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white">
                  <img
                    src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                    alt="QR Code WhatsApp"
                    className="max-w-[240px] w-full"
                  />
                </div>
              )}

              {connectionState === "open" && (
                <Button asChild className="w-full">
                  <Link to="/login">Ir para o login</Link>
                </Button>
              )}
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
