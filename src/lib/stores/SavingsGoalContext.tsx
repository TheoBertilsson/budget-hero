"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  MonthlySavings,
  Payment,
  SavingsGoalContextType,
  SavingsGoalType,
} from "../types";
import { auth, db } from "../firebase";
import {
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";

const SavingContext = createContext<SavingsGoalContextType | undefined>(
  undefined
);

export function SavingsProvider({ children }: { children: ReactNode }) {
  const [savingsGoal, setSavingsGoalState] = useState<number | null>(null);
  const [monthlySavingsGoal, setMonthlySavingsGoalState] =
    useState<MonthlySavings | null>(null);
  const [totalSavings, setTotalSavingsState] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");
      const snap = await getDoc(savingGoalRef);

      if (snap.exists()) {
        const data = snap.data();
        setSavingsGoalState(data.goal ?? null);
        setMonthlySavingsGoalState(data.monthly ?? null);
        setTotalSavingsState(data.total ?? 0);
      }
      setLoading(false);
    };
    fetchSavings();
  }, []);

  const setSavingsGoal = async (goal: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    setLoading(true);

    const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");
    await setDoc(savingGoalRef, { goal: goal }, { merge: true });

    setSavingsGoalState(goal);
    setLoading(false);
  };

  const setMonthlySavingsGoal = async (
    totalGoal: number,
    numberOfMonths: number,
    startYear: number,
    startMonth: number
  ) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");

    const newMonthlySavings: MonthlySavings = {};
    let remainingGoal = totalGoal;
    let year = startYear;
    let month = startMonth;

    for (let i = 0; i < numberOfMonths; i++) {
      const monthlyGoal = Math.ceil(totalGoal / numberOfMonths);
      if (!newMonthlySavings[year]) newMonthlySavings[year] = {};
      newMonthlySavings[year][month.toString().padStart(2, "0")] = {
        goal: monthlyGoal,
        paid: 0,
      };
      remainingGoal -= monthlyGoal;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    await setDoc(
      savingGoalRef,
      { monthly: newMonthlySavings },
      { merge: true }
    );
    setMonthlySavingsGoalState(newMonthlySavings);
  };

  const setTotalSavings = async (total: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");

    await setDoc(savingGoalRef, { total: total }, { merge: true });
    setTotalSavingsState(total);
  };

  const addPayment = async (year: string, month: string, savings: Payment) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");
    const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(savingGoalRef);
      if (!snap.exists()) throw new Error("Savings data not found");

      const data = snap.data() as SavingsGoalType;
      const { goal, total = 0, monthly } = data;

      if (!monthly || !goal || total === null) return;

      if (!monthly[year]) monthly[year] = {};
      if (!monthly[year][month]) monthly[year][month] = { goal: 0, paid: 0 };

      monthly[year][month].paid += savings.cost;

      const currentGoal = monthly[year][month].goal ?? 0;
      const currentPaid = monthly[year][month].paid;
      const leftover = Math.max(currentGoal - currentPaid, 0);

      const months = Object.entries(monthly)
        .flatMap(([y, monthsObj]) =>
          Object.keys(monthsObj).map((m) => ({ year: y, month: m }))
        )
        .sort(
          (a, b) =>
            new Date(`${a.year}-${a.month}-01`).getTime() -
            new Date(`${b.year}-${b.month}-01`).getTime()
        );

      const remainingMonths = months.filter(
        ({ year: y, month: m }) => !(y === year && m === month)
      );

      const newTotal = total + savings.cost;
      const remainingGoal = goal - newTotal + leftover;
      if (remainingGoal > 0 && remainingMonths.length > 0) {
        const newMonthlyGoal = Math.ceil(
          remainingGoal / remainingMonths.length
        );
        remainingMonths.forEach(({ year: y, month: m }) => {
          if (!monthly[y]) monthly[y] = {};
          if (!monthly[y][m]) monthly[y][m] = { goal: 0, paid: 0 };
          monthly[y][m].goal = newMonthlyGoal;
        });
      }

      tx.set(savingGoalRef, { total: newTotal, monthly }, { merge: true });
      setTotalSavingsState(newTotal);
      setMonthlySavingsGoalState(monthly);
    });
  };

  const value: SavingsGoalContextType = {
    savingsGoal,
    monthlySavingsGoal,
    totalSavings,
    setSavingsGoal,
    setMonthlySavingsGoal,
    setTotalSavings,
    addPayment,
    loading,
  };

  return (
    <SavingContext.Provider value={value}>{children}</SavingContext.Provider>
  );
}

export function useSavingsGoal() {
  const ctx = useContext(SavingContext);
  if (!ctx)
    throw new Error("useSavingsGoal must be used within a SavingsProvider");
  return ctx;
}
