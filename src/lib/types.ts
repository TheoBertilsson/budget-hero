export type MonthlyFinance = {
  incomes: Income[];
  expenses: Expense[];
  savings: Save[];
};

export type Save = {
  price: number;
  goal: string;
  goalId: string;
};
export type Expense = {
  name: string;
  price: number;
  category: string;
};
export type Income = {
  name: string;
  price: number;
};

export type FinanceData = {
  [year: string]: {
    [month: string]: MonthlyFinance | null;
  };
};

export type FinanceContextType = {
  finance: MonthlyFinance | null;
  incomes: Income[];
  expenses: Expense[];
  savings: Save[];
  incomeTotal: number;
  expenseTotal: number;
  savingsTotal: number;
  loading: boolean;
  setFinance: (data: MonthlyFinance) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  addIncome: (income: Income) => Promise<void>;
  addSavings: (year: string, month: string, savings: Save) => Promise<void>;
  removeExpense: (index: number) => Promise<void>;
  removeIncome: (index: number) => Promise<void>;
  removeSave: (index: number) => Promise<void>;
  updateExpenses: (index: number, updatedExpense: Expense) => Promise<void>;
  updateIncomes: (index: number, updatedIncome: Income) => Promise<void>;
  updateSaves: (index: number, updatedSave: Save) => Promise<void>;
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
  updateGoal: (
    goal: SavingGoalType,
    id: string,
    monthlyGoal?: number
  ) => Promise<void>;
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
