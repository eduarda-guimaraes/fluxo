"use client";

import { useEffect, useState } from "react";
import { subscribeToTransactions } from "@/services/transactions";
import type { Transaction } from "@/types";

type TransactionListProps = {
  userId: string;
  onTransactionsChange?: (transactions: Transaction[]) => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function TransactionList({
  userId,
  onTransactionsChange,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(
      userId,
      (currentTransactions) => {
        setTransactions(currentTransactions);
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
    <section className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <div>
        <p className="text-sm font-medium text-coral">Histórico</p>
        <h2 className="text-xl font-semibold text-foreground">Transações</h2>
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-md bg-background px-4 py-5 text-sm text-coral">
          {errorMessage}
        </p>
      ) : transactions.length === 0 ? (
        <p className="mt-6 rounded-md bg-background px-4 py-5 text-sm text-zinc-600">
          Nenhuma transação cadastrada ainda.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border-soft">
          {transactions.map((transaction) => {
            const isExpense = transaction.type === "expense";
            const signedAmount = isExpense
              ? -transaction.amount
              : transaction.amount;

            return (
              <li
                key={transaction.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {transaction.category}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {isExpense ? "Despesa" : "Entrada"} -{" "}
                    {formatDate(transaction.date)}
                  </p>
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

export { currencyFormatter };
