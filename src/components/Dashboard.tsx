import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { FormEvent, ReactNode, useState } from "react";
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
import { ChartRadialStacked } from "./ui/radialProgress";
import { auth } from "@/lib/firebase";

export function SummaryCard() {
  const { finance } = useFinance();
  const income =
    finance?.incomes?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  const expenses =
    finance?.expenses?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  return (
    <>
      <Card className="w-full h-full">
        <CardContent className="flex flex-col gap-2 w-full h-full ">
          <div className="flex items-center justify-center">
            <ChartRadialStacked expenses={expenses} income={income} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center"></CardFooter>
      </Card>
    </>
  );
}

export function BudgetCard() {
  const { finance } = useFinance();
  const income =
    finance?.incomes?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  const expenses =
    finance?.expenses?.reduce((sum, curr) => sum + curr.cost, 0) || 0;
  return (
    <>
      <Card className="w-full h-full">
        <CardContent className="flex flex-col gap-2 ">
          <p>💰 Income: {income.toLocaleString()}</p>
          <p>💸 Expenses: {expenses.toLocaleString()}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <AddIncomeDrawer />
          <AddExpenseDrawer />
        </CardFooter>
      </Card>
    </>
  );
}

export function MonthlySavingProgress() {
  const { monthlySavingsGoal } = useSavingsGoal();
  const { finance } = useFinance();
  const expenses = finance?.expenses;

  const thisMonthSavings = expenses?.reduce((total, expense) => {
    if (expense.category !== "savings") return total;
    return total + expense.cost;
  }, 0);

  const monthlyProgress =
    monthlySavingsGoal && thisMonthSavings
      ? (thisMonthSavings / monthlySavingsGoal) * 100
      : 0;

  return (
    <>
      <Card className="w-full h-full my-auto">
        <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
          <div className="flex justify-between">
            <p>0 SEK</p>
            <p>{monthlySavingsGoal?.toLocaleString()} SEK</p>
          </div>
          <Progress
            value={monthlyProgress}
            className="w-full mx-auto h-4 [&>div]:bg-linear-to-r [&>div]:from-cyan-400 [&>div]:via-sky-500 [&>div]:to-indigo-500 [&>div]:rounded-l-full"
            id="monthlyProgress"
          />
          <p className="text-sm leading-6">
            This month you have saved{" "}
            <span className="font-bold">
              {thisMonthSavings?.toLocaleString() || 0}
            </span>{" "}
            SEK!
            <br /> That is <span className="font-bold">
              {monthlyProgress}%
            </span>{" "}
            of your monthly goal!
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export function TotalSavingsGoal() {
  const { savingsGoal, totalSavings } = useSavingsGoal();

  const totalProgress = savingsGoal ? (totalSavings / savingsGoal) * 100 : 0;

  return (
    <>
      <Card className="w-full h-full my-auto">
        <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
          <div className="flex justify-between">
            <p>0 SEK</p>
            <p>{savingsGoal?.toLocaleString()} SEK</p>
          </div>
          <Progress
            value={totalProgress}
            className="w-full mx-auto h-4 [&>div]:bg-linear-to-r [&>div]:from-green-600 [&>div]:to-green-400 [&>div]:rounded-l-full"
            id="monthlyProgress"
          />
          <p className="text-sm leading-6">
            You have saved a total of{" "}
            <span className="font-bold">
              {totalSavings?.toLocaleString() || 0}
            </span>{" "}
            SEK!
            <br /> That is <span className="font-bold">
              {totalProgress}%
            </span>{" "}
            of your goal!
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export function AddExpenseDrawer() {
  const { addExpense } = useFinance();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    await addExpense({ item: name, cost: price, category: category });

    setLoading(false);

    setPrice(0);
    setName("");
    setCategory("");

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={"destructive"}>Add Expense</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Expense</DrawerTitle>
            <DrawerDescription>
              Add and expenses for this month
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
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
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.currentTarget.value))}
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
                    value={name || ""}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Electrical bill"
                    name="expenseName"
                  />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-muted-foreground text-[0.70rem] uppercase">
                    Category
                  </p>
                  <CategoryBox value={category} setValue={setCategory} />
                </div>
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button type="submit" form="expenseForm" disabled={loading}>
              {loading ? "Please wait..." : "Add"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function AddIncomeDrawer() {
  const { addIncome } = useFinance();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    await addIncome({ item: name, cost: price });

    setLoading(false);

    setPrice(0);
    setName("");

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-500/90 font-bold">
          Add Income
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Income</DrawerTitle>
            <DrawerDescription>Add an income for this month</DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="incomePrice"
                  >
                    SEK
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    placeholder="0"
                    type="number"
                    min={1}
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.currentTarget.value))}
                    required
                    name="incomePrice"
                  />
                </div>
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="incomeName"
                  >
                    Name
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    type="text"
                    required
                    value={name || ""}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Salary"
                    name="incomeName"
                  />
                </div>
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button type="submit" form="expenseForm" disabled={loading}>
              {loading ? "Please wait..." : "Add"}
            </Button>
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

export function CategoryBox({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

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
