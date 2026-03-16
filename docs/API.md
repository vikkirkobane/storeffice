# Storeffice API Documentation

> Base URL: `https://api.storeffice.com` (or your production domain)
> Authentication: Bearer token via `access_token` cookie or `Authorization: Bearer <token>`

---

## Authentication

### OTP Login
- **POST** `/api/auth/login`
- Body: `{ email: string }`
- Response: `{ success: true, message: "OTP sent" }`

### Verify OTP
- **POST** `/api/auth/verify-otp`
- Body: `{ email: string, otp: string }`
- Response: `{ accessToken: string, refreshToken: string, user: User }`

### Register
- **POST** `/api/auth/register`
- Body: `{ email: string, password: string, fullName: string, userType: "customer" | "owner" | "merchant" }`
- Response: `{ accessToken: string, refreshToken: string, user: User }`

---

## Office Spaces

### List Spaces
- **GET** `/api/office-spaces`
- Query: `?city=...&minPrice=...&maxPrice=...&capacity=...&page=...&limit=...`
- Response: `{ spaces: OfficeSpace[], pagination: { page, limit, total, pages } }`

### Get Space
- **GET** `/api/office-spaces/:id`
- Response: `OfficeSpace`

### Create Space (Owner)
- **POST** `/api/office-spaces`
- Body: `OfficeSpaceInput` (title, description, address, city, state, zipCode, country, latitude, longitude, photos, amenities, capacity, pricing fields, etc.)
- Auth: requires `owner` or `admin` role

### Update Space
- **PUT** `/api/office-spaces/:id`
- Similar body to create; updates the space

### Delete Space
- **DELETE** `/api/office-spaces/:id`

---

## Storage Spaces

Similar endpoints for storage spaces: `/api/storage-spaces`

---

## Products

### List Products
- **GET** `/api/products`
- Query: `?category=...&minPrice=...&maxPrice=...&search=...&city=...&page=...&limit=...`
- Note: `city` filters by storage location (joins storage_spaces)

### Get Product
- **GET** `/api/products/:id`

### Create Product (Merchant)
- **POST** `/api/products`
- Auth: `merchant` or `admin`

### Update/Delete Product
- **PUT** `/api/products/:id`
- **DELETE** `/api/products/:id`

---

## Bookings

### Create Booking
- **POST** `/api/bookings`
- Body: `{ spaceId: string, startDate: string (ISO), endDate: string, guestCount: number }`
- Auth: `customer`
- Returns: `{ booking, clientSecret, paymentIntentId, amount }` (client secret for Stripe)

### Get My Bookings
- **GET** `/api/bookings`
- Auth: `customer`, `owner` (filtered by user role)

### Cancel Booking
- **PUT** `/api/bookings/:id/cancel`

---

## Orders

### Checkout (Create Order + PaymentIntent)
- **POST** `/api/orders/checkout`
- Body: `{ items: [{ productId, quantity }], shippingAddress: Address }`
- Auth: `customer`
- Returns: `{ orderId, clientSecret, paymentIntentId, amount }`

### Get My Orders
- **GET** `/api/orders`
- Auth: `customer`

---

## Cart

### Get Cart
- **GET** `/api/cart`
- Auth: required (logged in)

### Add Item
- **POST** `/api/cart`
- Body: `{ productId: string, quantity?: number }`

### Update Item
- **PUT** `/api/cart/:productId`
- Body: `{ quantity: number }`

### Remove Item
- **DELETE** `/api/cart/:productId`

### Clear Cart
- **DELETE** `/api/cart`

---

## Payments

### Create PaymentIntent
- **POST** `/api/payments/create-intent`
- Body: `{ type: "booking" | "order", id: string }`
- Auth: required

### Refund Payment
- **POST** `/api/payments/:id/refund`
- Body: `{ amount?: number }` (partial amount in dollars)
- Auth: payment owner or admin

---

## Webhooks (Stripe)

- **POST** `/api/webhooks/stripe`
- Header: `stripe-signature: <sig>`
- Events handled:
  - `payment_intent.succeeded` → confirms booking/order, sends email, clears cart (orders only), reduces inventory
  - `payment_intent.payment_failed` → marks booking/order cancelled, sends email
  - `charge.refunded` → marks payment refunded

---

## Notifications

### List Notifications
- **GET** `/api/notifications`
- Query: `?unread=true` (optional)
- Response: `{ notifications, unreadCount }`

### Mark Read
- **POST** `/api/notifications/:id/read`

### Mark All Read
- **POST** `/api/notifications/read-all`

---

## Messaging

### List Conversations
- **GET** `/api/conversations`
- Response: `[{ conversationId, otherParticipantId, otherParticipant: {fullName, email}, lastMessage, lastAt, unread }]`

### Start Conversation
- **POST** `/api/conversations`
- Body: `{ participantId: string, message?: string }`
- Returns `{ conversationId, participant }`

### Get Messages
- **GET** `/api/conversations/:id/messages`
- Query: `?limit=...&offset=...`

### Send Message
- **POST** `/api/conversations/:id/messages`
- Body: `{ content: string }`

---

## Admin

All admin endpoints require `admin` or `owner` role.

### Users
- `POST /api/admin/users/:id/verify` — verify email
- `POST /api/admin/users/:id/toggle-suspend` — toggle isActive

### Listings
- `POST /api/admin/listings/office-spaces/:id/toggle` — toggle isActive
- `POST /api/admin/listings/products/:id/toggle` — toggle isActive

### Transactions
- `POST /api/admin/transactions/refund?type=booking|order&id=<entityId>` — full refund via Stripe

### Reviews
- `POST /api/admin/reviews/:id/delete` — delete review

---

## Dashboard Stats

- **GET** `/api/dashboard/stats`
- Returns role-specific aggregates: for owner → spaces, bookings, revenue; merchant → products, orders, sales; customer → bookings, orders.

---

*This document is a work in progress. Some endpoints may change during beta.*
