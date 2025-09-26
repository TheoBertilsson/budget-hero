import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ChartRadialStacked } from "./ui/radialProgress";
import { useDate } from "@/lib/stores/DateContext";
import ConfettiExplosion from "react-confetti-explosion";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { capitalize, getCurrentUser } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { EditGoals, EditMainGoal, EditPopover } from "./EditPopover";
import { AddExpenseDrawer, AddIncomeDrawer, AddSavingDrawer } from "./Drawers";
import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MonthlyFinance } from "@/lib/types";

export function SummaryCard() {
  const { incomeTotal, expenseTotal, savingsTotal } = useFinance();

  return (
    <>
      <Card className="w-full h-full">
        <CardContent className="flex flex-col gap-2 w-full h-full ">
          <div className="flex items-center justify-center">
            <ChartRadialStacked
              expenses={expenseTotal}
              income={incomeTotal}
              savings={savingsTotal}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center"></CardFooter>
      </Card>
    </>
  );
}

export function MonthlySavingProgress() {
  const { mainGoal } = useSavingsGoal();
  const { year, month } = useDate();
  const { savingsTotal, incomeTotal } = useFinance();

  const thisMonthSavings = mainGoal?.monthly?.[year]?.[month]?.paid ?? 0;

  const goalThisMonth = mainGoal?.monthly?.[year]?.[month]?.goal ?? 0;

  const monthlyProgress = goalThisMonth
    ? Math.round((thisMonthSavings / goalThisMonth) * 100)
    : 0;
  console.log(savingsTotal);

  return (
    <>
      <Card className="w-full my-auto h-full">
        <CardContent className="flex flex-col gap-5 px-0 justify-between  h-full py-0">
          <div className="flex flex-col gap-1 justify-start h-full  px-4">
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

            <p className="text-sm">
              You have saved{" "}
              <span className="font-bold">
                {savingsTotal.toLocaleString() || 0}
              </span>
              {"  "}
              SEK this month!
              <br /> That is{" "}
              <span className="font-bold">
                {Math.ceil(savingsTotal / incomeTotal).toLocaleString()}%
              </span>{" "}
              of your income!
            </p>
          </div>
          <SavingsBox />
        </CardContent>
      </Card>
    </>
  );
}

export function TotalSavingsGoal() {
  const { mainGoal } = useSavingsGoal();

  const totalProgress = mainGoal?.goal
    ? Math.round((mainGoal.total / mainGoal.goal) * 100)
    : 0;

  return (
    <>
      {mainGoal && (
        <Card className="w-full h-full flex flex-col gap-0">
          <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
            <div className=" text-xs font-semibold flex justify-between">
              <p>{capitalize(mainGoal?.name)}</p>
              <div className="flex gap-1 items-center">
                <p>{mainGoal?.goal.toLocaleString() || ""}</p>
                <EditMainGoal goal={mainGoal} />
              </div>
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
      )}
    </>
  );
}

export function SubGoals({ setShow }: { setShow: (show: boolean) => void }) {
  const { subGoals } = useSavingsGoal();

  return (
    <>
      <Card className="flex flex-col h-fit justify-between items-center w-full flex-1">
        {subGoals.length ? (
          <ScrollArea className="max-h-52 w-full">
            <CardContent className="flex flex-col py-2 gap-4 max-h-52 w-full">
              {subGoals.map((goal, i) => {
                const progress = goal.goal
                  ? Math.round((goal.total / goal.goal) * 100)
                  : 0;
                return (
                  <div className="flex flex-col gap-1" key={i}>
                    <div className=" text-xs font-semibold flex justify-between">
                      <p>{capitalize(goal.name)}</p>

                      <div className="flex gap-1 items-center">
                        <p>{goal.goal.toLocaleString()}</p>
                        <EditGoals goal={goal} />
                      </div>
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
          </ScrollArea>
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

export function PreviousMonthBox() {
  const user = getCurrentUser();
  const { year, month } = useDate();
  const { addExpense, addIncome, addSavings } = useFinance();
  const { addPayment } = useSavingsGoal();
  const [previousMonthFinance, setPreviousMonthFinance] =
    useState<MonthlyFinance | null>(null);
  const previousMonth =
    Number(month) === 1
      ? "12"
      : (Number(month) - 1).toString().padStart(2, "0");
  const targetYear =
    previousMonth === "12" ? (Number(year) - 1).toString() : year;

  useEffect(() => {
    const fetchFinance = async () => {
      const previousFinanceRef = doc(
        db,
        "users",
        user.uid,
        "finance",
        `${targetYear}-${previousMonth}`
      );
      const snap = await getDoc(previousFinanceRef);

      if (snap.exists()) {
        setPreviousMonthFinance(snap.data() as MonthlyFinance);
      } else {
        setPreviousMonthFinance(null);
      }
    };
    fetchFinance();
  }, [year, month]);

  return (
    <Card className="flex flex-col w-full items-center justify-center max-h-[31rem] flex-1">
      <ScrollArea className="max-h-[28rem] w-full rounded-lg">
        {previousMonthFinance ? (
          <CardContent className="flex flex-col py-2 gap-4  overflow-auto w-full">
            {previousMonthFinance?.incomes?.length > 0 && (
              <div className="border-b pb-4 flex flex-col gap-2">
                <h3 className="font-bold">Incomes</h3>
                <div className="flex flex-col gap-3 bg-primary/10 p-3 rounded-lg">
                  {previousMonthFinance.incomes.map((income, i) => {
                    return (
                      <div
                        className="gap-1 text-sm font-semibold flex justify-between items-center"
                        key={i}
                      >
                        <p className="w-full">{capitalize(income.name)}</p>
                        <div className="flex gap-2 items-center w-full justify-end">
                          <p>{income.price.toLocaleString()}</p>
                          <Button
                            variant={"secondary"}
                            className="size-6 bg-white"
                            onClick={() => {
                              addIncome(income, year, month);
                            }}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {previousMonthFinance?.expenses?.length > 0 && (
              <div className="border-b pb-4 flex flex-col gap-2">
                <h3 className="font-bold">Expenses</h3>
                <div className="flex flex-col gap-3 bg-primary/10 p-3 rounded-lg">
                  {previousMonthFinance.expenses.map((expense, i) => {
                    return (
                      <div
                        className="gap-4 text-sm font-semibold flex justify-between items-center"
                        key={i}
                      >
                        <p className="w-full">{capitalize(expense.name)}</p>
                        <p className="text-primary/60 w-full text-center">
                          {capitalize(expense.category)}
                        </p>
                        <div className="flex gap-4 items-center w-full justify-end">
                          <p>{expense.price.toLocaleString()}</p>
                          <Button
                            variant={"secondary"}
                            className="size-6 bg-white"
                            onClick={() => {
                              addExpense(expense, year, month);
                            }}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {previousMonthFinance?.savings?.length > 0 && (
              <div className="pb-4 flex flex-col gap-2">
                <h3 className="font-bold">Savings</h3>
                <div className="flex flex-col gap-3 bg-primary/10 p-3 rounded-lg">
                  {previousMonthFinance.savings.length > 0 &&
                    previousMonthFinance.savings.map((save, i) => {
                      return (
                        <div
                          className="gap-2 text-sm font-semibold flex justify-between items-center"
                          key={i}
                        >
                          <p className="w-full">{capitalize(save.goal)}</p>
                          <div className="flex gap-1 items-center w-full justify-end">
                            <p>{save.price.toLocaleString()}</p>
                            <Button
                              variant={"secondary"}
                              className="size-6 bg-white"
                              onClick={() => {
                                addSavings(save, year, month);
                                addPayment(
                                  save.goalId,
                                  year,
                                  month,
                                  save.price
                                );
                              }}
                            >
                              <PlusIcon />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </CardContent>
        ) : (
          <>
            <div></div>
            <CardContent className="flex justify-center items-center text-primary/60">
              <p>No previous month</p>
            </CardContent>
          </>
        )}
      </ScrollArea>
    </Card>
  );
}

export function ExpenseBox() {
  const { expenses, removeExpenses } = useFinance();
  const [showSelect, setShowSelect] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  return (
    <Card className="flex flex-col h-full justify-between items-center">
      {expenses.length > 0 ? (
        <ScrollArea className=" max-h-[31.25rem] w-full">
          <CardContent className="flex flex-col py-2 gap-4  overflow-auto w-full">
            {expenses.map((expense, i) => {
              return (
                <div
                  className="gap-1 text-sm font-semibold flex justify-between border-b pb-1"
                  key={i}
                >
                  <p className="w-full">{capitalize(expense.name)}</p>
                  <p className="text-primary/60 w-full text-center">
                    {capitalize(expense.category)}
                  </p>
                  <div className="flex gap-1 items-center w-full justify-end">
                    <p>{expense.price.toLocaleString()}</p>
                    {showSelect ? (
                      <Checkbox
                        className="size-4"
                        checked={selectedIndices.includes(i)}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setSelectedIndices((prev) => {
                            if (isChecked) {
                              if (prev.includes(i)) return prev;
                              return [...prev, i];
                            } else {
                              return prev.filter((idx) => idx !== i);
                            }
                          });
                        }}
                      />
                    ) : (
                      <EditPopover
                        type="expense"
                        price={expense.price}
                        name={expense.name}
                        category={expense.category}
                        index={i}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </ScrollArea>
      ) : (
        <>
          <div></div>
          <CardContent className="flex justify-center items-center text-primary/60">
            <p>No expenses yet</p>
          </CardContent>
        </>
      )}
      <CardFooter className="flex justify-between w-full items-end ">
        <Button
          variant={"ghost"}
          onClick={() => {
            setShowSelect(!showSelect);
            setSelectedIndices([]);
          }}
        >
          {showSelect ? "Cancel" : "Select"}
        </Button>
        {showSelect ? (
          <Button
            variant="destructive"
            className="bg-red-600 size-8"
            onClick={() => {
              setShowSelect(false);
              removeExpenses(selectedIndices);
              setSelectedIndices([]);
            }}
          >
            <TrashIcon />
          </Button>
        ) : (
          <AddExpenseDrawer />
        )}
      </CardFooter>
    </Card>
  );
}

export function IncomeBox() {
  const { incomes, removeIncomes } = useFinance();
  const [showSelect, setShowSelect] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  return (
    <>
      <Card className="flex flex-col h-full justify-between items-center">
        {incomes.length > 0 ? (
          <ScrollArea className="w-full max-h-40">
            <CardContent className="flex flex-col py-2 gap-4 max-h-40 w-full">
              {incomes.map((income, i) => {
                return (
                  <div
                    className="gap-1 text-sm font-semibold flex justify-between border-b pb-1"
                    key={i}
                  >
                    <p>{capitalize(income.name)}</p>
                    <div className="flex gap-1 items-center">
                      <p>{income.price.toLocaleString()}</p>
                      {showSelect ? (
                        <Checkbox
                          className="size-4"
                          checked={selectedIndices.includes(i)}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            setSelectedIndices((prev) => {
                              if (isChecked) {
                                if (prev.includes(i)) return prev;
                                return [...prev, i];
                              } else {
                                return prev.filter((idx) => idx !== i);
                              }
                            });
                          }}
                        />
                      ) : (
                        <EditPopover
                          type="income"
                          price={income.price}
                          name={income.name}
                          index={i}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </ScrollArea>
        ) : (
          <>
            <div></div>
            <CardContent className="flex justify-center items-center text-primary/60">
              <p>No income yet</p>
            </CardContent>
          </>
        )}
        <CardFooter className="flex justify-between w-full items-end ">
          <Button
            variant={"ghost"}
            onClick={() => {
              setShowSelect(!showSelect);
              setSelectedIndices([]);
            }}
          >
            {showSelect ? "Cancel" : "Select"}
          </Button>
          {showSelect ? (
            <Button
              variant="destructive"
              className="bg-red-600 size-8"
              onClick={() => {
                setShowSelect(false);
                removeIncomes(selectedIndices);
                setSelectedIndices([]);
              }}
            >
              <TrashIcon />
            </Button>
          ) : (
            <AddIncomeDrawer />
          )}
        </CardFooter>
      </Card>
    </>
  );
}

export function SavingsBox() {
  const { savings, removeSaves } = useFinance();
  const [showSelect, setShowSelect] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  return (
    <>
      <Card className="flex flex-col justify-end items-center border-none shadow-none p-0">
        {savings.length ? (
          <ScrollArea className="w-full max-h-24">
            <CardContent className="flex flex-col gap-2 max-h-24 w-full">
              {savings.map((save, i) => {
                return (
                  <div
                    className="gap-1 text-sm font-semibold flex justify-between border-b pb-1"
                    key={i}
                  >
                    <p>{capitalize(save.goal)}</p>
                    <div className="flex gap-1 items-center">
                      <p>{save.price.toLocaleString()}</p>
                      {showSelect ? (
                        <Checkbox
                          className="size-4"
                          checked={selectedIndices.includes(i)}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            setSelectedIndices((prev) => {
                              if (isChecked) {
                                if (prev.includes(i)) return prev;
                                return [...prev, i];
                              } else {
                                return prev.filter((idx) => idx !== i);
                              }
                            });
                          }}
                        />
                      ) : (
                        <EditPopover
                          type="save"
                          price={save.price}
                          name={save.goal}
                          index={i}
                          goalId={save.goalId}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </ScrollArea>
        ) : (
          <>
            <CardContent className="flex justify-center items-center text-primary/60">
              <p>No savings yet</p>
            </CardContent>
          </>
        )}
        <CardFooter className="flex justify-between w-full items-end ">
          <Button
            variant={"ghost"}
            onClick={() => {
              setShowSelect(!showSelect);
              setSelectedIndices([]);
            }}
          >
            {showSelect ? "Cancel" : "Select"}
          </Button>
          {showSelect ? (
            <Button
              variant="destructive"
              className="bg-red-600 size-8"
              onClick={() => {
                setShowSelect(false);
                removeSaves(selectedIndices);
                setSelectedIndices([]);
              }}
            >
              <TrashIcon />
            </Button>
          ) : (
            <AddSavingDrawer />
          )}
        </CardFooter>
      </Card>
    </>
  );
}
