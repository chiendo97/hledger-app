"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [sortBy, setSortBy] = useState("date"); // New state for sorting

  useEffect(() => {
    fetchTransactions().then((transactions) => {
      setTransactions(transactions);
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
  }, [searchQuery, categoryFilter, transactions, selectedMonth, sortBy]);

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
        <Select onValueChange={handleMonthChange} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(currentYear, i, 15);
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
      <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-4 py-2 text-left w-[115px]">Date</TableHead>
                <TableHead className="px-4 py-2 text-left">
                  Description
                </TableHead>
                <TableHead className="px-4 py-2 text-right w-[150px]">Amount</TableHead>
                <TableHead className="px-4 py-2 text-left">Category</TableHead>
                <TableHead className="px-4 py-2 text-left">Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-b border-muted-foreground/20"
                >
                  <TableCell className="px-4 py-2">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {transaction.description}
                  </TableCell>
                  <TableCell
                    className={`px-4 py-2 text-right ${transaction.amount < 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {transaction.category}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {transaction.account}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
