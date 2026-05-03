"use client";

import { useAuth } from "@/hooks/useAuth";
import { SavingsBoxesSection } from "@/components/SavingsBoxesSection";

export default function SavingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="px-5 py-6 sm:px-8 lg:px-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-coral">Reserva e Objetivos</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">Caixinhas</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Guarde dinheiro para seus objetivos e organize suas reservas.
        </p>
      </header>

      <SavingsBoxesSection
        userId={user.uid}
      />
    </section>
  );
}
