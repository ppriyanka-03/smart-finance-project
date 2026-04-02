import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Transaction {
  id: string;
  type: 'payment' | 'emi' | 'cashback' | 'income';
  description: string;
  amount: number;
  date: string;
  method?: string;
  recipient?: string;
  cashbackEarned?: number;
}

export interface EMILoan {
  id: string;
  name: string;
  principal: number;
  rate: number;
  tenure: number;
  emi: number;
  totalInterest: number;
  totalPayable: number;
  paidMonths: number;
  startDate: string;
}

interface FinanceState {
  totalBalance: number;
  walletBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  investmentValue: number;
  totalCashback: number;
  monthCashback: number;
  transactions: Transaction[];
  emiLoans: EMILoan[];
}

interface FinanceContextType extends FinanceState {
  makePayment: (recipient: string, amount: number, method: string, description: string) => { success: boolean; cashback: number };
  addEMI: (loan: Omit<EMILoan, 'id' | 'paidMonths' | 'startDate'>) => void;
  payEMI: (loanId: string) => boolean;
}

const defaultState: FinanceState = {
  totalBalance: 285400,
  walletBalance: 42500,
  monthlyIncome: 125000,
  monthlyExpenses: 68500,
  savings: 156000,
  investmentValue: 340000,
  totalCashback: 3250,
  monthCashback: 850,
  transactions: [
    { id: '1', type: 'income', description: 'Salary Credit', amount: 125000, date: '2026-02-01' },
  ],
  emiLoans: [],
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {

  // ✅ LOAD DATA SAFELY
  const [state, setState] = useState<FinanceState>(() => {
    try {
      const stored = localStorage.getItem('sf_finance');
      return stored ? JSON.parse(stored) : defaultState;
    } catch (error) {
      console.error("Storage error:", error);
      return defaultState;
    }
  });

  // ✅ AUTO SAVE DATA
  useEffect(() => {
    localStorage.setItem('sf_finance', JSON.stringify(state));
  }, [state]);

  // 💸 PAYMENT FUNCTION
  const makePayment = useCallback((recipient: string, amount: number, method: string, description: string) => {
    if (amount > state.totalBalance) return { success: false, cashback: 0 };

    let cashbackRate = 0;
    if (method === 'Wallet') cashbackRate = 0.05;
    else if (method === 'Card') cashbackRate = 0.02;
    else if (method === 'Net Banking') cashbackRate = 0.01;

    const cashback = Math.min(amount * cashbackRate, 500);
    const date = new Date().toISOString().split('T')[0];
    const txId = Date.now().toString();

    setState(prev => {
      const newTx: Transaction = {
        id: txId,
        type: 'payment',
        description,
        amount,
        date,
        method,
        recipient,
        cashbackEarned: cashback > 0 ? cashback : undefined,
      };

      const updatedTransactions = [newTx, ...prev.transactions];

      if (cashback > 0) {
        updatedTransactions.unshift({
          id: txId + '_cb',
          type: 'cashback',
          description: `Cashback from ${description}`,
          amount: cashback,
          date,
        });
      }

      return {
        ...prev,
        totalBalance: prev.totalBalance - amount + cashback,
        walletBalance: method === 'Wallet'
          ? prev.walletBalance - amount + cashback
          : prev.walletBalance + cashback,
        monthlyExpenses: prev.monthlyExpenses + amount,
        totalCashback: prev.totalCashback + cashback,
        monthCashback: prev.monthCashback + cashback,
        transactions: updatedTransactions,
      };
    });

    return { success: true, cashback };
  }, [state.totalBalance]);

  // 🏦 ADD EMI
  const addEMI = useCallback((loan: Omit<EMILoan, 'id' | 'paidMonths' | 'startDate'>) => {
    const date = new Date().toISOString().split('T')[0];

    setState(prev => ({
      ...prev,
      emiLoans: [
        ...prev.emiLoans,
        {
          ...loan,
          id: Date.now().toString(),
          paidMonths: 0,
          startDate: date,
        }
      ],
    }));
  }, []);

  // 💳 PAY EMI
  const payEMI = useCallback((loanId: string) => {
    const loan = state.emiLoans.find(l => l.id === loanId);
    if (!loan || loan.paidMonths >= loan.tenure || loan.emi > state.totalBalance) return false;

    const date = new Date().toISOString().split('T')[0];

    setState(prev => ({
      ...prev,
      totalBalance: prev.totalBalance - loan.emi,
      monthlyExpenses: prev.monthlyExpenses + loan.emi,
      emiLoans: prev.emiLoans.map(l =>
        l.id === loanId ? { ...l, paidMonths: l.paidMonths + 1 } : l
      ),
      transactions: [
        {
          id: Date.now().toString(),
          type: 'emi',
          description: `${loan.name} EMI Payment`,
          amount: loan.emi,
          date,
        },
        ...prev.transactions,
      ],
    }));

    return true;
  }, [state.emiLoans, state.totalBalance]);

  return (
    <FinanceContext.Provider value={{ ...state, makePayment, addEMI, payEMI }}>
      {children}
    </FinanceContext.Provider>
  );
};

// ✅ HOOK
export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};