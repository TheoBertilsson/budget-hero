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
  MonthlyFinance,
  Income,
  Save,
  SavingGoalType,
  MonthlySavings,
} from "../types";
import { auth, db } from "../firebase";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useDate } from "./DateContext";
import { getCurrentUser } from "../utils";
import { useSavingsGoal } from "./SavingsGoal";

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
  removeExpenses: async () => {},
  removeIncomes: async () => {},
  removeSaves: async () => {},
  updateExpenses: async () => {},
  updateIncomes: async () => {},
  updateSaves: async () => {},
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { year, month } = useDate();
  const { updateGoal, goals } = useSavingsGoal();

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
    const user = getCurrentUser();

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
    const user = getCurrentUser();

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

  const addIncome = async (income: Income) => {
    const user = getCurrentUser();
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
  const addSavings = async (year: string, month: string, saving: Save) => {
    const user = getCurrentUser();
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

  const removeIncomes = async (indices: number[]) => {
    const user = getCurrentUser();
    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    const updatedIncomes = incomes.filter((_, i) => !indices.includes(i));

    await updateDoc(financeRef, { incomes: updatedIncomes });

    setFinanceState((prev) =>
      prev ? { ...prev, incomes: updatedIncomes } : prev
    );
  };

  const removeSaves = async (indices: number[]) => {
    const user = getCurrentUser();
    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    const updatedSaves = savings.filter((_, i) => !indices.includes(i));
    const removedSaves = indices.map((i) => savings[i]);

    const savesByGoal = removedSaves.reduce<
      Record<string, typeof removedSaves>
    >((acc, save) => {
      acc[save.goalId] = acc[save.goalId] || [];
      acc[save.goalId].push(save);
      return acc;
    }, {});

    Object.entries(savesByGoal).forEach(([goalId, saves]) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("No goal found");

      const monthlyGoal = goal.monthly[year][month];
      if (!monthlyGoal) throw new Error("Monthly goal not found");

      const removedTotal = saves.reduce((sum, s) => sum + s.price, 0);

      const updatedGoal: SavingGoalType = {
        ...goal,
        total: goal.total - removedTotal,
        monthly: {
          ...goal.monthly,
          [year]: {
            ...goal.monthly[year],
            [month]: {
              ...monthlyGoal,
              paid: monthlyGoal.paid - removedTotal,
            },
          },
        },
      };

      updateGoal(
        updatedGoal,
        updatedGoal.id,
        !updatedGoal.hasDeadline
          ? updatedGoal.monthly[year][month].goal
          : undefined
      );
    });

    await updateDoc(financeRef, { savings: updatedSaves });

    setFinanceState((prev) =>
      prev ? { ...prev, savings: updatedSaves } : prev
    );
  };

  const removeExpenses = async (indices: number[]) => {
    const user = getCurrentUser();

    if (!user) throw new Error("No user signed in");

    const financeRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      `${year}-${month}`
    );

    const updatedExpenses = expenses.filter((_, i) => !indices.includes(i));

    await updateDoc(financeRef, { expenses: updatedExpenses });

    setFinanceState((prev) =>
      prev ? { ...prev, expenses: updatedExpenses } : prev
    );
  };

  const updateIncomes = async (index: number, updatedIncome: Income) => {
    const user = getCurrentUser();
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

    if (index < 0 || index >= incomes.length) {
      throw new Error("Invalid income index");
    }

    const updatedIncomes = [...incomes];
    updatedIncomes[index] = updatedIncome;

    await updateDoc(financeRef, { incomes: updatedIncomes });

    setFinanceState((prev) =>
      prev ? { ...prev, incomes: updatedIncomes } : prev
    );
  };

  const updateSaves = async (index: number, updatedSave: Save) => {
    const user = getCurrentUser();
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
    const save = data.savings[index];

    const goal = goals.find((goal) => goal.id === save.goalId);
    if (!goal) throw new Error("No goal found");
    const monthlyGoal = goal.monthly[year][month];

    if (!monthlyGoal) throw new Error("Monthly goal not found");
    const totalMonthlyPaid = monthlyGoal.paid - save.price + updatedSave.price;
    const totalPaid = goal.total - save.price + updatedSave.price;

    if (index < 0 || index >= data.savings.length) {
      throw new Error("Invalid income index");
    }

    const updatedGoal: SavingGoalType = {
      ...goal,
      total: totalPaid,
      monthly: {
        ...goal.monthly,
        [year]: {
          ...goal.monthly?.[year],
          [month]: {
            ...monthlyGoal,
            paid: totalMonthlyPaid,
          },
        },
      },
    };
    const updatedSavings = [...savings];
    updatedSavings[index] = updatedSave;

    await updateDoc(financeRef, { savings: updatedSavings });
    updateGoal(
      updatedGoal,
      updatedGoal.id,
      !updatedGoal.hasDeadline
        ? updatedGoal.monthly[year][month].goal
        : undefined
    );

    setFinanceState((prev) =>
      prev ? { ...prev, savings: updatedSavings } : prev
    );
  };

  const updateExpenses = async (index: number, updatedExpense: Expense) => {
    const user = getCurrentUser();
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
    const deposits = data.expenses || [];

    if (index < 0 || index >= deposits.length) {
      throw new Error("Invalid income index");
    }

    const updatedExpenses = [...expenses];
    updatedExpenses[index] = updatedExpense;

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
        removeExpenses,
        removeIncomes,
        removeSaves,
        updateExpenses,
        updateIncomes,
        updateSaves,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
