import crypto from 'crypto';

function verifyJWT(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${h}.${p}`)
    .digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  if (sig !== expected) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    if (d.exp && d.exp < Math.floor(Date.now() / 1000)) return null;
    return d;
  } catch { return null; }
}

async function kvPost(url, token, cmd) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  return r.json();
}

async function kvGet(key, url, token) {
  const { result } = await kvPost(url, token, ['GET', key]);
  if (!result) return null;
  try { return JSON.parse(result); } catch { return null; }
}

async function kvSet(key, value, url, token) {
  await kvPost(url, token, ['SET', key, JSON.stringify(value)]);
}

const ADMIN_EMAIL = 'jptorres@topconsuite.com';

export default async function handler(req, res) {
  const secret   = process.env.TOKEN_SECRET || '';
  const kvUrl    = process.env.KV_REST_API_URL;
  const kvToken  = process.env.KV_REST_API_TOKEN;

  const jwt     = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const decoded = verifyJWT(jwt, secret);

  if (!decoded || decoded.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Restrito ao administrador.' });
  }

  if (req.method === 'GET') {
    const logs      = (await kvGet('golive_logins',    kvUrl, kvToken)) || [];
    const blocklist = (await kvGet('golive_blocklist', kvUrl, kvToken)) || [];
    return res.status(200).json({ logs, blocklist });
  }

  if (req.method === 'DELETE') {
    await kvSet('golive_logins', [], kvUrl, kvToken);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    const { action, email } = req.body || {};
    const e = (email || '').trim().toLowerCase();
    if (!e) return res.status(400).json({ error: 'E-mail obrigatório.' });

    if (action === 'block') {
      const list = (await kvGet('golive_blocklist', kvUrl, kvToken)) || [];
      if (!list.includes(e)) list.push(e);
      await kvSet('golive_blocklist', list, kvUrl, kvToken);
      return res.status(200).json({ ok: true });
    }

    if (action === 'unblock') {
      let list = (await kvGet('golive_blocklist', kvUrl, kvToken)) || [];
      list = list.filter(x => x !== e);
      await kvSet('golive_blocklist', list, kvUrl, kvToken);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação inválida.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
