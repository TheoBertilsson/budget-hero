export type MonthlyFinance = {
  incomes: Payment[] | null;
  expenses: Expense[] | null;
};

export type Expense = {
  item: string;
  cost: number;
  category: string;
};
export type Payment = {
  item: string;
  cost: number;
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
  addExpense: (expense: Expense) => Promise<void>;
  addIncome: (income: Payment) => Promise<void>;
  addSavings: (year: string, month: string, savings: Payment) => Promise<void>;
};

export type DateContextType = {
  year: string;
  month: string;
  setYear: (year: string) => void;
  setMonth: (month: string) => void;
};
export type SavingsGoalContextType = {
  savingsGoal: number | null;
  monthlySavingsGoal: MonthlySavings | null;
  totalSavings: number;
  setSavingsGoal: (goal: number) => void;
  setMonthlySavingsGoal: (
    totalGoal: number,
    numberOfMonths: number,
    startYear: number,
    startMonth: number
  ) => void;
  setTotalSavings: (price: number) => void;
  addPayment: (year: string, month: string, savings: Payment) => void;
  loading: boolean;
};
export type SavingsGoalType = {
  goal: number | null;
  monthly: MonthlySavings | null;
  total: number | null;
};

export type MonthlySavings = {
  [year: string]: {
    [month: string]: {
      goal: number; // monthly goal
      paid: number; // how much was actually saved
    };
  };
};
