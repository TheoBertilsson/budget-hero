"use client";
import ProtectedRoute from "../ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome</p>
      </div>
    </ProtectedRoute>
  );
}
