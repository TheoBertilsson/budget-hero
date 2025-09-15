export type MonthlyFinance = {
  income: number;
  savingsGoal: number;
  expenses: Expense[] | null;
};

export type Expense = {
  item: string;
  cost: number;
  category: string;
};

export type FinanceData = {
  [year: string]: {
    [month: string]: MonthlyFinance | null;
  };
};

export type FinanceContextType = {
  finance: MonthlyFinance | null;
  loading: boolean;
  setFinance: (data: MonthlyFinance) => Promise<void>;
};

export type DateContextType = {
  year: string;
  month: string;
  setYear: (year: string) => void;
  setMonth: (month: string) => void;
};
