# 💳 PayWithMo - Stripe Payment Management System

A modern, full-stack payment management application built with React, Node.js, and Stripe. Features a beautiful UI for managing payment methods, processing payments, and viewing payment history with cross-device synchronization.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Stripe](https://img.shields.io/badge/Stripe-Latest-purple)

## ✨ Features

### 🎨 Modern UI/UX
- **Beautiful Design**: Clean, modern interface with blue/white theme
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Engaging hover effects and transitions
- **Form Validation**: Real-time validation with helpful error messages

### 💳 Payment Management
- **Save Payment Methods**: Securely store customer cards using Stripe
- **Quick Payments**: One-click payments with preset amounts ($5, $10, $25, $50)
- **Custom Amounts**: Process payments for any amount
- **Payment History**: Comprehensive transaction history with filtering

### 🔄 Cross-Device Synchronization
- **Local Storage**: Automatic local data persistence
- **Global Sync**: Share data across multiple devices
- **Device Tracking**: See which device made each payment
- **Manual Sync**: Force synchronization when needed

### 🛡️ Security & Reliability
- **Stripe Integration**: Industry-standard payment processing
- **Data Encryption**: All payment data is encrypted by Stripe
- **Error Handling**: Comprehensive error handling and user feedback
- **Offline Support**: Local storage backup for offline access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Stripe account with API keys
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/paymenthub.git
cd paymenthub
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Stripe Keys (Get these from your Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Optional: API URL (defaults to /api in production)
VITE_API_URL=http://localhost:4000/api

# Optional: Default customer ID (for testing)
VITE_STRIPE_CUSTOMER_ID=cus_your_customer_id_here
```

### 4. Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Paste them into your `.env` file

### 5. Run the Application
```bash
# Start the backend server (Terminal 1)
cd api
npm start

# Start the frontend development server (Terminal 2)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

## 📁 Project Structure

```
paymenthub/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── AddCardForm.jsx     # Card addition form
│   │   ├── QuickPay.jsx        # Quick payment component
│   │   ├── SavedCardsDropdown.jsx # Card selection
│   │   └── PaymentHistoryDashboard.jsx # History view
│   ├── context/                # React Context
│   │   └── PaymentContext.jsx  # Global state management
│   ├── App.jsx                 # Main application component
│   └── main.jsx               # Application entry point
├── api/                        # Backend Node.js server
│   ├── server.js              # Express server with Stripe integration
│   └── package.json           # Backend dependencies
├── public/                     # Static assets
├── .env                       # Environment variables (create this)
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ✅ Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | ✅ Yes |
| `VITE_API_URL` | Backend API URL | ❌ Optional |
| `VITE_STRIPE_CUSTOMER_ID` | Default customer ID | ❌ Optional |
| `PORT` | Server port (default: 4000) | ❌ Optional |

### Stripe Setup
1. Create a [Stripe account](https://stripe.com)
2. Enable test mode for development
3. Get your API keys from the dashboard
4. For production, switch to live keys and disable test mode

## 💡 Usage

### Adding Payment Methods
1. Navigate to the **Make Payment** tab
2. Scroll to **Add New Card** section
3. Fill in customer name and card details
4. Click **Save Card** to store securely with Stripe

### Making Payments
1. Select a saved payment method
2. Choose a quick amount or enter custom amount
3. Click **Pay Now** to process the payment
4. View confirmation and transaction details

### Viewing Payment History
1. Click the **Payment History** tab
2. View summary cards with key metrics
3. Browse detailed transaction table
4. See device information for each payment
5. Use the sync button to refresh data

### Cross-Device Access
- Data automatically syncs across devices
- Each device gets a unique session ID
- Manual sync available via the sync button
- View which device made each payment

## 🛠️ Development

### Available Scripts
```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend development
cd api
npm start            # Start backend server
npm run dev          # Start with nodemon (auto-restart)
```

### Tech Stack
- **Frontend**: React 18, Vite, Stripe.js
- **Backend**: Node.js, Express, Stripe SDK
- **Styling**: CSS3 with modern features
- **Storage**: LocalStorage + In-memory (production: use database)
- **State Management**: React Context API

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform

### Backend (Heroku/Railway)
1. Push the `api` folder to your hosting service
2. Set environment variables
3. Ensure the start script runs `node server.js`

### Full-Stack (Single Server)
The backend serves the frontend in production mode:
```bash
npm run build
cd api
NODE_ENV=production npm start
```

## 🔒 Security Best Practices

- ✅ Never commit `.env` files to Git
- ✅ Use test keys during development
- ✅ Validate all inputs on both client and server
- ✅ Use HTTPS in production
- ✅ Regularly rotate API keys
- ✅ Monitor Stripe dashboard for suspicious activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Review the Stripe documentation
2. Ensure all environment variables are set correctly
3. Check browser console for error messages

## 🙏 Acknowledgments

- [Stripe](https://stripe.com) for excellent payment processing
- [React](https://reactjs.org) for the amazing framework
- [Vite](https://vitejs.dev) for lightning-fast development

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
