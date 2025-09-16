export type MonthlyFinance = {
  income: number | null;
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
export type SavingsGoalContextType = {
  savingsGoal: number | null;
  monthlySavingsGoal: number | null;
  totalSavings: number;
  setSavingsGoal: (goal: number) => void;
  setMonthlySavingsGoal: (goal: number) => void;
  setTotalSavings: (price: number) => void;
  loading: boolean;
};
export type SavingsGoalType = {
  savingsGoal: number | null;
  monthlySavingsGoal: number | null;
  loading: boolean;
};
