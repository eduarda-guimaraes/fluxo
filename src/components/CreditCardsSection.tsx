"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DateSelector } from "@/components/DateSelector";
import {
  addCard,
  addCreditTransaction,
  deleteCard,
  deleteCreditTransaction,
  payInvoice,
  subscribeToCards,
  subscribeToCreditTransactions,
  subscribeToInvoices,
} from "@/services/creditCards";
import type { Card, CreditTransaction, Invoice } from "@/types";
import {
  buildInvoice,
  calculatePendingInvoicesTotal,
  currencyFormatter,
  getCreditTransactionsForInvoice,
} from "@/utils/finance";

type CreditCardsSectionProps = {
  userId: string;
  selectedMonth: string;
  onPendingInvoicesChange?: (total: number) => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function CreditCardsSection({
  userId,
  selectedMonth,
  onPendingInvoicesChange,
}: CreditCardsSectionProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<
    CreditTransaction[]
  >([]);
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [cardName, setCardName] = useState("");
  const [closingDay, setClosingDay] = useState("10");
  const [dueDay, setDueDay] = useState("17");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseCategory, setPurchaseCategory] = useState("");
  const [purchaseDescription, setPurchaseDescription] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [feedback, setFeedback] = useState("");
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] =
    useState<CreditTransaction | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<{
    card: Card;
    invoice: Invoice;
  } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [deletingTarget, setDeletingTarget] = useState("");
  const [payingTarget, setPayingTarget] = useState("");

  useEffect(() => {
    const unsubscribeCards = subscribeToCards(userId, setCards, (error) => {
      console.error("Erro ao carregar cartoes:", error);
      setFeedback("Nao foi possivel carregar os cartoes.");
    });
    const unsubscribeTransactions = subscribeToCreditTransactions(
      userId,
      setCreditTransactions,
      (error) => {
        console.error("Erro ao carregar compras:", error);
        setFeedback("Nao foi possivel carregar as compras no cartao.");
      },
    );
    const unsubscribeInvoices = subscribeToInvoices(
      userId,
      setPaidInvoices,
      (error) => {
        console.error("Erro ao carregar faturas:", error);
        setFeedback("Nao foi possivel carregar as faturas.");
      },
    );

    return () => {
      unsubscribeCards();
      unsubscribeTransactions();
      unsubscribeInvoices();
    };
  }, [userId]);

  const invoices = useMemo(() => {
    return cards.map((card) => {
      const draftInvoice = buildInvoice(card, creditTransactions, selectedMonth);
      const paidInvoice = paidInvoices.find(
        (invoice) => invoice.id === draftInvoice.id,
      );

      return {
        ...draftInvoice,
        paid: paidInvoice?.paid ?? false,
        paidAmount: paidInvoice?.paidAmount ?? 0,
        payments: paidInvoice?.payments ?? [],
      };
    });
  }, [cards, creditTransactions, paidInvoices, selectedMonth]);

  useEffect(() => {
    onPendingInvoicesChange?.(calculatePendingInvoicesTotal(invoices));
  }, [invoices, onPendingInvoicesChange]);

  const activeCardId = selectedCardId || cards[0]?.id || "";
  const selectedCard = cards.find((card) => card.id === activeCardId);

  async function handleAddCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cardName.trim()) {
      setFeedback("Informe o nome do cartão.");
      return;
    }

    try {
      const newCard = {
        userId,
        name: cardName.trim(),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      };
      const cardRef = await addCard(newCard);

      setCards((currentCards) =>
        currentCards.some((card) => card.id === cardRef.id)
          ? currentCards
          : [...currentCards, { id: cardRef.id, ...newCard }],
      );
      setSelectedCardId(cardRef.id);
      setCardName("");
      setFeedback("Cartão criado.");
    } catch (error) {
      console.error("Erro ao criar cartão:", error);
      setFeedback("Não foi possível criar o cartão.");
    }
  }

  async function handleAddPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(purchaseAmount);

    if (!selectedCard || !purchaseCategory.trim() || amount <= 0) {
      setFeedback("Selecione um cartão, categoria e valor válido.");
      return;
    }

    try {
      await addCreditTransaction({
        userId,
        cardId: selectedCard.id,
        amount,
        category: purchaseCategory.trim(),
        date: purchaseDate,
        description: purchaseDescription.trim(),
      });
      setPurchaseAmount("");
      setPurchaseCategory("");
      setPurchaseDescription("");
      setFeedback("Compra adicionada na fatura.");
    } catch (error) {
      console.error("Erro ao adicionar compra:", error);
      setFeedback("Não foi possível adicionar a compra.");
    }
  }

  function handlePayInvoice(card: Card, invoice: Invoice) {
    setInvoiceToPay({ card, invoice });
    setPayAmount("");
  }

  async function handleConfirmPayInvoice() {
    if (!invoiceToPay) {
      return;
    }
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedback("Informe um valor válido para pagamento.");
      return;
    }
    if (amount > invoiceToPay.invoice.total - (invoiceToPay.invoice.paidAmount ?? 0)) {
      setFeedback("O valor excede o saldo da fatura.");
      return;
    }
    try {
      const targetId = `${invoiceToPay.card.id}-${invoiceToPay.invoice.id}`;
      setPayingTarget(targetId);
      await payInvoice({
        userId,
        cardName: invoiceToPay.card.name,
        invoice: invoiceToPay.invoice,
        amount,
      });
      setFeedback("Pagamento registrado.");
      setInvoiceToPay(null);
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      setFeedback("Não foi possível registrar o pagamento.");
    } finally {
      setPayingTarget("");
    }
  }

  async function handleDeleteCard() {
    if (!cardToDelete) {
      return;
    }

    try {
      setDeletingTarget(cardToDelete.id);
      await deleteCard(userId, cardToDelete.id);
      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardToDelete.id),
      );
      setCreditTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.cardId !== cardToDelete.id,
        ),
      );
      setPaidInvoices((currentInvoices) =>
        currentInvoices.filter((invoice) => invoice.cardId !== cardToDelete.id),
      );
      if (selectedCardId === cardToDelete.id) {
        setSelectedCardId("");
      }
      setCardToDelete(null);
      setFeedback("Cartão excluído.");
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
      setFeedback("Não foi possível excluir o cartão.");
    } finally {
      setDeletingTarget("");
    }
  }

  async function handleDeletePurchase() {
    if (!purchaseToDelete) {
      return;
    }

    try {
      setDeletingTarget(purchaseToDelete.id);
      await deleteCreditTransaction(userId, purchaseToDelete.id);
      setCreditTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== purchaseToDelete.id,
        ),
      );
      setPurchaseToDelete(null);
      setFeedback("Compra excluida.");
    } catch (error) {
      console.error("Erro ao excluir compra:", error);
      setFeedback("Não foi possível excluir a compra.");
    } finally {
      setDeletingTarget("");
    }
  }

  return (
    <section
      id="cartoes"
      className="rounded-lg border border-border-soft bg-surface p-6 shadow-[0_18px_60px_rgba(80,58,39,0.06)]"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-coral">Cartões de crédito</p>
          <h2 className="text-xl font-semibold text-foreground">
            Faturas e compras
          </h2>
        </div>
        {feedback ? (
          <p className="rounded-md bg-background px-3 py-2 text-sm font-medium text-zinc-600">
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          <form
            onSubmit={handleAddCard}
            className="rounded-lg border border-border-soft bg-background p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              Novo cartão
            </p>
            <div className="mt-4 grid gap-3">
              <input
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="Ex: Nubank"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                  Dia de fechamento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={closingDay}
                    onChange={(event) => setClosingDay(event.target.value)}
                    className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
                  />
                  <span className="text-xs font-normal leading-5 text-zinc-500">
                    Dia em que a fatura fecha.
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                  Dia de vencimento
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(event) => setDueDay(event.target.value)}
                    className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
                  />
                  <span className="text-xs font-normal leading-5 text-zinc-500">
                    Dia limite para pagar.
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="rounded-md bg-mint-strong px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mint cursor-pointer"
              >
                Criar cartão
              </button>
            </div>
          </form>

          <form
            onSubmit={handleAddPurchase}
            className="rounded-lg border border-border-soft bg-background p-4"
          >
            <p className="text-sm font-semibold text-foreground">
              Nova compra
            </p>
            <div className="mt-4 grid gap-3">
              <select
                value={activeCardId}
                onChange={(event) => setSelectedCardId(event.target.value)}
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              >
                <option value="">Selecione um cartão</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseAmount}
                onChange={(event) => setPurchaseAmount(event.target.value)}
                placeholder="Valor"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <input
                value={purchaseCategory}
                onChange={(event) => setPurchaseCategory(event.target.value)}
                placeholder="Categoria"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <input
                value={purchaseDescription}
                onChange={(event) => setPurchaseDescription(event.target.value)}
                placeholder="Descricao"
                className="rounded-md border border-border-soft bg-surface px-3 py-3 text-sm outline-none focus:border-mint-strong"
              />
              <DateSelector
                label="Data"
                value={purchaseDate}
                onChange={setPurchaseDate}
              />
              <button
                type="submit"
                className="rounded-md bg-lavender px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mint-strong cursor-pointer"
              >
                Adicionar compra
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-border-soft bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Todos os cartões
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {cards.length} cartão(ões) cadastrado(s)
              </p>
            </div>
          </div>

          {cards.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">
              Crie um cartão para acompanhar suas faturas.
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              {cards.map((card) => {
                const invoice = invoices.find(
                  (currentInvoice) => currentInvoice.cardId === card.id,
                );
                const purchases = getCreditTransactionsForInvoice(
                  card,
                  creditTransactions,
                  selectedMonth,
                );

                if (!invoice) {
                  return null;
                }

                return (
                  <article
                    key={card.id}
                    className="rounded-lg border border-border-soft bg-surface p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {card.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Fecha dia {card.closingDay} - vence dia {card.dueDay}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                          Vencimento: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lavender">
                            Fatura total
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-coral">
                            {currencyFormatter.format(invoice.total)}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border-soft">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mint">
                            Pago
                          </p>
                          <p className="mt-1 text-lg font-semibold text-mint">
                            {currencyFormatter.format(invoice.paidAmount ?? 0)}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border-soft">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
                            A pagar
                          </p>
                          <p className="mt-1 text-lg font-semibold text-orange-500">
                            {currencyFormatter.format((invoice.total - (invoice.paidAmount ?? 0)))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handlePayInvoice(card, invoice)}
                        disabled={invoice.total - (invoice.paidAmount ?? 0) <= 0}
                        className="rounded-md bg-coral px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-lavender disabled:cursor-not-allowed disabled:bg-zinc-400 cursor-pointer"
                      >
                        {invoice.total - (invoice.paidAmount ?? 0) <= 0
                          ? "Fatura paga"
                          : "Registrar pagamento"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardToDelete(card)}
                        className="rounded-md border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-surface-muted hover:text-coral cursor-pointer"
                      >
                        Excluir cartão
                      </button>
                    </div>

                    <ul className="mt-5 divide-y divide-border-soft">
                      {purchases.length === 0 ? (
                        <li className="py-4 text-sm text-zinc-600">
                          Nenhuma compra nesta fatura.
                        </li>
                      ) : (
                        purchases.map((purchase) => (
                          <li
                            key={purchase.id}
                            className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-foreground">
                                {purchase.description || purchase.category}
                              </p>
                              <p className="text-sm text-zinc-500">
                                {purchase.category} -{" "}
                                {formatDate(purchase.date)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              <p className="font-semibold text-coral">
                                {currencyFormatter.format(purchase.amount)}
                              </p>
                              <button
                                type="button"
                                onClick={() => setPurchaseToDelete(purchase)}
                                className="rounded-md border border-border-soft bg-background px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-surface-muted hover:text-coral cursor-pointer"
                              >
                                Excluir
                              </button>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={Boolean(cardToDelete)}
        title="Excluir cartão?"
        description={`Esta ação vai remover "${cardToDelete?.name ?? "este cartão"}" e suas compras vinculadas.`}
        loading={Boolean(deletingTarget)}
        onCancel={() => setCardToDelete(null)}
        onConfirm={handleDeleteCard}
      />
      <ConfirmModal
        open={Boolean(purchaseToDelete)}
        title="Excluir compra?"
        description={`Esta ação vai remover "${purchaseToDelete?.description || purchaseToDelete?.category || "esta compra"}" da fatura e diminuir o valor total.`}
        loading={Boolean(deletingTarget)}
        onCancel={() => setPurchaseToDelete(null)}
        onConfirm={handleDeletePurchase}
      />
      <ConfirmModal
        open={Boolean(invoiceToPay)}
        title="Registrar pagamento"
        description={invoiceToPay ? (
          <div className="space-y-4">
            <div className="rounded-md bg-background p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Fatura de:</span>
                <span className="font-semibold text-foreground">{invoiceToPay.card.name}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border-soft pt-2">
                <span className="text-zinc-500">Valor total:</span>
                <span className="font-semibold text-coral">{currencyFormatter.format(invoiceToPay.invoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Já pago:</span>
                <span className="font-semibold text-mint">{currencyFormatter.format(invoiceToPay.invoice.paidAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border-soft pt-2 bg-orange-50 p-2 rounded -mx-2 px-3">
                <span className="font-semibold text-orange-900">Saldo a pagar:</span>
                <span className="font-bold text-lg text-orange-600">{currencyFormatter.format(invoiceToPay.invoice.total - (invoiceToPay.invoice.paidAmount ?? 0))}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Valor do pagamento
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={invoiceToPay.invoice.total - (invoiceToPay.invoice.paidAmount ?? 0)}
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder={`Até ${currencyFormatter.format(invoiceToPay.invoice.total - (invoiceToPay.invoice.paidAmount ?? 0))}`}
                className="rounded-md border border-border-soft bg-surface px-3 py-2 text-sm outline-none focus:border-mint-strong w-full"
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-2">
                Digite o valor que deseja pagar agora
              </p>
            </div>
          </div>
        ) : ""}
        confirmLabel="Registrar pagamento"
        cancelLabel="Cancelar"
        loading={Boolean(payingTarget)}
        onCancel={() => setInvoiceToPay(null)}
        onConfirm={handleConfirmPayInvoice}
      />
    </section>
  );
}
