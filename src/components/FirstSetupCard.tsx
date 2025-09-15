import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useFinance } from "@/lib/stores/FinanceContext";
import { useDate } from "@/lib/stores/DateContext";

export default function FirstSetupCard() {
  const { loading, setFinance } = useFinance();
  const { year, month } = useDate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const monthlyIncome = formData.get("monthlyIncome")
      ? Number(formData.get("monthlyIncome"))
      : null;
    const monthlySavingsGoal = formData.get("monthlySavingsGoal")
      ? Number(formData.get("monthlySavingsGoal"))
      : null;
    const savingsGoal = formData.get("savingsGoal")
      ? Number(formData.get("savingsGoal"))
      : null;

    if (!monthlyIncome || !monthlySavingsGoal || !savingsGoal)
      throw new Error("Invalid Data");
    try {
      setFinance({
        income: monthlyIncome,
        savingsGoal: monthlySavingsGoal,
        expenses: null,
      });
    } catch (error) {
      return;
    }
  }
  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            First a little information
          </CardTitle>
          <CardDescription>
            Set up your monthly income and your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="budgetForm">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex gap-2 justify-between">
                  <Label htmlFor="income">Monthly Income</Label>
                </div>

                <Input
                  id="monthlyIncome"
                  type="number"
                  name="monthlyIncome"
                  placeholder="25000 / month"
                  min={0}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlySavingsGoal">Monthly Savings</Label>
                <Input
                  id="monthlySavingsGoal"
                  type="number"
                  min={0}
                  name="monthlySavingsGoal"
                  placeholder="5000 / month"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savingsGoal">Savings Goal</Label>
                <Input
                  id="savingsGoal"
                  type="number"
                  min={0}
                  name="savingsGoal"
                  placeholder="1 000 000"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            form="budgetForm"
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Start the planning"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
