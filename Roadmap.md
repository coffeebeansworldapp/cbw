# COPILOT MASTER SPEC — Coffee Beans World

**Admin Panel + Flutter Mobile + E-Commerce Orders**

| Key | Value |
|-----|-------|
| Version | 1.0 |
| Stack | React 18 + Vite + React Router + CSS3 \| Node.js + Express \| MongoDB Atlas + Mongoose \| Cloudinary |
| Ports (dev) | Frontend 5173 \| Backend 4000 |

---

## 0) PROJECT GOAL (WHAT TO BUILD)

Build a full e-commerce system with:

| Component | Description |
|-----------|-------------|
| **A) CUSTOMER WEBSITE** | Existing React/Vite — keep working, minimal logic refactor only |
| **B) ADMIN PANEL** | NEW React/Vite — manage products, variants, stock, images, home sections, orders, customers |
| **C) CUSTOMER MOBILE APP** | NEW Flutter iOS+Android — browse, cart, checkout (COD), order history, profile |
| **D) ORDER SYSTEM** | NEW Mongoose + APIs — secure checkout, stock enforcement, admin status updates |

**Future Expansion (Reserve only, DO NOT implement now):**
- STAFF APP (kitchen/branch)
- DELIVERY APP (drivers)

---

## 1) NON-NEGOTIABLE RULES ⚠️

| Rule | Description |
|------|-------------|
| **R1** | DO NOT break existing website UI routes. Only extend. |
| **R2** | Backend is the ONLY source of truth for prices, totals, stock, and order totals. |
| **R3** | Client must NEVER compute final pricing for checkout. Frontend/Mobile may DISPLAY prices, but Backend must CALCULATE totals from DB at checkout. |
| **R4** | Split APIs by role: `/api/public/*` (website + flutter), `/api/admin/*` (admin only), reserve `/api/staff/*` and `/api/driver/*` for future |
| **R5** | Protect admin APIs with JWT + RBAC. Roles: `OWNER`, `MANAGER`, `STAFF` |
| **R6** | Store ORDER SNAPSHOTS: Each order item stores product + variant snapshot (name, sku, label, price) at purchase time. |
| **R7** | Input validation required on ALL write routes (Zod or Joi). |
| **R8** | Consistent error format: `{ success:false, message:string, code?:string, details?:any }` |
| **R9** | Use environment variables for all secrets (JWT, Mongo, Cloudinary). |
| **R10** | Cloudinary: Store `cloudinaryPublicId` + `secureUrl`. Remove asset when admin deletes image (where safe). |
| **R11** | Soft delete products (`active=false`) preferred over hard delete. |
| **R12** | Keep placeholders for CARD payments (UI + API), but MVP uses COD. |

---

## 2) MONOREPO STRUCTURE

```
/backend
  /src
    /config
    /models
    /routes
      /public
      /admin
      /staff   (reserved)
      /driver  (reserved)
    /controllers
    /services
    /middleware
    /utils
    app.js
/admin         (new React/Vite admin panel)
/frontend      (existing website)
/mobile        (new Flutter app)
```

---

## 3) DATABASE MODELS (MONGOOSE)

### 3.1 Product ✅ (UPGRADED)

**Existing fields (keep):**
- name, category, region, basePrice, roast, image, features, description, tastingNotes, processing, bestseller, inStock

**Added ecommerce fields:**
```javascript
slug: String unique           // SEO + Flutter friendly
active: Boolean default true
images: [{ secureUrl, cloudinaryPublicId }]  // optional gallery
variants: [VariantSchema]     // ⭐ CORE ECOMMERCE
```

**Variant (embedded schema):**
```javascript
{
  label: String,              // "250g", "500g", "1kg"
  weightGrams: Number,        // 250, 500, 1000
  sku: String unique,
  price: Number,              // FINAL price used in checkout
  compareAtPrice: Number,     // optional strike-through
  stockQty: Number default 0,
  active: Boolean default true
}
```

**Rules:**
- `inStock` auto-updated from variants (any active variant with stockQty > 0)
- `basePrice` remains for legacy UI; DO NOT use for checkout once variants exist

**Indexes:** `slug` unique, `variants.sku` unique

---

### 3.2 PremiumBean (UPGRADE)

Keep existing fields. Add:
```javascript
productId: ObjectId ref Product  // optional but recommended
ctaLabel: String optional
ctaUrl: String optional
```
Use `sortOrder` for display ordering; `active` for show/hide.

---

### 3.3 Category (KEEP)

```javascript
{
  slug: String unique,
  name: String,
  description: String,
  sortOrder: Number,
  active: Boolean
}
```

---

### 3.4 Media (FIX)

Rename `clouderiaId` → `cloudinaryPublicId` (typo fix)
```javascript
{
  filename: String,
  secureUrl: String,
  cloudinaryPublicId: String,
  type: String,
  createdAt: Date
}
```

---

### 3.5 Customer (NEW)

```javascript
{
  fullName: String,
  email: String required unique lowercase,
  passwordHash: String required,
  phone: String optional,
  addresses: [{
    label: String,
    name: String,
    phone: String,
    street: String,
    city: String,
    emirate: String,
    building: String,
    apartment: String,
    instructions: String,
    isDefault: Boolean
  }],
  timestamps: true
}
```

---

### 3.6 AdminUser (NEW)

```javascript
{
  name: String,
  email: String unique,
  passwordHash: String,
  role: enum ['OWNER', 'MANAGER', 'STAFF'],
  active: Boolean default true,
  lastLoginAt: Date,
  timestamps: true
}
```

---

### 3.7 Order (NEW) — ⭐ CORE

```javascript
{
  orderNo: String unique,        // CBW-YYYY-######
  customerId: ObjectId ref Customer,
  
  items: [{
    productId: ObjectId,
    variantId: ObjectId,
    nameSnapshot: String,
    variantSnapshot: {
      label: String,
      weightGrams: Number,
      sku: String
    },
    unitPrice: Number,
    qty: Number,
    lineTotal: Number
  }],
  
  pricing: {
    subtotal: Number,
    discount: Number,
    deliveryFee: Number,
    vat: Number,
    grandTotal: Number
  },
  
  payment: {
    method: enum ['COD', 'CARD'],
    status: enum ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    provider: String optional,
    transactionId: String optional
  },
  
  fulfillment: {
    type: enum ['DELIVERY', 'PICKUP'],
    addressSnapshot: Object,
    notes: String
  },
  
  status: enum [
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
  ],
  
  adminNotes: String,
  
  history: [{
    status: String,
    at: Date,
    byRole: String,
    byId: ObjectId,
    note: String
  }],
  
  timestamps: true
}
```

**Indexes:** `orderNo` unique, `customerId`, `status`, `createdAt`

---

### 3.8 AuditLog (NEW)

```javascript
{
  adminUserId: ObjectId,
  action: String,
  entityType: String,
  entityId: ObjectId,
  before: Object,
  after: Object,
  createdAt: Date
}
```

---

## 4) BACKEND API SPEC

### 4.1 Public API (`/api/public`) — Website + Flutter

**Catalog:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/products` | List products (query: category, roast, bestseller, search, page, limit) |
| GET | `/products/:slugOrId` | Get product detail |
| GET | `/premium-beans` | List premium beans |

**Customer Auth:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register (optional) |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| GET | `/me` | Get current user |

**Orders:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders` | Customer's orders |
| GET | `/orders/:id` | Order detail |

**Order Create Payload:**
```javascript
{
  items: [{ productId, variantId, qty }],
  fulfillment: { type: "DELIVERY|PICKUP", addressId?, addressSnapshot?, notes? },
  payment: { method: "COD|CARD" }  // MVP COD only
}
```

**Backend Order Create Responsibilities:**
1. Fetch products/variants from DB
2. Validate variant active + stockQty
3. Calculate unit prices from DB `variants.price`
4. Compute subtotal/fees/vat/grandTotal
5. Create order with snapshots
6. Decrement stockQty
7. Return created order

---

### 4.2 Admin API (`/api/admin`) — Admin Panel only

**Admin Auth:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Admin login |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |

**Dashboard:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/kpis` | Orders today, revenue, pending, low stock |

**Products:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| PATCH | `/products/:id/variants` | Update variants |
| PATCH | `/products/:id/active` | Toggle active |
| POST | `/products/:id/images` | Upload image |
| DELETE | `/products/:id/images/:cloudinaryPublicId` | Delete image |
| DELETE | `/products/:id` | Soft delete |

**Categories:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List |
| POST | `/categories` | Create |
| PUT | `/categories/:id` | Update |
| PATCH | `/categories/reorder` | Reorder |

**Premium Beans:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/premium-beans` | List |
| POST | `/premium-beans` | Create |
| PUT | `/premium-beans/:id` | Update |
| PATCH | `/premium-beans/reorder` | Reorder |

**Orders:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List (query: status, search, from, to, page, limit) |
| GET | `/orders/:id` | Detail |
| PATCH | `/orders/:id/status` | Update status (append history) |
| PATCH | `/orders/:id/admin-notes` | Update admin notes |

**Customers:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List |
| GET | `/customers/:id` | Detail |

**Admin Users (OWNER only):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List |
| POST | `/users` | Create |
| PUT | `/users/:id` | Update |
| PATCH | `/users/:id/active` | Toggle active |

**Audit Logs:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List audit logs |

---

### 4.3 Reserved Future Routes

```
/api/staff/*   (placeholder)
/api/driver/*  (placeholder)
```

---

## 5) AUTH + SECURITY

- JWT Access Token (short-lived) + Refresh Token (long-lived)
- Store refresh token hashed in DB
- Required middleware:
  - `requireAuth` (customer)
  - `requireAdminAuth`
  - `requireRole(["OWNER","MANAGER",...])`
- Rate limit login endpoints
- Security packages: Helmet, mongo-sanitize, CORS, express-rate-limit
- Validate all inputs with Zod/Joi

---

## 6) ADMIN PANEL (React/Vite) — MVP Pages

**Build Order:**
1. Login
2. Dashboard (orders today, revenue, pending, low stock)
3. Products (list, create/edit, variants editor, stock control, image upload)
4. Categories (CRUD + reorder)
5. Premium Beans (CRUD + reorder + product link)
6. Orders (list + detail + status update + admin notes)
7. Customers (list + detail)
8. Admin Users (OWNER only)
9. Audit Logs

**UX Rules:**
- Sidebar navigation + topbar
- Responsive layout
- Tables: search + filter + pagination
- Forms: validation + loading states + success/error toasts
- Image upload: drag & drop + preview
- PremiumBeans: drag reorder + live preview

---

## 7) FLUTTER MOBILE APP — MVP Screens

**Packages:**
- dio (API)
- flutter_secure_storage (tokens)
- go_router (routing)
- riverpod (state)
- freezed + json_serializable (models)
- cached_network_image

**Build Order:**
1. Splash (token check)
2. Login (email/password)
3. Home (premium beans + categories)
4. Product List (filters + pagination)
5. Product Detail (variant selector, add to cart)
6. Cart
7. Checkout (pickup/delivery, address, COD)
8. Orders List
9. Order Detail (status timeline)
10. Profile + Addresses

**Rules:**
- Cart stored locally (no server cart in MVP)
- Price shown from `variant.price`, NOT basePrice multipliers
- Checkout posts variantId + qty only; server calculates totals
- COD enabled; CARD shows "Coming soon"

---

## 8) CUSTOMER WEBSITE CHANGES (Minimal)

**Required Refactor:**
- Replace `sizePricing` multipliers with variant selection from API
- Add to cart stores: `{productId, variantId, qty, unitPriceFromAPI}`
- Checkout calls `POST /api/public/orders` (same as Flutter)

**DO NOT redesign UI** — only change data + logic.

---

## 9) MVP SCOPE

### ✅ MVP MUST INCLUDE:
- [ ] Products have variants (250g/500g/1kg) with price + stockQty
- [ ] Admin can CRUD products, manage variants, upload images, set stock
- [ ] Flutter customer can login, browse, add to cart, checkout COD, view orders
- [ ] Order model exists with snapshots and status history
- [ ] Admin can view orders and update status (with audit log)
- [ ] PremiumBeans can be reordered/managed in admin
- [ ] All admin endpoints protected by RBAC

### ❌ MVP DOES NOT INCLUDE:
- Driver assignment, GPS, live tracking
- Staff kitchen screens
- Card payments real integration
- Loyalty points

*(Architecture must NOT block future addition)*

---

## 10) IMPLEMENTATION ROADMAP 🗺️

### PHASE 0 — Setup
- [x] Create monorepo folders (backend/admin/frontend/mobile)
- [x] Add env templates
- [ ] Add shared constants (roles, order statuses)

### PHASE 1 — Models ✅
- [x] Upgrade Product schema (slug, variants, images, active)
- [x] Create Customer model
- [x] Create AdminUser model
- [x] Create Order model
- [x] Create AuditLog model
- [x] Add DB indexes
- [x] Fix Media model typo
- [x] Seed admin owner user

### PHASE 2 — Public APIs ✅
- [x] Catalog endpoints (categories, products, premium-beans)
- [x] Customer auth endpoints (register, login, refresh, logout, me)
- [x] Order create + list + detail + cancel
- [x] Stock deduction on order create (transaction-safe)
- [x] Address management endpoints

### PHASE 3 — Admin APIs ✅
- [x] Admin auth + RBAC (login, refresh, logout, me)
- [x] Product CRUD + variants + active toggle
- [x] Categories CRUD (using legacy routes)
- [x] PremiumBeans CRUD (using legacy routes)
- [x] Orders list/detail/status/admin notes
- [x] Dashboard KPIs
- [x] Customers list/detail
- [x] Admin users (OWNER only)
- [x] Audit logs

### PHASE 4 — Admin UI ✅
- [x] React/Vite setup with Tailwind CSS
- [x] Auth context with JWT refresh
- [x] Protected routes with RBAC
- [x] Responsive sidebar layout
- [x] Login page
- [x] Dashboard with KPIs + recent orders
- [x] Products list with search/filter
- [x] Product form with variants editor
- [x] Orders list with status updates
- [x] Order detail with history
- [x] Customers list
- [x] Admin users management (OWNER)
- [x] Audit logs viewer

### PHASE 5 — Flutter App ✅
- [x] Auth screens (Splash, Login, Register)
- [x] Home + product list/detail (categories, premium beans, variants)
- [x] Cart + checkout (COD, delivery/pickup, addresses)
- [x] Orders + profile (order history, address management)

### PHASE 6 — QA + Hardening
- [ ] Validate stock logic
- [ ] Validate order totals
- [ ] Error handling
- [ ] Audit coverage
- [ ] Deploy

---

## 11) DEFINITION OF DONE (Acceptance Tests)

- [ ] Creating a product with 3 variants works
- [ ] Setting variant stock to 0 makes it unavailable
- [ ] Customer checkout fails if stock insufficient
- [ ] Order totals are calculated on server only
- [ ] Admin can move order status through workflow; history is recorded
- [ ] PremiumBean reorder reflects immediately on website/mobile
- [ ] No old website route breaks
- [ ] Admin endpoints are not accessible without admin token

---

## 12) DEV QUALITY NOTES

- Use services layer: `controller -> service -> model`
- Use centralized error handler middleware
- Use pagination for list endpoints
- Consistent DTO/response format:
  ```javascript
  { success: true, data, meta? }
  ```
- Seeds required:
  - Admin owner user
  - Example products with variants
  - Example premium beans

---

## Quick Reference

### Order Status Flow
```
PENDING_CONFIRMATION → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
                    ↘ CANCELLED
                    ↘ REFUNDED
```

### Variant Pricing Formula (Seed)
```
250g = 30% of 1kg price
500g = 55% of 1kg price
1kg  = full basePrice
```

### Roles
| Role | Access |
|------|--------|
| OWNER | Full access, manage admin users |
| MANAGER | Products, orders, customers |
| STAFF | View orders, update status |

---

**END OF COPILOT MASTER SPEC**
