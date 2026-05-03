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

export type Card = {
  id: string;
  userId: string;
  name: string;
  closingDay: number;
  dueDay: number;
};

export type CreditTransaction = {
  id: string;
  userId: string;
  cardId: string;
  amount: number;
  category: string;
  date: string;
  description: string;
};

export type Invoice = {
  id: string;
  cardId: string;
  month: number;
  year: number;
  total: number;
  dueDate: string;
  paid: boolean;
  paidAmount?: number; // Valor já pago
  payments?: InvoicePayment[]; // Lista de pagamentos parciais
};

export type InvoicePayment = {
  id: string;
  amount: number;
  date: string;
  transactionId?: string;
};

export type SavingsBox = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  goal?: number;
  createdAt: Timestamp;
};

export type SavingsTransaction = {
  id: string;
  boxId: string;
  amount: number;
  type: "deposit" | "withdraw";
  date: string;
};

export type MonthlyBudget = {
  id?: string;
  userId: string;
  month: string; // Format: "YYYY-MM"
  plannedSalary: number;
};
