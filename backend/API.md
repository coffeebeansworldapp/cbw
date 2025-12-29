# Coffee Beans World - API Documentation

## Overview

The backend follows a **modular, role-based REST API design** with clear separation of concerns.

---

## Architecture

```
/api
├── /public     → Website + Mobile App (customers)
├── /admin      → Admin Panel (staff, managers)
├── /staff      → Reserved for future
└── /driver     → Reserved for future
```

---

## Public API (`/api/public`)

Routes for the website and Flutter mobile app (customer-facing).

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/home` | GET | Home page aggregator (featured products, carousel, etc.) | No |
| `/carousel` | GET | Get carousel slides | No |
| `/categories` | GET | List all active categories | No |
| `/products` | GET | List products with filters & pagination | No |
| `/products/:slugOrId` | GET | Get single product details | No |
| `/premium-beans` | GET | List premium bean products | No |
| `/auth/register` | POST | Customer registration | No |
| `/auth/login` | POST | Customer login | No |
| `/auth/refresh` | POST | Refresh access token | No |
| `/me` | GET | Get current customer profile | Yes |
| `/orders` | GET | List customer orders | Yes |
| `/orders` | POST | Create new order | Yes |
| `/orders/:id` | GET | Get order details | Yes |
| `/payments/intent` | POST | Payment intent (coming soon) | Yes |

### Query Parameters for `/products`

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category (africa, america, asia, premium, all) |
| `roast` | string | Filter by roast level (Light, Medium, Dark) |
| `bestseller` | boolean | Filter bestseller products only |
| `search` | string | Search by name, region, or description |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

---

## Admin API (`/api/admin`)

Routes for the admin panel (staff & managers).

### Authentication

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/login` | POST | Admin login | No |
| `/auth/refresh` | POST | Refresh admin token | No |
| `/me` | GET | Get current admin profile | Yes |

### Dashboard

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/dashboard/stats` | GET | Get dashboard statistics | Admin |
| `/dashboard/recent-orders` | GET | Get recent orders | Admin |

### Products

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/products` | GET | List all products (includes inactive) | Admin |
| `/products` | POST | Create new product | Admin |
| `/products/:id` | PUT | Update product | Admin |
| `/products/:id` | DELETE | Delete product | Admin |
| `/products/:id/variants` | PATCH | Update product variants | Admin |
| `/products/:id/active` | PATCH | Toggle product active status | Admin |
| `/products/:id/images` | POST | Upload product images | Admin |
| `/products/:id/images/:cloudinaryPublicId` | DELETE | Delete product image | Admin |

### Orders

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/orders` | GET | List all orders | Admin |
| `/orders/:id` | GET | Get order details | Admin |
| `/orders/:id/status` | PATCH | Update order status | Admin |

### Customers

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/customers` | GET | List all customers | Admin |
| `/customers/:id` | GET | Get customer details | Admin |
| `/customers/:id/active` | PATCH | Toggle customer active status | Admin |

### Users (Admin Users)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/users` | GET | List admin users | Admin |
| `/users` | POST | Create admin user | Super Admin |
| `/users/:id` | PUT | Update admin user | Super Admin |
| `/users/:id` | DELETE | Delete admin user | Super Admin |

### Carousel

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/carousel` | GET | List carousel slides | Admin |
| `/carousel` | POST | Create carousel slide | Admin |
| `/carousel/:id` | PUT | Update carousel slide | Admin |
| `/carousel/:id` | DELETE | Delete carousel slide | Admin |
| `/carousel/reorder` | PATCH | Reorder carousel slides | Admin |

### Audit Logs

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/audit-logs` | GET | List audit logs | Admin |

---

## Authentication

### JWT Token Structure

**Customer Token:**
```json
{
  "sub": "customer_id",
  "type": "customer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Admin Token:**
```json
{
  "sub": "admin_id",
  "type": "admin",
  "role": "super_admin|manager|staff",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Header

```
Authorization: Bearer <access_token>
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Success with Pagination

```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Error Response

```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_TOKEN` | 401 | No authorization token provided |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token is invalid or malformed |
| `INVALID_TOKEN_TYPE` | 401 | Wrong token type for endpoint |
| `CUSTOMER_NOT_FOUND` | 401 | Customer account not found or inactive |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `SERVER_ERROR` | 500 | Internal server error |
| `NOT_IMPLEMENTED` | 501 | Feature not yet implemented |

---

## Security

### Rate Limiting

| Endpoint Pattern | Limit |
|------------------|-------|
| `/api/*` (general) | 100 requests / 15 minutes |
| `/api/*/auth/*` | 20 requests / 15 minutes |

### Security Middleware

- **Helmet** - Secure HTTP headers
- **express-mongo-sanitize** - Prevents NoSQL injection attacks
- **CORS** - Cross-Origin Resource Sharing enabled
- **Payload Limit** - 10MB max JSON body size

---

## Validation

Request validation uses **Zod** schemas. Invalid requests return:

```json
{
  "success": false,
  "message": "Validation error details",
  "code": "VALIDATION_ERROR"
}
```

---

## Legacy Routes (Backward Compatibility)

These routes are maintained for backward compatibility:

| Endpoint | Maps To |
|----------|---------|
| `/api/media` | Media management |
| `/api/products` | Product listing |
| `/api/premium-beans` | Premium beans |
| `/api/categories` | Categories |

---

## Health Check

```
GET /api/health
```

Response:
```json
{
  "ok": true
}
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CLOUDINARY_*` | Cloudinary configuration | - |

---

## Future APIs (Reserved)

- `/api/staff` - Staff-specific endpoints
- `/api/driver` - Delivery driver endpoints
