# Apex Banking API (api-js)

This is a complete, full-stack banking application built with Node.js, Express, React, and Supabase.

## Architecture
- **Backend:** Node.js / Express.js
- **Frontend:** React (Vite)
- **Database & Auth:** Supabase (PostgreSQL + JWT)
- **Testing:** Vitest + Supertest

## Setup

1. **Clone & Install Dependencies**
   ```bash
   cd api-js
   npm install
   cd frontend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of `api-js` (see `.env.example`):
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   *Note: Render provides the `PORT` automatically in production.*

3. **Supabase Database Configuration**
   Run the SQL provided in `schema.sql` within your Supabase project's SQL editor. This creates the `accounts` and `transactions` tables and configures Row Level Security (RLS).

## Running Locally

**Start the Backend API (Port 3000):**
```bash
npm run dev
```

**Start the React Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

## Testing & Coverage

The backend relies on Vitest for testing business rules and HTTP endpoints.

**Run Tests with Coverage:**
```bash
npm run vitests:coverage
```
This generates a text output in your console and an HTML coverage report in the `coverage/` directory, spanning all critical features.

## Endpoints

### Auth
- `POST /api/auth/register` (email, password)
- `POST /api/auth/login` (email, password)
- `GET /api/auth/me` (Protected)

### Accounts
- `POST /api/accounts` (accountType: checking|savings)
- `GET /api/accounts`
- `GET /api/accounts/:id`
- `GET /api/accounts/:id/balance`

### Transactions
- `POST /api/transactions/credit` (accountId, amount)
- `POST /api/transactions/debit` (accountId, amount)
- `POST /api/transactions/transfer` (fromAccountId, toAccountId, amount)
- `GET /api/transactions/history`
