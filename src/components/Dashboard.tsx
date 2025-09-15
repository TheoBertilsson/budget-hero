import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent } from "./ui/card";

export function BudgetCard() {
  const { finance } = useFinance();
  const income = finance?.income || 0;
  const savings = finance?.savingsGoal || 0;
  const expenses =
    finance?.expenses?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  return (
    <>
      <Card className="w-full max-w-sm">
        <CardContent>
          <p>💰 Income: {income.toLocaleString()}</p>
          <p>🏦 Savings: {savings.toLocaleString()}</p>
          <p>
            💸 Budget Left: {(income - savings - expenses).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export function SavingProgression() {
  return {};
}
