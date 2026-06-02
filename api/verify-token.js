import crypto from 'crypto';

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token required' });
  }

  const secret = process.env.TOKEN_SECRET || '';
  if (!secret) {
    return res.status(500).json({ error: 'TOKEN_SECRET not configured' });
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    return res.status(401).json({ error: 'Token expired' });
  }

  return res.status(200).json({ role: decoded.role || 'viewer' });
}
