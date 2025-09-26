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
import { useTranslation } from "react-i18next";

export function AddExpenseDrawer() {
  const { addExpense, incomeTotal, expenseTotal, savingsTotal } = useFinance();
  const { year, month } = useDate();
  const { t } = useTranslation();
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

    await addExpense({ name, price, category }, year, month);

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
              toast(t("noMoney"), {
                description: t("cantSpendMoney"),
                action: {
                  label: t("close"),
                  onClick: () => {},
                },
              });
            }
          }}
        >
          {t("spend")}
        </Button>
      ) : (
        <DrawerTrigger asChild>
          <Button variant={"destructive"}>{t("spend")}</Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {" "}
              {moneyLeft - price < 0 ? t("noMoney") : t("addExpense")}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft - price < 0 && "text-destructive")}
            >
              {moneyLeft - price < 0
                ? t("needToEarnBeforeSpending")
                : t("whatHaveYouSpent")}
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
                    {t("name")}
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    type="text"
                    required
                    value={name || ""}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder={t("electricalBill")}
                    name="expenseName"
                  />
                </div>
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="expensePrice"
                  >
                    {t("price")}
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    placeholder="0"
                    type="number"
                    min={0}
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.currentTarget.value))}
                    required
                    name="expensePrice"
                  />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-muted-foreground text-[0.70rem] uppercase">
                    {t("category")}
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
              {loading ? t("pleaseWait") : t("spend")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function AddIncomeDrawer() {
  const { addIncome } = useFinance();
  const { year, month } = useDate();
  const { t } = useTranslation();
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) return;

    setLoading(true);

    await addIncome({ name, price }, year, month);

    setLoading(false);

    setPrice(0);
    setName("");

    setOpen(false);
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-500/90 font-bold">
          {t("earn")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{t("addIncome")}</DrawerTitle>
            <DrawerDescription>{t("whatHaveYouEarned")} </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex flex-col gap-2">
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="incomeName"
                  >
                    {t("name")}
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    type="text"
                    required
                    value={name || ""}
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder={t("salary")}
                    name="incomeName"
                  />
                </div>
                <div className="flex-1 text-center">
                  <Label
                    className="text-muted-foreground text-[0.70rem] uppercase"
                    htmlFor="incomePrice"
                  >
                    {t("price")}
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    placeholder="0"
                    type="number"
                    min={0}
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
              {loading ? t("pleaseWait") : t("earn")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
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
  const { t } = useTranslation();
  const [price, setPrice] = useState(0);
  const [goal, setGoal] = useState<{
    value: string;
    label: string;
    id: string;
  }>();
  const [comboboxError, setComboboxError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const moneyLeft = incomeTotal - expenseTotal - savingsTotal - price;
  const ratio = 1 - Math.max(0, Math.min(1, moneyLeft / incomeTotal));

  const budgetMessages = [
    {
      threshold: 80,
      message: t("everyPennyCounts"),
    },
    {
      threshold: 60,
      message: t("beExtraMindful"),
    },
    {
      threshold: 40,
      message: t("stickToBudget"),
    },
    { threshold: 20, message: t("healthyBudgetStableEconomy") },
    {
      threshold: 0,
      message: t("strongFlexibility"),
    },
  ];

  function getBudgetMessage(ratio: number) {
    const percentage = ratio * 100;
    return budgetMessages.find(({ threshold }) => percentage > threshold)
      ?.message;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) return;

    if (!goal) {
      setComboboxError(true);
      return;
    }
    setLoading(true);

    await addSavings(
      {
        goal: goal.label,
        price,
        goalId: goal.value,
      },
      year,
      month
    );
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
              toast(t("noMoney"), {
                description: t("cantSaveMoney"),
                action: {
                  label: t("close"),
                  onClick: () => {},
                },
              });
            }
          }}
        >
          {t("deposit")}
        </Button>
      ) : (
        <DrawerTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-500/90">
            {t("deposit")}
          </Button>
        </DrawerTrigger>
      )}

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className={cn(moneyLeft < 0 && "text-destructive")}>
              {" "}
              {moneyLeft < 0 ? t("noMoney") : t("addDeposit")}
            </DrawerTitle>
            <DrawerDescription
              className={cn(moneyLeft < 0 && "text-destructive")}
            >
              {moneyLeft < 0 ? t("earnBeforeDeposit") : t("whichGoalDeposit")}
            </DrawerDescription>
          </DrawerHeader>
          <form className="p-4" id="expenseForm" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center flex-col gap-3 space-x-2">
              <div className="flex flex-col gap-3">
                <div className="flex-1 text-center">
                  <p className="text-muted-foreground text-[0.70rem] uppercase">
                    {t("goal")}
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
                    {t("price")}
                  </Label>
                  <Input
                    className="text-7xl font-bold tracking-tighter"
                    placeholder="0"
                    type="number"
                    min={0}
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.currentTarget.value))}
                    required
                    name="savingsPrice"
                  />
                </div>
                <div className="h-4 w-full rounded-full bg-gradient-to-r [background-image:linear-gradient(to_right,#22c55e,#eab308,#f97316,#dc2626)] relative">
                  <div
                    className="absolute top-1/2 h-4 w-1 bg-white border border-black  -translate-y-1/2"
                    style={{
                      left: `calc(${ratio * 100}% - ${ratio * 20}px + 10px)`,
                    }}
                  ></div>
                </div>
              </div>{" "}
              <p className="text-sm">
                {getBudgetMessage(ratio) || t("strongFlexibility")}
              </p>
            </div>
          </form>
          <DrawerFooter>
            <Button
              type="submit"
              form="expenseForm"
              disabled={loading || moneyLeft < 0}
            >
              {loading ? t("pleaseWait") : t("deposit")}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => setPrice(0)}>
                {t("cancel")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
