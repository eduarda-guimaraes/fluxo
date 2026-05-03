import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";
import type { MonthlyBudget } from "@/types";

function budgetCollection(userId: string) {
  return collection(db, "users", userId, "budgets");
}

export async function setMonthlyBudget(userId: string, month: string, plannedSalary: number) {
  const docRef = doc(budgetCollection(userId), month);
  return setDoc(docRef, {
    userId,
    month,
    plannedSalary,
  }, { merge: true });
}

export function subscribeToMonthlyBudget(
  userId: string,
  month: string,
  onBudgetChange: (budget: MonthlyBudget | null) => void
) {
  const docRef = doc(budgetCollection(userId), month);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      onBudgetChange({ id: doc.id, ...doc.data() } as MonthlyBudget);
    } else {
      onBudgetChange(null);
    }
  });
}
