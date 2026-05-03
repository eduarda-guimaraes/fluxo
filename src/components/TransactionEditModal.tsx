"use client";

import { useState, type FormEvent } from "react";
import { updateTransaction } from "@/services/transactions";
import { DateSelector } from "@/components/DateSelector";
import type { Transaction } from "@/types";

type TransactionEditModalProps = {
  userId: string;
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
};

export function TransactionEditModal({
  userId,
  transaction,
  isOpen,
  onClose,
}: TransactionEditModalProps) {
  const [type, setType] = useState<Transaction["type"]>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!category.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Preencha uma categoria e um valor maior que zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTransaction(userId, {
        ...transaction,
        type,
        amount: parsedAmount,
        category: category.trim(),
        date,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      setErrorMessage("Não foi possível atualizar a transação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm px-6">
      <div className="w-full max-w-lg rounded-3xl border border-border-soft bg-surface p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-coral">Editar</p>
            <h2 className="text-xl font-semibold text-foreground">Alterar transação</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Tipo
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Transaction["type"])
                }
                className="rounded-xl border border-border-soft bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-mint-strong"
              >
                <option value="income">Entrada</option>
                <option value="expense">Despesa</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Valor
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                className="rounded-xl border border-border-soft bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-mint-strong"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Categoria
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ex: mercado, salário"
                list="edit-categories"
                className="rounded-xl border border-border-soft bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-mint-strong"
              />
              <datalist id="edit-categories">
                <option value="Salário" />
                <option value="Freelance" />
                <option value="Investimentos" />
                <option value="Mercado" />
                <option value="Aluguel" />
                <option value="Transporte" />
                <option value="Lazer" />
                <option value="Saúde" />
                <option value="Educação" />
                <option value="Assinaturas" />
                <option value="Outros" />
              </datalist>
            </label>

            <DateSelector
              value={date}
              onChange={setDate}
            />
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm font-medium text-coral">{errorMessage}</p>
          )}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-background cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-mint-strong px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-mint-strong/20 transition-all hover:bg-mint disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
