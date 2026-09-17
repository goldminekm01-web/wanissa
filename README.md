# Entertainment Awards Voting App

This is a complete full-stack voting application for entertainment awards in Kenya.
It features M-Pesa STK Push payments via Daraja API, SMS voting via Africa's Talking, and an Admin Dashboard.

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM, easy to migrate to PostgreSQL)
- **Styling**: Plain CSS Modules (Glassmorphism & dark theme)

## Setup and Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 3. Environment Variables
Create a `.env` file in the root directory with the following keys:

```env
# Database
DATABASE_URL="file:./dev.db"
# If using Postgres, replace with "postgresql://user:password@host:5432/db"

# M-Pesa Daraja API
MPESA_ENVIRONMENT="sandbox" # or production
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_SHORTCODE="5002399"
MPESA_PASSKEY="your_passkey"
MPESA_CALLBACK_URL="https://yourdomain.com/api/mpesa/callback"

# Africa's Talking SMS API
AT_USERNAME="sandbox"
AT_API_KEY="your_api_key"
AT_SENDER_ID="your_shortcode"

# App URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Run the Development Server
```bash
npm run dev
```

## Workflows & API Endpoints

### Voting Flow
1. **Web Flow**: Users browse categories -> select contestant -> enter phone number and vote count in the Quick-Vote modal (`/vote`). An STK push is initiated (`/api/vote/initiate`).
2. **SMS Flow**: Users text `VOTE JONOE123 3` to the Africa's Talking shortcode. The system receives this via the `/api/sms/inbound` webhook and replies with a payment link.
3. **Payment Confirmation**: Safaricom calls the `/api/mpesa/callback` webhook. The system verifies the transaction amount matches the expected amount, and if so, increments the contestant's vote count and logs the transaction.

### Admin Dashboard
Access the admin panel at `/admin`.
- **Categories**: Create and manage award categories.
- **Contestants**: Add contestants to categories. The system automatically generates a unique vote code (e.g., `JONOE123`).
- **Reports**: View real-time transaction history and vote revenue.

## Airtel Money Users (Constraint Approach)
As Airtel-to-Mpesa STK Push is not supported natively via Daraja without a third-party aggregator, the system relies on the STK Push fallback:
Airtel users can use the SMS shortcode or the website to initiate votes, but they will be prompted to enter a **Safaricom Number** in the payment modal to receive the M-Pesa STK Push.

## Testing
Run unit tests for the core logic (Candidate code generation and accounting validation):
```bash
npm test
```
*(Configure Jest or Vitest for automated running if desired).*
