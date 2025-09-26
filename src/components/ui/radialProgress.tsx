"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function ChartRadialStacked({
  expenses,
  income,
  savings,
}: {
  expenses: number;
  income: number;
  savings: number;
}) {
  const totalLeft = income - expenses - savings;
  const chartData = [{ expenses, income, savings }];

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: "var(--chart-1)",
    },
    savings: {
      label: "Savings",
      color: "var(--chart-2)",
    },
    income: {
      label: "Income",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-[2/1] w-full max-w-[400px]"
    >
      <RadialBarChart
        data={chartData}
        endAngle={180}
        cy="100%"
        innerRadius={
          window.innerWidth < 400 ? 80 : window.innerWidth < 768 ? 130 : 160
        }
        outerRadius={
          window.innerWidth < 400 ? 130 : window.innerWidth < 768 ? 200 : 260
        }
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 32}
                      className="fill-foreground text-xl xs:text-3xl md:text-4xl font-bold"
                    >
                      {totalLeft.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 4}
                      className="fill-muted-foreground text-sm"
                    >
                      Left
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="expenses"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-expenses)"
          className="stroke-transparent stroke-2"
          isAnimationActive={true}
        />
        <RadialBar
          dataKey="savings"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-savings)"
          className="stroke-transparent stroke-2"
          isAnimationActive={true}
        />
        <RadialBar
          dataKey="income"
          fill="var(--color-income)"
          stackId="a"
          cornerRadius={5}
          className="stroke-transparent stroke-2"
          isAnimationActive={true}
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
