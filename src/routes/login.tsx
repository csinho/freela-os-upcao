import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PhoneField } from "@/components/auth/PhoneField";
import {
  confirmLoginOtpRemote,
  requestLoginOtpRemote,
  resolveLoginRoleRemote,
} from "@/lib/api/auth.functions";
import { applyAuthSession } from "@/lib/auth/client-auth";
import { getClientSessao, isAdminSessao, isEmpresaSessao } from "@/lib/auth/client-session";
import type { LoginRole } from "@/lib/auth/types";
import { AppLogo } from "@/components/AppLogo";
import { APP_NAME, pageTitle } from "@/lib/app-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: pageTitle("Login") }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"whatsapp" | "otp">("whatsapp");
  const [role, setRole] = useState<LoginRole | null>(null);
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<React.ComponentRef<typeof InputOTP>>(null);

  const focusOtp = () => {
    requestAnimationFrame(() => {
      otpRef.current?.focus();
      setTimeout(() => otpRef.current?.focus(), 50);
    });
  };

  useEffect(() => {
    if (step === "otp") focusOtp();
  }, [step]);

  useEffect(() => {
    const sessao = getClientSessao();
    if (isAdminSessao(sessao)) {
      void navigate({ to: "/admin/dashboard" });
      return;
    }
    if (isEmpresaSessao(sessao)) {
      void navigate({ to: "/" });
    }
  }, [navigate]);

  const sendOtp = async () => {
    if (whatsapp.length < 11) {
      toast.error("Informe o WhatsApp completo.");
      return;
    }
    setLoading(true);
    try {
      const resolved = await resolveLoginRoleRemote({ data: { whatsapp } });
      if (resolved.role === "none") {
        toast.error("WhatsApp não cadastrado.");
        return;
      }
      setRole(resolved.role);
      const result = await requestLoginOtpRemote({
        data: { whatsapp, role: resolved.role },
      });
      toast.success(result.message);
      setStep("otp");
      setCode("");
      focusOtp();
    } catch (e) {
      toast.error((e as Error).message ?? "Falha ao enviar código");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    if (!role || role === "none" || code.length !== 6) {
      toast.error("Informe o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmLoginOtpRemote({ data: { whatsapp, code, role } });
      if (result.sessao.tipo === "admin") {
        await applyAuthSession(result.sessao);
        toast.success("Bem-vindo, administração.");
        void navigate({ to: "/admin/dashboard" });
        return;
      }
      await applyAuthSession(result.sessao, "auth" in result ? result.auth : undefined);
      toast.success(`Bem-vindo, ${result.sessao.nome}!`);
      void navigate({ to: "/" });
    } catch (e) {
      toast.error((e as Error).message ?? "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel =
    role === "admin" ? "Acesso administrativo" : role === "empresa" ? "Acesso da empresa" : null;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-background via-muted/30 to-muted/60 p-4 sm:p-6">
      <Card className="w-full max-w-md border-0 shadow-xl sm:border sm:shadow-lg rounded-2xl">
        <CardHeader className="space-y-4 pb-2">
          <AppLogo className="mx-auto" />
          <CardTitle className="sr-only">{APP_NAME}</CardTitle>
          <CardDescription className="text-center text-base">
            Entre com seu WhatsApp. O código chega por mensagem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pb-8">
          {step === "whatsapp" ? (
            <>
              <PhoneField value={whatsapp} onChange={(digits) => setWhatsapp(digits)} />
              <Button
                type="button"
                className="w-full h-12 text-base rounded-xl"
                disabled={loading || whatsapp.length < 11}
                onClick={() => void sendOtp()}
              >
                Enviar código
              </Button>
            </>
          ) : (
            <>
              {roleLabel && (
                <p className="text-sm text-muted-foreground text-center">{roleLabel}</p>
              )}
              <p className="text-sm text-muted-foreground text-center">
                Código enviado para <strong>{maskDisplay(whatsapp)}</strong>
              </p>
              <div className="flex justify-center py-2">
                <InputOTP
                  ref={otpRef}
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="button"
                className="w-full h-12 text-base rounded-xl"
                disabled={loading || code.length !== 6}
                onClick={() => void confirmOtp()}
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("whatsapp");
                  setCode("");
                  setRole(null);
                }}
              >
                Voltar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function maskDisplay(digits: string): string {
  if (digits.length < 11) return digits;
  return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}
