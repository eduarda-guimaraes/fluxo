"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { loginWithGoogle, loginWithEmail } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      router.replace("/dashboard");
    }
    if (!loading && user && !user.emailVerified) {
      router.replace("/verify-email");
    }
  }, [loading, router, user]);

  async function handleGoogleLogin() {
    setError("");
    try {
      setIsLoading(true);
      await loginWithGoogle();
      router.replace("/dashboard");
    } catch {
      setError("Não foi possível entrar com o Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha o e-mail e a senha.");
      return;
    }
    try {
      setIsLoading(true);
      const credential = await loginWithEmail(email, password);
      if (!credential.user.emailVerified) {
        router.replace("/verify-email");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("E-mail ou senha incorretos.");
      } else if (code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde um momento antes de tentar novamente.");
      } else {
        setError("Erro ao entrar. Verifique seus dados e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-mint-50 px-6 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-4xl border border-border-soft bg-surface/95 p-8 text-center shadow-[0_40px_120px_rgba(67,56,202,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <Image src="/favicon.ico" alt="Fluxo" width={100} height={100} className="rounded-xl" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lavender">Fluxo</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Bem-vindo(a)!</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Organize seu dinheiro com uma visão clara das suas entradas e saídas.
        </p>


        {error && (
          <div className="mt-4 rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-7 flex flex-col gap-3 text-left">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
              />
            </div>
            <div className="relative">
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-xs font-semibold text-lavender hover:underline cursor-pointer">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(85,189,169,0.30)] transition duration-200 hover:-translate-y-0.5 hover:bg-mint focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none cursor-pointer"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-soft"></div>
              </div>
              <div className="relative bg-surface/95 px-4 text-xs font-medium text-zinc-400 uppercase tracking-widest">
                ou
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || isLoading}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-background focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:shadow-none cursor-pointer"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35 11.1H12v2.8h5.15c-.2 1.12-.8 2.07-1.7 2.7v2.25h2.75c1.6-1.48 2.55-3.63 2.55-6.45 0-.43-.05-.85-.15-1.25Z" fill="#4285F4" />
                  <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-2.75-2.25c-.75.5-1.7.8-2.85.8-2.2 0-4.08-1.5-4.75-3.55H4.4v2.8C6.05 19.95 8.8 22 12 22Z" fill="#34A853" />
                  <path d="M7.25 14.8c-.2-.6-.3-1.25-.3-1.9 0-.65.1-1.3.3-1.9V8.2H4.4A9.97 9.97 0 0 0 2 12c0 1.6.4 3.15 1.15 4.55l3.1-1.75Z" fill="#FBBC05" />
                  <path d="M12 7.2c1.45 0 2.75.5 3.8 1.5l2.85-2.8C16.95 4.05 14.7 3 12 3 8.8 3 6.05 4.05 4.4 5.8l3.1 2.8C7.92 8.7 9.8 7.2 12 7.2Z" fill="#EA4335" />
                </svg>
              </span>
              Entrar com Google
            </button>

            <p className="mt-1 text-center text-sm text-zinc-500">
              Não tem conta?{" "}
              <a href="/register" className="font-semibold text-lavender hover:underline cursor-pointer">
                Criar conta
              </a>
            </p>
          </form>
      </section>
    </main>
  );
}
