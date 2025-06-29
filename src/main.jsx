import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { PaymentProvider } from './context/PaymentContext'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <PaymentProvider>
        <App />
      </PaymentProvider>
    </Elements>
  </React.StrictMode>,
)
