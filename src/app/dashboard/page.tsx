"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import FirstSetupCard from "@/components/FirstSetupCard";
import { FinanceProvider, useFinance } from "@/lib/stores/FinanceContext";
import { BudgetCard } from "@/components/Dashboard";

function DashboardContent() {
  const { finance } = useFinance();

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      {finance === null ? <FirstSetupCard /> : <BudgetCard />}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </ProtectedRoute>
  );
}
