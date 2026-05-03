import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { getCurrentMonthValue, calculateSummary, filterTransactionsByMonth } from "@/utils/finance";
import { subscribeToTransactions } from "@/services/transactions";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types";

type DashboardContextType = {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  balance: number;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions(user.uid, setTransactions);
    return unsub;
  }, [user]);

  const filteredTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );

  const summary = useMemo(() => calculateSummary(filteredTransactions), [filteredTransactions]);

  return (
    <DashboardContext.Provider 
      value={{ 
        selectedMonth, 
        setSelectedMonth, 
        transactions, 
        filteredTransactions,
        balance: summary.balance 
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de DashboardProvider.");
  }
  return context;
}
