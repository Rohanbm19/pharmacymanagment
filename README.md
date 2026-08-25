# Pharmacy Management System

An inventory and order management application for a pharmacy. The project contains a React/Vite dashboard, an Express API, PostgreSQL persistence, Redis-based coordination, Socket.IO live updates, and an AI recommendation endpoint.

## Implemented Plan

### 1. Pharmacy dashboard

- Displays total sales, total orders, total medicines, and low-stock counts.
- Loads medicine and order data from the backend.
- Shows recent orders, low-stock medicines, and top-selling medicine charts.
- Refreshes dashboard data when medicines, orders, or low-stock events are emitted through Socket.IO.
- Supports light/dark theme switching and an administrator profile modal.

### 2. Medicine inventory

- Lists medicines with name, category, company, stock, price, expiry date, and availability status.
- Classifies stock as `In Stock`, `Low Stock`, or `Out of Stock`.
- Adds new medicines through a modal form.
- Edits medicine name, category, stock, and price.
- Deletes medicines after confirmation.
- Refreshes when inventory or order events are received.

### 3. Order management

- Lists orders with customer, date, item count, total amount, status, payment state, and actions.
- Creates orders for a customer with one or more medicines and quantities.
- Calculates order totals from current medicine prices.
- Validates that a customer and at least one medicine are provided.
- Displays order details by order ID.
- Uses a PostgreSQL transaction to create the order, add order items, and decrement stock together.
- Uses a Redis lock to prevent concurrent order processing.

### 4. AI pharmacy assistant

- Provides a chat-style interface for common symptom questions.
- Sends the question and current medicine list to the recommendation API.
- Displays loading and fallback guidance states.
- Exposes separate insight and recommendation API routes.

### 5. Backend foundation

- Express application with CORS and JSON request parsing.
- PostgreSQL connection pool through the `pg` package.
- Redis integration for order locking and cache invalidation.
- Socket.IO server for real-time client updates.
- Startup schema checks for required order columns.
- Central error-handler module and validation middleware hook.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite |
| UI | Lucide React, Recharts, CSS |
| API client | Axios |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Cache/locking | Redis |
| Live updates | Socket.IO |
| AI integration | OpenAI package and AI routes |

## Project Structure

```text
backend/
	src/
		app.js                 Express app and API registration
		server.js              HTTP and Socket.IO server startup
		config/                PostgreSQL, Redis, and OpenAI configuration
		controllers/           Medicine, order, and AI request handlers
		middleware/             Validation and error handling hooks
		models/                 Database operations
		routes/                 REST endpoint definitions
		services/               AI, Redis, and socket service abstractions
		events/                 Stock event names
frontend/
	src/
		App.jsx                Navigation, routing, theme, and profile UI
		pages/                 Dashboard, Inventory, Orders, and AI screens
		services/api.js        Axios API functions
```

## API Reference

Base URL: `http://localhost:5000/api` when the backend uses its default port.

### Medicines

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/medicines` | List all medicines |
| `POST` | `/medicines` | Add a medicine |
| `PUT` | `/medicines/:id` | Update medicine fields |
| `PUT` | `/medicines/:id/stock` | Update stock only |
| `DELETE` | `/medicines/:id` | Delete a medicine |

Example medicine payload:

```json
{
	"name": "Paracetamol 650mg",
	"category": "Pain Relief",
	"stock": 50,
	"price": 25.5
}
```

### Orders

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/orders` | List orders |
| `POST` | `/orders` | Place an order and reduce stock |
| `GET` | `/orders/:id` | Get order line-item details |

Example order payload:

```json
{
	"user_id": null,
	"customer_name": "Rajesh Kumar",
	"medicine_list": [
		{ "medicine_id": 1, "quantity": 2 }
	]
}
```

### AI

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/ai/insight` | Generate an insight |
| `POST` | `/ai/recommendations` | Generate medicine/care recommendations |

The frontend sends `{ "question": "fever", "medicines": [] }` to the recommendations endpoint.

## Setup

### Prerequisites

- Node.js 18 or newer
- PostgreSQL
- Redis

### Backend

```powershell
cd backend
npm install
npm start
```

The server listens on `PORT` from `.env`, or port `5000` by default.

Create `backend/.env` with the database and Redis settings used by your local services:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pharmacy
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key
```

The exact Redis and OpenAI variable names should match the existing files in `backend/src/config/`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Set the frontend URLs to match the backend port. The current frontend defaults to port `5001`, while the backend defaults to port `5000`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For a production build:

```powershell
npm run build
```

## Database Model

The implemented order workflow expects these PostgreSQL tables:

- `medicines`: medicine name, category, stock, and price.
- `orders`: user reference, customer name, order date, status, and total price.
- `order_items`: order-to-medicine relationship and quantity.

On startup, the server ensures `orders.customer_name` and `orders.status` exist and makes `orders.user_id` optional for the current customer-order flow.

## Real-time Events

The frontend listens for:

- `medicines:updated`
- `orders:updated`
- `lowStock`

These events trigger fresh API reads in the dashboard, inventory, and orders screens.

## Current Limitations and Next Steps

- Authentication and role-based access control are not implemented.
- Search, filters, and pagination controls are currently visual controls; server-side filtering and pagination still need to be wired.
- Some dashboard chart and inventory display fields use mock or derived values, including company and expiry data.
- Payment status is currently returned as `Pending` by the order query.
- Validation middleware currently passes requests through and should be extended with field-level rules.
- The AI service abstraction contains placeholder behavior; production recommendations should include clinical safety controls, audit logging, and pharmacist review.
- Automated unit, API, and end-to-end tests should be added before production deployment.

## Useful Commands

```powershell
# Backend development mode
cd backend
npm run dev

# Frontend lint and production build
cd frontend
npm run lint
npm run build
```

