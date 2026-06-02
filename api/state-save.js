import { verifyJWT, bearerToken } from './_jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret  = process.env.TOKEN_SECRET || '';
  const decoded = verifyJWT(bearerToken(req), secret);

  if (!decoded || decoded.role !== 'editor') {
    return res.status(403).json({ error: 'Forbidden: editor role required' });
  }

  const { state } = req.body || {};
  if (!state) return res.status(400).json({ error: 'State is required' });

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return res.status(503).json({ error: 'KV not configured' });

  try {
    const resp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'golive_state_concrelongo', JSON.stringify(state)]),
    });

    if (!resp.ok) return res.status(502).json({ error: 'KV write failed' });

    const data = await resp.json();
    if (data.result !== 'OK') return res.status(500).json({ error: 'Unexpected KV response' });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to save state' });
  }
}
