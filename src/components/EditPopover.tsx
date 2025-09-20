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
                defaultValue={nameState}
                onChange={(e) => setNameState(e.currentTarget.value)}
                className="col-span-2 h-8"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="price">Price:</Label>
              <Input
                id="price"
                type="number"
                defaultValue={priceState}
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
  const [yearsOfSaving, setYearsOfSaving] = useState(goal.timeInMonths / 12);
  const [hasDeadline, setHasDeadline] = useState(goal.hasDeadline);

  useEffect(() => {
    setName(goal.name);
    setGoalState(goal.goal);
    setType(goal.type);
    setYearsOfSaving(goal.timeInMonths / 12);
    setHasDeadline(goal.hasDeadline);
  }, [goal]);

  const monthlyGoal = goalState / (yearsOfSaving * 12);
  const monthlyGoalDisplay = Math.ceil(monthlyGoal).toLocaleString();

  const updatedGoal = {
    ...goal,
    name,
    goal: goalState,
    type,
    hasDeadline,
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              updateGoal(
                updatedGoal,
                goal.id,
                hasDeadline ? undefined : monthlyGoal
              );
            }}
            id="editGoalsForm"
          >
            <div className="grid gap-2">
              <SubOrMainGoal setGoalType={setType} />

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name">Name:</Label>
                <Input
                  id="name"
                  defaultValue={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  className="col-span-2 h-8"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="goal">Goal:</Label>
                <Input
                  id="goal"
                  defaultValue={goalState}
                  type="number"
                  onChange={(e) => setGoalState(Number(e.currentTarget.value))}
                  className="col-span-2 h-8"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex w-full justify-end items-center gap-2">
                <Label htmlFor="hasDeadline" className="text-sm">
                  No deadline
                </Label>
                <Checkbox
                  id="hasDeadline"
                  checked={!hasDeadline}
                  onCheckedChange={(checked) => setHasDeadline(!checked)}
                />
              </div>

              {hasDeadline ? (
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
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="monthlyGoal">Monthly saving goal</Label>
                  <Input
                    id="monthlyGoal"
                    type="number"
                    min={0}
                    placeholder="1 000 000"
                    defaultValue={updatedGoal.monthly[year][month].goal}
                    onChange={(e) => {
                      const monthlyGoal = Number(e.currentTarget.value);
                      if (monthlyGoal > 0) {
                        const months = goalState / monthlyGoal;
                        setYearsOfSaving(months / 12);
                      }
                    }}
                    required
                  />
                </div>
              )}
            </div>
          </form>
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

          <Button form="editGoalsForm" variant="secondary" type="submit">
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

  const [yearsOfSaving, setYearsOfSaving] = useState(goal.timeInMonths / 12);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setHasDeadline(goal.hasDeadline);
    setName(goal.name);
    setGoalAmount(goal.goal);
    setYearsOfSaving(goal.timeInMonths / 12);
  }, [goal]);

  const monthlyGoal = goalAmount / (yearsOfSaving * 12);
  const monthlyGoalDisplay = Math.ceil(monthlyGoal).toLocaleString();

  const updatedGoal: SavingGoalType = {
    ...goal,
    hasDeadline,
    name,
    goal: goalAmount,
    timeInMonths: Math.ceil(yearsOfSaving * 12),
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
          <form
            id="editMainGoalForm"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
              updateGoal(
                updatedGoal,
                goal.id,
                hasDeadline ? undefined : monthlyGoal
              );
            }}
          >
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name">Name:</Label>
                <Input
                  id="name"
                  defaultValue={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  className="col-span-2 h-8"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="goal">Goal:</Label>
                <Input
                  id="goal"
                  type="number"
                  defaultValue={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.currentTarget.value))}
                  className="col-span-2 h-8"
                />
              </div>

              <div className="flex w-full justify-end items-center gap-2">
                <Label htmlFor="hasDeadline" className="text-sm">
                  No deadline
                </Label>
                <Checkbox
                  id="hasDeadline"
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
                    <span className="font-bold">{monthlyGoalDisplay}</span>{" "}
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
                        const months = goalAmount / monthlyGoal;
                        setYearsOfSaving(months / 12);
                      }
                    }}
                    placeholder="1 000 000"
                    required
                  />
                </div>
              )}
            </div>
          </form>
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

          <Button type="submit" form="editMainGoalForm" variant="secondary">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
