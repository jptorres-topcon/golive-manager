import { verifyJWT, bearerToken } from './_jwt.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token required' });
  }

  const secret  = process.env.TOKEN_SECRET || '';
  const decoded = verifyJWT(token, secret);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  return res.status(200).json({ role: decoded.role || 'viewer' });
}
