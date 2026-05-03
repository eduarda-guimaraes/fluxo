"use client";

import { currencyFormatter } from "@/utils/finance";

type MonthlyProjectionProps = {
  plannedSalary: number;
  actualIncome: number;
  paidExpenses: number;
  pendingInvoices: number;
};

export function MonthlyProjection({
  plannedSalary,
  actualIncome,
  paidExpenses,
  pendingInvoices,
}: MonthlyProjectionProps) {
  // O cálculo usa o planejado (pois é o que se espera ter no fim do mês)
  // Menos o que já saiu e o que ainda vai sair (faturas)
  const totalOut = paidExpenses + pendingInvoices;
  const projectedLeftover = plannedSalary - totalOut;
  
  const isNegative = projectedLeftover < 0;
  const isHealthy = !isNegative && projectedLeftover > (plannedSalary * 0.2); // sobra mais de 20%

  if (plannedSalary === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)] overflow-hidden relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-coral uppercase tracking-wider">Projeção de Fechamento</p>
          <h3 className="mt-1 text-2xl font-bold text-foreground">
            {isNegative ? "Atenção ao orçamento!" : "Seu planejamento está saudável"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Com base no seu salário planejado de <span className="font-semibold">{currencyFormatter.format(plannedSalary)}</span>
          </p>
        </div>

        <div className={`rounded-2xl px-6 py-4 text-center ${
          isNegative ? "bg-coral/10 border border-coral/20" : "bg-mint/10 border border-mint/20"
        }`}>
          <p className="text-xs font-semibold text-zinc-500 uppercase">Previsão de Sobra</p>
          <p className={`text-2xl font-bold ${isNegative ? "text-coral" : "text-mint-strong"}`}>
            {currencyFormatter.format(projectedLeftover)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-background p-3">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Saídas</p>
          <p className="text-sm font-semibold text-foreground">{currencyFormatter.format(totalOut)}</p>
          <p className="text-[10px] text-zinc-500">(Pagas + Faturas)</p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Já Recebido</p>
          <p className="text-sm font-semibold text-mint-strong">{currencyFormatter.format(actualIncome)}</p>
          <p className="text-[10px] text-zinc-500">({((actualIncome/plannedSalary)*100).toFixed(0)}% do esperado)</p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Status Final</p>
          <p className={`text-sm font-semibold ${isNegative ? "text-coral" : "text-mint-strong"}`}>
            {isNegative ? "Déficit previsto" : isHealthy ? "Ótimo rendimento" : "Equilibrado"}
          </p>
        </div>
      </div>

      {/* Decorative indicator line */}
      <div className={`absolute bottom-0 left-0 h-1.5 w-full ${isNegative ? "bg-coral" : "bg-mint-strong"}`} />
    </section>
  );
}
