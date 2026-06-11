export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = process.env.ADMIN_KEY || '';
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return res.status(503).json({ error: 'KV not configured' });

  try {
    const readResp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'golive_state_concrelongo']),
    });
    const { result: raw } = await readResp.json();
    if (!raw) return res.status(200).json({ ok: true, removed: 0, message: 'No state found' });

    const state = JSON.parse(raw);
    const completedIds = new Set((state.completed || []).map(c => c.id));
    const before = (state.centrals || []).length;
    state.centrals = (state.centrals || []).filter(c => !completedIds.has(c.id));
    const removed = before - state.centrals.length;

    if (removed === 0) {
      return res.status(200).json({ ok: true, removed: 0, message: 'No duplicates found' });
    }

    const writeResp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'golive_state_concrelongo', JSON.stringify(state)]),
    });
    if (!writeResp.ok) return res.status(502).json({ error: 'KV write failed' });

    return res.status(200).json({ ok: true, removed, message: `Removed ${removed} duplicate(s) from centrals` });
  } catch {
    return res.status(500).json({ error: 'Cleanup failed' });
  }
}
