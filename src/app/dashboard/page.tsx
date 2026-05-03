"use client";

import Image from "next/image";
import { PrivateRoute } from "@/components/PrivateRoute";
import { logout } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <DashboardContent />
    </PrivateRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Fluxo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lavender">
              Fluxo
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              Dashboard
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          Sair
        </button>
      </section>

      <section className="mx-auto mt-12 w-full max-w-5xl rounded-lg border border-border-soft bg-surface p-8 shadow-[0_24px_80px_rgba(80,58,39,0.08)]">
        <p className="text-sm font-medium text-coral">Bem-vindo de volta</p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          Ola, {user?.displayName ?? "usuario"}.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          Seu painel financeiro esta pronto para receber as proximas
          funcionalidades de receitas, despesas e metas.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-soft bg-background p-5">
            <p className="text-sm font-medium text-zinc-500">Saldo</p>
            <p className="mt-3 text-2xl font-semibold text-mint-strong">
              R$ 0,00
            </p>
          </div>
          <div className="rounded-lg border border-border-soft bg-background p-5">
            <p className="text-sm font-medium text-zinc-500">Receitas</p>
            <p className="mt-3 text-2xl font-semibold text-lavender">
              R$ 0,00
            </p>
          </div>
          <div className="rounded-lg border border-border-soft bg-background p-5">
            <p className="text-sm font-medium text-zinc-500">Despesas</p>
            <p className="mt-3 text-2xl font-semibold text-coral">R$ 0,00</p>
          </div>
        </div>
      </section>
    </main>
  );
}
