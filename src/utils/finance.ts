import type { Transaction } from "@/types";

export type Summary = {
  income: number;
  expense: number;
  balance: number;
};

export type CategoryTotal = {
  category: string;
  amount: number;
  percentage: number;
};

export type DailyFlow = {
  day: string;
  income: number;
  expense: number;
  balance: number;
};

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function getCurrentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: string,
) {
  return transactions.filter((transaction) => transaction.date.startsWith(month));
}

export function calculateSummary(transactions: Transaction[]): Summary {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        return {
          ...totals,
          income: totals.income + transaction.amount,
          balance: totals.balance + transaction.amount,
        };
      }

      return {
        ...totals,
        expense: totals.expense + transaction.amount,
        balance: totals.balance - transaction.amount,
      };
    },
    {
      income: 0,
      expense: 0,
      balance: 0,
    },
  );
}

export function calculateExpenseCategories(
  transactions: Transaction[],
): CategoryTotal[] {
  const expenses = transactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const totalExpense = expenses.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );
  const totalsByCategory = expenses.reduce<Record<string, number>>(
    (totals, transaction) => ({
      ...totals,
      [transaction.category]:
        (totals[transaction.category] ?? 0) + transaction.amount,
    }),
    {},
  );

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((first, second) => second.amount - first.amount);
}

export function calculateDailyFlow(
  transactions: Transaction[],
  month: string,
): DailyFlow[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  let runningBalance = 0;

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dayKey = `${month}-${String(day).padStart(2, "0")}`;
    const transactionsOfDay = transactions.filter(
      (transaction) => transaction.date === dayKey,
    );
    const income = transactionsOfDay
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = transactionsOfDay
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    runningBalance += income - expense;

    return {
      day: String(day).padStart(2, "0"),
      income,
      expense,
      balance: runningBalance,
    };
  });
}
