import React from 'react';
import { usePayment } from '../context/PaymentContext';
import './SavedCardsDropdown.css';

const SavedCardsDropdown = ({ onNavigateToAddCard }) => {
  const { cards, selectedCardId, setSelectedCardId } = usePayment();

  if (!cards || cards.length === 0) {
    return (
      <div className="saved-cards-dropdown">
        <div className="no-cards-message">
          <p>No payment methods available.</p>
          <button 
            onClick={onNavigateToAddCard}
            className="add-card-redirect-btn"
          >
            Add Your First Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-cards-dropdown">
      <label className="dropdown-label">
        Choose your payment method
      </label>
      <div className="select-container">
        <select
          value={selectedCardId || cards[0]?.id}
          onChange={e => setSelectedCardId(e.target.value)}
          className="card-select"
        >
          {cards.map(card => (
            <option key={card.id} value={card.id}>
              {card.brand} •••• {card.last4}
            </option>
          ))}
        </select>
        <div className="select-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SavedCardsDropdown; 