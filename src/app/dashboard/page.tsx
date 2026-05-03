"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { BalanceChart } from "@/components/BalanceChart";
import { CreditCardsSection } from "@/components/CreditCardsSection";
import { ExpenseChart } from "@/components/ExpenseChart";
import { MonthSelector } from "@/components/MonthSelector";
import { PrivateRoute } from "@/components/PrivateRoute";
import { SavingsBoxesSection } from "@/components/SavingsBoxesSection";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { logout } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types";
import {
  calculateDailyFlow,
  calculateExpenseCategories,
  calculateSummary,
  currencyFormatter,
  filterTransactionsByMonth,
  getCurrentMonthValue,
  type Summary,
} from "@/utils/finance";

const navigationItems = [
  { label: "Início", href: "#inicio", active: true },
  { label: "Gráficos", href: "#graficos", active: false },
  { label: "Transações", href: "#transacoes", active: false },
  { label: "Cartões", href: "#cartoes", active: false },
  { label: "Caixinhas", href: "#caixinhas", active: false },
];

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <DashboardContent />
    </PrivateRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [savedTotal, setSavedTotal] = useState(0);
  const [pendingInvoicesTotal, setPendingInvoicesTotal] = useState(0);

  const handleTransactionsChange = useCallback(
    (currentTransactions: Transaction[]) => {
      setTransactions(currentTransactions);
    },
    [],
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );

  const summary = useMemo<Summary>(
    () => calculateSummary(filteredTransactions),
    [filteredTransactions],
  );

  const expenseCategories = useMemo(
    () => calculateExpenseCategories(filteredTransactions),
    [filteredTransactions],
  );

  const dailyFlow = useMemo(
    () => calculateDailyFlow(filteredTransactions, selectedMonth),
    [filteredTransactions, selectedMonth],
  );

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-border-soft bg-surface px-6 py-6 shadow-[18px_0_60px_rgba(80,58,39,0.06)] lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Fluxo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lavender">
              Fluxo
            </p>
            <h1 className="text-xl font-semibold text-foreground">Finanças</h1>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-2">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
                item.active
                  ? "bg-mint-strong text-white shadow-[0_10px_24px_rgba(85,189,169,0.20)]"
                  : "text-zinc-600 hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  item.active ? "bg-white" : "bg-lavender"
                }`}
              />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 rounded-lg border border-border-soft bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lavender">
            Saldo disponível
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {currencyFormatter.format(summary.balance)}
          </p>
        </div>

        <div className="mt-auto rounded-lg border border-border-soft bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {user.displayName ?? "Usuario"}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Sair
          </button>
        </div>
      </aside>

      <MobileNavigation />

      <section id="inicio" className="px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-coral">
              Bem-vinda(o) de volta
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Olá, {user.displayName ?? "usuario"}.
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Controle saldo, cartões e reservas em uma única visão.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted lg:hidden"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Saldo disponivel"
            value={summary.balance}
            tone="text-foreground"
            helper="Sem caixinhas e sem faturas futuras"
          />
          <SummaryCard
            label="Receitas"
            value={summary.income}
            tone="text-mint-strong"
            helper="Total recebido no mês"
          />
          <SummaryCard
            label="Despesas"
            value={summary.expense}
            tone="text-coral"
            helper="Gastos pagos no mês"
          />
          <SummaryCard
            label="Guardado"
            value={savedTotal}
            tone="text-lavender"
            helper="Total nas caixinhas"
          />
          <SummaryCard
            label="Faturas"
            value={pendingInvoicesTotal}
            tone="text-coral"
            helper="Pendente no cartão"
          />
        </section>

        <section
          id="graficos"
          className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]"
        >
          <BalanceChart data={dailyFlow} />
          <ExpenseChart data={expenseCategories} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
          <TransactionForm userId={user.uid} />
          <TransactionList
            userId={user.uid}
            transactions={filteredTransactions}
            onTransactionsChange={handleTransactionsChange}
          />
        </section>

        <section className="mt-6">
          <CreditCardsSection
            userId={user.uid}
            selectedMonth={selectedMonth}
            onPendingInvoicesChange={setPendingInvoicesTotal}
          />
        </section>

        <section className="mt-6">
          <SavingsBoxesSection
            userId={user.uid}
            onSavingsTotalChange={setSavedTotal}
          />
        </section>
      </section>
    </main>
  );
}

function MobileNavigation() {
  return (
    <div className="sticky top-0 z-10 border-b border-border-soft bg-surface/95 px-5 py-4 backdrop-blur lg:hidden">
      <nav className="flex gap-2 overflow-x-auto">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${
              item.active
                ? "bg-mint-strong text-white"
                : "bg-background text-zinc-600"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: number;
  tone: string;
  helper: string;
}) {
  return (
    <article className="rounded-lg border border-border-soft bg-surface p-5 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>
        {currencyFormatter.format(value)}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{helper}</p>
    </article>
  );
}
