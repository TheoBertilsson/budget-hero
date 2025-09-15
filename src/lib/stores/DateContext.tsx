"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { DateContextType } from "../types";

const DateContext = createContext<DateContextType>({
  year: new Date().getFullYear().toString(),
  month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
  setYear: () => {},
  setMonth: () => {},
});

export function DateProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );

  return (
    <DateContext.Provider value={{ year, month, setYear, setMonth }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  return useContext(DateContext);
}
