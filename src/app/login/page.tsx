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
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-mint-50 px-6 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-4xl border border-border-soft bg-surface/95 p-8 text-center shadow-[0_40px_120px_rgba(67,56,202,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <Image src="/favicon.ico" alt="Fluxo" width={100} height={100} className="rounded-xl" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lavender">
          Fluxo
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          Bem-vindo(a)!
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Organize seu dinheiro com uma visão clara das suas entradas e saídas em poucos cliques.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading || isSigningIn}
          className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35 11.1H12v2.8h5.15c-.2 1.12-.8 2.07-1.7 2.7v2.25h2.75c1.6-1.48 2.55-3.63 2.55-6.45 0-.43-.05-.85-.15-1.25Z" fill="#4285F4" />
              <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.75-2.25c-.75.5-1.7.8-2.85.8-2.2 0-4.08-1.5-4.75-3.55H4.4v2.8C6.05 19.95 8.8 22 12 22Z" fill="#34A853" />
              <path d="M7.25 14.8c-.2-.6-.3-1.25-.3-1.9 0-.65.1-1.3.3-1.9V8.2H4.4A9.97 9.97 0 0 0 2 12c0 1.6.4 3.15 1.15 4.55l3.1-1.75Z" fill="#FBBC05" />
              <path d="M12 7.2c1.45 0 2.75.5 3.8 1.5l2.85-2.8C16.95 4.05 14.7 3 12 3 8.8 3 6.05 4.05 4.4 5.8l3.1 2.8C7.92 8.7 9.8 7.2 12 7.2Z" fill="#EA4335" />
            </svg>
          </span>
          {isSigningIn ? "Entrando..." : "Entrar com Google"}
        </button>

        <div className="mt-8 rounded-[1.75rem] bg-background/90 p-4 text-left shadow-sm">
          <p className="text-sm font-semibold text-foreground">Por que usar o Fluxo?</p>
          <ul className="mt-3 space-y-3 text-sm text-zinc-600">
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-mint-strong" />
              Login rápido e seguro com Google.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-mint-strong" />
              Interface simples e moderna para controle financeiro.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
