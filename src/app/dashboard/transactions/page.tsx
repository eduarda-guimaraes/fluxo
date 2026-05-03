"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { MonthSelector } from "@/components/MonthSelector";
import { subscribeToTransactions } from "@/services/transactions";
import type { Transaction } from "@/types";
import { filterTransactionsByMonth } from "@/utils/finance";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { selectedMonth, setSelectedMonth, filteredTransactions } = useDashboard();

  if (!user) return null;

  return (
    <section className="px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Movimentações</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Transações</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Adicione novas receitas/despesas e gerencie seu histórico.
          </p>
        </div>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
        <TransactionForm userId={user.uid} />
        <TransactionList
          userId={user.uid}
          transactions={filteredTransactions}
        />
      </section>
    </section>
  );
}
