import crypto from 'crypto';

function verifyJWT(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  if (signature !== expected) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.TOKEN_SECRET || '';
  const token  = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const decoded = verifyJWT(token, secret);

  if (!decoded || decoded.role !== 'editor') {
    return res.status(403).json({ error: 'Forbidden: editor role required' });
  }

  const { state } = req.body || {};
  if (!state) {
    return res.status(400).json({ error: 'State is required' });
  }

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(503).json({ error: 'KV_REST_API_URL / KV_REST_API_TOKEN not configured' });
  }

  try {
    const resp = await fetch(kvUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', 'golive_state_concrelongo', JSON.stringify(state)]),
    });

    if (!resp.ok) {
      return res.status(502).json({ error: 'KV write failed' });
    }

    const data = await resp.json();
    if (data.result !== 'OK') {
      return res.status(500).json({ error: 'Unexpected KV response', detail: data });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save state' });
  }
}
