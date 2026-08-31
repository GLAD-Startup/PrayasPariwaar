# Prayas Platform (`prayas-platform`)

> **Comprehensive NGO Platform for Prayas Sanstha**  
> Monorepo containing a **Next.js 14 App Router Web App**, an **Expo React Native Mobile App**, and a shared **Prisma PostgreSQL Database Package** powered by **npm workspaces** and **Turborepo**.

---

## 🏗️ Architecture Overview

```
prayas-platform/
├── apps/
│   ├── web/                     # Next.js 14 App Router (Public Portal + Admin Dashboard + Unified REST API)
│   │   ├── app/
│   │   │   ├── (public)/        # Landing, About, Blood Donation, Medical Equipment, Volunteer, Donate, Contact
│   │   │   ├── (admin)/admin/   # Admin Dashboard, Blood Requests, Equipment, Volunteers, Donations, Posts
│   │   │   └── api/             # Single REST/JSON API for Web & Mobile (/api/auth, /api/blood-requests, etc.)
│   │   ├── lib/                 # Prisma client, JWT Auth, Expo Push dispatcher, Razorpay integration
│   │   └── middleware.ts        # Admin route protection with JWT verification
│   └── mobile/                  # Expo React Native App for Donors & Volunteers (iOS / Android / Web)
│       ├── app/
│       │   ├── (auth)/          # Mobile Login & Signup
│       │   └── (tabs)/          # Home, Blood Donation, Equipment Bank, Volunteer, Profile
│       └── lib/                 # Typed API client (auto-JWT injection + 401 refresh), SecureStore
│
├── packages/
│   ├── database/                # Prisma ORM, PostgreSQL schema, singleton client export (@prayas/database)
│   ├── utils/                   # Shared Zod validation schemas & common types (@prayas/utils)
│   └── config/                  # Shared TypeScript and ESLint configurations (@prayas/config)
│
├── turbo.json                   # Turborepo pipeline configuration
├── package.json                 # npm workspaces definition
└── .env.example                 # Environment variables template
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher
- **npm**: `v9.0.0` or higher (standard npm included with Node.js)
- **PostgreSQL**: Local PostgreSQL or cloud instance (e.g. Render, Railway, DigitalOcean, self-hosted VPS)

### 2. Installation
Run `npm install` from the root directory to install all dependencies and link the workspaces:
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL database.

### 4. Database Setup (Prisma)
Prisma is the ORM connecting TypeScript to PostgreSQL. The physical database is created and hosted wherever your `DATABASE_URL` points (local PostgreSQL, Supabase, Neon, etc.).

```bash
# Push schema to create/sync tables in PostgreSQL
npm run db:push

# Generate Prisma Client TypeScript definitions
npm run db:generate

# (Optional) Open interactive visual database GUI at http://localhost:5555
npm run db:studio
```

---

## 💻 Running the Applications

### Run Everything Concurrently (Turbo)
```bash
npm run dev
```

### Run Web Application Only (Next.js)
```bash
# Available at http://localhost:3000
npm run web:dev
# Or: npm run dev --workspace=@prayas/web
```

### Run Mobile Application Only (Expo)
```bash
# Starts Expo Metro bundler
npm run mobile:dev
# Or: npm run dev --workspace=@prayas/mobile
```
Press `w` to open in browser, `a` for Android Emulator, or `i` for iOS Simulator.

---

## 🔑 Authentication Architecture

- **Dual-Token Custom JWT**: Short-lived Access Token (`15m`) + Long-lived Refresh Token (`7d`).
- **Web App**: Tokens are stored in secure `httpOnly` cookies via Route Handlers and verified by Next.js `middleware.ts`.
- **Mobile App**: Tokens are stored in hardware-encrypted storage using `expo-secure-store`.
- **Automatic Refresh**: The mobile client (`apps/mobile/lib/api.ts`) automatically intercepts `401 Unauthorized` responses, fetches a new access token via `/api/auth/refresh`, and retries the failed request seamlessly.

---

## 🩸 Emergency Blood Request Flow (End-to-End)

1. **Submission**: User or mobile donor fills the emergency blood request form in `apps/mobile/app/(tabs)/blood-donation.tsx` (or web portal).
2. **Validation**: Validated using the shared Zod schema `BloodRequestSchema` from `@prayas/utils`.
3. **API Processing**: Handled by Next.js route handler `apps/web/app/api/blood-requests/route.ts`.
4. **Database Insertion**: Saved into PostgreSQL with urgency level, patient details, and required blood group via Prisma.
5. **Instant Push Alert**: `apps/web/lib/expo-push.ts` queries all registered Expo Push Tokens and dispatches an emergency notification to matching donors via the Expo Push API.
6. **Admin Dashboard**: The request appears live in the Admin Dashboard at `/admin/blood-requests` with action buttons to approve, fulfill, or trigger broadcasts.

---

## 💳 Razorpay Donations Integration

- **Route Handler**: `/api/donations/create-order` creates an order with Razorpay.
- **Webhook**: `/api/donations/webhook` cryptographically verifies the `X-Razorpay-Signature` HMAC header and marks the donation as `SUCCESS` in PostgreSQL.

---

## 📄 License
MIT License. Built with ❤️ for Prayas Sanstha.
