import React, { useEffect, useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { usePayment } from '../context/PaymentContext';
import axios from 'axios';
import './AddCardForm.css';

const AddCardForm = ({ onSuccess }) => {
  const { refreshCards, customerId, setSelectedCardId, setCustomerId, setCustomerName } = usePayment();
  const stripe = useStripe();
  const elements = useElements();


  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [stripeErrors, setStripeErrors] = useState({});
  
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.fullName = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors.fullName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        } else {
          delete newErrors.fullName;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur for validation
  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    if (fieldName === 'fullName') {
      validateField(fieldName, fullName);
    }
  };

  // Handle Stripe element changes
  const handleStripeElementChange = (elementType) => (event) => {
    const newStripeErrors = { ...stripeErrors };
    
    if (event.error) {
      newStripeErrors[elementType] = event.error.message;
    } else {
      delete newStripeErrors[elementType];
    }
    
    setStripeErrors(newStripeErrors);
    
    // Mark as touched when user starts typing
    if (event.complete || event.error) {
      setTouched({ ...touched, [elementType]: true });
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasNoErrors = Object.keys(errors).length === 0 && Object.keys(stripeErrors).length === 0;
    const hasRequiredFields = fullName.trim().length > 0;
    return hasNoErrors && hasRequiredFields;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const nameValid = validateField('fullName', fullName);
    setTouched({ fullName: true, cardNumber: true, cardExpiry: true, cardCvc: true });

    if (!nameValid || !isFormValid()) {
      return;
    }

    setLoading(true);

    let activeCustomerId = customerId;

    try {
      if (!activeCustomerId) {
        const { data } = await api.post('/create-customer', { name: fullName.trim() });
        activeCustomerId = data.id;
        setCustomerId(data.id); // update context for rest of app
        setCustomerName(fullName.trim());
      }
      console.log('Creating new setup intent for customer:', activeCustomerId);
      const { data } = await api.post('/create-setup-intent', { customerId: activeCustomerId });
      const secret = data.client_secret;
      console.log('Got setup intent:', data.id, 'with secret:', secret?.substring(0, 20) + '...');

      const cardNumberElement = elements.getElement(CardNumberElement);
      
      console.log('About to confirm setup with:', {
        secret: secret,
        customerName: fullName.trim(),
        hasCardElement: !!cardNumberElement
      });
      
      const { setupIntent, error } = await stripe.confirmCardSetup(secret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: fullName.trim(),
          },
        },
      });
      
      
      if (error) {
        // Handle Stripe errors
        if (error.type === 'card_error') {
          setStripeErrors({ cardNumber: error.message });
        } else {
          alert(error.message);
        }
        return;
      }

      await api.post('/attach-payment-method', {
        customerId: activeCustomerId,
        payment_method: setupIntent.payment_method,
      });

      await refreshCards();
      
      alert('✅ Card saved! You can now make a payment.');
      document.querySelector('.quick-pay')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      
      setSelectedCardId(setupIntent.payment_method);
      
      setFullName('');
      setErrors({});
      setTouched({});
      setStripeErrors({});
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Card setup error:', err);
      console.error('Error details:', {
        response: err.response,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = 'Failed to save card. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check your deployment.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
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

  const getElementOptions = (elementType) => ({
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
        ...(stripeErrors[elementType] && touched[elementType] ? {
          color: '#c23d4b',
        } : {}),
      },
      invalid: {
        color: '#c23d4b',
      },
    },
  });

  return (
    <form onSubmit={handleSubmit} className="add-card-form">
      <div className="form-header">
        <h3>Add Payment Method</h3>
        <p>Your card information is encrypted and secure</p>
      </div>

      <div className="test-cards-info">
        <div className="test-cards-header">
          <span>Test Mode - Use this card to try payments</span>
        </div>
        <div className="test-card-display">
          <div className="test-card-number">4242 4242 4242 4242</div>
          <div className="test-card-details">
            <span>12/34</span>
            <span>123</span>
            <span>Any Name</span>
          </div>
        </div>
        <a 
          href="https://docs.stripe.com/testing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="test-cards-link"
        >
          More test cards
        </a>
      </div>

      <div className="field">
        <label>Your name *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (touched.fullName) {
              validateField('fullName', e.target.value);
            }
          }}
          onBlur={() => handleBlur('fullName')}
          placeholder="Full name"
          required
          className={`name-input ${errors.fullName && touched.fullName ? 'error' : ''}`}
        />
        {errors.fullName && touched.fullName && (
          <span className="error-message">{errors.fullName}</span>
        )}
      </div>
      
      <div className="field">
        <label>Card number *</label>
        <div className={`stripe-element-container ${stripeErrors.cardNumber && touched.cardNumber ? 'error' : ''}`}>
          <CardNumberElement 
            options={getElementOptions('cardNumber')} 
            onChange={handleStripeElementChange('cardNumber')}
          />
        </div>
        {stripeErrors.cardNumber && touched.cardNumber && (
          <span className="error-message">{stripeErrors.cardNumber}</span>
        )}
      </div>
      
      <div className="card-inputs-row">
        <div className="field">
          <label>Expiry date *</label>
          <div className={`stripe-element-container ${stripeErrors.cardExpiry && touched.cardExpiry ? 'error' : ''}`}>
            <CardExpiryElement 
              options={getElementOptions('cardExpiry')} 
              onChange={handleStripeElementChange('cardExpiry')}
            />
          </div>
          {stripeErrors.cardExpiry && touched.cardExpiry && (
            <span className="error-message">{stripeErrors.cardExpiry}</span>
          )}
        </div>
        <div className="field">
          <label>CVC *</label>
          <div className={`stripe-element-container ${stripeErrors.cardCvc && touched.cardCvc ? 'error' : ''}`}>
            <CardCvcElement 
              options={getElementOptions('cardCvc')} 
              onChange={handleStripeElementChange('cardCvc')}
            />
          </div>
          {stripeErrors.cardCvc && touched.cardCvc && (
            <span className="error-message">{stripeErrors.cardCvc}</span>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || !stripe || !isFormValid()}
        className={`submit-button ${!isFormValid() ? 'disabled' : ''}`}
      >
        {loading ? 'Saving…' : 'Save Card'}
      </button>

      <div className="security-info">
        This is dev mode to test payments
      </div>
    </form>
  );
};

export default AddCardForm; 