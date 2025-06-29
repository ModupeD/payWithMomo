import React, { useState, useRef } from 'react';
import SavedCardsDropdown from './components/SavedCardsDropdown';
import PaymentHistoryDashboard from './components/PaymentHistoryDashboard';
import QuickPay from './components/QuickPay';
import AddCardForm from './components/AddCardForm';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('payment');
  const [highlightAddCard, setHighlightAddCard] = useState(false);
  const addCardRef = useRef(null);

  const handleNavigateToAddCard = () => {
    if (activeTab !== 'payment') {
      setActiveTab('payment');
    }
    
    // Scroll to add card section and highlight it
    setTimeout(() => {
      if (addCardRef.current) {
        addCardRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add highlight effect
        setHighlightAddCard(true);
        setTimeout(() => setHighlightAddCard(false), 2000);
      }
    }, 100);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">💳 PayWithMo</h1>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Make Payment
            </button>
            <button 
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Payment History
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {activeTab === 'payment' && (
            <div className="tab-content">
              <div className="section">
                <h2 className="section-title">Select Payment Method</h2>
                <SavedCardsDropdown onNavigateToAddCard={handleNavigateToAddCard} />
              </div>
              
              <div className="section">
                <h2 className="section-title">Quick Payment</h2>
                <QuickPay />
              </div>
              
              <div 
                ref={addCardRef}
                className={`section ${highlightAddCard ? 'highlight-section' : ''}`}
              >
                <h2 className="section-title">Add New Card</h2>
                <AddCardForm />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content">
              <PaymentHistoryDashboard />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
