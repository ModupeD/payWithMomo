// A simple in-memory implementation to store customer metadata globally.
// In production, this should be persisted in a database.

let customers = new Map();

export default function handler(req, res) {
  // CORS headers for local testing as well as deployed environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pre-flight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { customerId, customerName } = req.body || {};

      if (!customerId || !customerName) {
        return res.status(400).json({ error: 'Customer ID and name required' });
      }

      // Store or update customer entry
      customers.set(customerId, {
        name: customerName,
        lastSeen: Date.now(),
      });

      return res.json({ success: true });
    } catch (err) {
      console.error('Error storing customer:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Method not allowed for anything other than POST / OPTIONS
  return res.status(405).json({ error: 'Method not allowed' });
} 