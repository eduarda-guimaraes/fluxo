"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MonthSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const monthNames = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedYear = Number(value.split("-")[0]);
  const [displayYear, setDisplayYear] = useState(selectedYear);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = useMemo(() => {
    const [year, month] = value.split("-");
    const monthIndex = Number(month) - 1;
    return `${monthNames[monthIndex]} / ${year}`;
  }, [value]);

  return (
    <div ref={containerRef} className="relative inline-flex flex-col gap-2 text-sm font-semibold text-foreground">
      <span>Período</span>

      <button
        type="button"
        onClick={() => {
          setDisplayYear(selectedYear);
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center justify-between rounded-md border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:border-mint-strong hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-strong focus:ring-offset-1 cursor-pointer"
      >
        <span>{selectedLabel}</span>
        <span className="ml-3 text-xs text-zinc-500">▼</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-border-soft bg-surface p-4 shadow-[0_18px_60px_rgba(80,58,39,0.06)]">
          <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm text-zinc-600">
            <button
              type="button"
              onClick={() => setDisplayYear((prev) => prev - 1)}
              className="rounded-md px-2 py-1 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-muted hover:text-foreground focus:outline-none"
            >
              ‹
            </button>
            <span className="font-semibold text-foreground">{displayYear}</span>
            <button
              type="button"
              onClick={() => setDisplayYear((prev) => prev + 1)}
              className="rounded-md px-2 py-1 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-muted hover:text-foreground focus:outline-none"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => {
              const monthValue = `${displayYear}-${String(index + 1).padStart(2, "0")}`;
              const isSelected = monthValue === value;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    onChange(monthValue);
                    setIsOpen(false);
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition duration-200 ease-out ${
                    isSelected
                      ? "bg-mint-strong text-white shadow-sm"
                      : "border border-border-soft bg-background text-foreground hover:-translate-y-0.5 hover:bg-surface-muted cursor-pointer"
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(getCurrentMonthValue());
                setIsOpen(false);
              }}
              className="rounded-md border border-border-soft bg-background px-3 py-2 text-sm font-semibold text-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-muted cursor-pointer"
            >
              Este mês
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-border-soft bg-background px-3 py-2 text-sm font-semibold text-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-muted cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
