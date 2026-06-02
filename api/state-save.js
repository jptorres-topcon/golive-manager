import { verifyJWT, bearerToken } from './_jwt.js';

// Merge por id: mantém existentes, atualiza os enviados, adiciona novos
function mergeById(existing = [], incoming = []) {
  const map = new Map(existing.map(item => [item.id, item]));
  for (const item of incoming) {
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  }
  return Array.from(map.values());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret  = process.env.TOKEN_SECRET || '';
  const decoded = verifyJWT(bearerToken(req), secret);

  if (!decoded || decoded.role !== 'editor') {
    return res.status(403).json({ error: 'Forbidden: editor role required' });
  }

  const { state: incoming } = req.body || {};
  if (!incoming) return res.status(400).json({ error: 'State is required' });

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return res.status(503).json({ error: 'KV not configured' });

  try {
    // 1) Ler estado atual do KV
    const readResp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'golive_state_concrelongo']),
    });
    const { result: raw } = await readResp.json();
    const existing = raw ? JSON.parse(raw) : { groups: [], centrals: [], completed: [], sobreAviso: [] };

    // 2) Merge: nunca descarta dados existentes
    const merged = {
      groups:     mergeById(existing.groups,     incoming.groups),
      centrals:   mergeById(existing.centrals,   incoming.centrals),
      completed:  mergeById(existing.completed,  incoming.completed),
      sobreAviso: mergeById(existing.sobreAviso, incoming.sobreAviso),
    };

    // 3) Gravar merged
    const writeResp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'golive_state_concrelongo', JSON.stringify(merged)]),
    });

    if (!writeResp.ok) return res.status(502).json({ error: 'KV write failed' });
    const data = await writeResp.json();
    if (data.result !== 'OK') return res.status(500).json({ error: 'Unexpected KV response' });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to save state' });
  }
}
