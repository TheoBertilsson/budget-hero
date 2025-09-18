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
  incomes: number | null;
  expenses: number | null;
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

export type MonthlySavings = {
  [year: string]: {
    [month: string]: {
      goal: number; // monthly goal
      paid: number; // how much was actually saved
    };
  };
};

export type SavingGoalType = {
  id: string;
  name: string;
  type: "main" | "sub";
  total: number;
  goal: number;
  timeInMonths: number;
  hasDeadline: boolean;
  monthly: MonthlySavings;
};
export type SavingGoalContextType = {
  goals: SavingGoalType[];
  mainGoal: SavingGoalType | null;
  subGoals: SavingGoalType[];
  addSavingsGoal: (params: AddSavingsGoalParams) => Promise<void>;
  addPayment: (
    goalId: string,
    year: string,
    month: string,
    amount: number
  ) => Promise<void>;
  loading: boolean;
};

export type AddSavingsGoalParams =
  | {
      goal: number;
      name: string;
      type: "main" | "sub";
      hasDeadline: true;
      timeInMonths: number;
      monthlyGoal?: never;
    }
  | {
      goal: number;
      name: string;
      type: "main" | "sub";
      hasDeadline: false;
      timeInMonths?: never;
      monthlyGoal: number;
    };
