# ⚠️ IMPORTANT: Clear Browser Cache After Deployment

## The Problem

You're seeing this error:
```
https://checkout-static-next.razorpay.com/build/undefined
```

This is because your **browser cached the old pricing page** that had the Razorpay script tag.

## The Solution

### Option 1: Hard Refresh (Fastest)

**On Chrome/Edge:**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**On Firefox:**
- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**On Safari:**
- Mac: `Cmd + Option + R`

### Option 2: Clear Site Data

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

**Or:**
1. Go to `chrome://settings/siteData`
2. Search for `utilify-one.vercel.app`
3. Click trash icon to delete
4. Reload the page

### Option 3: Incognito/Private Mode

Open your Vercel site in an incognito/private window:
- Chrome: `Ctrl/Cmd + Shift + N`
- Firefox: `Ctrl/Cmd + Shift + P`
- Safari: `Cmd + Shift + N`

## Verification

After clearing cache, verify the new code is loaded:

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. You should **NOT** see any requests to `checkout-static-next.razorpay.com`
5. When you click "Get Basic", you should redirect to `checkout.razorpay.com` (Razorpay's hosted page)

## For Your Users

After deployment, your users won't have this issue because:
- First-time visitors won't have any cache
- The old script URL won't exist in the new code
- Browser cache expires automatically over time

## Technical Details

The old code had:
```jsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

The new code:
- ✅ No Script tag
- ✅ Direct redirect to Razorpay Payment Link
- ✅ No client-side Razorpay code

## Still Seeing the Error?

If hard refresh doesn't work:

1. **Check you deployed the latest code**
   ```bash
   git status  # Should show "nothing to commit"
   git log -1  # Check latest commit includes payment changes
   ```

2. **Verify on Vercel**
   - Go to Vercel Dashboard → Deployments
   - Check latest deployment includes the new files
   - Look for: `src/app/api/payment/create-link/route.ts`

3. **Check browser console**
   - Open DevTools → Console
   - Look for any JavaScript errors
   - Check which version of the page loaded

4. **Try different browser**
   - If Chrome shows error, try Firefox or Safari
   - This confirms it's a cache issue
