import crypto from 'crypto';

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.${sig}`;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Credential required' });
  }

  const editors = (process.env.EDITOR_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  const managers = (process.env.MANAGER_EMAILS || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  const viewerCode = (process.env.VIEWER_CODE || '').trim();
  const secret     = process.env.TOKEN_SECRET   || '';

  let role = null;
  if (editors.includes(credential.trim().toLowerCase()))  role = 'editor';
  else if (managers.includes(credential.trim().toLowerCase())) role = 'manager';
  else if (viewerCode && credential.trim() === viewerCode)     role = 'viewer';

  if (!role) {
    return res.status(401).json({ error: 'Invalid credential' });
  }

  const now   = Math.floor(Date.now() / 1000);
  const token = secret
    ? signJWT({ role, iat: now, exp: now + 24 * 60 * 60 }, secret)
    : null;

  return res.status(200).json({ role, token });
}
