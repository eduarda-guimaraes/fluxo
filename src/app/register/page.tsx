"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { registerWithEmail } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setIsLoading(true);
      await registerWithEmail(email, password, name);
      router.replace("/verify-email");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso. Faça login ou use outro e-mail.");
      } else if (code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (code === "auth/weak-password") {
        setError("Senha fraca. Use pelo menos 6 caracteres.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-mint-50 px-6 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-4xl border border-border-soft bg-surface/95 p-8 shadow-[0_40px_120px_rgba(67,56,202,0.08)] backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center mb-4">
            <Image src="/favicon.ico" alt="Fluxo" width={100} height={100} className="rounded-xl" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lavender">Fluxo</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Criar conta</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Rápido e gratuito. Um e-mail de verificação será enviado.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label htmlFor="reg-name" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Nome completo
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Silva"
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              E-mail
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Senha
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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

          <div>
            <label htmlFor="reg-confirm" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    getStrengthLevel(password) >= level
                      ? level <= 1
                        ? "bg-coral"
                        : level <= 2
                        ? "bg-amber-400"
                        : level <= 3
                        ? "bg-mint"
                        : "bg-mint-strong"
                      : "bg-border-soft"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(85,189,169,0.30)] transition duration-200 hover:-translate-y-0.5 hover:bg-mint focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none cursor-pointer"
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <a href="/login" className="font-semibold text-lavender hover:underline">
              Fazer login
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}

function getStrengthLevel(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
