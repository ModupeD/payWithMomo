import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';


const STORAGE_KEYS = {
  PAYMENTS: 'paymentHub_payments',
  CARDS: 'paymentHub_cards',
  CUSTOMER_ID: 'paymentHub_customerId',
  CUSTOMER_NAME: 'paymentHub_customerName',
  SELECTED_CARD: 'paymentHub_selectedCard',
  SESSION_ID: 'paymentHub_sessionId'
};


const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

/*──────────────────────────────────
  Generate unique session ID
  ──────────────────────────────────*/
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [customerId, setCustomerId] = useState(() => 
    storage.get(STORAGE_KEYS.CUSTOMER_ID) || import.meta.env.VITE_STRIPE_CUSTOMER_ID || null
  );
  const [customerName, setCustomerName] = useState(() => 
    storage.get(STORAGE_KEYS.CUSTOMER_NAME) || ''
  );
  const [cards, setCards] = useState(() => 
    storage.get(STORAGE_KEYS.CARDS) || []
  );
  const [payments, setPayments] = useState(() => 
    storage.get(STORAGE_KEYS.PAYMENTS) || []
  );
  const [selectedCardId, setSelectedCardId] = useState(() => 
    storage.get(STORAGE_KEYS.SELECTED_CARD) || null
  );
  const [sessionId] = useState(() => {
    let session = storage.get(STORAGE_KEYS.SESSION_ID);
    if (!session) {
      session = generateSessionId();
      storage.set(STORAGE_KEYS.SESSION_ID, session);
    }
    return session;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    storage.set(STORAGE_KEYS.CUSTOMER_ID, customerId);
  }, [customerId]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CUSTOMER_NAME, customerName);
  }, [customerName]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CARDS, cards);
  }, [cards]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.PAYMENTS, payments);
  }, [payments]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.SELECTED_CARD, selectedCardId);
  }, [selectedCardId]);

  const api = axios.create({ baseURL: API_BASE_URL });

  // helper to merge payments uniquely
  const mergePayments = (newPayments) => {
    setPayments((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      newPayments.forEach((p) => {
        if (!existingIds.has(p.id)) merged.push(p);
      });
      return merged;
    });
  };

  /* ─────────────────────────────────
     Load cards & payments once
  ──────────────────────────────────*/
  useEffect(() => {
    // Load global payments on app start
    (async () => {
      try {
        const { data: globalPayments } = await api.get('/global-payments');
        if (globalPayments && globalPayments.length > 0) {
          // Merge with local payments
          mergePayments(globalPayments);
        }
      } catch (err) {
        console.warn('Could not fetch global payments:', err.message);
      }
    })();
  }, []); // Run once on mount

  useEffect(() => {
    if (!customerId) return; // wait until customer id is available
    
    // Only fetch from API if we don't have recent data
    const lastFetch = storage.get(`lastFetch_${customerId}`);
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    if (lastFetch && (now - lastFetch) < CACHE_DURATION && cards.length > 0) {
      return; // Use cached data
    }

    (async () => {
      try {
        // Fetch customer information
        const { data: customerData } = await api.get(`/customer/${customerId}`);
        if (customerData) {
          setCustomerName(customerData.name || '');
          // Store customer info globally
          await api.post('/store-customer', {
            customerId,
            customerName: customerData.name || ''
          });
        }

        const { data: cardData } = await api.get(`/payment-methods/${customerId}`);
        if (cardData?.length) {
          const simplified = cardData.map((pm) => ({
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
          }));
          setCards(simplified);
          if (!selectedCardId) {
            setSelectedCardId(simplified[0].id);
          }
        }

        const { data: paymentData } = await api.get(`/payments/${customerId}`);
        if (paymentData) {
          const mapped = paymentData.map((p) => ({
            id: p.id,
            cardId: p.payment_method,
            amount: p.amount / 100,
            date: new Date(p.created * 1000).toISOString().slice(0, 10),
            customerName: customerData.name || '',
            last4: '', // will fill later when we refresh cards
          }));
          mergePayments(mapped);
        }
        
        // Update last fetch time
        storage.set(`lastFetch_${customerId}`, now);
      } catch (err) {
        // Handle transient 404s (customer not yet fully available right after creation)
        if (err?.response?.status === 404) {
          console.info('Stripe returned 404 (customer not yet propagated) – will retry automatically');
        } else {
          // Log other errors but don't fall back to mock data
          console.warn('Could not fetch Stripe data:', err.message);
        }
      }
    })();
  }, [customerId]);

  /* ─────────────────────────────────
     Store payment globally
  ──────────────────────────────────*/
  const storePaymentGlobally = async (payment) => {
    try {
      await api.post('/global-payments', { payment });
    } catch (err) {
      console.warn('Could not store payment globally:', err.message);
    }
  };

  /* ─────────────────────────────────
     Make a one-time payment
  ──────────────────────────────────*/
  const pay = async (amountDollars) => {
    const cents = Math.round(amountDollars * 100);
    if (!customerId) throw new Error('Customer not set');
    const { data } = await api.post('/create-payment-intent', {
      customerId,
      payment_method: selectedCardId,
      amount: cents,
    });
    // Add new payment locally so dashboard shows immediately
    const cardInfo = cards.find((c) => c.id === selectedCardId);
    const newPayment = {
      id: data.id,
      cardId: selectedCardId,
      amount: cents / 100,
      date: new Date().toISOString().slice(0, 10),
      customerName,
      last4: cardInfo?.last4 || '',
      sessionId, // Track which session created this payment
    };
    setPayments((prev) => [...prev, newPayment]);
    
    // Store globally for cross-device access
    await storePaymentGlobally(newPayment);
    
    return data;
  };

  /* ─────────────────────────────────
     Add a new card (placeholder, real
     logic resides in AddCardForm)
  ──────────────────────────────────*/
  const refreshCards = async () => {
    if (!customerId) return;
    const { data } = await api.get(`/payment-methods/${customerId}`);
    if (data) {
      const simplified = data.map((pm) => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
      }));
      setCards(simplified);
      if (!selectedCardId && simplified.length) {
        setSelectedCardId(simplified[0].id);
      }

      // backfill last4 for existing payments
      setPayments((prev) => prev.map((p) => {
        if (!p.last4) {
          const card = simplified.find((c) => c.id === p.cardId);
          return card ? { ...p, last4: card.last4 } : p;
        }
        return p;
      }));
    }
  };

  /* ─────────────────────────────────
     Clear all data (for testing/reset)
  ──────────────────────────────────*/
  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => storage.remove(key));
    setCustomerId(null);
    setCustomerName('');
    setCards([]);
    setPayments([]);
    setSelectedCardId(null);
  };

  return (
    <PaymentContext.Provider value={{
      cards,
      payments,
      selectedCardId,
      setSelectedCardId,
      pay,
      refreshCards,
      customerId,
      setCustomerId,
      customerName,
      setCustomerName,
      mergePayments,
      sessionId,
      clearAllData,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext); 