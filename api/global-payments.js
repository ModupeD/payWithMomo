
let payments = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      res.json(payments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { payment } = req.body;
      
      if (!payment || !payment.id) {
        return res.status(400).json({ error: 'Valid payment object with ID is required' });
      }

      // Check if payment already exists
      const existingIndex = payments.findIndex(p => p.id === payment.id);
      
      if (existingIndex >= 0) {
        // Update existing payment
        payments[existingIndex] = { ...payment, updatedAt: new Date().toISOString() };
      } else {
        // Add new payment
        payments.push({ ...payment, createdAt: new Date().toISOString() });
      }

      res.json({ 
        success: true, 
        message: 'Payment stored successfully',
        data: payment
      });
    } catch (err) {
      console.error('Error storing payment:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 