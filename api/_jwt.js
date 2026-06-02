import crypto from 'crypto';

export function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function signJWT(payload, secret) {
  const h = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const b = base64url(JSON.stringify(payload));
  const s = crypto.createHmac('sha256', secret).update(`${h}.${b}`)
    .digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${h}.${b}.${s}`;
}

export function verifyJWT(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;

  const expected = crypto.createHmac('sha256', secret).update(`${h}.${p}`)
    .digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  // timing-safe comparison — previne timing attacks
  const aBuf = Buffer.from(sig);
  const bBuf = Buffer.from(expected);
  if (aBuf.length !== bBuf.length) return null;
  if (!crypto.timingSafeEqual(aBuf, bBuf)) return null;

  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    if (d.exp && d.exp < Math.floor(Date.now() / 1000)) return null;
    return d;
  } catch { return null; }
}

export function bearerToken(req) {
  return (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}
