"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { currencyFormatter, type DailyFlow } from "@/utils/finance";

type BalanceChartProps = {
  data: DailyFlow[];
  plannedSalary?: number;
};

function formatTooltipValue(value: unknown) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? currencyFormatter.format(numericValue)
    : String(value ?? "");
}

export function BalanceChart({ data, plannedSalary }: BalanceChartProps) {
  return (
    <section className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Evolução</p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Entradas, despesas e saldo
          </h3>
        </div>
        <div className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-zinc-600">
          Tempo real
        </div>
      </div>

      <div className="mt-6 h-80 min-h-80 min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 0 }}>
            <CartesianGrid stroke="#eadfd3" strokeDasharray="4 4" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#8a8178" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#8a8178"
              tickFormatter={(value: number) =>
                currencyFormatter.format(value).replace(",00", "")
              }
            />
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              labelFormatter={(label) => `Dia ${label}`}
            />
            
            {plannedSalary && plannedSalary > 0 && (
              <ReferenceLine 
                y={plannedSalary} 
                stroke="#55bda9" 
                strokeDasharray="3 3" 
                strokeWidth={2}
                label={{ 
                  value: "Meta Salário", 
                  position: "insideBottomRight", 
                  fill: "#55bda9", 
                  fontSize: 10,
                  fontWeight: "bold"
                }} 
              />
            )}

            <Bar dataKey="income" name="Entradas" fill="#55bda9" radius={6} />
            <Bar dataKey="expense" name="Despesas" fill="#ff8e78" radius={6} />
            <Line
              type="monotone"
              dataKey="balance"
              name="Saldo"
              stroke="#a58ee6"
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
