import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import './QuickPay.css';

const QuickPay = () => {
  const { pay, cards } = usePayment();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!cards || cards.length === 0) {
      alert('Please add a payment method first');
      return;
    }
    
    setLoading(true);
    try {
      await pay(amt);
      setAmount('');
      alert('Payment successful! 🎉');
    } catch (err) {
      console.error('Payment error:', err);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.error) {
        errorMessage = err.error;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50];
  const hasCards = cards && cards.length > 0;

  return (
    <div className="quick-pay">
      {!hasCards && (
        <div className="no-cards-warning">
          <p>⚠️ Add a payment method first to make payments</p>
        </div>
      )}
      
      <div className="quick-amounts">
        <label className="quick-amounts-label">Quick amounts:</label>
        <div className="amount-buttons">
          {quickAmounts.map(amt => (
            <button
              key={amt}
              type="button"
              className="amount-button"
              onClick={() => setAmount(amt.toString())}
              disabled={!hasCards}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-amount">
        <label className="amount-label">Or enter custom amount:</label>
        <div className="amount-input-container">
          <div className="currency-symbol">$</div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-input"
            disabled={!hasCards}
          />
        </div>
      </div>

      <button 
        onClick={handlePay} 
        disabled={loading || !amount || parseFloat(amount) <= 0 || !hasCards}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay $${amount || '0.00'}`}
      </button>
    </div>
  );
};

export default QuickPay;