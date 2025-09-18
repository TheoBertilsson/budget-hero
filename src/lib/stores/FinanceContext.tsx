"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Expense,
  FinanceContextType,
  FinanceData,
  MonthlyFinance,
  Payment,
  Saving,
} from "../types";
import { auth, db } from "../firebase";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useDate } from "./DateContext";

const FinanceContext = createContext<FinanceContextType>({
  finance: null,
  incomes: [],
  expenses: [],
  savings: [],
  incomeTotal: 0,
  expenseTotal: 0,
  savingsTotal: 0,
  loading: true,
  setFinance: async () => {},
  addExpense: async () => {},
  addIncome: async () => {},
  addSavings: async () => {},
  removeExpense: async () => {},
  removeIncome: async () => {},
  removeSave: async () => {},
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { year, month } = useDate();
  const [finance, setFinanceState] = useState<MonthlyFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const incomes = finance?.incomes || [];
  const expenses = finance?.expenses || [];
  const savings = finance?.savings || [];
  const incomeTotal =
    finance?.incomes?.reduce((sum, curr) => sum + curr.price, 0) || 0;
  const expenseTotal =
    finance?.expenses?.reduce((sum, curr) => sum + curr.price, 0) || 0;
  const savingsTotal =
    finance?.savings?.reduce((sum, curr) => sum + curr.price, 0) || 0;

  useEffect(() => {
    const fetchFinance = async () => {
      const user = auth.currentUser;
      if (!user) {
        setFinanceState(null);
        setLoading(false);
        return;
      }

      const financeRef = doc(
        db,
        "users",
        user.uid,
        "finance",
        `${year}-${month}`
      );
      const snap = await getDoc(financeRef);

      if (snap.exists()) {
        setFinanceState(snap.data() as MonthlyFinance);
      } else {
        setFinanceState({ incomes: [], expenses: [], savings: [] });
      }

      setLoading(false);
    };

    fetchFinance();
  }, [year, month]);

  const setFinance = async (data: MonthlyFinance) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );
    await setDoc(financeRef, data, { merge: true });

    setFinanceState(data);
  };

  const addExpense = async (expense: Expense) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    await setDoc(
      financeRef,
      { expenses: arrayUnion(expense) },
      { merge: true }
    );

    setFinanceState((prev) =>
      prev
        ? {
            ...prev,
            expenses: prev.expenses ? [...prev.expenses, expense] : [expense],
          }
        : {
            incomes: [],
            expenses: [expense],
            savings: [],
          }
    );
  };

  const addIncome = async (income: Payment) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    await setDoc(financeRef, { incomes: arrayUnion(income) }, { merge: true });

    setFinanceState((prev) =>
      prev
        ? {
            ...prev,
            incomes: prev.incomes ? [...prev.incomes, income] : [income],
          }
        : {
            incomes: [income],
            expenses: [],
            savings: [],
          }
    );
  };
  const addSavings = async (year: string, month: string, saving: Saving) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    await setDoc(financeRef, { savings: arrayUnion(saving) }, { merge: true });

    setFinanceState((prev) =>
      prev
        ? {
            ...prev,
            savings: prev.savings ? [...prev.savings, saving] : [saving],
          }
        : {
            incomes: [],
            expenses: [],
            savings: [saving],
          }
    );
  };

  const removeIncome = async (index: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );
    const snap = await getDoc(financeRef);

    if (!snap.exists()) throw new Error("Finance document not found");

    const data = snap.data() as MonthlyFinance;
    const incomes = data.incomes || [];

    const updatedIncomes = incomes.filter((_, i) => i !== index);

    await updateDoc(financeRef, { incomes: updatedIncomes });

    setFinanceState((prev) =>
      prev ? { ...prev, incomes: updatedIncomes } : prev
    );
  };

  const removeSave = async (index: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );
    const snap = await getDoc(financeRef);

    if (!snap.exists()) throw new Error("Finance document not found");

    const data = snap.data() as MonthlyFinance;
    const savings = data.savings || [];

    const updatedSaves = savings.filter((_, i) => i !== index);

    await updateDoc(financeRef, { savings: updatedSaves });

    setFinanceState((prev) =>
      prev ? { ...prev, savings: updatedSaves } : prev
    );
  };

  const removeExpense = async (index: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );
    const snap = await getDoc(financeRef);

    if (!snap.exists()) throw new Error("Finance document not found");

    const data = snap.data() as MonthlyFinance;
    const expenses = data.expenses || [];

    const updatedExpenses = expenses.filter((_, i) => i !== index);

    await updateDoc(financeRef, { expenses: updatedExpenses });

    setFinanceState((prev) =>
      prev ? { ...prev, expenses: updatedExpenses } : prev
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        finance,
        incomes,
        expenses,
        savings,
        incomeTotal,
        expenseTotal,
        savingsTotal,
        loading,
        setFinance,
        addExpense,
        addIncome,
        addSavings,
        removeExpense,
        removeIncome,
        removeSave,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
