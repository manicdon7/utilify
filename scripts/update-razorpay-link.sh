#!/bin/bash

# Update Razorpay Payment Link Callback URL
# This is only needed for OLD payment links created before the fix

# Your Razorpay credentials from .env
KEY_ID="rzp_test_SOf7JPFl0apSo6"
KEY_SECRET="8TOk47mYGgFL1QbHNb31c7EO"

# The payment link ID you want to update
PAYMENT_LINK_ID="plink_Et2G7ymGcTTuM5"  # Replace with your actual payment link ID

# Your callback URL
CALLBACK_URL="https://utilify-one.vercel.app/payment/callback"

# Update the payment link
curl -u ${KEY_ID}:${KEY_SECRET} \
  -X PATCH https://api.razorpay.com/v1/payment_links/${PAYMENT_LINK_ID} \
  -H 'Content-type: application/json' \
  -d "{
    \"callback_url\": \"${CALLBACK_URL}\",
    \"callback_method\": \"get\"
  }"

echo "\n✅ Payment link updated!"
