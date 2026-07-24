# 🍽️ Restaurant Ordering System

A full-stack restaurant ordering platform that connects customers, a backend database, payment integration, and an admin dashboard into one working system.
'converting the repo to TypeScript'
Tooling + config (both frontend and backend): 0.5–2 hours
Batch renaming files: 0.1–0.5 hours (scripts/automation)
Fixing runtime/type errors & adding types: 2–24+ hours depending on code complexity and strictness
Full strict, well-typed migration: days (1–5+) for this multi-package repo

> Status: 🚧 In active development — core ordering flow is functional, additional UI polish and features are in progress.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [1. Frontend — Customer Website](#1-frontend--customer-website)
- [2. Backend — API & Business Logic](#2-backend--api--business-logic)
- [3. Admin Panel — Restaurant Management](#3-admin-panel--restaurant-management)
- [End-to-End Flow](#end-to-end-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roadmap / Planned Improvements](#roadmap--planned-improvements)
- [Known Issues](#known-issues)

---

## Overview

This project is a full-stack restaurant ordering system with three main parts:

- 🛒 A **customer-facing food ordering website**
- ⚙️ A **backend API** that stores data and handles business logic
- 🧑‍🍳 An **admin dashboard** for managing menu items and orders

In simple terms, it lets customers browse dishes, add them to a cart, log in or sign up, place an order, pay through a payment gateway, and view their order history. It also gives restaurant staff a way to add or remove food items from the menu.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (Customer) | React, Vite |
| Admin Panel | React |
| Backend | Node.js, Express |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| Payments | Paystack |
| HTTP Client | Axios |

---

## Project Structure

```
restaurant-ordering-system/
├── frontend/       # Customer-facing React app
├── admin/          # Admin dashboard React app
└── backend/        # Node.js/Express API + MongoDB
```

---

## 1. Frontend — Customer Website

The frontend is the part users interact with. It's built with **React and Vite** and organized around a modern restaurant-style shopping experience.

### Main Customer Experience

- Home page with a hero section, menu categories, and featured dishes
- Browse food items by category (salads, rolls, desserts, sandwiches, pasta, noodles)
- Add items to cart with instant quantity updates
- Cart page showing items, quantities, subtotal, delivery fee, and total cost
- Checkout page collecting delivery details (name, address, email, phone, city)
- Redirect to payment page after checkout
- Post-payment verification step, followed by order history view

### Key Frontend Files

| File | Responsibility |
|---|---|
| `App.jsx` | Main routes — home, cart, checkout, verification, orders |
| `StoreContext.jsx` | Central state manager — cart contents, food items list, user auth token, add/remove helpers, total calculations |
| `LoginPopup.jsx` | Sign-up and login |
| `Cart.jsx` | Displays cart, proceeds to checkout |
| `PlaceOrder.jsx` | Collects delivery details, starts order process |
| `MyOrders.jsx` | Displays customer's previous orders |

### How It Works

The frontend communicates with the backend via HTTP requests through **Axios** — fetching the menu, syncing cart updates, creating orders, and displaying order history.

---

## 2. Backend — API & Business Logic

The backend is built with **Node.js, Express, and MongoDB**, acting as the central server for the whole application.

### What It Does

- Handles user registration and login
- Stores and serves food items
- Manages the shopping cart per user
- Creates and tracks orders
- Handles payment initialization with Paystack
- Serves uploaded food images

### Main Backend Structure

| File | Responsibility |
|---|---|
| `server.js` | Starts the server, connects to MongoDB, defines main API routes |
| `foodRoute.js` | Add, list, and remove food items |
| `userRoute.js` | User authentication |
| `cartRoute.js` | Add/remove/get cart actions |
| `orderRoute.js` | Place orders, verify payment, retrieve user orders |

### Core Backend Features

- **Security:** passwords hashed with `bcrypt`, sessions secured with `JWT`
- **Food items** stored in MongoDB with `name`, `description`, `price`, `category`, and `image` filename
- **Orders** store user ID, ordered items, delivery address, amount, order status, and payment status
- **Images** uploaded to the `uploads` folder and served publicly via the `/images` route

### Payment Flow

1. Order is saved to the database
2. User's cart is cleared
3. Backend creates a Paystack payment session
4. Frontend redirects the user to the Paystack payment page

This makes the app feel like a real online food delivery platform rather than just a simple demo.

---

## 3. Admin Panel — Restaurant Management

A separate React app designed for restaurant staff or owners.

### What It Does

- Add new food items to the menu
- View all available food items
- Remove food items from the menu
- Manage orders

### Admin Features

| File | Responsibility |
|---|---|
| `App.jsx` | Admin routes for Add, List, and Orders pages |
| `Add.jsx` | Form to add a new dish — name, description, price, category, image upload |
| `List.jsx` | Displays all food items from the database, allows deletion |
| `Sidebar.jsx` | Navigation between Add, List, and Orders pages |

### Admin Workflow

A restaurant manager can:

1. Upload a new dish image
2. Enter product details
3. Send it to the backend
4. See it immediately appear in the menu for customers

This makes the admin app a simple but useful content management dashboard for the restaurant.

---

## End-to-End Flow

1. A customer opens the frontend website
2. They browse food items and add dishes to the cart
3. They sign up or log in
4. They go to checkout, enter delivery details, and submit the order
5. The backend saves the order and starts a payment process
6. The customer pays through Paystack
7. The order becomes marked as paid and appears in their order history
8. The admin manages the menu and views orders through the admin app

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB instance)
- Paystack account (test API keys)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd restaurant-ordering-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
npm install lucide-react

# Install admin dependencies
cd ../admin
npm install
```

### Running Locally

```bash
# Start backend (from /backend)
npm run server

# Start frontend (from /frontend)
npm run dev

# Start admin panel (from /admin)
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

> ⚠️ Never commit your `.env` file to version control. Make sure it's listed in `.gitignore`.

---

## Roadmap / Planned Improvements

- [ ] UI polish across cart, checkout, and order history pages
- [ ] Mobile responsiveness improvements
- [ ] Order status tracking updates (e.g. preparing, out for delivery, delivered)
- [ ] Admin order management page (currently placeholder)
- [ ] Search and filter functionality for menu items
- [ ] Loading and empty states across pages
- [ ] Toast notifications for cart and order actions
- [ ] Improved form validation on checkout
- [ ] Deployment (frontend, backend, admin)

---

## Known Issues

- _List any current bugs or limitations here as you find them._

---

## License

This project is currently unlicensed / for personal portfolio use.
