/**
 * functions/api/suggestions.js
 *
 * Handles the suggestion forum API:
 *   GET  /api/suggestions  — list all suggestions (newest first)
 *   POST /api/suggestions  — submit a new suggestion
 *
 * Bindings (wrangler.jsonc):
 *   SUGGESTIONS — KV namespace for persisted suggestion data
 *
 * KV schema:
 *   Key:   "suggestion:<id>"
 *   Value: JSON string of { id, text, votes, createdAt }
 *   Key:   "index"
 *   Value: JSON array of all suggestion IDs (sorted newest-first)
 *
 * https://developers.cloudflare.com/pages/functions/api-reference/
 * https://developers.cloudflare.com/pages/functions/bindings/
 */

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// ── GET /api/suggestions ────────────────────────────────────────────────────
export async function onRequestGet({ env }) {
  const KV = env.SUGGESTIONS;

  // Retrieve the index of all suggestion IDs
  const indexRaw = await KV.get('index');
  const index = indexRaw ? JSON.parse(indexRaw) : [];

  // Fetch each suggestion in parallel
  const suggestions = await Promise.all(
    index.map(async (id) => {
      const raw = await KV.get(`suggestion:${id}`);
      return raw ? JSON.parse(raw) : null;
    })
  );

  return json(suggestions.filter(Boolean));
}

// ── POST /api/suggestions ───────────────────────────────────────────────────
export async function onRequestPost({ request, env }) {
  const KV = env.SUGGESTIONS;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const text = (body.text || '').trim();
  if (!text || text.length < 5) {
    return json({ error: 'Suggestion must be at least 5 characters.' }, 400);
  }
  if (text.length > 500) {
    return json({ error: 'Suggestion must be 500 characters or fewer.' }, 400);
  }

  const id = crypto.randomUUID();
  const suggestion = {
    id,
    text,
    votes: 0,
    createdAt: new Date().toISOString(),
  };

  // Store the suggestion
  await KV.put(`suggestion:${id}`, JSON.stringify(suggestion));

  // Prepend to the index (newest first)
  const indexRaw = await KV.get('index');
  const index = indexRaw ? JSON.parse(indexRaw) : [];
  index.unshift(id);
  await KV.put('index', JSON.stringify(index));

  return json(suggestion, 201);
}
