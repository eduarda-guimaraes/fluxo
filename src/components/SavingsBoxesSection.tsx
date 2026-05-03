"use client";

import { Timestamp } from "firebase/firestore";
import { useEffect, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  addSavingsBox,
  deleteSavingsBox,
  moveSavingsMoney,
  subscribeToSavingsBoxes,
} from "@/services/savings";
import type { SavingsBox } from "@/types";
import { currencyFormatter } from "@/utils/finance";

type SavingsBoxesSectionProps = {
  userId: string;
  onSavingsTotalChange?: (total: number) => void;
};

export function SavingsBoxesSection({
  userId,
  onSavingsTotalChange,
}: SavingsBoxesSectionProps) {
  const [boxes, setBoxes] = useState<SavingsBox[]>([]);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedBoxId, setSelectedBoxId] = useState("");
  const [amount, setAmount] = useState("");
  const [movementType, setMovementType] =
    useState<"deposit" | "withdraw">("deposit");
  const [feedback, setFeedback] = useState("");
  const [boxToDelete, setBoxToDelete] = useState<SavingsBox | null>(null);
  const [deletingBoxId, setDeletingBoxId] = useState("");

  useEffect(() => {
    return subscribeToSavingsBoxes(
      userId,
      (currentBoxes) => {
        setBoxes(currentBoxes);
        onSavingsTotalChange?.(
          currentBoxes.reduce((total, box) => total + box.amount, 0),
        );
      },
      (error) => {
        console.error("Erro ao carregar caixinhas:", error);
        setFeedback("Não foi possível carregar as caixinhas.");
      },
    );
  }, [onSavingsTotalChange, userId]);

  async function handleCreateBox(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setFeedback("Informe o nome da caixinha.");
      return;
    }

    const parsedGoal = Number(goal);
    const boxData = {
      userId,
      name: name.trim(),
      amount: 0,
      createdAt: Timestamp.now(),
      ...(goal && parsedGoal > 0 ? { goal: parsedGoal } : {}),
    };

    try {
      const boxRef = await addSavingsBox(boxData);

      setBoxes((currentBoxes) =>
        currentBoxes.some((box) => box.id === boxRef.id)
          ? currentBoxes
          : [...currentBoxes, { id: boxRef.id, ...boxData }],
      );
      setSelectedBoxId(boxRef.id);
      setName("");
      setGoal("");
      setFeedback("Caixinha criada.");
    } catch (error) {
      console.error("Erro ao criar caixinha:", error);
      setFeedback("Não foi possivel criar a caixinha.");
    }
  }

  async function handleMoveMoney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const activeBoxId = selectedBoxId || boxes[0]?.id || "";
    const selectedBox = boxes.find((box) => box.id === activeBoxId);
    const parsedAmount = Number(amount);

    if (!selectedBox || parsedAmount <= 0) {
      setFeedback("Selecione uma caixinha e informe um valor valido.");
      return;
    }

    try {
      await moveSavingsMoney({
        userId,
        box: selectedBox,
        amount: parsedAmount,
        type: movementType,
      });
      setAmount("");
      setFeedback(
        movementType === "deposit"
          ? "Depósito registrado."
          : "Saque registrado.",
      );
    } catch (error) {
      console.error("Erro ao movimentar caixinha:", error);
      setFeedback("Não foi possível movimentar essa caixinha.");
    }
  }

  async function handleDeleteBox() {
    if (!boxToDelete) {
      return;
    }

    try {
      setDeletingBoxId(boxToDelete.id);
      await deleteSavingsBox(userId, boxToDelete.id);
      setBoxes((currentBoxes) => {
        const nextBoxes = currentBoxes.filter(
          (box) => box.id !== boxToDelete.id,
        );
        onSavingsTotalChange?.(
          nextBoxes.reduce((total, box) => total + box.amount, 0),
        );
        return nextBoxes;
      });
      if (selectedBoxId === boxToDelete.id) {
        setSelectedBoxId("");
      }
      setBoxToDelete(null);
      setFeedback("Caixinha excluída.");
    } catch (error) {
      console.error("Erro ao excluir caixinha:", error);
      setFeedback("Não foi possível excluir a caixinha.");
    } finally {
      setDeletingBoxId("");
    }
  }

  return (
    <section
      id="caixinhas"
      className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Suas caixinhas</p>
          <h2 className="text-xl font-semibold text-foreground">
            Reservas separadas
          </h2>
        </div>
        {feedback ? (
          <p className="rounded-md bg-background px-3 py-2 text-sm font-medium text-zinc-600">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <form
            onSubmit={handleCreateBox}
            className="rounded-lg border border-border-soft bg-background p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              Nova caixinha
            </p>
            <div className="mt-4 grid gap-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Emergência"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Meta opcional"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <button
                type="submit"
                className="rounded-md bg-mint-strong px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mint cursor-pointer"
              >
                Criar caixinha
              </button>
            </div>
          </form>

          <form
            onSubmit={handleMoveMoney}
            className="rounded-lg border border-border-soft bg-background p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              Movimentar reserva
            </p>
            <div className="mt-4 grid gap-3">
              <select
                value={selectedBoxId || boxes[0]?.id || ""}
                onChange={(event) => setSelectedBoxId(event.target.value)}
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              >
                <option value="">Selecione uma caixinha</option>
                {boxes.map((box) => (
                  <option key={box.id} value={box.id}>
                    {box.name}
                  </option>
                ))}
              </select>
              <select
                value={movementType}
                onChange={(event) =>
                  setMovementType(event.target.value as "deposit" | "withdraw")
                }
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              >
                <option value="deposit">Depositar</option>
                <option value="withdraw">Sacar</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Valor"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <button
                type="submit"
                className="rounded-md bg-lavender px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mint-strong cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>

        <div className="grid content-start gap-4 md:grid-cols-2">
          {boxes.length === 0 ? (
            <p className="rounded-lg border border-border-soft bg-background p-5 text-sm text-zinc-600">
              Nenhuma caixinha criada ainda.
            </p>
          ) : (
            boxes.map((box) => {
              const progress = box.goal
                ? Math.min((box.amount / box.goal) * 100, 100)
                : 0;

              return (
                <article
                  key={box.id}
                  className="rounded-lg border border-border-soft bg-background p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {box.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {box.goal
                          ? `Meta: ${currencyFormatter.format(box.goal)}`
                          : "Sem meta definida"}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-mint-strong">
                      {currencyFormatter.format(box.amount)}
                    </p>
                  </div>
                  {box.goal ? (
                    <div className="mt-4">
                      <div className="h-3 rounded-full bg-surface-muted">
                        <div
                          className="h-3 rounded-full bg-mint-strong"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-zinc-500">
                        {progress.toFixed(0)}% concluido
                      </p>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setBoxToDelete(box)}
                    className="mt-4 rounded-md border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-surface-muted hover:text-coral cursor-pointer"
                  >
                    Excluir caixinha
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>
      <ConfirmModal
        open={Boolean(boxToDelete)}
        title="Excluir caixinha?"
        description={`Esta ação vai remover "${boxToDelete?.name ?? "esta caixinha"}" e suas movimentações internas.`}
        loading={Boolean(deletingBoxId)}
        confirmLabel="Excluir"
        onCancel={() => setBoxToDelete(null)}
        onConfirm={handleDeleteBox}
      />
    </section>
  );
}
