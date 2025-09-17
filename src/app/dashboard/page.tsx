"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import FirstSetupCard from "@/components/FirstSetupCard";
import { FinanceProvider } from "@/lib/stores/FinanceContext";
import {
  BudgetCard,
  MonthlySavingProgress,
  SummaryCard,
  TotalSavingsGoal,
} from "@/components/Dashboard";
import {
  SavingsProvider,
  useSavingsGoal,
} from "@/lib/stores/SavingsGoalContext";
import MonthSlider from "@/components/Carousel";

function DashboardContent() {
  const { savingsGoal } = useSavingsGoal();

  return (
    <>
      {savingsGoal === null ? (
        <main className="w-screen h-screen flex items-center justify-center">
          <FirstSetupCard />
        </main>
      ) : (
        <main className="w-screen h-screen flex flex-col items-center gap-5 py-5">
          <header className="w-full max-w-3/4 flex flex-col gap-5">
            <MonthSlider />
            <SummaryCard />
            <TotalSavingsGoal />
          </header>
          <section className="h-fit max-w-3/4 lg:max-h-40 lg:h-full flex items-center justify-center gap-5 w-full lg:flex-row flex-col">
            <MonthlySavingProgress />
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
      <SavingsProvider>
        <FinanceProvider>
          <DashboardContent />
        </FinanceProvider>
      </SavingsProvider>
    </ProtectedRoute>
  );
}
