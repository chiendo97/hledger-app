import { IncomeStatementData, TransactionData } from "@/app/interfaces";
import { forwardRequest } from "../utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isIncomeStatement = searchParams.has("income-statement");
  const isTransactions = searchParams.has("transactions");

  const forwardResponse = await forwardRequest(request, "/transactions");
  if (forwardResponse.status !== 200) {
    return forwardResponse;
  }

  if (isIncomeStatement === true) {
    const transactionsData = await forwardResponse.json();

    const incomeStatementData: IncomeStatementData = {
      startDate: "", // Populate this with a valid start date logic
      endDate: "", // Populate this with a valid end date logic
      revenues: [],
      expenses: [],
    };

    // Assuming your response structure is consistent, we process it
    for (const transaction of transactionsData) {
      const date = transaction.tdate;

      for (const posting of transaction.tpostings) {
        if (posting.pamount.length === 0) {
          continue;
        }

        const account = posting.paccount;
        const currency = posting.pamount[0].acommodity;
        const amount = posting.pamount[0].aquantity.floatingPoint;

        if ("expense" === account.split(":")[0]) {
          incomeStatementData.expenses.push({
            name: account,
            amount: amount,
            currency: currency,
            date: date,
          });
        } else if ("revenue" === account.split(":")[0]) {
          incomeStatementData.revenues.push({
            name: account,
            amount: -1 * amount,
            currency: currency,
            date: date,
          });
        }
      }
    }

    return new Response(JSON.stringify(incomeStatementData), {
      status: forwardResponse.status,
      headers: forwardResponse.headers,
    });
  }

  if (isTransactions === true) {
    const transactionsData = await forwardResponse.json();

    const transactions: TransactionData[] = [];

    // Assuming your response structure is consistent, we process it
    for (const transaction of transactionsData) {
      if (transaction.tpostings.length !== 2) {
        continue;
      }

      const date = transaction.tdate;
      const description = transaction.tdescription;
      const posting = transaction.tpostings[0];
      const index = transaction.tindex;
      const transactionID =
        transaction.ttags[transaction.ttags.length - 1][
          transaction.ttags[transaction.ttags.length - 1].length - 1
        ];

      if (posting.pamount.length === 0) {
        continue;
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
      });
    }

    // return transactions;
    return new Response(JSON.stringify(transactions), {
      status: forwardResponse.status,
      headers: forwardResponse.headers,
    });
  }

  return forwardResponse;
}
