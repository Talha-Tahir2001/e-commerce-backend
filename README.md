# E-commerce Backend API

A simple e-commerce backend built with Node.js, Express, TypeScript, and MongoDB. This API supports user authentication, product management, order creation, review management, and admin-only routes.

## Features

- User registration and login with JWT authentication
- Password reset flow using reset tokens
- Cookie-based authentication for protected routes
- Product listing, details, reviews, and admin product management
- Order creation, order tracking, and admin order management
- Request validation using `zod` for environment variables
- Error handling and async middleware support

## Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB + Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcrypt` for password hashing
- `zod` for environment validation
- `helmet`, `cors`, `morgan`, `cookie-parser`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm
- MongoDB connection URI

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with at least the following variables:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
NODE_ENV=development
```

### Run the server

For development:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

The server will run on `http://localhost:8000` by default unless `PORT` is configured.

## API Routes

All API routes are mounted under `/api/v1`.

### Authentication

- `POST /api/v1/register`
  - Registers a new user
  - Body: `{ name, email, password }`

- `POST /api/v1/login`
  - Authenticates a user and returns a JWT cookie
  - Body: `{ email, password }`

- `GET /api/v1/logout`
  - Clears the auth cookie and logs out

- `POST /api/v1/password/forgot`
  - Sends a password reset token to the user email
  - Body: `{ email }`

- `PUT /api/v1/password/reset/:token`
  - Resets password using the reset token
  - Body: `{ password, confirmPassword }`

### User

- `GET /api/v1/me`
  - Returns current logged-in user details
  - Requires auth cookie

- `PUT /api/v1/password/update`
  - Update current user password
  - Body: `{ oldPassword, newPassword, confirmPassword }`

- `PUT /api/v1/me/update`
  - Update current user profile
  - Body: `{ name, email, avatar? }`

### Admin User Management

- `GET /api/v1/admin/users`
  - Returns all users
  - Requires admin auth

- `GET /api/v1/admin/user/:id`
  - Returns a single user by ID
  - Requires admin auth

- `PUT /api/v1/admin/user/:id`
  - Updates the user's role
  - Requires admin auth

- `DELETE /api/v1/admin/user/:id`
  - Deletes a user
  - Requires admin auth

### Products

- `GET /api/v1/products`
  - Get list of products
  - Supports search, filter, and pagination via query params

- `GET /api/v1/product/:id`
  - Get details for a single product

- `PUT /api/v1/review`
  - Create or update a product review
  - Requires auth cookie
  - Body: `{ rating, comment, productId }`

- `GET /api/v1/reviews?id=<productId>`
  - Get all reviews for a product

- `DELETE /api/v1/reviews?productId=<productId>&id=<reviewId>`
  - Delete a review
  - Requires auth cookie

### Admin Product Management

- `GET /api/v1/admin/products`
  - Get all products for admin dashboard
  - Requires admin auth

- `POST /api/v1/admin/product/new`
  - Create a new product
  - Requires admin auth

- `PUT /api/v1/admin/product/:id`
  - Update an existing product
  - Requires admin auth

- `DELETE /api/v1/admin/product/:id`
  - Delete a product
  - Requires admin auth

### Orders

- `POST /api/v1/order/new`
  - Create a new order
  - Requires auth cookie
  - Body: `{ shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice }`

- `GET /api/v1/order/:id`
  - Get details for a specific order
  - Requires auth cookie

- `GET /api/v1/orders/me`
  - Get orders for the current user
  - Requires auth cookie

- `GET /api/v1/admin/orders`
  - Get all orders
  - Requires admin auth

- `PUT /api/v1/admin/order/:id`
  - Update order status
  - Requires admin auth

- `DELETE /api/v1/admin/order/:id`
  - Delete an order
  - Requires admin auth

## Notes

- CORS is currently configured to allow `http://localhost:5173`.
- The app stores JWT tokens in a cookie named `token`.
- Environment variables are validated with `zod` before the server starts.

## Project Structure

- `src/index.ts` — app bootstrap and server startup
- `src/config/env.ts` — environment validation and export
- `src/config/db.ts` — MongoDB connection helper
- `src/routes/` — Express route definitions
- `src/controllers/` — request handlers and business logic
- `src/models/` — Mongoose models
- `src/middleware/` — auth, error handling, async wrapper
- `src/utils/` — JWT token helper, API filtering utilities, error helper

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Talha-Tahir2001/e-commerce-backend?tab=MIT-1-ov-file) file for details.
