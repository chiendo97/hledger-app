
export interface Asset {
  name: string;      // The name of the asset
  amount: number;    // The monetary amount of the asset, can be negative
  currency: string;  // Currency code
}

export interface BalanceSheetData {
  date: string;         // Date in string format
  assets: Asset[];      // Array of assets
  liabilities: Asset[];  // Array of liabilities (currently empty, but same structure as assets)
}

export interface Revenue {
  name: string;      // Name of the revenue source
  amount: number;    // Amount of revenue, can be positive or negative
  currency: string;  // Currency code
  date: string;      // Date of the revenue
}

export interface Expense {
  name: string;      // Name of the expense source
  amount: number;    // Amount of expense
  currency: string;  // Currency code
  date: string;      // Date of the expense
}

export interface IncomeStatementData {
  startDate: string;     // Start date of the reporting period
  endDate: string;       // End date of the reporting period
  revenues: Revenue[];   // Array of revenues
  expenses: Expense[];   // Array of expenses
}

export interface TransactionData {
  date: string;         // Date of the transaction
  id: number;           // Unique identifier for the transaction
  description: string;  // Description of the transaction
  amount: number;       // The monetary amount involved in the transaction
  currency: string;     // Currency code (e.g., 'vnd')
  category: string;     // Category that the transaction belongs to
  account: string;      // Account related to the transaction
}
