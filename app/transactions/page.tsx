"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { fetchTransactions } from "../apis";
import { TransactionData } from "../interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ArrowUpRight, ArrowDownLeft, Circle } from "lucide-react";
import TransactionsList from "./transaction";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toISOString().slice(0, 7);

export default function Transactions() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "",
  );
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get("month") || currentMonth,
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || currentYear.toString(),
  );
  const [sortBy, setSortBy] = useState("date"); // New state for sorting
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions()
      .then((result) => {
        setTransactions(result);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching balance sheet:", error);
        setIsLoading(false);
      });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const updateURLParams = (params: { [key: string]: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`/transactions?${newSearchParams.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    updateURLParams({ category });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    updateURLParams({ month });
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const newMonth =
      selectedMonth === "total" ? "total" : year + selectedMonth.slice(4);

    setSelectedMonth(newMonth);
    updateURLParams({ year, month: newMonth });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const sortedTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      if (
        searchQuery !== "" &&
        !transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        categoryFilter !== "" &&
        !transaction.category
          .toLowerCase()
          .includes(categoryFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedMonth !== "total" &&
        !transaction.date.startsWith(selectedMonth)
      ) {
        return false;
      }
      if (selectedYear && !transaction.date.startsWith(selectedYear)) {
        return false;
      }
      return true;
    });

    // Sort based on the selected option
    if (sortBy === "date") {
      filtered.sort((a, b) => {
        if (a.date === b.date) {
          return b.index - a.index;
        }
        return b.date.localeCompare(a.date);
      });
    } else if (sortBy === "amount") {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }

    return filtered.slice(0, 200);
  }, [
    searchQuery,
    categoryFilter,
    transactions,
    selectedMonth,
    sortBy,
    selectedYear,
  ]);

  const transactionByCurrency = sortedTransactions.reduce(
    (byCurrency, asset) => {
      if (!byCurrency[asset.currency]) {
        byCurrency[asset.currency] = 0;
      }
      byCurrency[asset.currency] += asset.amount;
      return byCurrency;
    },
    {} as Record<string, number>,
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(Math.abs(amount));
  };

  const totalTransaction = Object.entries(transactionByCurrency)
    .map(([currency, amount]) => `${formatCurrency(amount, currency)}`)
    .join(", ");

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === "transfer")
      return <Circle className="w-5 h-5 text-blue-500" />;

    return amount > 0 ? (
      <ArrowUpRight className="w-5 h-5 text-red-500" />
    ) : (
      <ArrowDownLeft className="w-5 h-5 text-green-500" />
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <div className="flex flex-wrap gap-4">
        <Input
          className="w-[180px]"
          id="search"
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Input
          className="w-[180px]"
          id="category"
          type="text"
          placeholder="Enter category..."
          value={categoryFilter}
          onChange={(e) => handleCategoryFilter(e.target.value)}
        />
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleMonthChange} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(parseInt(selectedYear, 10), i, 15);
              const monthStr = date.toISOString().slice(0, 7);
              return (
                <SelectItem key={monthStr} value={monthStr}>
                  {date.toLocaleString("default", { month: "long" })}
                </SelectItem>
              );
            }).reverse()}
          </SelectContent>
        </Select>
        {/* New Select component for sorting */}
        <Select onValueChange={handleSortChange} value={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <TransactionsList transactions={sortedTransactions} />
      )}
      <div className="mt-4 text-center">
        <p className="font-semibold">Total: {totalTransaction}</p>
      </div>
    </div>
  );
}
