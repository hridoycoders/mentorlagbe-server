# MentorLagbe Server - Assignment 9 Category 001

## Live Links
- **Production API:** https://mentorlagbe-server-1.vercel.app/
- **Client Frontend:** https://mentorlagbe-tuitionplatform.vercel.app/

## Project Description
MentorLagbe is a full-stack tutor-student connection platform built with Express.js and Next.js. This repository contains the backend API, database configuration, and seed setup. The platform enables students to find and apply for tuition classes, and tutors to post and manage their tuition listings.

**Assignment 9 Category 001** — Complete audit and incremental implementation across client and server repositories, including JWT authentication, role-based authorization, Stripe payments, tuition search/filter/pagination, dashboards, and production seed data.

## Technology Stack
- **Runtime:** Node.js 26.x (Fluid Compute on Vercel)
- **Framework:** Express.js 5
- **Language:** JavaScript (ES module syntax, `type: "module"` in package.json)
- **Database:** MongoDB (v7.9.0) with official MongoDB Node.js driver
- **Authentication:** better-auth + jose (JWT via remote JWKS)
- **Payments:** Stripe ^23.1.0
- **Environment:** dotenv ^18.0.10, CORS ^2.8.6
- **Development:** nodemon ^3.1.14

## API Endpoint Overview (Grouped by Feature)

### Authentication & Authorization
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| GET | `/api/users/me` | `verifyToken` | Logged-in user: Get own profile |
| PATCH | `/api/users/me` | `verifyToken` | Logged-in user: Update own profile |
| GET | `/api/users/admin` | `verifyAdmin` | Admin: Get all users |
| PATCH | `/api/users/admin/:id/role` | `verifyAdmin` | Admin: Update user role |
| PATCH | `/api/users/admin/:id/status` | `verifyAdmin` | Admin: Update user account status |

**Named middlewares:**
- `verifyToken` — JWT verification with remote JWKS, attaches `req.user` {id, name, email, role, plan}
- `verifyStudent` — `[verifyToken, authorizeRole("student")]`
- `verifyTutor` — `[verifyToken, authorizeRole("tutor")]`
- `verifyAdmin` — `[verifyToken, authorizeRole("admin")]`
- `authorizeRole(...allowedRoles)` — role-check middleware (403 if not allowed)

### Tuitions
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| GET | `/api/tuitions/search` | None | Public: Search and filter tuition listings |
| GET | `/api/tuitions/admin/all` | `verifyAdmin` | Admin: Get all tuition listings |
| PATCH | `/api/tuitions/admin/:id/status` | `verifyAdmin` | Admin: Approve or reject a tuition listing |
| GET | `/api/tuitions/my` | `verifyTutor` | Tutor: Get own tuition listings |
| POST | `/api/tuitions` | `verifyTutor` | Tutor: Create a tuition listing |
| PATCH | `/api/tuitions/:id` | `verifyTutor` | Tutor: Update own tuition listing |
| DELETE | `/api/tuitions/:id` | `verifyTutor` | Tutor: Delete own tuition listing |
| GET | `/api/tuitions/:id` | None | Public: Get a single tuition listing (approved+active) |
| GET | `/api/tuitions` | None | Public: Get approved and active tuition listings |

**Key features:**
- Server-side search/filter by subject, class level, mode (online/offline), location
- Pagination on public listing endpoint
- Partial unique index on `seedKey` for idempotent seed data
- All tuitions have `status: "approved"` and `isActive: true`

### Payments
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| POST | `/api/payments/webhook` | None | Stripe webhook receiver (raw body) |
| POST | `/api/payments/create-checkout-session` | `verifyToken`, `authorizeRole("tutor", "student")` | Create Stripe Checkout Session ($15 tutor, $10 student) |

**Webhook:** Handles `checkout.session.completed` events, verifies Stripe signature, updates payment records.

### Applications
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| GET | `/api/applications/student` | `verifyStudent` | Student: Get own applications |
| GET | `/api/applications/tutor` | `verifyTutor` | Tutor: Get all applications for own tuitions |
| GET | `/api/applications/tutor/:id` | `verifyTutor` | Tutor: Get a specific application by ID |
| PATCH | `/api/applications/tutor/:id/status` | `verifyTutor` | Tutor: Accept or reject an application |
| POST | `/api/applications` | `verifyStudent` | Student: Apply for a tuition |
| DELETE | `/api/applications/:id` | `verifyStudent` | Student: Cancel a pending application |

### Dashboard Statistics
| Method | Endpoint | Middleware | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats/student` | `verifyStudent` | Student dashboard stats |
| GET | `/api/dashboard/stats/tutor` | `verifyTutor` | Tutor dashboard stats |
| GET | `/api/dashboard/stats/admin` | `verifyAdmin` | Admin dashboard stats |
| GET | `/api/dashboard/transactions` | `verifyAdmin` | Admin: Payment transaction history |

## MongoDB Collections

| Collection | Key Fields | Indexes |
|---|---|---|
| `users` | `_id, name, email, role, plan, image, phone, bio, emailVerified, seedKey, createdAt, updatedAt` | — |
| `tuitions` | `_id, title, subject, classLevel, mode, location, monthlyFee, daysPerWeek, description, bannerImage, tutorId, tutorName, tutorEmail, status, isActive, seedKey, createdAt, updatedAt` | `unique_tuition_seed_key` (partial, on `seedKey: 1` where `seedKey` is non-empty string) |
| `applications` | `_id, studentId, tutorId, tuitionId, status, createdAt, updatedAt` | `unique_student_tuition_application` (unique on `{tuitionId: 1, studentId: 1}`) |
| `payments` | `_id, sessionId, amount, currency, status, tutorId, studentId, createdAt` | `unique_stripe_session` (unique on `sessionId: 1`) |

**Index creation order on server boot:** `connectDB()` → `createIndexes()` → mount routes → `app.listen(PORT)`.

## Stripe Payment Overview

- **Tutor Pro Plan:** $15/month (USD) — unlocks unlimited tuition posts, priority listing, golden PRO badge
- **Student Pro Plan:** $10/month (USD) — unlocks enhanced search, bookmark limits, direct applications
- **Checkout:** POST `/api/payments/create-checkout-session` — backend derives plan from authenticated user's role
- **Webhook:** POST `/api/payments/webhook` — receives Stripe events, verifies signature, updates payment status
- **Webhook raw-body handling:** `express.raw({ type: "application/json" })` in `index.js`

## ImgBB Upload Overview
- Image upload functionality for tuition banners and user profiles
- Configured via environment variables (upload URL and API key managed at deployment)
- Client-side upload integration with server-side validation

## Search / Filter / Pagination
- **Public search:** GET `/api/tuitions/search` — query parameters for subject, classLevel, mode, location
- **Public listings:** GET `/api/tuitions` — returns approved+active tuitions with pagination
- Server-side filtering and pagination implemented in `getPublicTuitions` controller

## Installation & Local Development

### Prerequisites
- Node.js 26.x (LTS)
- MongoDB Atlas account or local MongoDB instance
- Stripe account (for payment testing)

### Server Setup
```bash
cd server
# Copy env template (existing .env file present)
cp .env .env.local
# Or pull from Vercel: vercel env pull .env.seed.production.local --environment=production

# Set required env var NAMES only (do not reveal values):
#   MONGODB_URI, DB_NAME, PORT, CLIENT_URL
#   BETTER_AUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

npm install
npm run seed   # idempotent: inserts 4 tutors + 12 tuitions (seedKey-based dedup)
npm run dev    # nodemon: runs on http://localhost:5000 (or PORT env var)
```

### Seed Script
- **Command:** `npm run seed`
- **Behavior:** Idempotent — uses `updateOne` with `upsert: true` and `seedKey` matching
- **Inserts:** Up to 4 tutor accounts (display-only, no login password) + up to 12 tuition records
- **Unique index:** `unique_tuition_seed_key` (partial: only documents with non-empty string `seedKey`)
- **Rerun result:** `Tuitions inserted: 0, already present: 12` (no duplicates)
- **Tutor accounts:** Display-only — no password, `image: ""`, `phone: ""`, `bio: ""`, cannot log in

### Production Deployment
- Deployed on Vercel with automatic GitHub linking (`origin/main`)
- Start command: `npm start` → `node index.js`
- CORS origin from `process.env.CLIENT_URL`
- Webhook raw-body preserved for Stripe event verification
- Environment variables managed via Vercel dashboard (Secret type)

## Required Environment Variable NAMES
- `MONGODB_URI` — MongoDB connection string (do not document values)
- `DB_NAME` — Database name (default: `mentorlagbe`, do not document values)
- `PORT` — Server port (default: 5000)
- `CLIENT_URL` — Frontend URL for callback URLs and CORS
- `BETTER_AUTH_URL` — Better Auth base URL for JWKS verification (e.g., `https://mentorlagbe-server.vercel.app`)
- `STRIPE_SECRET_KEY` — Stripe secret key (do not document values)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret (do not document values)

**Note:** Never print or expose actual values of `MONGODB_URI`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET`.

## Client Repository
- **URL:** https://github.com/hridoycoders/mentorlagbe-client.git
- **Features:** Next.js App Router, better-auth, Stripe checkout, dashboards, tuition search/filter, toast notifications

## Git & Deployment
- **Branch:** main
- **Remote:** https://github.com/hridoycoders/mentorlagbe-server.git
- **Latest committed seed setup:** `3449fb4` "feat: add idempotent tuition seed setup"
- **Production deployment:** Vercel, automatic deploys from `main` branch
- **Server startup sequence:** `connectDB()` → `createIndexes()` → mount all routes → `app.listen(PORT)`

## Security Notes
- Never commit or expose `.env` values, especially `MONGODB_URI`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- All env vars marked as `Secret` type in Vercel dashboard
- JWT verification uses remote JWKS from `BETTER_AUTH_URL`
- Role-based authorization via `authorizeRole(...roles)` middleware
- Stripe webhook signature verification prevents spoofed events
- Partial unique index on `seedKey` ensures idempotent seed data without affecting real user records
- CORS configured via `process.env.CLIENT_URL`