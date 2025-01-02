"use client";

import { useState, useMemo, useEffect } from "react";
import { NestedLevelSelector } from "@/components/NestedLevelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Expense, IncomeStatementData, Revenue } from "../interfaces";
import { fetchIncomeStatement } from "../apis";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toISOString().slice(0, 7);

function sortByAmountAndCurrency(
  items: {
    amount: number;
    children: Expense[] | Revenue[];
    name: string;
    currency: string;
  }[],
) {
  return items.sort((a, b) => {
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency);
    }
    return b.amount - a.amount;
  });
}

function groupByNestedLevel(items: Expense[] | Revenue[], level: number) {
  return items.reduce(
    (acc, item) => {
      const key = item.name.split(":").slice(0, level).join(":");
      if (!acc[key]) {
        acc[key] = { ...item, children: [], amount: 0, name: key };
      }
      acc[key].amount += item.amount;
      if (item.name.split(":").length > level) {
        acc[key].children.push(item);
      }
      return acc;
    },
    {} as {
      [key: string]: {
        amount: number;
        children: Expense[] | Revenue[];
        name: string;
        currency: string;
      };
    },
  );
}

export default function IncomeStatement() {
  const [data, setData] = useState<IncomeStatementData>({
    startDate: ``,
    endDate: ``,
    revenues: [],
    expenses: [],
  });
  const [nestedLevel, setNestedLevel] = useState(2);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  console.log(selectedYear, selectedMonth);

  useEffect(() => {
    fetchIncomeStatement().then(setData);
  }, []);

  const handleLevelChange = (level: number) => {
    setNestedLevel(level);
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    const newMonth =
      selectedMonth === "total" ? "total" : `${year}${selectedMonth.slice(4)}`;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const filteredData = useMemo(() => {
    if (selectedMonth === "total") {
      return data;
    }
    return {
      ...data,
      revenues: data.revenues.filter((item) =>
        item.date.startsWith(selectedMonth),
      ),
      expenses: data.expenses.filter((item) =>
        item.date.startsWith(selectedMonth),
      ),
    };
  }, [data, selectedMonth, selectedYear]);

  const renderItems = (items: Expense[] | Revenue[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level);
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems));

    return sortedItems.map((item, index: number) => (
      <TableRow key={index}>
        <TableCell className="text-left">
          <Link
            href={`/transactions?category=${encodeURIComponent(item.name)}&month=${selectedMonth}&year=${selectedYear}`}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {item.name}
          </Link>
        </TableCell>
        <TableCell className="text-right text-green-500">
          {item.amount.toLocaleString()} {item.currency}
        </TableCell>
      </TableRow>
    ));
  };

  const totalRevenues = useMemo(
    () => filteredData.revenues.reduce((sum, item) => sum + item.amount, 0),
    [filteredData],
  );
  const totalExpenses = useMemo(
    () => filteredData.expenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredData],
  );

  const netIncome = totalRevenues - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Income Statement</h1>
      <div className="flex flex-wrap gap-4">
        <NestedLevelSelector onLevelChange={handleLevelChange} />
        <Select
          onValueChange={handleYearChange}
          defaultValue={selectedYear.toString()}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleMonthChange} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(selectedYear, i, 15);
              const monthStr = date.toISOString().slice(0, 7);
              return (
                <SelectItem key={monthStr} value={monthStr}>
                  {date.toLocaleString("default", { month: "long" })}
                </SelectItem>
              );
            }).reverse()}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-bold">
                Revenues
              </TableCell>
            </TableRow>
            {renderItems(filteredData.revenues, nestedLevel)}
            <TableRow className="font-bold">
              <TableCell className="text-right">Total Revenues:</TableCell>
              <TableCell className="text-right">
                {totalRevenues.toLocaleString()} vnd
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell colSpan={2} className="font-bold">
                Expenses
              </TableCell>
            </TableRow>
            {renderItems(filteredData.expenses, nestedLevel)}
            <TableRow className="font-bold">
              <TableCell className="text-right">Total Expenses:</TableCell>
              <TableCell className="text-right">
                {totalExpenses.toLocaleString()} vnd
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="text-right">Net Income:</TableCell>
              <TableCell className="text-right">
                {netIncome.toLocaleString()} vnd
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
