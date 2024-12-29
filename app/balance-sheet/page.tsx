"use client";

import { useEffect, useState } from "react";
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

// Dummy data
const balanceSheetData = {
  date: "2024-12-26",
  assets: [],
  liabilities: [],
};

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
    return b.amount - a.amount;
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

  useEffect(() => {
    fetchBalanceSheet(nestedLevel).then((data) => {
      setData(data);
    });
  }, [nestedLevel]);

  const handleLevelChange = (level: number) => {
    setNestedLevel(level);
  };

  const renderItems = (items: Asset[], level: number) => {
    const groupedItems = groupByNestedLevel(items, level);
    const sortedItems = sortByAmountAndCurrency(Object.values(groupedItems));

    return sortedItems.map((item, index: number) => (
      <TableRow key={index}>
        <TableCell className="text-left">{item.name}</TableCell>
        <TableCell className="text-right text-green-500">
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
      <NestedLevelSelector onLevelChange={handleLevelChange} />
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
              <TableCell className="text-right font-bold">Net Worth:</TableCell>
              <TableCell className="text-right">{netWorth}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
