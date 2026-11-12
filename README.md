# Inkosi Restaurant Ordering System

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

A full-stack restaurant ordering platform built with React, Node.js, Express, and MongoDB. Features customer ordering, admin management, and Paystack payment integration.

## 🌐 Live Deployment

- **Customer App**: https://inkosiresturant.netlify.app/
- **Admin Dashboard**: https://inkosi-admin.netlify.app/
- **API**: Hosted backend serving both applications

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation Guide](#installation-guide)
- [API Documentation](#api-documentation)
- [Operating Rules](#operating-rules)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Application

- Browse menu with search and filtering
- Featured dishes showcase
- Secure user authentication (signup/login)
- Shopping cart with persistent storage
- Checkout with delivery address
- Paystack payment integration
- Order tracking and history
- Store availability notifications

### Admin Dashboard

- Dish management (add, edit, remove)
- Image upload functionality
- Featured dishes curation (max 4 dishes)
- Order management and status updates
- Advanced order filtering and search (ID, phone, customer name)
- Store status control (open/closed, live/paused)
- Real-time order notifications

### Backend API

- JWT-based authentication with bcrypt password hashing
- RESTful API for food, users, cart, and orders
- MongoDB integration with Mongoose ODM
- Order placement validation and guard rules
- Store status management with operating hours
- Payment verification with Paystack

## 🛠️ Tech Stack

### Frontend & Admin

- **React** 19.x - UI library
- **Vite** 8.x - Lightning-fast build tool
- **Tailwind CSS** 4.x - Utility-first CSS
- **React Router** 7.x - Client-side routing
- **Axios** 1.x - HTTP client

### Backend

- **Node.js** 18+ - JavaScript runtime
- **Express** 5.x - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 9.x - MongoDB ODM
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling

## 📁 Project Structure

```
Inkosi-Resturant-v1/
├── frontend/          # Customer-facing React app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── admin/             # Admin dashboard React app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tests/
│   ├── package.json
│   └── server.js
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** for cloning the repository
- **MongoDB Atlas Account** (free tier) for database - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Paystack Account** (test/sandbox available) for payments - [Sign up](https://paystack.com/)

### Verify Installation

```bash
node --version
npm --version
git --version
```

## 🚀 Quick Start

Get the application running in 5 minutes:

```bash
# 1. Clone repository
git clone https://github.com/ZannyM/Inkosi-Resturant-v1.git
cd Inkosi-Resturant-v1

# 2. Install all dependencies
npm run install:all

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 4. Start all services
npm run dev:all
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **API**: http://localhost:4000

## 📦 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/ZannyM/Inkosi-Resturant-v1.git
cd Inkosi-Resturant-v1
```

### Step 2: Obtain Required Credentials

#### MongoDB Connection String

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/
2. Create a new cluster
3. Set up database access (username and password)
4. Get your connection string in the format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

#### Paystack API Keys

1. Create a Paystack account at https://paystack.com/
2. Navigate to Settings → API Keys & Webhooks
3. Copy your **Secret Key** (for backend)

### Step 3: Backend Setup

#### 3.1 Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3.2 Configure Environment Variables

Copy the example file and update it:

```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/inkosi_db
JWT_SECRET=your_secure_jwt_secret_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

**Important**: The `JWT_SECRET` should be a strong random string (at least 32 characters).

#### 3.3 Backend Commands

```bash
# Development server with auto-reload
npm run server

# Production server
npm start

# Run tests
npm test
```

The backend will start at `http://localhost:4000`

### Step 4: Frontend Setup

#### 4.1 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4.2 Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The frontend will start at `http://localhost:5173`

### Step 5: Admin Dashboard Setup

#### 5.1 Install Admin Dependencies

```bash
cd ../admin
npm install
```

#### 5.2 Admin Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The admin dashboard will start at `http://localhost:5174`

### Step 6: Running All Services Simultaneously

From the project root directory, use the provided npm scripts:

```bash
# Install all dependencies
npm run install:all

# Start all development servers
npm run dev:all

# Build all applications
npm run build:all
```

Or run each in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Admin:**
```bash
cd admin
npm run dev
```

## 🔌 API Documentation

Base URL: `http://localhost:4000/api`

### Authentication Endpoints

```
POST   /user/register          Register new user
POST   /user/login             Login user
GET    /user/profile           Get user profile (requires auth)
```

### Food Endpoints

```
GET    /food/list              Get all dishes
GET    /food/featured          Get featured dishes
POST   /food/add               Add new dish (admin)
POST   /food/update            Update dish (admin)
POST   /food/feature           Mark dish as featured (admin)
POST   /food/remove            Remove dish (admin)
```

### Cart Endpoints

```
GET    /cart/get               Get user's cart
POST   /cart/add               Add item to cart
POST   /cart/remove            Remove item from cart
```

### Order Endpoints

```
POST   /order/place            Create new order
POST   /order/verify           Verify payment
GET    /order/list             Get all orders (admin)
POST   /order/userorders       Get user's orders
POST   /order/status           Update order status (admin)
```

### Store Status Endpoints

```
GET    /store/status           Get store status
POST   /store/status           Update store status (admin)
```

## 🏪 Operating Rules

Orders are accepted only when **both** conditions are true:

1. **Store Status**: Store is live (`isStoreLive = true`)
2. **Operating Hours**: Current time is within business hours

### Default Operating Hours

- **Days**: Monday - Sunday
- **Hours**: 10:00 AM - 10:00 PM (SAST)

### Store Closure Scenarios

When the store is closed, customers see appropriate notifications:

| Condition | Message |
|-----------|---------|
| Kitchen Paused | "Kitchen isn't operational today. Please check back later." |
| Outside Hours | "Restaurant is currently closed. Please place your order during operational hours." |

### Store Status API Response

```json
{
  "isStoreLive": true,
  "isWithinOperatingHours": true,
  "isAcceptingOrders": true,
  "closedReason": null,
  "operatingHours": {
    "start": "10:00",
    "end": "22:00"
  }
}
```

## 🔍 Important Notes

### Port Configuration

- **Backend API**: `4000` (configured in `server.js`)
- **Frontend Dev Server**: `5173` (Vite default)
- **Admin Dev Server**: `5174` (secondary Vite instance)

### File Uploads

- Uploaded dish images are stored in `backend/uploads/images`
- Images are served via `http://localhost:4000/images/{filename}`

### Troubleshooting Tips

1. **Port Already in Use**: Kill the process using the port or configure a different port in the environment
2. **Stale Store Status**: Restart both backend and frontend servers after making changes
3. **Authentication Errors**: Clear browser localStorage and re-login
4. **Image Upload Issues**: Ensure `backend/uploads` directory exists and has write permissions

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_long_random_string` |
| `PAYSTACK_SECRET_KEY` | Paystack API secret key | `sk_test_...` |
| `PORT` | Server port (optional) | `4000` |

### Frontend Configuration

- Update API base URL in axios instances if backend is hosted elsewhere
- Default: `http://localhost:4000`

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

Test files are located in `backend/tests/`

## 🔐 Security Notes

- All passwords are hashed using bcrypt
- JWT tokens secure API endpoints
- Payment verification is server-side
- Never commit `.env` files with real credentials
- Use environment variables for all sensitive data

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Paystack Documentation](https://paystack.com/docs)
- [Vite Guide](https://vitejs.dev/)

## 🐛 Known Limitations

- Store settings and staff management options in admin dashboard are placeholders
- Analytics section not yet implemented
- Image optimization for uploads not implemented

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**ZannyM** - Portfolio Project

---

**Last Updated**: November 2024  
**Status**: Active Development
