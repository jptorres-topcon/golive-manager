export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ error: 'Credential required' });
  }

  const editors = (process.env.EDITOR_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const viewerCode = (process.env.VIEWER_CODE || '').trim();

  if (editors.length > 0 && editors.includes(credential.trim().toLowerCase())) {
    return res.status(200).json({ role: 'editor' });
  }

  if (viewerCode && credential.trim() === viewerCode) {
    return res.status(200).json({ role: 'viewer' });
  }

  return res.status(401).json({ error: 'Invalid credential' });
}
