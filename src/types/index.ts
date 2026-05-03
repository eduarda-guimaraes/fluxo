import type { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Transaction = {
  id?: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  createdAt: Timestamp;
};
