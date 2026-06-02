import crypto from 'crypto';

// Endpoint de reset — NUNCA é chamado pelo app automaticamente.
// Requer header X-Admin-Key igual à variável de ambiente ADMIN_KEY.
// Uso: curl -X POST https://[url]/api/state-reset \
//        -H "X-Admin-Key: <ADMIN_KEY>" \
//        -H "Content-Type: application/json" \
//        -d '{"state": {...}}'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey    = (process.env.ADMIN_KEY || '').trim();
  const providedKey = (req.headers['x-admin-key'] || '').trim();

  if (!adminKey) {
    return res.status(500).json({ error: 'ADMIN_KEY not configured on server' });
  }

  // Timing-safe comparison para a chave admin
  const a = Buffer.from(providedKey.padEnd(64));
  const b = Buffer.from(adminKey.padEnd(64));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b) || providedKey !== adminKey) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  const { state } = req.body || {};
  if (!state || !Array.isArray(state.groups) || !Array.isArray(state.centrals)) {
    return res.status(400).json({ error: 'state com groups[] e centrals[] é obrigatório' });
  }

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return res.status(503).json({ error: 'KV not configured' });

  try {
    const resp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'golive_state_concrelongo', JSON.stringify(state)]),
    });

    const data = await resp.json();
    if (data.result !== 'OK') return res.status(500).json({ error: 'KV write failed', detail: data });

    return res.status(200).json({
      ok: true,
      groups:    state.groups.length,
      centrals:  state.centrals.length,
      completed: (state.completed || []).length,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reset state' });
  }
}
