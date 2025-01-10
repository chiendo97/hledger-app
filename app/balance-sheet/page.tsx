"use client";

import { useEffect, useRef, useState } from "react";
import { NestedLevelSelector } from "@/components/NestedLevelSelector";
import { Asset, BalanceSheetData } from "../interfaces";
import { fetchBalanceSheet } from "../apis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Dummy data
const balanceSheetData = {
  date: "",
  assets: [],
  liabilities: [],
};

const currentYear = new Date().getFullYear();

function sortByAmountAndCurrency(
  items: {
    name: string;
    amount: number;
    currency: string;
  }[],
) {
  return items.sort((a, b) => {
    if (a.currency !== b.currency) {
      return a.currency.localeCompare(b.currency);
    }
    return a.name.localeCompare(b.name);
  });
}

function groupByNestedLevel(items: Asset[], level: number) {
  return items.reduce(
    (acc, item) => {
      const key = item.name.split(":").slice(0, level).join(":");
      if (!acc[key]) {
        acc[key] = { ...item };
      } else {
        acc[key].amount += item.amount;
      }

      return acc;
    },
    {} as {
      [key: string]: {
        name: string;
        amount: number;
        currency: string;
      };
    },
  );
}

export default function BalanceSheet() {
  const [data, setData] = useState<BalanceSheetData>(balanceSheetData);
  const [nestedLevel, setNestedLevel] = useState(2);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [isLoading, setIsLoading] = useState(true);

  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the effect on initial mount to avoid double fetching
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsLoading(true);
    fetchBalanceSheet(nestedLevel, parseInt(selectedYear, 10))
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching balance sheet:", error);
        setIsLoading(false);
      });
  }, [nestedLevel, selectedYear]);

  const handleLevelChange = (level: number) => {
    setNestedLevel(level);
  };

  const renderItems = (items: Asset[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level);
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems));

    return sortedItems.map((item, index: number) => (
      <TableRow key={index}>
        <TableCell className="text-left">{item.name}</TableCell>
        <TableCell
          className={`text-right ${item.amount < 0 ? "text-red-500" : "text-green-500"}`}
        >
          {item.amount.toLocaleString()} {item.currency}
        </TableCell>
      </TableRow>
    ));
  };

  const totalAssets = data.assets.reduce(
    (acc, asset) => {
      if (!acc[asset.currency]) {
        acc[asset.currency] = 0;
      }
      acc[asset.currency] += asset.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const netWorth = Object.entries(totalAssets)
    .map(([currency, amount]) => `${amount.toLocaleString()} ${currency}`)
    .join(", ");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Balance Sheet</h1>
      <div className="flex flex-wrap gap-4">
        <NestedLevelSelector onLevelChange={handleLevelChange} />
        <Select onValueChange={setSelectedYear} value={selectedYear.toString()}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left"></TableHead>
                <TableHead className="text-right">{data.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">
                  Assets
                </TableCell>
              </TableRow>
              {renderItems(data.assets, nestedLevel)}
              {data.assets.length !== 0 && (
                <TableRow>
                  <TableCell className="text-right font-bold">
                    Total Assets:
                  </TableCell>
                  <TableCell className="text-right">{netWorth}</TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">
                  Liabilities
                </TableCell>
              </TableRow>
              {data.liabilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No liabilities
                  </TableCell>
                </TableRow>
              ) : (
                renderItems(data.liabilities, nestedLevel)
              )}
              {data.liabilities.length !== 0 && (
                <TableRow>
                  <TableCell className="text-right font-bold">
                    Total Liabilities:
                  </TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/50">
                <TableCell className="text-right font-bold">
                  Net Worth:
                </TableCell>
                <TableCell className="text-right">{netWorth}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
