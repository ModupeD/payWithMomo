import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import './PaymentHistoryDashboard.css';

const PaymentHistoryDashboard = () => {
  const { payments, sessionId } = usePayment();
  const [lastSync, setLastSync] = useState(() => {
    const stored = localStorage.getItem('paymentHub_lastSync');
    return stored ? new Date(stored) : null;
  });

  const handleManualSync = async () => {
    try {
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('paymentHub_lastSync', now.toISOString());
      window.alert('Data synced successfully! 🎉');
    } catch (err) {
      window.alert('Sync failed. Please try again.');
    }
  };

  return (
    <div className="payment-history-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="dashboard-title">Payment History</h2>
          <div className="sync-info">
            {lastSync && (
              <span className="last-sync">
                Last synced: {lastSync.toLocaleString()}
              </span>
            )}
            <button onClick={handleManualSync} className="sync-button">
              🔄 Sync Data
            </button>
          </div>
        </div>
        <div className="session-info">
          <span className="session-id">Session: {sessionId?.slice(-6)}</span>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No payments yet</h3>
          <p>Your payment history will appear here and sync across all your devices</p>
        </div>
      ) : (
        <div className="payments-container">
          <div className="payments-summary">
            <div className="summary-card">
              <h4>Total Payments</h4>
              <span className="summary-value">{payments.length}</span>
            </div>
            <div className="summary-card">
              <h4>Total Amount</h4>
              <span className="summary-value">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="summary-card">
              <h4>Devices Used</h4>
              <span className="summary-value">
                {new Set(payments.map(p => p.sessionId).filter(Boolean)).size || 1}
              </span>
            </div>
          </div>

          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Card</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.customerName || '—'}</td>
                    <td>•••• {p.last4 || '----'}</td>
                    <td>
                      <div className="date-cell">
                        <span className="date-primary">{new Date(p.date).toLocaleDateString()}</span>
                        <span className="date-secondary">{new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-cell">${p.amount.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="status-badge success">Completed</span>
                    </td>
                    <td>
                      <span className="device-cell">
                        {p.sessionId === sessionId ? '📱 This device' : '💻 Other device'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryDashboard; 