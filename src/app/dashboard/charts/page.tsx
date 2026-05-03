"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { BalanceChart } from "@/components/BalanceChart";
import { ExpenseChart } from "@/components/ExpenseChart";
import { MonthSelector } from "@/components/MonthSelector";
import { subscribeToMonthlyBudget } from "@/services/budget";
import { subscribeToTransactions } from "@/services/transactions";
import type { Transaction } from "@/types";
import {
  calculateDailyFlow,
  calculateExpenseCategories,
  filterTransactionsByMonth,
} from "@/utils/finance";

export default function ChartsPage() {
  const { user } = useAuth();
  const { selectedMonth, setSelectedMonth, filteredTransactions } = useDashboard();
  const [plannedSalary, setPlannedSalary] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubBudget = subscribeToMonthlyBudget(user.uid, selectedMonth, (budget) => {
      setPlannedSalary(budget?.plannedSalary ?? 0);
    });

    return () => unsubBudget();
  }, [user, selectedMonth]);

  const expenseCategories = useMemo(
    () => calculateExpenseCategories(filteredTransactions),
    [filteredTransactions],
  );

  const dailyFlow = useMemo(
    () => calculateDailyFlow(filteredTransactions, selectedMonth),
    [filteredTransactions, selectedMonth],
  );

  if (!user) return null;

  return (
    <section className="px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Visualização de dados</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Gráficos</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Acompanhe o fluxo diário e a distribuição de gastos.
          </p>
        </div>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <BalanceChart data={dailyFlow} plannedSalary={plannedSalary} />
        <ExpenseChart data={expenseCategories} />
      </section>
    </section>
  );
}
