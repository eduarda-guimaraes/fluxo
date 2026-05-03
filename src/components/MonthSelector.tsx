"use client";

type MonthSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
      Período
      <input
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-mint-strong"
      />
    </label>
  );
}
