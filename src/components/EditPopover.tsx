import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVerticalIcon, TrashIcon } from "lucide-react";
import { CategoryBox } from "./ComboBoxes";
import { useEffect, useState } from "react";
import { useFinance } from "@/lib/stores/FinanceContext";
import { Expense, Income, Save, SavingGoalType } from "@/lib/types";
import { SavingsSlider, SubOrMainGoal } from "./Goals";
import { Checkbox } from "./ui/checkbox";
import { useDate } from "@/lib/stores/DateContext";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { ceilToOneDecimal } from "@/lib/utils";

type EditPopoverType = {
  type: "expense" | "save" | "income";
  price: number;
  name: string;
  index: number;
  category?: string;
  goalId?: string;
};

export function EditPopover({
  type,
  price,
  name,
  index,
  category,
  goalId,
}: EditPopoverType) {
  const {
    removeExpense,
    removeSave,
    removeIncome,
    updateExpenses,
    updateIncomes,
    updateSaves,
  } = useFinance();

  const [categoryState, setCategoryState] = useState<string>(category || "");
  const [nameState, setNameState] = useState(name);
  const [priceState, setPriceState] = useState(price);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCategoryState(category || "");
    setNameState(name);
    setPriceState(price);
  }, [category, name, price]);

  const removeItem = () => {
    if (type === "expense") removeExpense(index);
    else if (type === "save") removeSave(index);
    else if (type === "income") removeIncome(index);
    setOpen(false);
  };

  const updateItem = () => {
    if (type === "expense") {
      const updated: Expense = {
        name: nameState,
        price: priceState,
        category: categoryState,
      };
      updateExpenses(index, updated);
    } else if (type === "save" && goalId) {
      const updated: Save = {
        goal: nameState,
        price: priceState,
        goalId,
      };
      updateSaves(index, updated);
    } else {
      const updated: Income = { name: nameState, price: priceState };
      updateIncomes(index, updated);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="size-4 rounded-xs cursor-pointer">
          <EllipsisVerticalIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 flex flex-col gap-4 shadow-2xl">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Edit {type}</h4>
          </div>

          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                value={nameState}
                onChange={(e) => setNameState(e.currentTarget.value)}
                className="col-span-2 h-8"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="price">Price:</Label>
              <Input
                id="price"
                type="number"
                value={priceState}
                onChange={(e) => setPriceState(Number(e.currentTarget.value))}
                className="col-span-2 h-8"
              />
            </div>

            {category !== undefined && (
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="category">Category:</Label>
                <CategoryBox
                  value={categoryState}
                  setValue={setCategoryState}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between items-center">
          <Button
            variant="destructive"
            className="bg-red-600 size-8"
            onClick={removeItem}
          >
            <TrashIcon />
          </Button>

          <Button variant="secondary" onClick={updateItem}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function EditGoals({ goal }: { goal: SavingGoalType }) {
  const { year, month } = useDate();
  const { removeGoal, updateGoal } = useSavingsGoal();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal.name);
  const [goalState, setGoalState] = useState(goal.goal);
  const [type, setType] = useState(goal.type);
  const [yearsOfSaving, setYearsOfSaving] = useState(
    Math.ceil(goal.timeInMonths / 12)
  );
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(
    goal?.monthly?.[year]?.[month]?.goal ?? 0
  );
  const [noDeadline, setNoDeadline] = useState(!goal.hasDeadline);

  useEffect(() => {
    setName(goal.name);
    setGoalState(goal.goal);
    setType(goal.type);
    setYearsOfSaving(Math.ceil(goal.timeInMonths / 12));
    setMonthlySavingsGoal(goal?.monthly?.[year]?.[month]?.goal ?? 0);
    setNoDeadline(!goal.hasDeadline);
  }, [goal, year, month]);

  const monthlyGoal = Math.ceil(goalState / (yearsOfSaving * 12));
  const monthlyGoalDisplay = monthlyGoal.toLocaleString();

  const updatedGoal = {
    ...goal,
    name,
    goal: goalState,
    type,
    hasDeadline: !noDeadline,
    timeInMonths: yearsOfSaving * 12,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="size-4 rounded-xs has-[>svg]:px-0 cursor-pointer"
        >
          <EllipsisVerticalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 flex flex-col gap-4 shadow-2xl">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Edit goal</h4>
          </div>

          <div className="grid gap-2">
            <SubOrMainGoal setGoalType={setType} />

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                className="col-span-2 h-8"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="goal">Goal:</Label>
              <Input
                id="goal"
                value={goalState}
                type="number"
                onChange={(e) => setGoalState(Number(e.currentTarget.value))}
                className="col-span-2 h-8"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex w-full justify-end items-center gap-2">
              <Label htmlFor="noDeadline" className="text-sm">
                No deadline
              </Label>
              <Checkbox
                id="noDeadline"
                checked={noDeadline}
                onCheckedChange={(checked) => setNoDeadline(checked === true)}
              />
            </div>

            {noDeadline ? (
              <div className="grid gap-2">
                <Label htmlFor="monthlyGoal">Monthly saving goal</Label>
                <Input
                  id="monthlyGoal"
                  type="number"
                  min={0}
                  placeholder="1 000 000"
                  value={monthlySavingsGoal}
                  onChange={(e) =>
                    setMonthlySavingsGoal(Number(e.currentTarget.value))
                  }
                  required
                />
              </div>
            ) : (
              <>
                <SavingsSlider
                  yearsOfSaving={yearsOfSaving}
                  setYearsOfSaving={setYearsOfSaving}
                />
                <p>
                  You need to save:{" "}
                  <span className="font-bold">{monthlyGoalDisplay}</span>{" "}
                  SEK/month
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between items-center">
          <Button
            variant="destructive"
            className="bg-red-600 has-[>svg]:px-0 size-8"
            onClick={() => {
              removeGoal(goal.id);
              setOpen(false);
            }}
          >
            <TrashIcon />
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setOpen(false);
              updateGoal(
                updatedGoal,
                goal.id,
                noDeadline ? monthlySavingsGoal : undefined
              );
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function EditMainGoal({ goal }: { goal: SavingGoalType }) {
  const { year, month } = useDate();
  const { removeGoal, updateGoal } = useSavingsGoal();

  const [hasDeadline, setHasDeadline] = useState(goal.hasDeadline);
  const [name, setName] = useState(goal.name);
  const [goalAmount, setGoalAmount] = useState(goal.goal);

  const [yearsOfSaving, setYearsOfSaving] = useState(
    Math.ceil(goal.timeInMonths / 12)
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHasDeadline(goal.hasDeadline);
    setName(goal.name);
    setGoalAmount(goal.goal);
    setYearsOfSaving(Math.ceil(goal.timeInMonths / 12));
  }, [goal, year, month]);

  const monthlyGoal = Math.ceil(goalAmount / (yearsOfSaving * 12));
  console.log(
    yearsOfSaving + " + " + monthlyGoal + " = " + Math.ceil(yearsOfSaving * 12)
  );

  const updatedGoal: SavingGoalType = {
    ...goal,
    hasDeadline,
    name,
    goal: goalAmount,
    timeInMonths: ceilToOneDecimal(yearsOfSaving * 12),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="size-4 rounded-xs cursor-pointer">
          <EllipsisVerticalIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 flex flex-col gap-4 shadow-2xl">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Edit goal</h4>
          </div>

          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                className="col-span-2 h-8"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="goal">Goal:</Label>
              <Input
                id="goal"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.currentTarget.value))}
                className="col-span-2 h-8"
              />
            </div>

            <div className="flex w-full justify-end items-center gap-2">
              <Label htmlFor="noDeadline" className="text-sm">
                No deadline
              </Label>
              <Checkbox
                id="noDeadline"
                checked={!hasDeadline}
                onCheckedChange={(checked) => setHasDeadline(!checked)}
              />
            </div>

            {hasDeadline ? (
              <>
                <SavingsSlider
                  setYearsOfSaving={setYearsOfSaving}
                  yearsOfSaving={yearsOfSaving}
                />
                <p>
                  You need to save:{" "}
                  <span className="font-bold">
                    {monthlyGoal.toLocaleString()}
                  </span>{" "}
                  SEK/month
                </p>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="monthlyGoal">Monthly saving goal</Label>
                <Input
                  id="monthlyGoal"
                  type="number"
                  min={0}
                  defaultValue={updatedGoal.monthly[year][month].goal}
                  onChange={(e) => {
                    const monthlyGoal = Number(e.currentTarget.value);
                    if (monthlyGoal > 0) {
                      const months = Math.ceil(goalAmount / monthlyGoal);
                      setYearsOfSaving(months / 12);
                    }
                  }}
                  placeholder="1 000 000"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between items-center">
          <Button
            variant="destructive"
            className="bg-red-600 size-8"
            onClick={() => {
              removeGoal(goal.id);
              setOpen(false);
            }}
          >
            <TrashIcon />
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setOpen(false);
              updateGoal(updatedGoal, goal.id);
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
