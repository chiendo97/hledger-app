import {
  Asset,
  BalanceSheetData,
  IncomeStatementData,
  TransactionData,
} from "./interfaces";

export async function fetchBalanceSheet(
  level: number,
  year: number = new Date().getFullYear(),
): Promise<BalanceSheetData> {
  if (level < 1) {
    throw new Error("Invalid level");
  }

  if (level > 3) {
    throw new Error("Level too deep");
  }

  // Declare a BalanceSheetData object
  const balanceSheetData: BalanceSheetData = {
    date: year.toString(),
    assets: [],
    liabilities: [],
  };

  const response = await fetch("/api/accountnames");
  const accountNamesData = await response.json();

  const accountNames = [] as string[];

  for (const accountName of accountNamesData) {
    if (accountName.split(":").length !== level) {
      continue;
    }
    if (accountName.split(":")[0] !== "asset") {
      continue;
    }
    accountNames.push(accountName);
  }

  for (const accountName of accountNames) {
    const response = await fetch(
      `/api/accounttransactions/${accountName}?year=${year}`,
    );

    const assets = (await response.json()) as Asset[];
    balanceSheetData.assets.push(...assets);
  }

  return balanceSheetData;
}

export async function fetchIncomeStatement(): Promise<IncomeStatementData> {
  const response = await fetch("/api/transactions?income-statement");
  const incomeStatementData = await response.json();

  return incomeStatementData;
}

export async function fetchTransactions(): Promise<TransactionData[]> {
  const response = await fetch("/api/transactions?transactions");

  return await response.json();
}
