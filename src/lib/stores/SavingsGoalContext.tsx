"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { MonthlySavings, SavingsGoalContextType } from "../types";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
        setSavingsGoalState(data.savingsGoal ?? null);
        setMonthlySavingsGoalState(data.monthlySavingsGoal ?? null);
        setTotalSavingsState(data.totalSavings ?? 0);
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
    await setDoc(savingGoalRef, { savingsGoal: goal }, { merge: true });

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
      { monthlySavings: newMonthlySavings },
      { merge: true }
    );
    setMonthlySavingsGoalState(newMonthlySavings);
  };

  const setTotalSavings = async (total: number) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(db, "users", user.uid, "finance", "savings");

    await setDoc(savingGoalRef, { totalSavings: total }, { merge: true });
  };

  const value: SavingsGoalContextType = {
    savingsGoal,
    monthlySavingsGoal,
    totalSavings,
    setSavingsGoal,
    setMonthlySavingsGoal,
    setTotalSavings,
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
