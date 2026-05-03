"use client";

import { Timestamp } from "firebase/firestore";
import { useState, type FormEvent } from "react";
import { addTransaction } from "@/services/transactions";
import type { Transaction } from "@/types";

type TransactionFormProps = {
  userId: string;
};

const initialFormState = {
  type: "income" as Transaction["type"],
  amount: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
};

export function TransactionForm({ userId }: TransactionFormProps) {
  const [type, setType] = useState<Transaction["type"]>(initialFormState.type);
  const [amount, setAmount] = useState(initialFormState.amount);
  const [category, setCategory] = useState(initialFormState.category);
  const [date, setDate] = useState(initialFormState.date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!category.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFeedback("Preencha uma categoria e um valor maior que zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addTransaction({
        userId,
        type,
        amount: parsedAmount,
        category: category.trim(),
        date,
        createdAt: Timestamp.now(),
      });

      setType(initialFormState.type);
      setAmount(initialFormState.amount);
      setCategory(initialFormState.category);
      setDate(initialFormState.date);
      setFeedback("Transação adicionada com sucesso.");
      console.log("Transação adicionada com sucesso.");
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      setFeedback(
        "Não foi possível adicionar. Verifique as regras do Firestore.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-coral">Nova transação</p>
        <h2 className="text-xl font-semibold text-foreground">
          Adicionar movimento
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Tipo
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as Transaction["type"])
            }
            className="rounded-md border border-border-soft bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-mint-strong"
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
            className="rounded-md border border-border-soft bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-mint-strong"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Categoria
          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Ex: mercado, salário"
            className="rounded-md border border-border-soft bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-mint-strong"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Data
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-border-soft bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-mint-strong"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-mint-strong px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(85,189,169,0.25)] transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none"
        >
          {isSubmitting ? "Adicionando..." : "Adicionar"}
        </button>
        {feedback ? (
          <p className="text-sm font-medium text-zinc-600">{feedback}</p>
        ) : null}
      </div>
    </form>
  );
}
