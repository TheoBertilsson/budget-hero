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
  updateDoc,
  where,
} from "firebase/firestore";
import { getCurrentUser } from "../utils";

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
        ? Math.ceil(params.goal / params.monthlyGoal)
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
    };

    const docRef = await addDoc(savingsCollection, newGoal);
    await setDoc(docRef, { id: docRef.id }, { merge: true });

    setGoalsState((prev) => [...prev, { ...newGoal, id: docRef.id }]);
    await setMonthlySavingsGoal(
      docRef.id,
      params.goal,
      calculatedTime,
      Number(year),
      Number(month)
    );

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
    startMonth: number
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

    if (!snap.exists()) throw new Error("Saving goals document does not exist");

    const goal = snap.data() as SavingGoalType;

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
    const updatedGoal = {
      ...goal,
      monthly: newMonthlySavings,
    };

    await setDoc(savingGoalRef, updatedGoal, { merge: true });

    setGoalsState((prev) =>
      prev.map((g) => (g.id === goalId ? { ...updatedGoal, id: goalId } : g))
    );
  };

  const updateGoal = async (
    goal: SavingGoalType,
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

    if (goal.type === "main") {
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

    let calculatedTime = goal.timeInMonths;
    if (monthlyGoal) {
      calculatedTime =
        !goal.timeInMonths && monthlyGoal
          ? Math.ceil(goal.goal / monthlyGoal)
          : goal.timeInMonths || 0;
    }

    const updatedGoal = {
      ...goal,
      timeInMonths: calculatedTime,
    };

    const goalRef = doc(savingsCollection, id);
    await updateDoc(goalRef, updatedGoal);

    setGoalsState((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g))
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
