"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { PrivateRoute } from "@/components/PrivateRoute";
import {
  currencyFormatter,
  TransactionList,
} from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { logout } from "@/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types";

type Summary = {
  income: number;
  expense: number;
  balance: number;
};

const navigationItems = [
  { label: "Início", href: "#inicio", active: true },
  { label: "Transações", href: "#transacoes", active: false },
  { label: "Categorias", href: "#categorias", active: false },
  { label: "Metas", href: "#metas", active: false },
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

  const handleTransactionsChange = useCallback(
    (currentTransactions: Transaction[]) => {
      setTransactions(currentTransactions);
    },
    [],
  );

  const summary = useMemo<Summary>(() => {
    return transactions.reduce(
      (totals, transaction) => {
        if (transaction.type === "income") {
          return {
            ...totals,
            income: totals.income + transaction.amount,
            balance: totals.balance + transaction.amount,
          };
        }

        return {
          ...totals,
          expense: totals.expense + transaction.amount,
          balance: totals.balance - transaction.amount,
        };
      },
      {
        income: 0,
        expense: 0,
        balance: 0,
      },
    );
  }, [transactions]);

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
            Saldo atual
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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-coral">
              Bem-vinda(o) de volta
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Olá, {user.displayName ?? "usuario"}.
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Visão geral das suas entradas, despesas e saldo atual.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-border-soft bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted lg:hidden"
          >
            Sair
          </button>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Saldo atual"
            value={summary.balance}
            tone="text-foreground"
            helper="Entradas menos despesas"
          />
          <SummaryCard
            label="Entradas"
            value={summary.income}
            tone="text-mint-strong"
            helper="Total recebido"
          />
          <SummaryCard
            label="Despesas"
            value={summary.expense}
            tone="text-coral"
            helper="Total gasto"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <OverviewChart summary={summary} />
          <section id="transacoes">
            <TransactionForm userId={user.uid} />
          </section>
        </section>

        <section className="mt-6">
          <TransactionList
            userId={user.uid}
            onTransactionsChange={handleTransactionsChange}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div id="categorias">
            <InfoPanel
              title="Categorias"
              description="Em breve, você poderá organizar transações por categorias personalizadas."
            />
          </div>
          <div id="metas">
            <InfoPanel
              title="Metas"
              description="Em breve, acompanhe objetivos financeiros e progresso mensal."
            />
          </div>
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

function OverviewChart({ summary }: { summary: Summary }) {
  const maxValue = Math.max(summary.income, summary.expense, 1);
  const incomeHeight = Math.max((summary.income / maxValue) * 100, 8);
  const expenseHeight = Math.max((summary.expense / maxValue) * 100, 8);

  return (
    <section className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-coral">Início</p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Fluxo do mês
          </h3>
        </div>
        <div className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-zinc-600">
          Tempo real
        </div>
      </div>

      <div className="mt-8 grid min-h-72 grid-cols-[1fr_1fr] items-end gap-8 rounded-lg bg-background px-8 pb-8 pt-10">
        <ChartBar
          label="Entradas"
          value={summary.income}
          height={incomeHeight}
          colorClass="bg-mint-strong"
        />
        <ChartBar
          label="Despesas"
          value={summary.expense}
          height={expenseHeight}
          colorClass="bg-coral"
        />
      </div>
    </section>
  );
}

function InfoPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <p className="text-sm font-medium text-coral">{title}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
    </article>
  );
}

function ChartBar({
  label,
  value,
  height,
  colorClass,
}: {
  label: string;
  value: number;
  height: number;
  colorClass: string;
}) {
  return (
    <div className="flex h-56 flex-col items-center justify-end gap-3">
      <p className="text-sm font-semibold text-foreground">
        {currencyFormatter.format(value)}
      </p>
      <div className="flex h-36 w-full max-w-24 items-end rounded-md bg-surface-muted p-2">
        <div
          className={`w-full rounded-md ${colorClass}`}
          style={{ height: `${height}%` }}
        />
      </div>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
    </div>
  );
}
