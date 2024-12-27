import { forwardRequest } from '../utils';

export async function POST(request: Request) {
  return forwardRequest(request, '/accounts');
}

export async function GET(request: Request) {
  return forwardRequest(request, '/accounts');
}
