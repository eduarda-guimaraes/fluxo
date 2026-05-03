"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { resetPassword } from "@/firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Por favor, insira seu e-mail.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      await resetPassword(email);
      setMessage("Link de recuperação enviado! Verifique seu e-mail.");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Não encontramos uma conta com este e-mail.");
      } else {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
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

        <h1 className="text-2xl font-semibold text-foreground">Recuperar senha</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Insira seu e-mail e enviaremos um link para você redefinir sua senha.
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

        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-mint-strong transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(85,189,169,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-mint focus:outline-none focus:ring-2 focus:ring-mint-strong disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Enviando..." : "Enviar link"}
          </button>
        </form>

        <p className="mt-8 text-sm text-zinc-500">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-lavender hover:underline cursor-pointer">
            Voltar para o login
          </Link>
        </p>
      </section>
    </main>
  );
}
