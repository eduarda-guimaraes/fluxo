"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { loginWithGoogle } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  async function handleLogin() {
    try {
      setIsSigningIn(true);
      await loginWithGoogle();
      router.replace("/dashboard");
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-sm rounded-lg border border-border-soft bg-surface px-8 py-10 text-center shadow-[0_24px_80px_rgba(80,58,39,0.10)]">
        <Image
          src="/favicon.ico"
          alt="Fluxo"
          width={64}
          height={64}
          className="mx-auto h-16 w-16 rounded-2xl"
        />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-lavender">
          Fluxo
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          Entrar na sua conta
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Organize seu dinheiro com uma visão clara das suas entradas e saidas.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading || isSigningIn}
          className="mt-8 w-full rounded-md bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(85,189,169,0.30)] transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none"
        >
          {isSigningIn ? "Entrando..." : "Entrar com Google"}
        </button>
      </section>
    </main>
  );
}
