"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { FinanceContextType, MonthlyFinance } from "../types";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDate } from "./DateContext";

const FinanceContext = createContext<FinanceContextType>({
  finance: null,
  loading: true,
  setFinance: async () => {},
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [finance, setFinanceState] = useState<MonthlyFinance | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <FinanceContext.Provider value={{ finance, loading, setFinance }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
