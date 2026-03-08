# ✅ Payment System - Backend Flow with Public Key

## Environment Variables Updated

### Changed
- `RAZORPAY_KEY_ID` → `NEXT_PUBLIC_RAZORPAY_KEY_ID` ✅
- This allows the key to be accessible in both client and server code

### Your `.env` file
```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SOf7JPFl0apSo6
RAZORPAY_KEY_SECRET=8TOk47mYGgFL1QbHNb31c7EO
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Files Updated

1. ✅ `.env` - Changed to `NEXT_PUBLIC_RAZORPAY_KEY_ID`
2. ✅ `.env.example` - Updated template
3. ✅ `src/app/api/payment/create-link/route.ts` - Uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. ✅ `src/app/api/payment/create-order/route.ts` - Uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. ✅ `PAYMENT_SETUP.md` - Updated documentation

## How It Works

### Backend Payment Flow
```
User clicks "Get Basic/Pro"
    ↓
Frontend: POST /api/payment/create-link
    ↓
Backend: Creates Razorpay Payment Link using NEXT_PUBLIC_RAZORPAY_KEY_ID + SECRET
    ↓
Backend: Returns payment URL
    ↓
Frontend: Redirects user to Razorpay hosted page
    ↓
User: Completes payment on Razorpay
    ↓
Razorpay: Calls webhook /api/payment/webhook
    ↓
Backend: Verifies signature and adds credits
    ↓
User: Redirects to /payment/callback
    ↓
Callback: Shows success and redirects to dashboard
```

## Vercel Deployment Checklist

### 1. Add Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required:**
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SOf7JPFl0apSo6
RAZORPAY_KEY_SECRET=8TOk47mYGgFL1QbHNb31c7EO
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Configure Razorpay Webhook
- Dashboard → Settings → Webhooks
- URL: `https://utilify-one.vercel.app/api/payment/webhook`
- Events: `payment_link.paid`, `payment_link.cancelled`, `payment_link.expired`
- Copy webhook secret to Vercel

### 3. Deploy
```bash
git add .
git commit -m "Use NEXT_PUBLIC_RAZORPAY_KEY_ID for payment"
git push
```

### 4. Clear Browser Cache
After deployment:
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## Why NEXT_PUBLIC_?

The `NEXT_PUBLIC_` prefix makes the environment variable accessible in:
- ✅ Client-side code (React components)
- ✅ Server-side code (API routes)
- ✅ Build time

**Note:** Only the **Key ID** is public (safe to expose). The **Key Secret** remains private.

## Security

- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Safe to expose (it's meant to be public)
- ❌ `RAZORPAY_KEY_SECRET` - NEVER expose (stays server-side only)
- ❌ `RAZORPAY_WEBHOOK_SECRET` - NEVER expose (stays server-side only)

## Testing

### Local Testing
```bash
npm run dev
# Go to http://localhost:3001/pricing
# Sign in and click "Get Basic"
# Should redirect to Razorpay payment page
```

### Verify Environment Variable
The key should be visible in browser DevTools → Network → Response headers (because it's public).

## Build Status
✅ Build completed successfully
✅ No errors
✅ All routes compiled

## What's Different from Before?

**Old Code:**
- Used `RAZORPAY_KEY_ID` (private env var)
- Only accessible in API routes
- Required workarounds for client-side access

**New Code:**
- Uses `NEXT_PUBLIC_RAZORPAY_KEY_ID` (public env var)
- Accessible everywhere
- Cleaner, more standard Next.js pattern
- Still maintains security (key ID is meant to be public)
