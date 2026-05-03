"use client";

import { useEffect, useState } from "react";
import { subscribeToTransactions } from "@/services/transactions";
import type { Transaction } from "@/types";
import { currencyFormatter } from "@/utils/finance";

type TransactionListProps = {
  userId: string;
  transactions?: Transaction[];
  onTransactionsChange?: (transactions: Transaction[]) => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function TransactionList({
  userId,
  transactions,
  onTransactionsChange,
}: TransactionListProps) {
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(
      userId,
      (currentTransactions) => {
        setLocalTransactions(currentTransactions);
        onTransactionsChange?.(currentTransactions);
        setErrorMessage("");
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar transações:", error);
        setErrorMessage(
          "Não foi possível carregar as transações. Verifique as regras do Firestore.",
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [onTransactionsChange, userId]);

  const visibleTransactions = transactions ?? localTransactions;

  if (loading) {
    return (
      <section className="rounded-lg border border-border-soft bg-surface p-6">
        <p className="text-sm font-medium text-lavender">
          Carregando transações...
        </p>
      </section>
    );
  }

  return (
    <section
      id="transacoes"
      className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Histórico</p>
          <h2 className="text-xl font-semibold text-foreground">Transações</h2>
        </div>
        <p className="text-sm text-zinc-500">
          {visibleTransactions.length} registro(s)
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-md bg-background px-4 py-5 text-sm text-coral">
          {errorMessage}
        </p>
      ) : visibleTransactions.length === 0 ? (
        <p className="mt-6 rounded-md bg-background px-4 py-5 text-sm text-zinc-600">
          Nenhuma transação cadastrada neste período.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border-soft">
          {visibleTransactions.map((transaction) => {
            const isExpense = transaction.type === "expense";
            const signedAmount = isExpense
              ? -transaction.amount
              : transaction.amount;

            return (
              <li
                key={transaction.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold ${
                      isExpense
                        ? "bg-coral/15 text-coral"
                        : "bg-mint/20 text-mint-strong"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {transaction.category}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {isExpense ? "Despesa" : "Entrada"} -{" "}
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    isExpense ? "text-coral" : "text-mint-strong"
                  }`}
                >
                  {currencyFormatter.format(signedAmount)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
