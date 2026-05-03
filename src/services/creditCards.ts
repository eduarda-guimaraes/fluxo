import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { addTransaction } from "@/services/transactions";
import type { Card, CreditTransaction, Invoice } from "@/types";

type CardInput = Omit<Card, "id">;
type CreditTransactionInput = Omit<CreditTransaction, "id">;

function cardsCollection(userId: string) {
  return collection(db, "users", userId, "cards");
}

function creditTransactionsCollection(userId: string) {
  return collection(db, "users", userId, "creditTransactions");
}

function invoicesCollection(userId: string) {
  return collection(db, "users", userId, "invoices");
}

function mapCardDoc(docSnapshot: QueryDocumentSnapshot): Card {
  const data = docSnapshot.data() as CardInput;

  return {
    id: docSnapshot.id,
    ...data,
  };
}

function mapCreditTransactionDoc(
  docSnapshot: QueryDocumentSnapshot,
): CreditTransaction {
  const data = docSnapshot.data() as CreditTransactionInput;

  return {
    id: docSnapshot.id,
    ...data,
  };
}

function mapInvoiceDoc(docSnapshot: QueryDocumentSnapshot): Invoice {
  const data = docSnapshot.data() as Omit<Invoice, "id">;

  return {
    id: docSnapshot.id,
    ...data,
  };
}

export function addCard(card: CardInput) {
  return addDoc(cardsCollection(card.userId), card);
}

export function addCreditTransaction(transaction: CreditTransactionInput) {
  return addDoc(creditTransactionsCollection(transaction.userId), transaction);
}

export function deleteCreditTransaction(
  userId: string,
  creditTransactionId: string,
) {
  return deleteDoc(
    doc(creditTransactionsCollection(userId), creditTransactionId),
  );
}

export async function deleteCard(userId: string, cardId: string) {
  const batch = writeBatch(db);
  const purchasesQuery = query(
    creditTransactionsCollection(userId),
    where("cardId", "==", cardId),
  );
  const invoicesQuery = query(
    invoicesCollection(userId),
    where("cardId", "==", cardId),
  );
  const [purchasesSnapshot, invoicesSnapshot] = await Promise.all([
    getDocs(purchasesQuery),
    getDocs(invoicesQuery),
  ]);

  purchasesSnapshot.docs.forEach((purchaseDoc) => {
    batch.delete(purchaseDoc.ref);
  });
  invoicesSnapshot.docs.forEach((invoiceDoc) => {
    batch.delete(invoiceDoc.ref);
  });
  batch.delete(doc(cardsCollection(userId), cardId));

  return batch.commit();
}

export function subscribeToCards(
  userId: string,
  onCardsChange: (cards: Card[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const cardsQuery = query(cardsCollection(userId), orderBy("name", "asc"));

  return onSnapshot(
    cardsQuery,
    (snapshot) => onCardsChange(snapshot.docs.map(mapCardDoc)),
    (error) => onError?.(error),
  );
}

export function subscribeToCreditTransactions(
  userId: string,
  onTransactionsChange: (transactions: CreditTransaction[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const transactionsQuery = query(
    creditTransactionsCollection(userId),
    orderBy("date", "desc"),
  );

  return onSnapshot(
    transactionsQuery,
    (snapshot) =>
      onTransactionsChange(snapshot.docs.map(mapCreditTransactionDoc)),
    (error) => onError?.(error),
  );
}

export function subscribeToInvoices(
  userId: string,
  onInvoicesChange: (invoices: Invoice[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    invoicesCollection(userId),
    (snapshot) => onInvoicesChange(snapshot.docs.map(mapInvoiceDoc)),
    (error) => onError?.(error),
  );
}

export async function payInvoice({
  userId,
  cardName,
  invoice,
  amount,
}: {
  userId: string;
  cardName: string;
  invoice: Invoice;
  amount: number;
}) {
  if (invoice.paid || invoice.total <= 0 || amount <= 0) {
    return;
  }

  // Registrar pagamento parcial
  await addTransaction({
    userId,
    type: "expense",
    amount,
    category: `Fatura ${cardName}`,
    date: new Date().toISOString().slice(0, 10),
    createdAt: Timestamp.now(),
  });

  // Atualizar fatura com valor pago acumulado
  const paidAmount = (invoice.paidAmount ?? 0) + amount;
  const payments = [
    ...(invoice.payments ?? []),
    { amount, date: new Date().toISOString().slice(0, 10) },
  ];
  const isPaid = paidAmount >= invoice.total;

  await setDoc(doc(invoicesCollection(userId), invoice.id), {
    cardId: invoice.cardId,
    month: invoice.month,
    year: invoice.year,
    total: invoice.total,
    dueDate: invoice.dueDate,
    paid: isPaid,
    paidAmount,
    payments,
  });
}
