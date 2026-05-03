"use client";

import { useRouter } from "next/navigation";
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
      <section className="w-full max-w-sm text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Fluxo
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Login</h1>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading || isSigningIn}
          className="mt-8 w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSigningIn ? "Entrando..." : "Entrar com Google"}
        </button>
      </section>
    </main>
  );
}
