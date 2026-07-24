# Deployment Notes (Deferred)

This document explains why deployment was postponed for now, and how to deploy this project later.

## Why Deployment Was Not Done Yet

## 1. Pending runtime stability checks
- Recent local terminals show `npm run dev` / `npm run server` exits with code `1` at different points.
- Before production deployment, local startup should be stable across:
  - `backend`
  - `frontend`
  - `admin`

## 2. Multi-app architecture requires coordinated deployment
- This repo has 3 separate deployable apps:
  - `frontend` (customer app)
  - `admin` (admin app)
  - `backend` (API server)
- Each app needs its own environment variables and URL wiring.

## 3. Environment-specific payment configuration needed
- Paystack callback URLs must be switched from localhost to production domain(s).
- Production keys must be configured safely on the backend platform.

## 4. CORS + cross-domain setup needed
- Backend must allow requests from both deployed frontend and admin domains.
- This is required for auth, cart, orders, and admin API usage.

## 5. File upload persistence risk in production
- Backend currently uses local disk (`backend/uploads`) for images.
- Many cloud hosts have ephemeral storage, so images may be lost after restarts/redeploys.
- Recommended: migrate uploads to cloud storage (Cloudinary/S3/Supabase Storage).

## 6. Time and sequencing constraints
- Deployment was intentionally postponed to focus first on feature completion and bug fixes.

---

## How Deployment Will Be Done

## Target architecture
- Frontend: Vercel or Netlify
- Admin: Vercel or Netlify
- Backend: Render / Railway / Fly.io / VPS
- Database: MongoDB Atlas
- Image storage: Cloudinary (recommended)

## Suggested domain layout
- `app.yourdomain.com` -> frontend
- `admin.yourdomain.com` -> admin
- `api.yourdomain.com` -> backend

---

## Deployment Plan (Step-by-Step)

## Step 1: Pre-deployment checks
1. Run backend locally and confirm no startup crash.
2. Run frontend locally and test:
   - login
   - cart drawer checkout flow
   - closed-store popup behavior
3. Run admin locally and test:
   - store live toggle
   - notifications
   - featured/list/orders pages
4. Build all apps successfully:
   - `cd backend && node --check server.js`
   - `cd frontend && npm run build`
   - `cd admin && npm run build`

## Step 2: Deploy backend first
1. Deploy `backend` service.
2. Set backend environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PAYSTACK_SECRET_KEY`
3. Update backend CORS to allow deployed frontend + admin domains.
4. Verify API health at `/` and key routes.

## Step 3: Deploy frontend and admin
1. Deploy `frontend`.
2. Deploy `admin`.
3. Set each app API base URL to deployed backend URL.

## Step 4: Configure Paystack production callbacks
1. Update backend checkout callback URL to production frontend URL.
2. Validate end-to-end payment flow in test/live mode.

## Step 5: Storage hardening for uploads
1. Migrate image uploads from local disk to cloud storage.
2. Update upload and image URL logic.
3. Retest add/list/edit/remove food workflows.

## Step 6: Final verification
1. Customer flow: browse -> cart -> checkout -> pay -> verify -> my orders.
2. Admin flow: add/edit/remove food, feature dishes, order status updates, store pause.
3. Closed-store behavior:
   - Kitchen paused
   - Outside operating hours
4. Notification badge updates as orders are placed.

---

## Quick Troubleshooting Checklist

- If frontend/admin cannot call API:
  - Check API base URL
  - Check backend CORS
- If payments fail:
  - Check Paystack key and callback URL
- If images disappear:
  - Confirm cloud storage migration completed
- If auth fails:
  - Verify token headers and JWT secret

---

## Estimated Time When You Resume

- Basic first live deployment: 2-5 hours
- Stable production-ready setup: 1-2 days
- With upload migration + hardening: 2-5 days
