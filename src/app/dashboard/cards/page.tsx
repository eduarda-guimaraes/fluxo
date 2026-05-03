"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { CreditCardsSection } from "@/components/CreditCardsSection";
import { MonthSelector } from "@/components/MonthSelector";

export default function CardsPage() {
  const { user } = useAuth();
  const { selectedMonth, setSelectedMonth } = useDashboard();

  if (!user) return null;

  return (
    <section className="px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-coral">Crédito</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Cartões</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Gerencie seus cartões de crédito e acompanhe suas faturas.
          </p>
        </div>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </header>

      <CreditCardsSection
        userId={user.uid}
        selectedMonth={selectedMonth}
      />
    </section>
  );
}
