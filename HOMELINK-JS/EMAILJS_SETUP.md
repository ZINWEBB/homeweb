# EmailJS Setup for Booking System (DEPRECATED)

**NOTE: This setup has been replaced with Google Sheets integration. See GOOGLE_SHEETS_SETUP.md for the new implementation.**

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com
2. Sign up for free
3. Verify your email

## Step 2: Add Email Service
1. Go to Dashboard → Email Services
2. Click "Connect New Service"
3. Choose your email provider (Gmail recommended):
   - **For Gmail**: Enable "Less secure app access" on your Google account
   - Or use Google App Password if 2FA is enabled
4. Complete the setup - you'll get a **Service ID** (looks like `service_xxxx`)

## Step 3: Create Email Templates

### Customer Confirmation Template:
1. Go to Dashboard → Email Templates
2. Click "Create New Template"
3. Name: `template_customer_booking`
4. Subject: `Your Booking Confirmation - {{property_venue}}`
5. Content:
```
Hello {{client_name}},

Thank you for booking with MADEHOME!

BOOKING DETAILS:
---
Property: {{property_venue}}
Type: {{property_type}}
Bedrooms: {{bedrooms}}
Bathrooms: {{bathrooms}}
Compound Space: {{compound_space}}

PAYMENT SUMMARY:
Basic Fee: ₦{{basic_fee}}
Agent Fee: {{agent_fee}}
Total Amount: ₦{{total_fee}}

Date: {{booking_date}} at {{booking_time}}
---

Your booking request has been submitted. Our team will contact you shortly.

Best regards,
MADEHOME Team
```

### Admin Notification Template:
1. Create another template
2. Name: `template_admin_booking`
3. Subject: `NEW BOOKING - {{property_venue}}`
4. Content:
```
NEW BOOKING RECEIVED!

CUSTOMER DETAILS:
Name: {{client_name}}
Email: {{client_email}}

PROPERTY DETAILS:
Venue: {{property_venue}}
Type: {{property_type}}
Bedrooms: {{bedrooms}}
Bathrooms: {{bathrooms}}
Compound Space: {{compound_space}}

PAYMENT:
Basic Fee: ₦{{basic_fee}}
Agent Fee: {{agent_fee}}
Total: ₦{{total_fee}}

Booking Date: {{booking_date}} at {{booking_time}}

---
Follow up with customer at {{client_email}}
```

## Step 4: Update detailpage.js
Open `detailpage.js` and update these lines:
- Line 68: Your **Public Key** (found in Account → Account ID)
- Add your **Service ID** (from Step 2)
- Add your template IDs (from Step 3)

## Current Settings:
- Public Key: Already set to `3r2gkOHB7HzNhA5fs` ✓
- Service ID: `service_2c2hd5g` (update if different)
- Customer Template: `template_customer_booking`
- Admin Template: `template_admin_booking`
- Admin Email: `koplamajohn@gmail.com`

## Testing
1. Go to detail page
2. Click on a property to see details
3. Enter name and email
4. Click "Book Now"
5. Check both emails for confirmation

## Free Tier Limits
- EmailJS free plan: 200 emails/month
- That's about 6-7 bookings per day
