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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="w-screen h-screen flex items-center justify-center">
        <FirstSetupCard />
      </main>
    </ProtectedRoute>
  );
}
