export const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

export async function forwardRequest(request: Request, endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error forwarding request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

