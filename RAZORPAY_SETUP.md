# Razorpay Integration & Security Setup Guide

## 1️⃣ ENVIRONMENT VARIABLES SETUP

### Backend (.env file in `/backend` folder)

Add these lines to your `.env` file:

```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Frontend (.env file in `/frontend` folder)

```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

⚠️ **IMPORTANT:** 
- Never commit `.env` files to Git
- The `.gitignore` should include `.env` and `.env.local`
- Key Secret should ONLY be in backend .env (never expose in frontend)

---

## 2️⃣ HOW TO GET RAZORPAY KEYS

### Step 1: Create Razorpay Account
1. Go to **[Razorpay](https://razorpay.com/)**
2. Sign up or login
3. Email verification required

### Step 2: Get API Keys
1. Go to Dashboard → **Settings** → **API Keys**
2. You'll see two keys:
   - **Key ID** (Public Key) - Safe to share, used in frontend
   - **Key Secret** (Secret Key) - NEVER share, backend only!

### Step 3: Copy Keys
```
Key ID:     rzp_live_xxxxxxxxxxxxx
Key Secret: xxxxxxxxxxxxxxxxxxxxxxxx (KEEP PRIVATE!)
```

### Step 4: Get Webhook Secret (Optional but Recommended)
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/order/webhook`
3. Copy the webhook signing secret

---

## 3️⃣ SECURITY FEATURES IMPLEMENTED

### ✅ Payment Signature Verification
**What it does:** Verifies that payment signatures match using HMAC-SHA256

**Location:** `backend/utils/paymentSecurity.js`

```javascript
// This ensures the payment wasn't tampered with
const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
)
```

**Why it matters:** Without this, someone could fake a payment by just changing the response in their browser!

---

### ✅ Rate Limiting
**What it does:** Limits payment attempts to 5 per user per 15 minutes

**Location:** `backend/middleware/paymentRateLimit.js`

**Benefits:**
- Prevents brute force attacks
- Stops accidental duplicate payments
- Protects against automated fraud

---

### ✅ Input Sanitization
**What it does:** Cleans and validates all payment data

**Location:** `backend/utils/paymentSecurity.js` → `sanitizePaymentResponse()`

**Prevents:**
- SQL injection attempts
- XSS attacks
- Malformed data causing system errors

---

### ✅ Stock Validation
**What it does:** Double-checks stock availability after payment

**Location:** `backend/controllers/orderController.js` → `verifyRazorpay()`

**Benefit:** Ensures customer doesn't get charged for out-of-stock items

---

## 4️⃣ PAYMENT FLOW (SECURE)

```
1. Customer fills checkout form
   ↓
2. Frontend validates address, amount, items
   ↓
3. Backend creates Razorpay order (payment: false)
   ↓
4. Razorpay payment modal opens
   ↓
5. Customer pays via Razorpay gateway
   ↓
6. Razorpay returns: order_id, payment_id, signature
   ↓
7. Frontend sends to backend with SIGNATURE
   ↓
8. Backend verifies SIGNATURE (CRITICAL SECURITY CHECK)
   ↓
9. Backend verifies payment status with Razorpay API
   ↓
10. Backend deducts stock & marks payment as true
   ↓
11. Email confirmation sent
   ↓
12. Order complete
```

---

## 5️⃣ ERROR HANDLING

### Invalid Signature
```
Status: 401
Message: "Payment verification failed - Invalid signature. Fraudulent attempt detected."
Action: Order is NOT created
```

### Rate Limit Exceeded
```
Status: 429
Message: "Too many payment attempts. Try again in X seconds"
Action: Blocks further attempts temporarily
```

### Missing Payment Data
```
Status: 400
Message: "Missing payment verification data"
Action: Verification fails safely
```

---

## 6️⃣ PRODUCTION CHECKLIST

Before going live, ensure:

- [ ] `RAZORPAY_KEY_ID` in frontend .env
- [ ] `RAZORPAY_KEY_ID` in backend .env
- [ ] `RAZORPAY_KEY_SECRET` in backend .env ONLY
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS enabled (Razorpay requires it)
- [ ] Webhook configured in Razorpay dashboard
- [ ] Test payment with Razorpay test credentials first
- [ ] All error messages don't leak sensitive info
- [ ] Rate limiting is working
- [ ] Signature verification is enabled

---

## 7️⃣ TESTING

### Test with Razorpay Test Credentials
1. Use Key ID starting with `rzp_test_`
2. Use test cards:
   - **Success:** `4111111111111111`
   - **Decline:** `4000000000000002`
3. Any future expiry date, any CVV

### Verification Test
The signature will be verified automatically. If it fails:
```
Response: { success: false, message: "Invalid signature" }
```

---

## 8️⃣ NEXT STEPS (OPTIONAL - MAXIMUM SECURITY)

### Implement Webhooks
Add webhook endpoint to handle server-to-server payment notifications:

```javascript
POST /api/order/webhook
// Verify signature
// Update order status
// Send confirmation email
```

### Additional Security
- Monitor payment failures
- Log all payment attempts
- Set up fraud detection alerts
- Implement 2FA for admin panel

---

## ❓ TROUBLESHOOTING

**Q: "Razorpay keys are not configured"**
- Ensure `.env` in `/backend` has both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

**Q: "Invalid signature" error**
- Check that RAZORPAY_KEY_SECRET is exactly correct
- Ensure no extra spaces in `.env`
- Restart backend server after changing .env

**Q: Payment appears in Razorpay but order not created**
- Check backend logs for the error
- Ensure database connection is working
- Verify stock is available for all items

**Q: "Too many payment attempts" error**
- This is expected after 5 failed attempts
- Wait 15 minutes before retrying
- Or switch payment method to COD

---

## 🔒 SECURITY SUMMARY

| Feature | Status | Risk Level |
|---------|--------|-----------|
| Signature Verification | ✅ Implemented | CRITICAL |
| Rate Limiting | ✅ Implemented | HIGH |
| Input Sanitization | ✅ Implemented | HIGH |
| Stock Validation | ✅ Implemented | MEDIUM |
| HTTPS | 📝 Required | CRITICAL |
| Webhook Signature | ⏳ Optional | MEDIUM |

---

**Congratulations! Your payment gateway is now highly secure.** 🎉
