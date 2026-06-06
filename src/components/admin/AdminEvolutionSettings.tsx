import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getEvolutionQrAdminRemote,
  refreshEvolutionConnectionAdminRemote,
  saveEvolutionInstanceAdminRemote,
} from "@/lib/api/admin.functions";
import type { AdminSettings } from "@/lib/admin/types";
import { PhoneField } from "@/components/auth/PhoneField";
import { getClientSessao } from "@/lib/auth/client-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  settings: AdminSettings | null;
  onUpdated: () => void;
};

function applyQrResult(
  result: { base64: string | null; pairingCode: string | null; connectionState: string },
  setters: {
    setQrBase64: (v: string | null) => void;
    setPairingCode: (v: string | null) => void;
    setConnectionState: (v: string) => void;
  },
) {
  setters.setQrBase64(result.base64);
  setters.setPairingCode(result.pairingCode);
  setters.setConnectionState(result.connectionState);
}

export function AdminEvolutionSettings({ settings, onUpdated }: Props) {
  const [instanceName, setInstanceName] = useState("");
  const [connectionPhone, setConnectionPhone] = useState("");
  const [recreate, setRecreate] = useState(false);
  const [connectionState, setConnectionState] = useState("unknown");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setInstanceName(settings.evolutionInstanceName);
      setConnectionPhone(settings.evolutionConnectionPhone);
      setConnectionState(settings.evolutionConnectionState);
    }
  }, [settings]);

  const createInstance = async () => {
    const sessao = getClientSessao();
    if (!sessao || sessao.tipo !== "admin") return;
    if (connectionPhone.length < 11) {
      toast.error("Informe o WhatsApp com 11 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const result = await saveEvolutionInstanceAdminRemote({
        data: {
          adminWhatsapp: sessao.id,
          instanceName,
          connectionPhone,
          recreate,
        },
      });
      applyQrResult(result, { setQrBase64, setPairingCode, setConnectionState });
      if (result.base64) {
        toast.success("Instância criada. Escaneie o QR Code no WhatsApp.");
      } else if (result.pairingCode) {
        toast.success("Instância criada. Use o código de pareamento no WhatsApp.");
      } else {
        toast.success("Instância salva. Clique em Gerar QR Code se o QR não aparecer.");
      }
      onUpdated();
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao criar instância");
    } finally {
      setLoading(false);
    }
  };

  const generateQr = async () => {
    const sessao = getClientSessao();
    if (!sessao || sessao.tipo !== "admin") return;
    setLoading(true);
    try {
      const result = await getEvolutionQrAdminRemote({ data: { adminWhatsapp: sessao.id } });
      applyQrResult(result, { setQrBase64, setPairingCode, setConnectionState });
      if (result.base64) {
        toast.success("QR Code gerado. Escaneie no WhatsApp.");
      } else if (result.pairingCode) {
        toast.success("Código de pareamento gerado.");
      } else {
        toast.error("Evolution não retornou QR Code.");
      }
      onUpdated();
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao gerar QR");
    } finally {
      setLoading(false);
    }
  };

  const refreshState = async () => {
    const sessao = getClientSessao();
    if (!sessao || sessao.tipo !== "admin") return;
    setLoading(true);
    try {
      const result = await refreshEvolutionConnectionAdminRemote({
        data: { adminWhatsapp: sessao.id },
      });
      setConnectionState(result.connectionState);
      if (result.connectionState === "open") {
        toast.success("WhatsApp conectado!");
        setQrBase64(null);
        setPairingCode(null);
      } else {
        toast.message(`Estado: ${result.connectionState}`);
      }
      onUpdated();
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao verificar conexão");
    } finally {
      setLoading(false);
    }
  };

  const stateVariant =
    connectionState === "open" ? "default" : connectionState === "connecting" ? "secondary" : "destructive";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          WhatsApp (Evolution API)
          <Badge variant={stateVariant}>{connectionState}</Badge>
        </CardTitle>
        <CardDescription>
          Crie a instância na Evolution, gere o QR e conecte o número. URL e API key ficam nos secrets
          do servidor (GitHub / Cloudflare).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="evo-instance">Nome da instância</Label>
          <Input
            id="evo-instance"
            placeholder="notificacao-upservicos"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>WhatsApp que vai conectar</Label>
          <PhoneField value={connectionPhone} onChange={(digits) => setConnectionPhone(digits)} />
          <p className="text-xs text-muted-foreground">
            Número do aparelho que vai escanear o QR (11 dígitos, sem 55).
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={recreate} onCheckedChange={(v) => setRecreate(v === true)} />
          Recriar instância (apaga a anterior na Evolution com o mesmo nome)
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
            <span className="block text-xs text-muted-foreground mt-1">
              WhatsApp → Aparelhos conectados → Conectar com número de telefone
            </span>
          </p>
        )}

        {qrBase64 && (
          <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white">
            <img
              src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
              alt="QR Code Evolution WhatsApp"
              className="max-w-[240px] w-full"
            />
            <p className="text-xs text-muted-foreground text-center">
              Escaneie no WhatsApp → Aparelhos conectados → Conectar aparelho
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
