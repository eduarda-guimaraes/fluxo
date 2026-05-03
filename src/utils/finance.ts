import type {
  Card,
  CreditTransaction,
  Invoice,
  SavingsBox,
  Transaction,
} from "@/types";

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

export function calculateSavedTotal(savingsBoxes: SavingsBox[]) {
  return savingsBoxes.reduce((total, box) => total + box.amount, 0);
}

export function getInvoiceId(cardId: string, monthValue: string) {
  return `${cardId}-${monthValue}`;
}

export function getInvoicePeriod(card: Card, monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const startDate = new Date(year, month - 2, card.closingDay + 1);
  const endDate = new Date(year, month - 1, card.closingDay);
  const dueMonthOffset = card.dueDay <= card.closingDay ? 0 : -1;
  const dueDate = new Date(year, month + dueMonthOffset, card.dueDay);

  return {
    start: startDate.toISOString().slice(0, 10),
    end: endDate.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
  };
}

export function getCreditTransactionsForInvoice(
  card: Card,
  creditTransactions: CreditTransaction[],
  monthValue: string,
) {
  const period = getInvoicePeriod(card, monthValue);

  return creditTransactions.filter(
    (transaction) =>
      transaction.cardId === card.id &&
      transaction.date >= period.start &&
      transaction.date <= period.end,
  );
}

export function buildInvoice(
  card: Card,
  creditTransactions: CreditTransaction[],
  monthValue: string,
  paid = false,
): Invoice {
  const [year, month] = monthValue.split("-").map(Number);
  const invoiceTransactions = getCreditTransactionsForInvoice(
    card,
    creditTransactions,
    monthValue,
  );
  const period = getInvoicePeriod(card, monthValue);
  const total = invoiceTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return {
    id: getInvoiceId(card.id, monthValue),
    cardId: card.id,
    month,
    year,
    total,
    dueDate: period.dueDate,
    paid,
  };
}

export function calculatePendingInvoicesTotal(invoices: Invoice[]) {
  return invoices.reduce(
    (total, invoice) => total + (invoice.paid ? 0 : invoice.total),
    0,
  );
}
