"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AddSavingsGoalParams,
  SavingGoalContextType,
  SavingGoalType,
} from "../types";
import { useDate } from "./DateContext";
import { auth, db } from "../firebase";
import {
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const SavingContext = createContext<SavingGoalContextType | undefined>(
  undefined
);

export function SavingsProvider({ children }: { children: ReactNode }) {
  const { year, month } = useDate();
  const [goals, setGoals] = useState<SavingGoalType[]>([]);
  const mainGoal = goals.find((goal) => goal.type === "main") || null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const savingGoalRef = doc(
        db,
        "users",
        user.uid,
        "finance",
        "savingGoals"
      );
      const snap = await getDoc(savingGoalRef);

      if (snap.exists()) {
        const data = snap.data();
        setGoals(data.goals || []);
      } else {
        setGoals([]);
      }
      setLoading(false);
    };
    fetchSavings();
  }, [year, month]);

  const addSavingsGoal = async (params: AddSavingsGoalParams) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    setLoading(true);

    const savingGoalsRef = doc(db, "users", user.uid, "finance", "savingGoals");
    const snap = await getDoc(savingGoalsRef);
    const data = snap.exists() ? snap.data() : { goals: [] };
    const goals: SavingGoalType[] = data.goals || [];

    // If adding a new main goal, downgrade any existing main goal to sub
    if (params.type === "main") {
      goals.forEach((g) => {
        if (g.type === "main") g.type = "sub";
      });
    }

    const newGoalId = uuidv4();
    const calculatedTime =
      !params.timeInMonths && params.monthlyGoal
        ? Math.ceil(params.goal / params.monthlyGoal)
        : params.timeInMonths || 0;

    const newGoal: SavingGoalType = {
      id: newGoalId,
      type: params.type,
      total: 0,
      goal: params.goal,
      name: params.name,
      hasDeadline: true,
      timeInMonths: calculatedTime, // required because hasDeadline is true
      monthly: {},
    };

    await setDoc(
      savingGoalsRef,
      { ...goals, goals: arrayUnion(newGoal) },
      { merge: true }
    );

    setGoals((prev) => [...prev, newGoal]);
    setLoading(false);
    setMonthlySavingsGoal(
      newGoalId,
      params.goal,
      calculatedTime,
      Number(year),
      Number(month)
    );
  };

  const addPayment = async (
    goalId: string,
    year: string,
    month: string,
    amount: number
  ) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(db, "users", user.uid, "finance", "savingGoals");

    let updatedGoal: SavingGoalType | null = null;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(savingGoalRef);
      if (!snap.exists()) throw new Error("Saving goals document not found");

      const data = snap.data();
      const goals: SavingGoalType[] = data.goals || [];

      const goalIndex = goals.findIndex((g) => g.id === goalId);
      if (goalIndex === -1) throw new Error("Goal not found");

      const goal = { ...goals[goalIndex] };

      if (!goal.monthly[year]) goal.monthly[year] = {};
      if (!goal.monthly[year][month])
        goal.monthly[year][month] = { goal: goal.goal, paid: 0 };

      goal.monthly[year][month].paid += amount;
      goal.total += amount;

      if (goal.hasDeadline) {
        const months = Object.entries(goal.monthly)
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

        const currentGoal = goal.monthly[year][month].goal ?? 0;
        const currentPaid = goal.monthly[year][month].paid;
        const leftover = Math.max(currentGoal - currentPaid, 0);

        const remainingGoal = goal.goal - goal.total + leftover;

        if (remainingGoal > 0 && remainingMonths.length > 0) {
          const newMonthlyGoal = Math.ceil(
            remainingGoal / remainingMonths.length
          );
          remainingMonths.forEach(({ year: y, month: m }) => {
            if (!goal.monthly[y]) goal.monthly[y] = {};
            if (!goal.monthly[y][m]) goal.monthly[y][m] = { goal: 0, paid: 0 };
            goal.monthly[y][m].goal = newMonthlyGoal;
          });
        }
      }

      const updatedGoals = [...goals];
      updatedGoals[goalIndex] = goal;

      tx.set(savingGoalRef, { goals: updatedGoals }, { merge: true });

      updatedGoal = goal;
    });

    if (updatedGoal) {
      setGoals((prev) =>
        prev.map((g) => (g.id === updatedGoal!.id ? updatedGoal! : g))
      );
    }
  };

  return (
    <SavingContext.Provider
      value={{ goals, mainGoal, addSavingsGoal, addPayment, loading }}
    >
      {children}
    </SavingContext.Provider>
  );
}
export function useSavingsGoal() {
  const ctx = useContext(SavingContext);
  if (!ctx)
    throw new Error("useSavingsGoal must be used within a SavingsProvider");
  return ctx;
}

const setMonthlySavingsGoal = async (
  goalId: string,
  totalGoal: number,
  numberOfMonths: number,
  startYear: number,
  startMonth: number
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user signed in");

  const savingGoalsRef = doc(db, "users", user.uid, "finance", "savingGoals");
  const snap = await getDoc(savingGoalsRef);

  if (!snap.exists()) throw new Error("Saving goals document does not exist");

  const data = snap.data();
  const goals: NewSavingGoalType[] = data.goals || [];

  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex === -1) throw new Error("Goal not found");

  const newMonthlySavings: (typeof goals)[number]["monthly"] = {};
  let remainingGoal = totalGoal;
  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < numberOfMonths; i++) {
    let monthlyGoal =
      i === numberOfMonths - 1
        ? remainingGoal
        : Math.floor(totalGoal / numberOfMonths);
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

  // Update the goal in the array
  const updatedGoals = [...goals];
  updatedGoals[goalIndex] = {
    ...updatedGoals[goalIndex],
    monthly: newMonthlySavings,
  };

  await setDoc(savingGoalsRef, { goals: updatedGoals }, { merge: true });
};
