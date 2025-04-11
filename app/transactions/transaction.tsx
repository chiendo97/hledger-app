import React from "react";
import { TransactionData } from "../interfaces";

// Import shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper function to format currency with the 'đ' symbol for Vietnamese Dong
const formatCurrency = (amount: number, currency: string): string => {
  // Format negative amounts with a minus sign
  const sign = amount < 0 ? "-" : "";
  const absAmount = Math.abs(amount);

  // Format the amount with thousands separators
  const formattedAmount = absAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Return with the appropriate currency symbol
  if (currency.toLowerCase() === "vnd" || currency === "đ") {
    return `${sign}đ${formattedAmount}`;
  }
  return `${sign}${formattedAmount} ${currency}`;
};

// Format the category as a hashtag
const formatCategory = (category: string): string => {
  return `#${category}`;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Define day names and month names
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the components
  const dayOfWeek = days[date.getDay()];
  const dayOfMonth = date.getDate(); // No leading zero
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Format as "Wed, 9 Apr 2025"
  return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
}

// Function to group transactions by date
const groupTransactionsByDate = (transactions: TransactionData[]) => {
  const grouped: Record<string, TransactionData[]> = {};

  transactions.forEach((transaction) => {
    // Extract date from transaction
    const date = formatDate(transaction.date);

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(transaction);
  });

  // Sort dates in descending order
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .reduce((result: Record<string, TransactionData[]>, date) => {
      result[date] = grouped[date];
      return result;
    }, {});
};

const TransactionsList: React.FC<{ transactions: TransactionData[] }> = ({
  transactions,
}) => {
  // Calculate income and expenses totals
  const { income, expenses } = transactions.reduce(
    (totals, transaction) => {
      if (transaction.amount < 0) {
        totals.income += transaction.amount;
      } else {
        totals.expenses += Math.abs(transaction.amount);
      }
      return totals;
    },
    { income: 0, expenses: 0 },
  );

  const groupedByDate = groupTransactionsByDate(transactions);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="p-4 pt-6">
        <h1 className="text-5xl font-normal mb-8">Transactions</h1>

        {/* Income and Expenses Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-xl">Income</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-gray-700 border-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-teal-400 text-xl mt-2">
                {formatCurrency(income, "đ")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-xl">Expenses</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-gray-700 border-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-red-400 text-xl mt-2">
                -{formatCurrency(expenses, "đ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Date-grouped Transaction Sections */}
      {Object.entries(groupedByDate).map(([date, dateTransactions]) => {
        // Calculate the sum for this date group
        const dateSum = dateTransactions.reduce(
          (sum, tx) => sum + tx.amount,
          0,
        );

        return (
          <div key={date} className="mb-8">
            <h2 className="text-2xl font-normal mb-4 ml-4">{date}</h2>
            <div className="space-y-2">
              {dateTransactions.map((transaction) => {
                return (
                  <Card
                    key={transaction.id}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700/80 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        {/* Middle section (description and account) with left alignment */}
                        <div className="ml-3 flex-1">
                          {/* Description - will be on the same line as amount */}
                          <p className="text-gray-400 truncate max-w-[200px] sm:max-w-none sm:whitespace-normal">
                            {transaction.description}
                          </p>

                          {/* Account - will be on the same line as category */}
                          <div className="text-sm">
                            {formatCategory(transaction.account)}
                          </div>
                          {/* Category - will be on the same line as account */}
                          <div className="text-sm">
                            {formatCategory(transaction.category)}
                          </div>
                        </div>

                        {/* Right section (amount and category) with right alignment */}
                        <div className="flex-shrink-0 text-right">
                          {/* Amount - will be on the same line as description */}
                          <div
                            className={`font-medium ${transaction.amount > 0 ? "text-red-400 bg-red-100" : "text-green-400 bg-green-100"}`}
                          >
                            {formatCurrency(
                              transaction.amount * -1,
                              transaction.currency,
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="mt-2 px-2 ml-2">
              <p className="text-red-400 text-xl">
                <span className="text-white">Sum:</span>{" "}
                <span className="text-red-400">
                  {formatCurrency(dateSum, "đ")}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionsList;
