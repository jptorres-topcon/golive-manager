import { signJWT } from './_jwt.js';

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

async function logAccess(email, role, kvUrl, kvToken) {
  try {
    const logs = (await kvGet('golive_logins', kvUrl, kvToken)) || [];
    const now  = new Date().toISOString();
    const idx  = logs.findIndex(e => e.email === email);
    if (idx >= 0) {
      logs[idx].lastAccess = now;
      logs[idx].count      = (logs[idx].count || 1) + 1;
      logs[idx].role       = role;
    } else {
      logs.push({ email, role, firstAccess: now, lastAccess: now, count: 1 });
    }
    await kvSet('golive_logins', logs, kvUrl, kvToken);
  } catch (_) {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const kvUrl    = process.env.KV_REST_API_URL;
  const kvToken  = process.env.KV_REST_API_TOKEN;
  const secret   = process.env.TOKEN_SECRET || '';
  const emailLow = email.trim().toLowerCase();

  if (kvUrl && kvToken) {
    const blocklist = (await kvGet('golive_blocklist', kvUrl, kvToken)) || [];
    if (blocklist.includes(emailLow)) {
      return res.status(401).json({ error: 'Acesso negado para este e-mail.' });
    }
  }

  const editors         = (process.env.EDITOR_EMAILS    || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const editorPassword  = (process.env.EDITOR_PASSWORD  || '').trim();
  const managerPassword = (process.env.MANAGER_PASSWORD || '').trim();
  const viewerPassword  = (process.env.VIEWER_PASSWORD  || '').trim();

  let role = null;
  if (editors.includes(emailLow)) {
    if (editorPassword && password === editorPassword) role = 'editor';
  } else {
    if (managerPassword && password === managerPassword)      role = 'manager';
    else if (viewerPassword && password === viewerPassword)   role = 'viewer';
  }

  if (!role) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  if (kvUrl && kvToken) await logAccess(emailLow, role, kvUrl, kvToken);

  const now   = Math.floor(Date.now() / 1000);
  const token = secret
    ? signJWT({ email: emailLow, role, iat: now, exp: now + 24 * 60 * 60 }, secret)
    : null;

  return res.status(200).json({ role, token, email: emailLow });
}
