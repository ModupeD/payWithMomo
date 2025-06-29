# 🚀 Setup Guide for PaymentHub

## Environment Variables Setup

Create a `.env` file in the root directory with the following content:

```env
# Stripe API Keys
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration (Optional)
# For development, you can use http://localhost:4000/api
# For production, this will default to /api
VITE_API_URL=http://localhost:4000/api

# Default Customer ID (Optional)
# You can create a test customer in Stripe and use their ID here
# Or leave this empty to create customers dynamically
VITE_STRIPE_CUSTOMER_ID=

# Server Port (Optional)
# The port your backend server will run on
PORT=4000

# Node Environment (Optional)
# Set to 'production' when deploying
NODE_ENV=development
```

## Getting Stripe API Keys

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and sign up
   - Complete account verification

2. **Get Test API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Click on **Developers** in the left sidebar
   - Click on **API Keys**
   - Make sure you're in **Test mode** (toggle in top right)
   - Copy the **Publishable key** (starts with `pk_test_`)
   - Click **Reveal test key** for the **Secret key** (starts with `sk_test_`)

3. **Add Keys to .env File**
   - Replace `sk_test_your_stripe_secret_key_here` with your actual secret key
   - Replace `pk_test_your_stripe_publishable_key_here` with your actual publishable key

## Git Repository Setup

Follow these steps to create and push to GitHub:

### 1. Initialize Git Repository (if not already done)
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit: PaymentHub - Stripe payment management system

- Modern React frontend with beautiful UI
- Node.js backend with Stripe integration
- Cross-device synchronization
- Real-time form validation
- Payment history dashboard
- Responsive design"
```

### 4. Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right
3. Select **New repository**
4. Name it `paymenthub` (or your preferred name)
5. Add description: "Modern Stripe payment management system with React and Node.js"
6. Keep it **Public** or **Private** (your choice)
7. **DO NOT** initialize with README (we already have one)
8. Click **Create repository**

### 5. Connect Local Repository to GitHub
Replace `yourusername` with your actual GitHub username:

```bash
git remote add origin https://github.com/yourusername/paymenthub.git
git branch -M main
git push -u origin main
```

### 6. Verify Upload
- Go to your GitHub repository
- You should see all your files except `.env` (which is properly ignored)
- Check that README.md displays correctly

## Security Checklist ✅

Before pushing to GitHub, ensure:

- [ ] `.env` file is listed in `.gitignore`
- [ ] No API keys are hardcoded in source files
- [ ] `.gitignore` includes all necessary patterns
- [ ] Test the app locally before pushing

## Next Steps

1. **Test the Setup**
   ```bash
   # Install dependencies
   npm install
   cd api && npm install && cd ..
   
   # Start the application
   cd api && npm start &
   npm run dev
   ```

2. **Create a Test Payment**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

3. **Deploy to Production**
   - Use live Stripe keys
   - Deploy to Heroku, Netlify, or your preferred platform
   - Set environment variables in your hosting platform

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**
   - Double-check your `.env` file
   - Ensure no extra spaces around the keys
   - Make sure you're using test keys for development

2. **CORS Errors**
   - Ensure the backend is running on port 4000
   - Check that `VITE_API_URL` matches your backend URL

3. **Git Push Rejected**
   - Make sure you've created the GitHub repository first
   - Check that the remote URL is correct: `git remote -v`

Need help? Check the main README.md or create an issue on GitHub! 