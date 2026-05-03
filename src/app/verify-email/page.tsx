"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { logout, resendVerificationEmail } from "@/firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.emailVerified) {
        router.replace("/dashboard");
      }
    }
  }, [loading, user, router]);

  async function handleResend() {
    setIsResending(true);
    setMessage("");
    setError("");
    try {
      await resendVerificationEmail();
      setMessage("E-mail de verificação enviado com sucesso!");
    } catch (err: any) {
      setError("Erro ao enviar e-mail. Tente novamente mais tarde.");
    } finally {
      setIsResending(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  // Poll for verification status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user && !user.emailVerified) {
      interval = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          router.replace("/dashboard");
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm font-medium text-lavender">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-mint-50 px-6 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-4xl border border-border-soft bg-surface/95 p-8 text-center shadow-[0_40px_120px_rgba(67,56,202,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <Image src="/favicon.ico" alt="Fluxo" width={100} height={100} className="rounded-xl" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground">Verifique seu e-mail</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Enviamos um link de confirmação para <strong>{user.email}</strong>. 
          Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
        </p>

        {message && (
          <div className="mt-4 rounded-xl bg-mint-strong/10 border border-mint-strong/20 px-4 py-3 text-sm text-mint-strong">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(85,189,169,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-mint focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:opacity-50 cursor-pointer "
          >
            {isResending ? "Enviando..." : "Reenviar e-mail"}
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-zinc-600 transition duration-200 hover:bg-background cursor-pointer"
          >
            Sair e usar outra conta
          </button>
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          Assim que você confirmar o e-mail, esta página será atualizada automaticamente.
        </p>
      </section>
    </main>
  );
}
