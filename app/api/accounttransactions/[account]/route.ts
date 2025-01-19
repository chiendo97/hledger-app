import { forwardRequest } from "../../utils";

export async function GET(
  request: Request,
  { params }: { params: { account: string } },
) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  if (year === null) {
    return new Response("year parameter is required", {
      status: 400,
    });
  }

  const accountName = params.account;

  const forwardResponse = await forwardRequest(
    request,
    `/accounttransactions/${params.account}`,
  );

  if (forwardResponse.status !== 200) {
    return forwardResponse;
  }

  const accountTransactionsData = await forwardResponse.json();

  const assets = [];
  const amountByCurrency = {} as Record<string, number>;

  for (const transactions of accountTransactionsData) {
    const transaction = transactions[0];

    const date = transaction.tdate as string;

    if (!date.startsWith("1997") && !date.startsWith(year.toString())) {
      continue;
    }

    for (const posting of transaction.tpostings) {
      if (!posting.paccount.startsWith(accountName)) {
        continue;
      }

      if (posting.pamount.length === 0) {
        continue;
      }

      const currency = posting.pamount[0].acommodity;
      const amount = posting.pamount[0].aquantity.floatingPoint;

      if (amountByCurrency[currency] === undefined) {
        amountByCurrency[currency] = 0;
      }

      amountByCurrency[currency] += amount;
    }
  }

  for (const currency of Object.keys(amountByCurrency)) {
    const amount = amountByCurrency[currency];

    if (amount === 0) {
      continue;
    }

    assets.push({
      name: accountName,
      amount: amount,
      currency: currency,
    });
  }

  return new Response(JSON.stringify(assets), {
    status: forwardResponse.status,
    headers: forwardResponse.headers,
  });
}
