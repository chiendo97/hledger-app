"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { fetchIncomeStatement } from "./apis";

const currentYear = new Date().getFullYear();

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "mobile",
    color: "#60a5fa",
  },
  expense: {
    label: "Expense",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

interface ChartData {
  month: string;
  expense: number;
}

export default function Component() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchIncomeStatement().then((data) => {
      setChartData(
        Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentYear, i, 15);
          const monthStr = date.toISOString().slice(0, 7);
          const monthExpense = data.expenses
            .filter((expense) => expense.date.startsWith(monthStr))
            .reduce((acc, expense) => acc + expense.amount, 0);
          return {
            month: monthStr,
            expense: monthExpense,
          } as ChartData;
        }),
      );
    });
  }, []);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="expense"
          fill="var(--color-desktop)"
          radius={4}
          label={(props) => {
            const { x, y, width, value } = props;

            return (
              <text
                x={x + width / 2}
                y={y}
                fill="#666"
                textAnchor="middle"
                dy={-6}
              >
                {value.toLocaleString()}
              </text>
            );
          }}
        ></Bar>
      </BarChart>
    </ChartContainer>
  );
}
