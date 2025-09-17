"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Expense, FinanceContextType, MonthlyFinance, Payment } from "../types";
import { auth, db } from "../firebase";
import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { useDate } from "./DateContext";

const FinanceContext = createContext<FinanceContextType>({
  finance: null,
  incomes: null,
  expenses: null,
  loading: true,
  setFinance: async () => {},
  addExpense: async () => {},
  addIncome: async () => {},
  addSavings: async () => {},
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [finance, setFinanceState] = useState<MonthlyFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const incomes =
    finance?.incomes?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  const expenses =
    finance?.expenses?.reduce((sum, curr) => sum + curr.cost, 0) || 0;

  const { year, month } = useDate();

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
        setFinanceState({ incomes: [], expenses: [] }); // default if doc missing
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
            incomes: null,
            expenses: [expense],
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
            expenses: null,
          }
    );
  };
  const addSavings = async (year: string, month: string, savings: Payment) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    const expense = { ...savings, category: "Savings" };
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
        : { incomes: null, expenses: [expense] }
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        finance,
        incomes,
        expenses,
        loading,
        setFinance,
        addExpense,
        addIncome,
        addSavings,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
