import crypto from 'crypto';

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role } = req.body || {};
  if (role !== 'viewer') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const secret = process.env.TOKEN_SECRET || '';
  if (!secret) {
    return res.status(500).json({ error: 'TOKEN_SECRET not configured' });
  }

  const header  = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now     = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({
    role: 'viewer',
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30 dias
  }));

  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const token = `${header}.${payload}.${sig}`;

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host'] || req.headers.host || 'golive-manager.vercel.app';
  const url   = `${proto}://${host}?token=${token}`;

  return res.status(200).json({ token, url });
}
