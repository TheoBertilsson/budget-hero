"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { FinanceProvider } from "@/lib/stores/FinanceContext";
import {
  BudgetCard,
  MonthlySavingProgress,
  SubGoals,
  SummaryCard,
  TotalSavingsGoal,
} from "@/components/Dashboard";
import MonthSlider from "@/components/Carousel";
import { SavingsProvider, useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { SetupMainGoalCard, SetupNewGoal } from "@/components/Goals";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useState } from "react";

function DashboardContent() {
  const { goals } = useSavingsGoal();
  const [showSetupNewGoal, setShowSetupNewGoal] = useState(false);

  return (
    <>
      {!goals[0] ? (
        <main className="w-screen h-screen flex items-center justify-center">
          <SetupMainGoalCard />
        </main>
      ) : (
        <main className="w-screen h-screen flex flex-col items-center gap-5 ">
          {showSetupNewGoal && <SetupNewGoal setShow={setShowSetupNewGoal} />}
          <SettingsDialog />
          <header className="w-full max-w-3/4 flex flex-col gap-5">
            <MonthSlider />
            <SummaryCard />
            <TotalSavingsGoal />
          </header>
          <section className="grid grid-cols-2 grid-rows-2 gap-5 max-w-3/4 w-full ">
            <div className="row-start-1 col-start-1">
              <MonthlySavingProgress />
            </div>
            <div className="row-start-1 col-start-2">
              <SubGoals setShow={setShowSetupNewGoal} />
            </div>
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
