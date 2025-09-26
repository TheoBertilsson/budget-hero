"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { FinanceProvider } from "@/lib/stores/FinanceContext";
import {
  ExpenseBox,
  IncomeBox,
  MonthlySavingProgress,
  PreviousMonthBox,
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
              " h-full flex flex-col items-center gap-5 min-h-screen p-5",
              showSetupNewGoal ? "max-h-screen overflow-hidden" : ""
            )}
          >
            <SettingsDialog />
            <header className="w-full xl:max-w-3/4 flex flex-col gap-5">
              <MonthSlider />
              <SummaryCard />
              <TotalSavingsGoal />
            </header>
            <section className="flex flex-col lg:flex-row w-full xl:max-w-3/4  gap-5">
              <div className="flex flex-col gap-5 flex-1">
                <MonthlySavingProgress />

                <IncomeBox />
              </div>
              <div className="flex-1">
                <ExpenseBox />
              </div>
            </section>
            <section className="flex flex-col lg:flex-row gap-5 xl:max-w-3/4 w-full">
              <PreviousMonthBox />
              <SubGoals setShow={setShowSetupNewGoal} />
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
