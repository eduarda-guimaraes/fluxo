"use client";

type DateSelectorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
};

export function DateSelector({
  label = "Data",
  value,
  onChange,
  min,
  max,
}: DateSelectorProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        className="w-full rounded-md border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground outline-none transition duration-200 ease-out hover:-translate-y-0.5 hover:border-mint-strong hover:shadow-sm focus:border-mint-strong focus:ring-2 focus:ring-mint-strong focus:ring-offset-1"
      />
    </label>
  );
}
