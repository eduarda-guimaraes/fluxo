import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { addTransaction } from "@/services/transactions";
import type { SavingsBox, SavingsTransaction } from "@/types";

type SavingsBoxInput = Omit<SavingsBox, "id">;
type SavingsTransactionInput = Omit<SavingsTransaction, "id">;

function savingsBoxesCollection(userId: string) {
  return collection(db, "users", userId, "savingsBoxes");
}

function savingsTransactionsCollection(userId: string, boxId: string) {
  return collection(db, "users", userId, "savingsBoxes", boxId, "transactions");
}

function mapSavingsBoxDoc(docSnapshot: QueryDocumentSnapshot): SavingsBox {
  const data = docSnapshot.data() as SavingsBoxInput;

  return {
    id: docSnapshot.id,
    ...data,
  };
}

export function addSavingsBox(box: SavingsBoxInput) {
  return addDoc(savingsBoxesCollection(box.userId), box);
}

export async function deleteSavingsBox(userId: string, boxId: string) {
  const batch = writeBatch(db);
  const movementsSnapshot = await getDocs(
    savingsTransactionsCollection(userId, boxId),
  );

  movementsSnapshot.docs.forEach((movementDoc) => {
    batch.delete(movementDoc.ref);
  });
  batch.delete(doc(savingsBoxesCollection(userId), boxId));

  return batch.commit();
}

export function subscribeToSavingsBoxes(
  userId: string,
  onBoxesChange: (boxes: SavingsBox[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const boxesQuery = query(savingsBoxesCollection(userId), orderBy("name", "asc"));

  return onSnapshot(
    boxesQuery,
    (snapshot) => onBoxesChange(snapshot.docs.map(mapSavingsBoxDoc)),
    (error) => onError?.(error),
  );
}

export async function moveSavingsMoney({
  userId,
  box,
  amount,
  type,
}: {
  userId: string;
  box: SavingsBox;
  amount: number;
  type: SavingsTransactionInput["type"];
}) {
  const boxRef = doc(savingsBoxesCollection(userId), box.id);
  const signedAmount = type === "deposit" ? amount : -amount;

  if (type === "withdraw" && amount > box.amount) {
    throw new Error("Saldo insuficiente na caixinha.");
  }

  await updateDoc(boxRef, {
    amount: increment(signedAmount),
  });

  await addDoc(savingsTransactionsCollection(userId, box.id), {
    boxId: box.id,
    amount,
    type,
    date: new Date().toISOString().slice(0, 10),
  });

  await addTransaction({
    userId,
    type: type === "deposit" ? "expense" : "income",
    amount,
    category: `Caixinha ${box.name}`,
    date: new Date().toISOString().slice(0, 10),
    createdAt: Timestamp.now(),
  });
}
