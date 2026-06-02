import { signJWT, verifyJWT, bearerToken, base64url } from './_jwt.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret  = process.env.TOKEN_SECRET || '';
  const decoded = verifyJWT(bearerToken(req), secret);

  // Apenas editores podem gerar links de compartilhamento
  if (!decoded || decoded.role !== 'editor') {
    return res.status(403).json({ error: 'Apenas editores podem gerar links.' });
  }

  if (!secret) {
    return res.status(500).json({ error: 'TOKEN_SECRET not configured' });
  }

  const now   = Math.floor(Date.now() / 1000);
  const token = signJWT({ role: 'viewer', iat: now, exp: now + 30 * 24 * 60 * 60 }, secret);

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host'] || req.headers.host || 'golive-manager-five.vercel.app';
  const url   = `${proto}://${host}?token=${token}`;

  return res.status(200).json({ token, url });
}
