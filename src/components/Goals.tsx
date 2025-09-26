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
import { FormEvent, useState } from "react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { RadioGroup } from "radix-ui";
import { XIcon } from "lucide-react";
import { ceilToOneDecimal } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function SetupMainGoalCard() {
  const { t } = useTranslation();
  const { addSavingsGoal, loading } = useSavingsGoal();
  const [yearsOfSaving, setYearsOfSaving] = useState(3);
  const [goalName, setGoalName] = useState("");
  const [savingsGoalState, setSavingsGoalState] = useState(0);
  const calculatedMonthlySavingsGoal = savingsGoalState / (yearsOfSaving * 12);
  const calculatedMonthlySavingsGoalDisplay = Math.ceil(
    calculatedMonthlySavingsGoal
  ).toLocaleString();
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
            {t("setUpMainGoal")}
          </CardTitle>
          <CardDescription>{t("addGoalWithOrWithoutDeadline")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-6"
            id="newMainGoalForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="savingsGoal">{t("savingsGoal")}</Label>
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
              <Label htmlFor="goalName">{t("name")}</Label>
              <Input
                id="goalName"
                type="text"
                onChange={(value) => setGoalName(value.currentTarget.value)}
                min={0}
                name="goalName"
                placeholder={t("newHouse")}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex w-full justify-end items-center gap-2">
                {" "}
                <Label htmlFor="noDeadline" className="text-sm">
                  {t("deadline")}
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
                    {t("needToSave", {
                      value: calculatedMonthlySavingsGoalDisplay,
                      currency: "SEK",
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyGoal">{t("monthlyGoal")}</Label>
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
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full"
            type="submit"
            form="newMainGoalForm"
            disabled={loading}
          >
            {loading ? t("pleaseWait") : t("startPlanning")}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export function SetupNewGoal({
  setShow,
}: {
  setShow: (show: boolean) => void;
}) {
  const { t } = useTranslation();
  const { addSavingsGoal, loading } = useSavingsGoal();
  const [yearsOfSaving, setYearsOfSaving] = useState(3);
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState<"sub" | "main">("sub");
  const [savingsGoalState, setSavingsGoalState] = useState(0);
  const calculatedMonthlySavingsGoal = savingsGoalState / (yearsOfSaving * 12);
  const calculatedMonthlySavingsGoalDisplay = Math.ceil(
    calculatedMonthlySavingsGoal
  ).toLocaleString();
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(0);
  const [noDeadline, setNoDeadline] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setShow(false);
    try {
      if (noDeadline) {
        addSavingsGoal({
          goal: savingsGoalState,
          name: goalName,
          type: goalType,
          hasDeadline: false,
          monthlyGoal: monthlySavingsGoal,
        });
      } else {
        addSavingsGoal({
          goal: savingsGoalState,
          name: goalName,
          type: goalType,
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
      <div className="absolute min-h-svh min-w-dvw h-full w-full flex justify-center items-center bg-primary/80 z-50">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex justify-between items-center">
              <p>{t("setUpNewGoal")}</p>
              <Button
                variant={"outline"}
                className="size-8 p-0"
                onClick={() => setShow(false)}
              >
                <XIcon className="size-5" />
              </Button>
            </CardTitle>
            <CardDescription>{t("addGoalAgain")} </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-6"
              id="newGoalForm"
              onSubmit={(event) => {
                handleSubmit(event);
              }}
            >
              <SubOrMainGoal setGoalType={setGoalType} />
              <div className="grid gap-2">
                <Label htmlFor="goalName">{t("name")}</Label>
                <Input
                  id="goalName"
                  type="text"
                  onChange={(value) => setGoalName(value.currentTarget.value)}
                  name="goalName"
                  placeholder={t("newHouse")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savingsGoal">{t("goal")}</Label>
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
                <div className="flex w-full justify-end items-center gap-2">
                  <Label htmlFor="noDeadline" className="text-sm">
                    {t("deadline")}
                  </Label>
                  <Checkbox
                    id="noDeadline"
                    checked={noDeadline}
                    onCheckedChange={(checked) =>
                      setNoDeadline(checked === true)
                    }
                  />
                </div>
                {!noDeadline ? (
                  <>
                    <SavingsSlider
                      setYearsOfSaving={setYearsOfSaving}
                      yearsOfSaving={yearsOfSaving}
                    />
                    <p className="">
                      {t("needToSave", {
                        value: calculatedMonthlySavingsGoalDisplay,
                        currency: "SEK",
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="monthlyGoal">{t("monthlyGoal")}</Label>
                      <Input
                        id="monthlyGoal"
                        type="number"
                        onChange={(value) =>
                          setMonthlySavingsGoal(
                            Number(value.currentTarget.value)
                          )
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
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              className="w-full"
              type="submit"
              form="newGoalForm"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Add new goal"}
            </Button>
          </CardFooter>
        </Card>
      </div>
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
  const { t } = useTranslation();
  return (
    <div className="w-full flex flex-col gap-2">
      <Label>
        <span className="font-bold">{ceilToOneDecimal(yearsOfSaving)}</span>{" "}
        {t("yearsOfSaving")}
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

export const SubOrMainGoal = ({
  setGoalType,
}: {
  setGoalType: (value: "main" | "sub") => void;
}) => {
  const { t } = useTranslation();

  const goalTypes = [
    {
      value: "sub",
      label: t("subGoal"),
    },
    {
      value: "main",
      label: t("mainGoal"),
    },
  ];
  return (
    <RadioGroup.Root
      defaultValue={goalTypes[0].value}
      className="max-w-md w-full grid grid-cols-2 gap-3"
    >
      {goalTypes.map((goal) => (
        <RadioGroup.Item
          key={goal.value}
          value={goal.value}
          onClick={(value) => {
            setGoalType(value.currentTarget.value as "sub" | "main");
          }}
          className="ring-[1px] ring-border rounded py-1 px-3 data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
        >
          <span className="font-semibold tracking-tight">{goal.label}</span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
};
