"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { currencyFormatter, type CategoryTotal } from "@/utils/finance";

type ExpenseChartProps = {
  data: CategoryTotal[];
};

const chartColors = ["#ff8e78", "#a58ee6", "#80d6c4", "#f4c56f", "#8eb8e6"];

function formatTooltipValue(value: unknown) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? currencyFormatter.format(numericValue)
    : String(value ?? "");
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <section
      id="categorias"
      className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
    >
      <div>
        <p className="text-sm font-medium text-coral">Categorias</p>
        <h3 className="mt-1 text-xl font-semibold text-foreground">
          Despesas por categoria
        </h3>
      </div>

      {data.length === 0 ? (
        <p className="mt-8 rounded-md bg-background px-4 py-8 text-center text-sm text-zinc-600">
          Nenhuma despesa neste período.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.category}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatTooltipValue(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-3">
            {data.map((item, index) => (
              <li
                key={item.category}
                className="flex items-center justify-between gap-3 rounded-md bg-background px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        chartColors[index % chartColors.length],
                    }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {item.category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-zinc-600">
                  {item.percentage.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
