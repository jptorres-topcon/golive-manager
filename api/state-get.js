import { verifyJWT, bearerToken } from './_jwt.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Qualquer role autenticado pode ler o estado
  const secret  = process.env.TOKEN_SECRET || '';
  const decoded = verifyJWT(bearerToken(req), secret);
  if (!decoded) {
    return res.status(401).json({ error: 'Autenticação necessária.' });
  }

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(503).json({ error: 'KV not configured', state: null });
  }

  try {
    const resp = await fetch(kvUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'golive_state_concrelongo']),
    });

    if (!resp.ok) return res.status(502).json({ error: 'KV read failed', state: null });

    const { result } = await resp.json();
    if (!result)  return res.status(200).json({ state: null });

    return res.status(200).json({ state: JSON.parse(result) });
  } catch {
    return res.status(500).json({ error: 'Failed to read state', state: null });
  }
}
