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
import { useEffect, useState } from "react";
import { Slider } from "./ui/slider";
import { useSavingsGoal } from "@/lib/stores/SavingsGoalContext";
import { useDate } from "@/lib/stores/DateContext";

export default function FirstSetupCard() {
  const { year, month } = useDate();
  const { setSavingsGoal, setMonthlySavingsGoal, setTotalSavings, loading } =
    useSavingsGoal();
  const [yearsOfSaving, setYearsOfSaving] = useState(3);
  const [savingsGoalState, setSavingsGoalState] = useState(0);
  const monthlySavingsGoal = Math.ceil(savingsGoalState / (yearsOfSaving * 12));
  const monthlySavingsGoalDisplay = monthlySavingsGoal.toLocaleString();

  async function handleSubmit() {
    if (!savingsGoalState || !monthlySavingsGoal)
      throw new Error("Invalid Data");
    try {
      setSavingsGoal(savingsGoalState);
      setMonthlySavingsGoal(
        savingsGoalState,
        yearsOfSaving * 12,
        Number(year),
        Number(month)
      );
      setTotalSavings(0);
    } catch (error) {
      return;
    }
  }
  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Set up your saving goal
          </CardTitle>
          <CardDescription>Drag the slider to change period</CardDescription>
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
              <SavingsSlider
                setYearsOfSaving={setYearsOfSaving}
                yearsOfSaving={yearsOfSaving}
              />
              <p className="">
                You need to save:{" "}
                <span className="font-bold">{monthlySavingsGoalDisplay}</span>{" "}
                SEK/month
              </p>
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
