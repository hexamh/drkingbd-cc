/**
 * functions/api/suggestions/[id]/vote.js
 *
 * POST /api/suggestions/:id/vote — upvote a suggestion.
 *
 * Uses file-based dynamic routing: [id] becomes params.id at runtime.
 * https://developers.cloudflare.com/pages/functions/routing/
 * https://developers.cloudflare.com/pages/functions/api-reference/
 */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost({ params, env }) {
  const KV = env.SUGGESTIONS;
  const { id } = params;

  const raw = await KV.get(`suggestion:${id}`);
  if (!raw) {
    return json({ error: 'Suggestion not found.' }, 404);
  }

  const suggestion = JSON.parse(raw);
  suggestion.votes += 1;

  await KV.put(`suggestion:${id}`, JSON.stringify(suggestion));

  return json(suggestion);
}
