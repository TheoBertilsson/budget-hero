"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import FirstSetupCard from "@/components/FirstSetupCard";
import { FinanceProvider, useFinance } from "@/lib/stores/FinanceContext";
import { BudgetCard, SavingProgression } from "@/components/Dashboard";
import {
  SavingsProvider,
  useSavingsGoal,
} from "@/lib/stores/SavingsGoalContext";

function DashboardContent() {
  const { savingsGoal } = useSavingsGoal();

  return (
    <>
      {savingsGoal === null ? (
        <main className="w-screen h-screen flex items-center justify-center">
          <FirstSetupCard />
        </main>
      ) : (
        <main className="w-screen h-screen flex items-center justify-center gap-5">
          <section className="max-h-40 h-full flex items-center justify-center gap-5 w-full">
            <SavingProgression />
            <BudgetCard />
          </section>
        </main>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <FinanceProvider>
        <SavingsProvider>
          <DashboardContent />
        </SavingsProvider>
      </FinanceProvider>
    </ProtectedRoute>
  );
}
