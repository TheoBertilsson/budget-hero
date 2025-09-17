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
import { useState } from "react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";

export default function SetupGoalCard() {
  const { addSavingsGoal, loading } = useSavingsGoal();
  const [yearsOfSaving, setYearsOfSaving] = useState(3);
  const [goalName, setGoalName] = useState("");
  const [savingsGoalState, setSavingsGoalState] = useState(0);
  const calculatedMonthlySavingsGoal = Math.ceil(
    savingsGoalState / (yearsOfSaving * 12)
  );
  const calculatedMonthlySavingsGoalDisplay =
    calculatedMonthlySavingsGoal.toLocaleString();
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(0);
  const [noDeadline, setNoDeadline] = useState(false);

  async function handleSubmit() {
    try {
      if (noDeadline) {
        addSavingsGoal({
          goal: savingsGoalState,
          name: goalName,
          type: "main",
          hasDeadline: false,
          monthlyGoal: monthlySavingsGoal,
        });
      } else {
        addSavingsGoal({
          goal: savingsGoalState,
          name: goalName,
          type: "main",
          hasDeadline: true,
          timeInMonths: yearsOfSaving * 12,
        });
      }
    } catch (error) {
      console.error("Error when adding goal: " + error);
      return;
    }
  }
  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Set up your main saving goal
          </CardTitle>
          <CardDescription>Add a goal with or without deadline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="savingsGoal">Savings Goal</Label>
              <Input
                id="savingsGoal"
                type="number"
                onChange={(value) =>
                  setSavingsGoalState(Number(value.currentTarget.value))
                }
                min={0}
                name="savingsGoal"
                placeholder="1 000 000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goalName">Name</Label>
              <Input
                id="goalName"
                type="text"
                onChange={(value) => setGoalName(value.currentTarget.value)}
                min={0}
                name="goalName"
                placeholder="New House"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex w-full justify-end items-center gap-2">
                {" "}
                <Label htmlFor="noDeadline" className="text-sm">
                  No deadline
                </Label>
                <Checkbox
                  id="noDeadline"
                  checked={noDeadline}
                  onCheckedChange={(checked) => setNoDeadline(checked === true)}
                />
              </div>
              {!noDeadline ? (
                <>
                  <SavingsSlider
                    setYearsOfSaving={setYearsOfSaving}
                    yearsOfSaving={yearsOfSaving}
                  />
                  <p className="">
                    You need to save:{" "}
                    <span className="font-bold">
                      {calculatedMonthlySavingsGoalDisplay}
                    </span>{" "}
                    SEK/month
                  </p>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyGoal">Monthly saving goal</Label>
                    <Input
                      id="monthlyGoal"
                      type="number"
                      onChange={(value) =>
                        setMonthlySavingsGoal(Number(value.currentTarget.value))
                      }
                      min={0}
                      name="monthlyGoal"
                      placeholder="1 000 000"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : "Start the planning"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

type SavingsSliderProps = {
  yearsOfSaving: number;
  setYearsOfSaving: (value: number) => void;
};

export function SavingsSlider({
  yearsOfSaving,
  setYearsOfSaving,
}: SavingsSliderProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <Label>
        <span className="font-bold">{yearsOfSaving}</span> Years of saving
      </Label>
      <div className="px-4 ">
        <Slider
          value={[yearsOfSaving]}
          onValueChange={(val) => setYearsOfSaving(val[0])}
          max={65}
          min={1}
          step={1}
        />
      </div>
    </div>
  );
}
