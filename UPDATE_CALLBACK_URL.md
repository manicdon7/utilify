# Update Razorpay Payment Link Callback URL

## For New Payment Links (Recommended)

**New payment links created from now on will automatically have the correct callback URL.** No manual update needed!

Your code in `src/app/api/payment/create-link/route.ts` already sets:
```javascript
callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`
// = https://utilify-one.vercel.app/payment/callback
```

## For Existing/Old Payment Links

If you have **old payment links** created before this fix, you can update them manually.

### Method 1: Using the Script (Easiest)

I've created a script at `scripts/update-razorpay-link.sh`:

```bash
# Edit the script first to set your payment link ID
nano scripts/update-razorpay-link.sh

# Change this line:
PAYMENT_LINK_ID="plink_Et2G7ymGcTTuM5"  # Your actual link ID

# Run the script
./scripts/update-razorpay-link.sh
```

### Method 2: Using cURL Directly

```bash
curl -u rzp_test_SOf7JPFl0apSo6:8TOk47mYGgFL1QbHNb31c7EO \
  -X PATCH https://api.razorpay.com/v1/payment_links/plink_XXXXX \
  -H 'Content-type: application/json' \
  -d '{
    "callback_url": "https://utilify-one.vercel.app/payment/callback",
    "callback_method": "get"
  }'
```

Replace `plink_XXXXX` with your actual payment link ID.

### Method 3: Using Razorpay Dashboard

1. Go to Razorpay Dashboard → Payment Links
2. Find your payment link
3. Click "Edit"
4. Update "Redirect URL" to: `https://utilify-one.vercel.app/payment/callback`
5. Save

## How to Find Payment Link IDs

### From Database
```javascript
// In MongoDB, check the Payment collection
// The `orderId` field contains the payment link ID
db.payments.find({ status: "created" })
```

### From Razorpay Dashboard
1. Go to Dashboard → Payment Links
2. Click on any payment link
3. The ID is in the URL: `https://dashboard.razorpay.com/app/payment-links/plink_XXXXX`

## Verifying the Callback URL

After updating, test it:

```bash
# Get payment link details
curl -u rzp_test_SOf7JPFl0apSo6:8TOk47mYGgFL1QbHNb31c7EO \
  https://api.razorpay.com/v1/payment_links/plink_XXXXX

# Check the response for:
# "callback_url": "https://utilify-one.vercel.app/payment/callback"
```

## Important Notes

### Old Links Won't Expire
- Old payment links with wrong callback URLs will still work
- They just won't redirect to the right page
- Best practice: Let them expire and create new ones

### New Links Are Correct
- All **new** payment links created after deploying the fix will have the correct callback URL
- No manual intervention needed

### Webhook Still Works
- Even if callback URL is wrong, the webhook will still add credits
- User just won't see the success page properly

## Testing

### Test New Payment Link
1. Go to `/pricing`
2. Click "Get Basic"
3. Complete payment
4. Should redirect to `/payment/callback?razorpay_payment_link_status=paid`
5. Should show success and auto-redirect to dashboard

### Verify Callback URL in Code
```bash
# Check what URL is being used
grep -n "callback_url" src/app/api/payment/create-link/route.ts

# Should show:
# callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
```

## Deploy to Fix All Future Links

```bash
git add .
git commit -m "Fix payment callback URL and redirection"
git push origin main
```

After deployment, all new payment links will automatically use the correct callback URL.

## Summary

- ✅ **New links**: Automatically correct (after deploying the fix)
- ⚠️ **Old links**: Need manual update using cURL/script/dashboard
- ✅ **Webhook**: Works regardless of callback URL
- ✅ **Credits**: Added via webhook even if redirect fails
