import { useFinance } from "@/lib/stores/FinanceContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ChartRadialStacked } from "./ui/radialProgress";
import { useDate } from "@/lib/stores/DateContext";
import ConfettiExplosion from "react-confetti-explosion";
import { useSavingsGoal } from "@/lib/stores/SavingsGoal";
import { capitalize } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { EditGoals, EditMainGoal, EditPopover } from "./EditPopover";
import { AddExpenseDrawer, AddIncomeDrawer, AddSavingDrawer } from "./Drawers";

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

  const thisMonthSavings = mainGoal?.monthly?.[year]?.[month]?.paid ?? 0;

  const goalThisMonth = mainGoal?.monthly?.[year]?.[month]?.goal ?? 0;

  const monthlyProgress = goalThisMonth
    ? Math.ceil((thisMonthSavings / goalThisMonth) * 100)
    : 0;

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
              This month you have saved{" "}
              <span className="font-bold">
                {thisMonthSavings?.toLocaleString() || 0}
              </span>{" "}
              SEK!
              <br /> That is{" "}
              <span className="font-bold">{monthlyProgress}%</span> of your
              monthly goal!
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
    ? Math.ceil((mainGoal.total / mainGoal.goal) * 100)
    : 0;

  return (
    <>
      {mainGoal && (
        <Card className="w-full h-full flex flex-col gap-0">
          <CardContent className="flex flex-col gap-2 pb-2 justify-center  h-full ">
            <div className=" text-xs font-semibold flex justify-between">
              <p>{mainGoal?.name.toLocaleString()}</p>
              <div className="flex gap-1 items-center">
                <p>{capitalize(mainGoal?.goal.toLocaleString() || "")}</p>
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
      <Card className="flex flex-col h-fit justify-between items-center">
        {subGoals.length ? (
          <ScrollArea className="max-h-52 w-full">
            <CardContent className="flex flex-col py-2 gap-4 max-h-52 w-full">
              {subGoals.map((goal, i) => {
                const progress = goal.goal
                  ? Math.ceil((goal.total / goal.goal) * 100)
                  : 0;
                return (
                  <div className="flex flex-col gap-1" key={i}>
                    <div className=" text-xs font-semibold flex justify-between">
                      <p>{goal.name.toLocaleString()}</p>

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

export function ExpenseBox() {
  const { expenses } = useFinance();

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
                  <p>{capitalize(expense.name)}</p>
                  <p className="text-primary/60">
                    {capitalize(expense.category)}
                  </p>
                  <div className="flex gap-1 items-center">
                    <p>{expense.price.toLocaleString()}</p>
                    <EditPopover
                      type="expense"
                      price={expense.price}
                      name={expense.name}
                      category={expense.category}
                      index={i}
                    />
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
      <CardFooter className="flex justify-end w-full items-end ">
        <AddExpenseDrawer />
      </CardFooter>
    </Card>
  );
}

export function IncomeBox() {
  const { incomes } = useFinance();

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
                      <EditPopover
                        type="income"
                        price={income.price}
                        name={income.name}
                        index={i}
                      />
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
        <CardFooter className="flex justify-end w-full items-end ">
          <AddIncomeDrawer />
        </CardFooter>
      </Card>
    </>
  );
}

export function SavingsBox() {
  const { savings } = useFinance();

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
                      <EditPopover
                        type="save"
                        price={save.price}
                        name={save.goal}
                        index={i}
                        goalId={save.goalId}
                      />
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
        <CardFooter className="flex justify-end w-full items-end ">
          <AddSavingDrawer />
        </CardFooter>
      </Card>
    </>
  );
}
