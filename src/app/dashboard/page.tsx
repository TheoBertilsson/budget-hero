"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import FirstSetupCard from "@/components/FirstSetupCard";
import { FinanceProvider, useFinance } from "@/lib/stores/FinanceContext";
import { BudgetCard } from "@/components/Dashboard";
import {
  SavingsProvider,
  useSavingsGoal,
} from "@/lib/stores/SavingsGoalContext";

function DashboardContent() {
  const { savingsGoal } = useSavingsGoal();

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      {savingsGoal === null ? <FirstSetupCard /> : <BudgetCard />}
    </main>
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
