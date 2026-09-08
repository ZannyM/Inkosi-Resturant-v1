# Inkosi Restaurant Feature Roadmap

This project already includes authentication, cart syncing, Paystack payments, order management, admin menu CRUD, featured dishes, and store-hours enforcement.

The strongest next features are those that demonstrate architecture, product thinking, security, and testing.

## Recommended Features

### 1. Real-time Order Tracking

Use Socket.IO so customers see order-status changes immediately:

`Pending -> Confirmed -> Preparing -> Out for delivery -> Delivered`

This demonstrates event-driven architecture and real-time communication between the admin dashboard and customer application.

### 2. Admin Analytics Dashboard

Add an admin dashboard showing:

- Revenue
- Order count
- Popular meals
- Average order value
- Busiest ordering days

Use MongoDB aggregation pipelines and charts. This demonstrates how raw operational data can become useful business information.

### 3. Order Ratings and Reviews

Allow customers to rate meals after delivery. Reviews should:

- Only be available for completed orders
- Prevent duplicate reviews
- Be associated with the correct customer and order
- Be visible in the menu
- Be manageable by admins

### 4. Promo Codes and Discounts

Support percentage discounts, expiry dates, usage limits, and minimum order amounts. Discounts must be validated on the backend rather than trusted from the frontend.

### 5. Reorder and Favorites

Allow customers to favorite meals and quickly reorder a previous purchase. This is a relatively small feature that makes the app feel more complete and useful.

### 6. Email Notifications

Send emails for order confirmation and order-status updates. Include the order number, item summary, amount, and delivery details in a clean receipt-style email.

### 7. Dietary and Allergen Filtering

Add menu tags such as:

- Vegetarian
- Vegan
- Halal
- Spicy
- Gluten-free
- Common allergens

Add filters and clear labels to the customer menu.

## Best Showcase Combination

For an interview portfolio, prioritize these three features:

1. **Real-time order tracking** for technical depth
2. **Admin analytics** for business value
3. **Reviews or promo codes** for a complete customer workflow

A small number of complete features with tests will look stronger than many partially finished features.

## Interview Talking Points

Be prepared to explain:

- How WebSocket events are designed and authorized
- How order ownership is checked
- How MongoDB aggregation powers the analytics dashboard
- How the backend prevents users from manipulating prices or discounts
- How frontend state stays consistent with backend state
- What tests cover the critical order flows

## Recommended Testing

Add tests for:

- Payment verification
- Order ownership
- Discount validation
- Order-status permissions
- Review eligibility
- Duplicate review prevention

## Suggested Implementation Areas

The most natural places to extend the current application are:

- `frontend/src/context/StoreContext.jsx`
- `frontend/src/pages/MyOrders/`
- `frontend/src/pages/Confirmation/`
- `frontend/src/components/FoodItem/`
- `backend/controllers/orderController.js`
- `backend/models/orderModel.js`
- `backend/routes/orderRoute.js`
- The admin Orders page
