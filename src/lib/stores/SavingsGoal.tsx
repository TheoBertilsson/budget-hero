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
  MonthlySavings,
  SavingGoalContextType,
  SavingGoalType,
} from "../types";
import { useDate } from "./DateContext";
import { auth, db } from "../firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ceilToOneDecimal, getCurrentUser } from "../utils";

const SavingContext = createContext<SavingGoalContextType | undefined>(
  undefined
);

export function SavingsProvider({ children }: { children: ReactNode }) {
  const { year, month } = useDate();
  const [goals, setGoalsState] = useState<SavingGoalType[]>([]);
  const mainGoal = goals.find((goal) => goal.type === "main") || null;
  const subGoals = goals.filter((goal) => goal.type === "sub");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      const user = getCurrentUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const savingsCollection = collection(
        db,
        "users",
        user.uid,
        "finance",
        "savings",
        "goals"
      );

      const querySnap = await getDocs(savingsCollection);
      const allGoals: SavingGoalType[] = querySnap.docs.map((docSnap) => ({
        ...(docSnap.data() as SavingGoalType),
        id: docSnap.id,
      }));

      setGoalsState(allGoals);
      setLoading(false);
    };
    fetchSavings();
  }, [year, month]);

  const addSavingsGoal = async (params: AddSavingsGoalParams) => {
    const user = getCurrentUser();

    if (!user) throw new Error("No user signed in");

    setLoading(true);

    const savingsCollection = collection(
      db,
      "users",
      user.uid,
      "finance",
      "savings",
      "goals"
    );

    if (params.type === "main") {
      const q = query(savingsCollection, where("type", "==", "main"));
      const querySnap = await getDocs(q);

      for (const docSnap of querySnap.docs) {
        await updateDoc(docSnap.ref, { type: "sub" });
      }
      setGoalsState((prev) =>
        prev.map((g) => (g.type === "main" ? { ...g, type: "sub" } : g))
      );
    }

    const calculatedTime =
      !params.timeInMonths && params.monthlyGoal
        ? params.goal / params.monthlyGoal
        : params.timeInMonths || 0;

    const newGoal: SavingGoalType = {
      id: "",
      type: params.type,
      total: 0,
      goal: params.goal,
      name: params.name,
      hasDeadline: true,
      timeInMonths: calculatedTime, // required because hasDeadline is true
      monthly: {},
      createdAt: Timestamp.now(),
    };

    const monthlyGoal = params.monthlyGoal ? params.monthlyGoal : undefined;
    const docRef = await addDoc(savingsCollection, newGoal);
    await setDoc(docRef, { id: docRef.id }, { merge: true });

    const monthlySavings = await setMonthlySavingsGoal(
      docRef.id,
      params.goal,
      calculatedTime,
      Number(year),
      Number(month),
      monthlyGoal
    );
    setGoalsState((prev) => [
      ...prev,
      { ...newGoal, id: docRef.id, monthly: monthlySavings },
    ]);

    setLoading(false);
  };

  const addPayment = async (
    goalId: string,
    year: string,
    month: string,
    amount: number
  ) => {
    const user = getCurrentUser();
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      "savings",
      "goals",
      goalId
    );

    let updatedGoal: SavingGoalType | null = null;

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(savingGoalRef);
      if (!snap.exists()) throw new Error("Saving goal not found");

      const goal = snap.data() as SavingGoalType;

      if (!goal.monthly[year]) goal.monthly[year] = {};
      if (!goal.monthly[year][month]) {
        goal.monthly[year][month] = { goal: goal.goal, paid: 0 };
      }

      goal.monthly[year][month].paid += amount;
      goal.total += amount;

      if (goal.hasDeadline) {
        const allMonths = Object.entries(goal.monthly)
          .flatMap(([y, monthsObj]) =>
            Object.keys(monthsObj).map((m) => ({ year: y, month: m }))
          )
          .sort(
            (a, b) =>
              new Date(`${a.year}-${a.month}-01`).getTime() -
              new Date(`${b.year}-${b.month}-01`).getTime()
          );

        const futureMonths = allMonths.filter(
          ({ year: y, month: m }) =>
            y > year || (y === year && Number(m) > Number(month))
        );

        const paidSoFar = goal.total;
        const remainingGoal = Math.max(goal.goal - paidSoFar, 0);

        if (remainingGoal > 0 && futureMonths.length > 0) {
          const newMonthlyGoal = Math.ceil(remainingGoal / futureMonths.length);

          futureMonths.forEach(({ year: y, month: m }) => {
            if (!goal.monthly[y]) goal.monthly[y] = {};
            if (!goal.monthly[y][m]) goal.monthly[y][m] = { goal: 0, paid: 0 };
            goal.monthly[y][m].goal = newMonthlyGoal;
          });
        } else if (remainingGoal <= 0) {
          futureMonths.forEach(({ year: y, month: m }) => {
            if (!goal.monthly[y]) goal.monthly[y] = {};
            if (!goal.monthly[y][m]) goal.monthly[y][m] = { goal: 0, paid: 0 };
            goal.monthly[y][m].goal = 0;
          });
        }
      }

      tx.set(savingGoalRef, goal, { merge: true });
      updatedGoal = goal;
    });

    if (updatedGoal) {
      setGoalsState((prev) =>
        prev.map((g) => (g.id === goalId ? updatedGoal! : g))
      );
    }
  };

  const setMonthlySavingsGoal = async (
    goalId: string,
    totalGoal: number,
    numberOfMonths: number,
    startYear: number,
    startMonth: number,
    monthlyGoal?: number
  ) => {
    const user = getCurrentUser();
    if (!user) throw new Error("No user signed in");

    const savingGoalRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      "savings",
      "goals",
      goalId
    );
    const snap = await getDoc(savingGoalRef);
    if (!snap.exists()) throw new Error("Saving goal does not exist");
    const goal = snap.data() as SavingGoalType;

    const pastMonths = filterMonthlySavings(
      goal.monthly,
      goal.createdAt.toDate(),
      new Date(startYear, startMonth, 1)
    );

    let remainingGoal = totalGoal;
    let year = startYear;
    let month = startMonth;

    const newMonthlySavings: SavingGoalType["monthly"] = {};

    for (let i = countMonths(pastMonths) - 1; i < numberOfMonths; i++) {
      const monthKey = month.toString().padStart(2, "0");

      if (!newMonthlySavings[year]) newMonthlySavings[year] = {};

      const prevPaid = goal.monthly?.[year]?.[monthKey]?.paid ?? 0;

      const newMonthlyGoal =
        i === numberOfMonths - 1
          ? remainingGoal
          : goal.hasDeadline || !monthlyGoal
          ? Math.ceil(totalGoal / numberOfMonths)
          : monthlyGoal;

      newMonthlySavings[year][monthKey] = {
        goal: newMonthlyGoal,
        paid: prevPaid,
      };

      remainingGoal -= newMonthlyGoal;

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    const mergedMonthly: SavingGoalType["monthly"] = { ...pastMonths };

    for (const year of Object.keys(newMonthlySavings)) {
      if (!mergedMonthly[year]) mergedMonthly[year] = {};
      mergedMonthly[year] = {
        ...mergedMonthly[year],
        ...newMonthlySavings[year],
      };
    }

    await updateDoc(savingGoalRef, {
      monthly: mergedMonthly,
    });

    return mergedMonthly;
  };

  const updateGoal = async (
    updatedGoal: SavingGoalType,
    id: string,
    monthlyGoal?: number
  ) => {
    const user = getCurrentUser();
    if (!user) throw new Error("No user signed in");

    setLoading(true);

    const savingsCollection = collection(
      db,
      "users",
      user.uid,
      "finance",
      "savings",
      "goals"
    );

    if (updatedGoal.type === "main") {
      const q = query(savingsCollection, where("type", "==", "main"));
      const querySnap = await getDocs(q);

      for (const docSnap of querySnap.docs) {
        if (docSnap.id !== id) {
          await updateDoc(docSnap.ref, { type: "sub" });
        }
      }

      setGoalsState((prev) =>
        prev.map((g) =>
          g.id !== id && g.type === "main" ? { ...g, type: "sub" } : g
        )
      );
    }

    const goalRef = doc(savingsCollection, id);
    await updateDoc(goalRef, updatedGoal);

    const newMonthly = await setMonthlySavingsGoal(
      updatedGoal.id,
      updatedGoal.goal,
      updatedGoal.timeInMonths,
      Number(year),
      Number(month),
      monthlyGoal
    );

    setGoalsState((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, ...updatedGoal, monthly: newMonthly } : g
      )
    );

    setLoading(false);
  };

  const removeGoal = async (id: string) => {
    const user = getCurrentUser();
    if (!user) throw new Error("No user signed in");

    const goalRef = doc(
      db,
      "users",
      user.uid,
      "finance",
      "savings",
      "goals",
      id
    );

    await deleteDoc(goalRef);
    setGoalsState((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <SavingContext.Provider
      value={{
        goals,
        mainGoal,
        subGoals,
        updateGoal,
        removeGoal,
        addSavingsGoal,
        addPayment,
        loading,
      }}
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

function filterMonthlySavings(
  savings: MonthlySavings,
  createdAt: Date,
  today: Date
): MonthlySavings {
  const result: MonthlySavings = {};

  // Normalize dates to first day of the month
  const start = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 1);

  for (const yearStr of Object.keys(savings)) {
    const year = parseInt(yearStr, 10);
    for (const monthStr of Object.keys(savings[yearStr])) {
      const month = parseInt(monthStr, 10); // 1–12
      const current = new Date(year, month - 1, 1);

      if (current >= start && current < end) {
        if (!result[yearStr]) {
          result[yearStr] = {};
        }
        result[yearStr][monthStr] = savings[yearStr][monthStr];
      }
    }
  }

  return result;
}

function countMonths(savings: MonthlySavings): number {
  let count = 0;
  for (const year of Object.keys(savings)) {
    count += Object.keys(savings[year]).length;
  }
  return count;
}
