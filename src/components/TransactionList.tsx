"use client";

import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  deleteTransaction,
  subscribeToTransactions,
} from "@/services/transactions";
import type { Transaction } from "@/types";
import { currencyFormatter } from "@/utils/finance";
import { TransactionEditModal } from "@/components/TransactionEditModal";

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
  const [deletingId, setDeletingId] = useState("");
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);

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

  async function handleDeleteTransaction() {
    const transactionId = transactionToDelete?.id;

    if (!transactionId) {
      return;
    }

    try {
      setDeletingId(transactionId);
      await deleteTransaction(userId, transactionId);
      setLocalTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId,
        ),
      );
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      setErrorMessage("Não foi possível excluir a transação.");
    } finally {
      setDeletingId("");
    }
  }

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
    <>
      <section
        id="transacoes"
        className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-coral">Histórico</p>
            <h2 className="text-xl font-semibold text-foreground">
              Transações
            </h2>
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
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p
                      className={`text-lg font-semibold ${
                        isExpense ? "text-coral" : "text-mint-strong"
                      }`}
                    >
                      {currencyFormatter.format(signedAmount)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTransactionToEdit(transaction)}
                        className="rounded-md border border-border-soft bg-background px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-surface-muted hover:text-mint-strong cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransactionToDelete(transaction)}
                        disabled={deletingId === transaction.id}
                        className="rounded-md border border-border-soft bg-background px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-surface-muted hover:text-coral disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {transactionToEdit && (
        <TransactionEditModal
          userId={userId}
          transaction={transactionToEdit}
          isOpen={Boolean(transactionToEdit)}
          onClose={() => setTransactionToEdit(null)}
        />
      )}

      <ConfirmModal
        open={Boolean(transactionToDelete)}
        title="Excluir transação?"
        description={`Esta ação vai remover "${transactionToDelete?.category ?? "esta transação"}" do histórico.`}
        loading={Boolean(deletingId)}
        confirmLabel="Excluir"
        onCancel={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
      />
    </>
  );
}
