# Vercel Deployment Guide - Backend Payment Flow

## ✅ Changes Made

**Removed frontend Razorpay dependency** - Now using 100% backend payment flow:
- ✅ No more Razorpay checkout.js script errors
- ✅ Payment Links created on backend
- ✅ User redirects to Razorpay hosted page
- ✅ Webhook handles payment confirmation
- ✅ Callback page shows payment status

## Required Vercel Environment Variables

### AI & Ads
```
AI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
NEXT_PUBLIC_ADSENSE_ID=your_adsense_id
```

### Authentication (NextAuth)
```
NEXTAUTH_SECRET=your_64_char_random_secret
NEXTAUTH_URL=https://utilify-one.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/utilify
```

### Payment (Razorpay)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Credits & Pricing (Server-side)
```
CREDITS_DEFAULT=3
CREDITS_PLAN_BASIC=50
CREDITS_PLAN_PRO=200
PRICE_PLAN_BASIC=99
PRICE_PLAN_PRO=299
CURRENCY=INR
```

### Credits & Pricing (Client-side for display)
```
NEXT_PUBLIC_PRICE_BASIC=99
NEXT_PUBLIC_PRICE_PRO=299
NEXT_PUBLIC_CREDITS_BASIC=50
NEXT_PUBLIC_CREDITS_PRO=200
```

## Razorpay Webhook Setup

1. **Go to Razorpay Dashboard** → Settings → Webhooks
2. **Add Webhook URL**: `https://utilify-one.vercel.app/api/payment/webhook`
3. **Select Events**:
   - ☑️ `payment_link.paid`
   - ☑️ `payment_link.cancelled`
   - ☑️ `payment_link.expired`
4. **Generate Webhook Secret** and copy it
5. **Add to Vercel**: `RAZORPAY_WEBHOOK_SECRET=your_secret`

## MongoDB Atlas Setup

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Click **Confirm**

*This is required for Vercel serverless functions with dynamic IPs*

## Google OAuth Setup

Update your Google Cloud Console OAuth credentials:

**Authorized redirect URIs:**
```
https://utilify-one.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Authorized JavaScript origins:**
```
https://utilify-one.vercel.app
http://localhost:3000
```

## Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Implement backend-only payment flow"
   git push
   ```

2. **Add all environment variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables listed above
   - Make sure to select "Production", "Preview", and "Development" for each

3. **Redeploy**
   - Go to Deployments tab
   - Click three dots (•••) on latest deployment
   - Click "Redeploy"

4. **Verify Webhook**
   - Make a test payment
   - Check Vercel Function Logs for `/api/payment/webhook`
   - Verify credits are added to user account

## Testing Payment Flow Locally

```bash
# Start dev server
npm run dev

# Go to http://localhost:3001/pricing
# Sign in with Google
# Click "Get Basic" or "Get Pro"
# You'll be redirected to Razorpay hosted page
```

For local webhook testing, use **ngrok** or **Razorpay CLI**:
```bash
# Option 1: ngrok
ngrok http 3001
# Use ngrok URL + /api/payment/webhook in Razorpay dashboard

# Option 2: Razorpay Webhook CLI
npm install -g razorpay-webhook-cli
razorpay-webhook-cli --port 3001 --path /api/payment/webhook
```

## Payment Flow Diagram

```
User clicks "Get Basic/Pro"
    ↓
Frontend calls /api/payment/create-link
    ↓
Backend creates Razorpay Payment Link
    ↓
User redirects to Razorpay hosted page
    ↓
User completes payment on Razorpay
    ↓
Razorpay calls /api/payment/webhook (instant)
    ↓
Backend verifies signature & adds credits
    ↓
User redirects to /payment/callback
    ↓
Callback page shows success & redirects to dashboard
```

## Troubleshooting

### 500 error on `/api/payment/create-link`
- Check Vercel Function Logs for exact error
- Verify all Razorpay env vars are set
- Verify MongoDB connection (check Atlas IP whitelist)
- Ensure user is authenticated

### Webhook not receiving events
- Verify webhook URL is correct in Razorpay dashboard
- Check webhook secret matches in Vercel
- Check Vercel Function Logs for webhook errors
- Verify events are enabled in Razorpay

### Credits not added after payment
- Check webhook logs in Vercel
- Verify signature verification passes
- Check MongoDB connection
- Manually check Payment and User collections in MongoDB

### Payment callback shows "pending" forever
- Check if webhook was triggered (Razorpay dashboard → Webhooks → Logs)
- Verify webhook secret is correct
- Check Vercel Function Logs for errors

## Security Notes

- ✅ No sensitive data exposed to frontend
- ✅ Payment processed on Razorpay's secure servers
- ✅ Webhook signature verification prevents tampering
- ✅ User authentication required for all payment endpoints
- ✅ All secrets stored server-side only
