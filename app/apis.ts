import { BalanceSheetData, IncomeStatementData, TransactionData } from "./interfaces";








export async function fetchBalanceSheet(level: number): Promise<BalanceSheetData> {
  if (level < 1) {
    throw new Error('Invalid level');
  }

  if (level > 3) {
    throw new Error('Level too deep');
  }

  // Declare a BalanceSheetData object
  const balanceSheetData: BalanceSheetData = {
    date: new Date().toISOString().split('T')[0], // Replace with your actual date logic
    assets: [],
    liabilities: []
  };

  const response = await fetch('/api/accounts');
  const accountsData = await response.json();

  // Assuming your response structure is consistent, we process it
  for (const account of accountsData) {
    const assetName = account.aname

    const assetLevel = assetName.split(':').length
    if (assetLevel !== level) {
      continue;
    }

    if ('asset' !== assetName.split(':')[0]) {
      continue;
    }


    for (const entry of account.aibalance) {
      const currency = entry.acommodity;
      const amount = entry.aquantity.floatingPoint; // Taking the floating point directly, concerning cost.

      if (amount == 0) {
        continue;
      }

      balanceSheetData.assets.push({
        name: assetName,
        amount: amount,
        currency: currency
      });
    }
  }

  return balanceSheetData;
}

export async function fetchIncomeStatement(): Promise<IncomeStatementData> {
  // Declare a BalanceSheetData object
  const incomeStatementData: IncomeStatementData = {
    startDate: '', // Populate this with a valid start date logic
    endDate: '',   // Populate this with a valid end date logic
    revenues: [],
    expenses: []
  };

  const response = await fetch('/api/transactions');
  const transactionsData = await response.json();

  // Assuming your response structure is consistent, we process it
  for (const transaction of transactionsData) {
    const date = transaction.tdate;

    for (const posting of transaction.tpostings) {
      if (posting.pamount.length === 0) {
        continue
      }

      const account = posting.paccount;
      const currency = posting.pamount[0].acommodity;
      const amount = posting.pamount[0].aquantity.floatingPoint;

      if ('expense' === account.split(':')[0]) {
        incomeStatementData.expenses.push({
          name: account,
          amount: amount,
          currency: currency,
          date: date,
        });
      } else if ('revenue' === account.split(':')[0]) {
        incomeStatementData.revenues.push({
          name: account,
          amount: -1 * amount,
          currency: currency,
          date: date,
        });
      }
    }

  }

  return incomeStatementData;
}
export async function fetchTransactions(): Promise<TransactionData[]> {

  const transactions: TransactionData[] = [];

  const response = await fetch('/api/transactions');
  const transactionsData = await response.json();

  // Assuming your response structure is consistent, we process it
  for (const transaction of transactionsData) {
    if (transaction.tpostings.length !== 2) {
      continue;
    }

    const date = transaction.tdate;
    const description = transaction.tdescription;
    const posting = transaction.tpostings[0];
    const index = transaction.tindex;
    const transactionID = transaction.ttags[transaction.ttags.length - 1][transaction.ttags[transaction.ttags.length - 1].length - 1];

    if (posting.pamount.length === 0) {
      continue
    }

    const category = posting.paccount;
    const account = transaction.tpostings[1].paccount;
    const currency = posting.pamount[0].acommodity;
    const amount = posting.pamount[0].aquantity.floatingPoint;

    transactions.push({
      index: index,
      date: date,
      id: transactionID,
      description: description,
      amount: amount,
      currency: currency,
      category: category,
      account: account,
    })

  }

  return transactions;
}
