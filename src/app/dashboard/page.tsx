"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import FirstSetupCard from "@/components/FirstSetupCard";
import { FinanceProvider, useFinance } from "@/lib/stores/FinanceContext";

export default function DashboardPage() {
  const { finance, loading, setFinance } = useFinance();
  return (
    <ProtectedRoute>
      <FinanceProvider>
        <main className="w-screen h-screen flex items-center justify-center">
          {!finance && (
            <>
              <FirstSetupCard />
            </>
          )}
        </main>
      </FinanceProvider>
    </ProtectedRoute>
  );
}
