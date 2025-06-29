import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage for global data (in production, use a database)
const globalData = {
  payments: [],
  customers: new Map() // customerId -> customer info
};

// ──────────────────────────────────────────────
//  Serve front-end assets in production
// ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientBuildPath = path.resolve(__dirname, '../dist');
  app.use(express.static(clientBuildPath));

  // For any route not starting with /api, send back index.html
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.get('/api/payment-methods/:customerId', async (req, res) => {
  try {
    const { data } = await stripe.paymentMethods.list({
      customer: req.params.customerId,
      type: 'card',
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/payments/:customerId', async (req, res) => {
  try {
    const { data } = await stripe.paymentIntents.list({
      customer: req.params.customerId,
      limit: 20,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { customerId, payment_method, amount } = req.body; // amount in **cents**
    const intent = await stripe.paymentIntents.create({
      customer: customerId,
      payment_method,
      amount,
      currency: 'usd',
      confirm: true,
      off_session: true,
    });
    res.json(intent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/create-setup-intent', async (req, res) => {
  try {
    const { customerId } = req.body;
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
    res.json(setupIntent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/attach-payment-method', async (req, res) => {
  try {
    const { customerId, payment_method } = req.body;
    await stripe.paymentMethods.attach(payment_method, { customer: customerId });
    // set as default
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: payment_method },
    });
    res.json({ status: 'attached' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/create-customer', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const customer = await stripe.customers.create({ name });
    res.json({ id: customer.id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/customer/:customerId', async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve(req.params.customerId);
    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      created: customer.created
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/global-payments', async (req, res) => {
  try {
    res.json(globalData.payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/store-payment', async (req, res) => {
  try {
    const { payment } = req.body;
    if (!payment || !payment.id) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }
    
    // Check if payment already exists
    const existingIndex = globalData.payments.findIndex(p => p.id === payment.id);
    if (existingIndex >= 0) {
      globalData.payments[existingIndex] = payment; // Update existing
    } else {
      globalData.payments.push(payment); // Add new
    }
    
    res.json({ success: true, totalPayments: globalData.payments.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/store-customer', async (req, res) => {
  try {
    const { customerId, customerName } = req.body;
    if (!customerId || !customerName) {
      return res.status(400).json({ error: 'Customer ID and name required' });
    }
    
    globalData.customers.set(customerId, { name: customerName, lastSeen: Date.now() });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// For Vercel serverless functions, export the app
export default app;

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Stripe API server listening → http://localhost:${PORT}`)
  );
} 