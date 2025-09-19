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
import { useFinance } from "@/lib/stores/FinanceContext";
import { Button } from "./ui/button";
import { useDate } from "@/lib/stores/DateContext";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { CategoryBox, GoalBox } from "./ComboBoxes";
import { cn, getCurrentUser } from "@/lib/utils";
import { toast } from "sonner";

export function AddExpenseDrawer() {
  const { addExpense, incomeTotal, expenseTotal, savingsTotal } = useFinance();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [comboboxError, setComboboxError] = useState(false);

  const moneyLeft = incomeTotal - expenseTotal - savingsTotal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const user = getCurrentUser();

    if (!user) return;

    if (!category) {
      setComboboxError(true);
      setLoading(false);
      return;
    }

    await addExpense({ name, price, category });

    setLoading(false);

    setPrice(0);
    setName("");
    setCategory("");

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {moneyLeft <= 0 ? (
        <Button
          variant={"destructive"}
          className="opacity-50 cursor-not-allowed hover:bg-destructive"
          onClick={() => {
            if (moneyLeft <= 0) {
              toast("No money!", {
                description: "You can't spend money you don't have!",
                action: {
                  label: "Close",
                  onClick: () => {},
                },
              });
            }
          }}
        >
          Spend
        </Button>
      ) : (
        <DrawerTrigger asChild>
          <Button variant={"destructive"}>Spend</Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {" "}
              {moneyLeft - price < 0 ? "No money!" : "Add an expense"}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {moneyLeft - price < 0
                ? "Earn an income before spending!"
                : "What have you spent?"}
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
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
              {loading ? "Please wait..." : "Spend"}
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

export function AddIncomeDrawer() {
  const { addIncome } = useFinance();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) return;

    setLoading(true);

    await addIncome({ name, price });

    setLoading(false);

    setPrice(0);
    setName("");

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-500/90 font-bold">
          Earn
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add an Income</DrawerTitle>
            <DrawerDescription>
              What have you earned this month?
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
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
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button type="submit" form="expenseForm" disabled={loading}>
              {loading ? "Please wait..." : "Earn"}
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

export function AddSavingDrawer() {
  const { addSavings, incomeTotal, expenseTotal, savingsTotal } = useFinance();
  const { addPayment } = useSavingsGoal();
  const { year, month } = useDate();
  const [price, setPrice] = useState(0);
  const [goal, setGoal] = useState<{
    value: string;
    label: string;
    id: string;
  }>();
  const [comboboxError, setComboboxError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const moneyLeft = incomeTotal - expenseTotal - savingsTotal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) return;

    if (!goal) {
      setComboboxError(true);
      return;
    }
    setLoading(true);

    await addSavings(year, month, {
      goal: goal.label,
      price,
      goalId: goal.value,
    });
    await addPayment(goal?.value, year, month, price);
    setLoading(false);

    setPrice(0);
    setGoal({ label: "", value: "", id: "" });

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {moneyLeft <= 0 ? (
        <Button
          className="opacity-50 cursor-not-allowed bg-blue-500 hover:bg-blue-500"
          onClick={() => {
            if (moneyLeft <= 0) {
              toast("No money!", {
                description: "You can't save money you don't have!",
                action: {
                  label: "Close",
                  onClick: () => {},
                },
              });
            }
          }}
        >
          Deposit
        </Button>
      ) : (
        <DrawerTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-500/90">Deposit</Button>
        </DrawerTrigger>
      )}

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {" "}
              {moneyLeft - price < 0 ? "No money!" : "Add deposit"}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {moneyLeft - price < 0
                ? "Earn an income before depositing!"
                : "Which goal do you wanna deposit to?"}
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
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
              </div>
            </div>
          </form>
          <DrawerFooter>
            <Button
              type="submit"
              form="expenseForm"
              disabled={loading || moneyLeft - price < 0}
            >
              {loading ? "Please wait..." : "Deposit"}
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
