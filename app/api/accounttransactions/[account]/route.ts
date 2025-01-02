import { forwardRequest } from "../../utils";

export async function GET(
  request: Request,
  { params }: { params: { account: string } }
) {
  return forwardRequest(request, `/accounttransactions/${params.account}`);
}

