export type Finance = {
  income: number;
  savings: number;
  variedIncome: boolean;
};

export type FinanceContextType = {
  finance: Finance | null;
  loading: boolean;
  setFinance: (data: Finance) => Promise<void>;
};
