"use client";

import { useState } from "react";
import { setMonthlyBudget } from "@/services/budget";
import { currencyFormatter } from "@/utils/finance";

type PlannedSalaryCardProps = {
  userId: string;
  month: string;
  value: number;
  actualIncome: number;
};

export function PlannedSalaryCard({
  userId,
  month,
  value,
  actualIncome,
}: PlannedSalaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    const parsedValue = Number(newValue);
    if (Number.isNaN(parsedValue)) return;

    try {
      setIsLoading(true);
      await setMonthlyBudget(userId, month, parsedValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar salário planejado:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const progress = value > 0 ? Math.min((actualIncome / value) * 100, 100) : 0;
  const isCompleted = progress >= 100;

  return (
    <article className="relative overflow-hidden rounded-lg border border-border-soft bg-surface p-5 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">Salário Planejado</p>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setNewValue(value.toString());
          }}
          className="text-xs font-semibold text-lavender hover:underline cursor-pointer"
        >
          {isEditing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {isEditing ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            autoFocus
            className="w-full rounded-md border border-border-soft bg-background px-2 py-1 text-lg font-semibold outline-none focus:ring-2 focus:ring-mint-strong"
          />
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-md bg-mint-strong p-1.5 text-white transition hover:bg-mint disabled:opacity-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-2xl font-semibold text-foreground">
            {currencyFormatter.format(value)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={isCompleted ? "text-mint-strong font-bold" : "text-zinc-500"}>
              {progress.toFixed(0)}% concluído
            </span>
            <span className="text-zinc-400">
              Faltam {currencyFormatter.format(Math.max(0, value - actualIncome))}
            </span>
          </div>
        </div>
      )}
      
      <p className="mt-2 text-[10px] uppercase tracking-wider font-bold text-zinc-400">Objetivo mensal</p>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-surface-muted">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${
            isCompleted ? "bg-mint-strong" : "bg-mint"
          }`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}
