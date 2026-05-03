"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type PrivateRouteProps = {
  children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm font-medium text-lavender">Carregando...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
