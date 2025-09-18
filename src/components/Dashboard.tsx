import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { FormEvent, useState } from "react";
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
import { Progress } from "./ui/progress";
import { ChartRadialStacked } from "./ui/radialProgress";
import { auth } from "@/lib/firebase";
import { useDate } from "@/lib/stores/DateContext";
import ConfettiExplosion from "react-confetti-explosion";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { CategoryBox, GoalBox } from "./ComboBoxes";
import { cn } from "@/lib/utils";

export function SummaryCard() {
  const { incomeTotal, expenseTotal } = useFinance();

  return (
    <>
      <Card className="w-full h-full">
        <CardContent className="flex flex-col gap-2 w-full h-full ">
          <div className="flex items-center justify-center">
            <ChartRadialStacked
              expenses={expenseTotal || 0}
              income={incomeTotal || 0}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center"></CardFooter>
      </Card>
    </>
  );
}

export function BudgetCard() {
  return (
    <>
      <Card className="w-full h-full">
        <CardFooter className="flex flex-wrap lg:flex-nowrap justify-evenly items-center gap-2 h-full">
          <AddIncomeDrawer />
          <AddSavingDrawer />
          <AddExpenseDrawer />
        </CardFooter>
      </Card>
    </>
  );
}

export function MonthlySavingProgress() {
  const { mainGoal } = useSavingsGoal();
  const { year, month } = useDate();

  const thisMonthSavings = mainGoal?.monthly?.[year]?.[month]?.paid ?? 0;

  const goalThisMonth = mainGoal?.monthly?.[year]?.[month]?.goal ?? 0;

  const monthlyProgress = goalThisMonth
    ? Math.ceil((thisMonthSavings / goalThisMonth) * 100)
    : 0;

  return (
    <>
      <Card className="w-full my-auto h-full">
        <CardContent className="flex flex-col gap-5 pb-2 justify-center  h-full ">
          <div className=" flex gap-2 flex-col">
            <div className="flex justify-end text-sm font-semibold">
              <p>{goalThisMonth?.toLocaleString()}</p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <Progress
                value={monthlyProgress > 100 ? 100 : monthlyProgress}
                className="w-full mx-auto h-4 [&>div]:bg-linear-to-r [&>div]:from-cyan-400 [&>div]:via-sky-500 [&>div]:to-indigo-500 [&>div]:rounded-l-full [&>div]:transition-all [&>div]:duration-700"
                id="monthlyProgress"
              />
              {monthlyProgress >= 100 && (
                <ConfettiExplosion className="" duration={5000} />
              )}
            </div>
          </div>

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
  const { mainGoal } = useSavingsGoal();

  const totalProgress = mainGoal?.goal
    ? Math.ceil((mainGoal.total / mainGoal.goal) * 100)
    : 0;

  return (
    <>
      <Card className="w-full h-full flex flex-col gap-0">
        <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
          <div className=" text-xs font-semibold flex justify-between">
            <p>{mainGoal?.name.toLocaleString()}</p>
            <p>{mainGoal?.goal.toLocaleString()}</p>
          </div>
          <div className="flex justify-center items-center">
            <Progress
              value={totalProgress > 100 ? 100 : totalProgress}
              className="w-full mx-auto h-4 [&>div]:bg-linear-to-r [&>div]:from-green-600 [&>div]:to-green-400 [&>div]:rounded-l-full [&>div]:transition-all [&>div]:duration-700"
              id="monthlyProgress"
            />
            {totalProgress >= 100 && (
              <ConfettiExplosion className="" duration={5000} />
            )}
          </div>
          <p className="text-sm leading-6">
            You have saved a total of{" "}
            <span className="font-bold">
              {mainGoal?.total?.toLocaleString() || 0}
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

export function SubGoals({ setShow }: { setShow: (show: boolean) => void }) {
  const { subGoals } = useSavingsGoal();

  return (
    <>
      <Card className="flex flex-col h-full justify-between items-center">
        {subGoals.length ? (
          <CardContent className="flex flex-col py-2 gap-4 max-h-80 overflow-auto w-full">
            {subGoals.map((goal, i) => {
              const progress = goal.goal
                ? Math.ceil((goal.total / goal.goal) * 100)
                : 0;
              return (
                <div className="flex flex-col gap-1" key={i}>
                  <div className=" text-xs font-semibold flex justify-between">
                    <p>{goal.name.toLocaleString()}</p>
                    <p>{goal.goal.toLocaleString()}</p>
                  </div>

                  <div className="flex justify-center items-center">
                    <Progress
                      value={progress > 100 ? 100 : progress}
                      className="w-full mx-auto h-4 [&>div]:bg-linear-to-r [&>div]:from-green-600 [&>div]:to-green-400 [&>div]:rounded-l-full [&>div]:transition-all [&>div]:duration-700"
                      id="monthlyProgress"
                    />
                    {progress >= 100 && <ConfettiExplosion duration={5000} />}
                  </div>
                </div>
              );
            })}
          </CardContent>
        ) : (
          <>
            <div></div>
            <CardContent className="flex justify-center items-center text-primary/60">
              <p>No sub goals set</p>
            </CardContent>
          </>
        )}
        <CardFooter className="flex justify-end w-full">
          <Button variant={"outline"} onClick={() => setShow(true)}>
            New goal
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export function IncomeBox() {
  const { incomes } = useFinance();

  return (
    <>
      <Card className="flex flex-col h-full justify-between items-center">
        {incomes.length ? (
          <CardContent className="flex flex-col py-2 gap-4 max-h-40 overflow-auto w-full">
            {incomes.map((income, i) => {
              return (
                <div
                  className="gap-1 text-sm font-semibold flex justify-between border-b pb-1"
                  key={i}
                >
                  <p>{income.item.toLocaleString()}</p>
                  <p>{income.cost.toLocaleString()}</p>
                </div>
              );
            })}
          </CardContent>
        ) : (
          <>
            <div></div>
            <CardContent className="flex justify-center items-center text-primary/60">
              <p>No income yet</p>
            </CardContent>
          </>
        )}
        <CardFooter className="flex justify-end w-full items-end ">
          <AddIncomeDrawer />
        </CardFooter>
      </Card>
    </>
  );
}
export function AddExpenseDrawer() {
  const { addExpense, incomeTotal, expenseTotal } = useFinance();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [comboboxError, setComboboxError] = useState(false);

  const moneyLeft = incomeTotal - expenseTotal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    if (!category) {
      setComboboxError(true);
      setLoading(false);
      return;
    }

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
        <Button variant={"destructive"} disabled={!moneyLeft}>
          Add Expense
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {" "}
              {moneyLeft - price < 0 ? "No money left!" : "Add expense"}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {moneyLeft - price < 0
                ? "Add an Income before continuing!"
                : "Add an expenses for this month"}
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
                  <CategoryBox
                    value={category}
                    setValue={setCategory}
                    error={comboboxError}
                    setError={setComboboxError}
                  />
                </div>
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button
              type="submit"
              form="expenseForm"
              disabled={loading || moneyLeft - price < 0}
            >
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

function AddSavingDrawer() {
  const { addSavings, incomeTotal, expenseTotal } = useFinance();
  const { addPayment } = useSavingsGoal();
  const { year, month } = useDate();
  const [price, setPrice] = useState(0);
  const [goal, setGoal] = useState<{ value: string; label: string }>();
  const [comboboxError, setComboboxError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const moneyLeft = incomeTotal - expenseTotal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    if (!goal) {
      setComboboxError(true);
      return;
    }
    setLoading(true);

    await addSavings(year, month, { item: goal?.label || "", cost: price });
    await addPayment(goal?.value, year, month, price);
    setLoading(false);

    setPrice(0);
    setGoal({ label: "", value: "" });

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="bg-blue-500 hover:bg-blue-500/90 font-bold"
          disabled={moneyLeft <= 0}
        >
          Add Savings
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {" "}
              {moneyLeft - price < 0 ? "No money left!" : "Add savings"}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {moneyLeft - price < 0
                ? " Add an Income before continuing!"
                : "Add savings for this month"}
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="savingsPrice"
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
                    name="savingsPrice"
                  />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-muted-foreground text-[0.70rem] uppercase">
                    Goals
                  </p>
                  <GoalBox
                    selectedOption={goal}
                    setSelectedOption={setGoal}
                    error={comboboxError}
                    setError={setComboboxError}
                  />
                </div>
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button
              type="submit"
              form="expenseForm"
              disabled={loading || moneyLeft - price < 0}
            >
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
