import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { Popover } from "./ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useSavingsGoal } from "@/lib/stores/SavingsGoalContext";
import { Progress } from "./ui/progress";

export function BudgetCard() {
  const { finance } = useFinance();
  const income = finance?.income || 0;
  const expenses =
    finance?.expenses?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  return (
    <>
      <Card className="w-full max-w-sm h-full">
        <CardContent className="flex flex-col gap-2 ">
          <p>💰 Income: {income.toLocaleString()}</p>
          <p>💸 Expenses: {expenses.toLocaleString()}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant={"ghost"}>Edit</Button>
          <AddExpenseDrawer />
        </CardFooter>
      </Card>
    </>
  );
}

export function SavingProgression() {
  const { savingsGoal, monthlySavingsGoal, totalSavings } = useSavingsGoal();
  const { finance } = useFinance();
  const expenses = finance?.expenses;

  const thisMonthSavings = expenses?.reduce((total, expense) => {
    if (expense.category !== "savings") return total;
    return total + expense.cost;
  }, 0);

  const totalProgress = savingsGoal ? (totalSavings / savingsGoal) * 100 : 0;

  const monthlyProgress =
    monthlySavingsGoal && thisMonthSavings
      ? (thisMonthSavings / monthlySavingsGoal) * 100
      : 0;

  return (
    <>
      <Card className="w-full max-w-sm h-full my-auto">
        <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
          <Label className="text-sm " htmlFor="totalProgress">
            Total:
          </Label>
          <Progress
            value={totalProgress}
            className="w-3/4 mx-auto"
            id="totalProgress"
          />
          <Label className="text-sm" htmlFor="monthlyProgress">
            This month:
          </Label>
          <Progress
            value={monthlyProgress}
            className="w-3/4 mx-auto"
            id="monthlyProgress"
          />
        </CardContent>
      </Card>
    </>
  );
}

export function AddExpenseDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Add Expense</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Expense</DrawerTitle>
            <DrawerDescription>
              Add and expenses for this month
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="expensePrice"
                  >
                    SEK
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    placeholder="0"
                    type="number"
                    min={1}
                    required
                    name="expensePrice"
                  />
                </div>
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="expenseName"
                  >
                    Name
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    type="text"
                    required
                    placeholder="Electrical bill"
                    name="expenseName"
                  />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-muted-foreground text-[0.70rem] uppercase">
                    Category
                  </p>
                  <CategoryBox />
                </div>
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const categories = [
  {
    value: "housing",
    label: "Housing",
  },
  {
    value: "transport",
    label: "Transport",
  },
  {
    value: "food",
    label: "Food",
  },
  {
    value: "entertainment",
    label: "Entertainment",
  },
  {
    value: "health",
    label: "Health",
  },
  {
    value: "savings",
    label: "Savings",
  },
  {
    value: "miscellaneous",
    label: "Miscellaneous",
  },
];

export function CategoryBox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? categories.find((category) => category.value === value)?.label
            : "Select category..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
