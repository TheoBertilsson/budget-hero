"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { FinanceProvider } from "@/lib/stores/FinanceContext";
import {
  BudgetCard,
  IncomeBox,
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
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { goals } = useSavingsGoal();
  const [showSetupNewGoal, setShowSetupNewGoal] = useState(false);

  return (
    <>
      {!goals[0] ? (
        <main className="w-full h-full py-5 flex items-center justify-center min-h-screen min-w-screen">
          <SetupMainGoalCard />
        </main>
      ) : (
        <>
          {showSetupNewGoal && <SetupNewGoal setShow={setShowSetupNewGoal} />}
          <main
            className={cn(
              "w-full h-full flex flex-col items-center gap-5 min-h-screen min-w-screen pb-5",
              showSetupNewGoal ? "max-h-screen overflow-hidden" : ""
            )}
          >
            <SettingsDialog />
            <header className="w-full max-w-3/4 flex flex-col gap-5">
              <MonthSlider />
              <SummaryCard />
              <TotalSavingsGoal />
            </header>
            <section className="grid grid-cols-2 gap-5 max-w-3/4 w-full auto-rows-fr">
              <div className="row-start-1 col-start-1">
                <MonthlySavingProgress />
              </div>

              <div className="row-start-1 row-end-3 col-start-2">
                <SubGoals setShow={setShowSetupNewGoal} />
              </div>
              <div className="row-start-2 col-start-1">
                <IncomeBox />
              </div>
            </section>
          </main>
        </>
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
