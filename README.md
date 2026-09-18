# Inkosi Restaurant Ordering System

Full-stack restaurant ordering platform with three apps:

- Frontend customer app (React + Vite)
- https://inkosiresturant.netlify.app/ 
- Admin dashboard (React + Vite)
- https://inkosi-admin.netlify.app/
- Backend API (Node.js + Express + MongoDB)

Status: active development

## What Is Implemented

### Customer app

- Browse menu and featured dishes
- Add/remove items from cart (including cart drawer)
- Login and signup flow
- Checkout with delivery details
- Paystack payment redirect and verification
- My Orders page
- Closed-store popup shown before checkout when ordering is not available

### Admin app

- Add dishes with image upload
- Edit dishes inline from list page
- Remove dishes
- Featured dishes management (max 4)
- Order management with status updates
- Order filtering (Processing, Out for delivery, Delivered)
- Order search support by id/reference/customer/phone/item name
- Store live toggle (Store Live / Kitchen Paused)

### Backend

- JWT auth and password hashing
- Food, cart, user, order APIs
- Featured food APIs
- Store status API
- Order placement guard rules:
	- blocked when kitchen is paused
	- blocked outside operating hours

## Operating Rules

Orders are accepted only when both are true:

- Store status is live
- Current time is within operating hours

Default operating hours:

- 10:00 AM - 10:00 PM (all week)

If closed, frontend shows a popup with reason:

- Kitchen paused: "Kitchen isn't operational today. Please check back later."
- Outside hours: "Restaurant is currently closed. Please place your order during operational hours."

## Project Structure

```text
Inkosi-Resturant-v1/
	frontend/   Customer-facing app
	admin/      Admin dashboard
	backend/    API server
```

## Tech Stack

- React
- Vite
- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcrypt
- Axios
- Paystack

## API Summary

Base URL: `http://localhost:4000`

### Food

- `POST /api/food/add`
- `GET /api/food/list`
- `GET /api/food/featured`
- `POST /api/food/feature`
- `POST /api/food/update`
- `POST /api/food/remove`

### User

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/profile`

### Cart

- `POST /api/cart/add`
- `POST /api/cart/remove`
- `GET /api/cart/get`

### Orders

- `POST /api/order/place`
- `POST /api/order/verify`
- `POST /api/order/userorders`
- `GET /api/order/list`
- `POST /api/order/status`

### Store status

- `GET /api/store/status`
- `POST /api/store/status`

`GET /api/store/status` returns fields used by frontend/admin checks:

- `isStoreLive`
- `isWithinOperatingHours`
- `isAcceptingOrders`
- `closedReason`
- `operatingHours`

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Paystack account and test/live keys

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2) Configure backend env

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### 3) Run all apps

Terminal 1:

```bash
cd backend
npm run server
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Terminal 3:

```bash
cd admin
npm run dev
```

## Important Notes

- Backend default port is `4000`.
- Frontend redirect URL used in order flow is currently `http://localhost:5174`.
- Uploaded images are served from `/images` and stored in `backend/uploads`.
- If store availability behavior seems stale after code changes, restart backend and frontend dev servers.

## Known Limitations

- Store settings and staff management menu options in admin are placeholders.
- Analytics section in admin is not implemented yet.

## License

Personal/portfolio project.
