"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/context/DashboardContext";
import { MonthSelector } from "@/components/MonthSelector";
import { PlannedSalaryCard } from "@/components/PlannedSalaryCard";
import { MonthlyProjection } from "@/components/MonthlyProjection";
import { subscribeToMonthlyBudget } from "@/services/budget";
import { subscribeToTransactions } from "@/services/transactions";
import { subscribeToSavingsBoxes } from "@/services/savings";
import { subscribeToCards, subscribeToCreditTransactions, subscribeToInvoices } from "@/services/creditCards";
import type { Transaction, SavingsBox, Card, CreditTransaction, Invoice } from "@/types";
import {
  calculateSummary,
  currencyFormatter,
  filterTransactionsByMonth,
  calculatePendingInvoicesTotal,
  buildInvoice,
} from "@/utils/finance";

export default function InicioPage() {
  const { user } = useAuth();
  const { selectedMonth, setSelectedMonth, filteredTransactions, balance } = useDashboard();
  const [plannedSalary, setPlannedSalary] = useState(0);
  const [savingsBoxes, setSavingsBoxes] = useState<SavingsBox[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubBudget = subscribeToMonthlyBudget(user.uid, selectedMonth, (budget) => {
      setPlannedSalary(budget?.plannedSalary ?? 0);
    });

    const unsubSavings = subscribeToSavingsBoxes(user.uid, setSavingsBoxes);
    const unsubCards = subscribeToCards(user.uid, setCards);
    const unsubCreditTrans = subscribeToCreditTransactions(user.uid, setCreditTransactions);
    const unsubInvoices = subscribeToInvoices(user.uid, setPaidInvoices);

    return () => {
      unsubBudget();
      unsubSavings();
      unsubCards();
      unsubCreditTrans();
      unsubInvoices();
    };
  }, [user, selectedMonth]);

  const summary = useMemo(() => calculateSummary(filteredTransactions), [filteredTransactions]);

  const savedTotal = useMemo(() => savingsBoxes.reduce((acc, box) => acc + box.amount, 0), [savingsBoxes]);

  const pendingInvoicesTotal = useMemo(() => {
    const invoices = cards.map((card) => {
      const draftInvoice = buildInvoice(card, creditTransactions, selectedMonth);
      const paidInvoice = paidInvoices.find((inv) => inv.id === draftInvoice.id);
      return {
        ...draftInvoice,
        paid: paidInvoice?.paid ?? false,
        paidAmount: paidInvoice?.paidAmount ?? 0,
      };
    });
    return calculatePendingInvoicesTotal(invoices);
  }, [cards, creditTransactions, paidInvoices, selectedMonth]);

  if (!user) return null;

  return (
    <section className="px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Bem-vinda(o) de volta</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            Olá, {user.displayName ?? "usuario"}.
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Controle saldo, cartões e reservas em uma única visão.
          </p>
        </div>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Saldo disponível"
          value={summary.balance}
          tone="text-foreground"
          helper="Sem caixinhas e sem faturas futuras"
        />
        <PlannedSalaryCard
          userId={user.uid}
          month={selectedMonth}
          value={plannedSalary}
          actualIncome={summary.income}
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

      <MonthlyProjection
        plannedSalary={plannedSalary}
        actualIncome={summary.income}
        paidExpenses={summary.expense}
        pendingInvoices={pendingInvoicesTotal}
      />
    </section>
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
