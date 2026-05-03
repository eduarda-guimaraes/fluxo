import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import type { Transaction } from "@/types";

function transactionsCollection(userId: string) {
  return collection(db, "users", userId, "transactions");
}

function mapTransactionDoc(doc: QueryDocumentSnapshot): Transaction {
  const data = doc.data() as Omit<Transaction, "id">;

  return {
    id: doc.id,
    ...data,
  };
}

export async function addTransaction(transaction: Transaction) {
  return addDoc(transactionsCollection(transaction.userId), {
    userId: transaction.userId,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.date,
    createdAt: transaction.createdAt,
  });
}

export function deleteTransaction(userId: string, transactionId: string) {
  return deleteDoc(doc(transactionsCollection(userId), transactionId));
}

export async function getTransactions(userId: string) {
  const transactionsQuery = query(
    transactionsCollection(userId),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(transactionsQuery);

  return snapshot.docs.map(mapTransactionDoc);
}

export function subscribeToTransactions(
  userId: string,
  onTransactionsChange: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const transactionsQuery = query(
    transactionsCollection(userId),
    orderBy("date", "desc"),
  );

  return onSnapshot(
    transactionsQuery,
    (snapshot) => {
      onTransactionsChange(snapshot.docs.map(mapTransactionDoc));
    },
    (error) => {
      onError?.(error);
    },
  );
}
