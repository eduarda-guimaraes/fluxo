"use client";

import { ReactNode } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border-soft bg-surface p-6 shadow-[0_24px_90px_rgba(39,35,31,0.22)]">
        <p className="text-sm font-medium text-coral">Confirmar exclusão</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
        <div className="mt-3 text-sm leading-6 text-zinc-600">{description}</div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-zinc-400 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-coral px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-lavender disabled:cursor-not-allowed disabled:bg-zinc-400 cursor-pointer"
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
