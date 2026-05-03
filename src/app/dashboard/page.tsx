"use client";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Fluxo
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="mt-4 text-base text-zinc-600">
          Olá, {user?.displayName ?? "usuário"}.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-8 rounded-md border border-zinc-300 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-zinc-100"
        >
          Sair
        </button>
      </section>
    </main>
  );
}
