"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Finance, FinanceContextType } from "../types";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const FinanceContext = createContext<FinanceContextType>({
  finance: null,
  loading: true,
  setFinance: async () => {},
});

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [finance, setFinanceState] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      const user = auth.currentUser;
      if (!user) {
        setFinanceState(null);
        setLoading(false);
        return;
      }

      const financeRef = doc(db, "users", user.uid, "settings", "finance");
      const snap = await getDoc(financeRef);

      if (snap.exists()) {
        setFinanceState(snap.data() as Finance);
      }
      setLoading(false);
    };

    fetchFinance();
  }, []);

  const setFinance = async (data: Finance) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    const financeRef = doc(db, "users", user.uid, "settings", "finance");
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
