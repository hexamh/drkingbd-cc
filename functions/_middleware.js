/**
 * functions/_middleware.js
 * Global CORS middleware applied to all Pages Functions routes.
 * https://developers.cloudflare.com/pages/functions/middleware/
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Run the actual handler
  const response = await context.next();

  // Clone and attach CORS headers
  const newResponse = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => newResponse.headers.set(k, v));

  return newResponse;
}
