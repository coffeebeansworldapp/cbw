# Firebase Authentication + MongoDB Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App (Flutter)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Login Screen    │  │  Auth Provider   │  │  API Service  │ │
│  │  - Email/Pass    │→ │  - State Mgmt    │→ │  - Dio Client │ │
│  │  - Google Auth   │  │  - Error Handle  │  │  - Auto Token │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│           ↓                      ↓                      ↓        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Firebase Auth Service (firebase_auth_service)    │  │
│  │  - signInWithGoogle()                                    │  │
│  │  - signInWithEmailAndPassword()                          │  │
│  │  - createUserWithEmailAndPassword()                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                          │ 1. Sign In
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Firebase Authentication                     │
│  - Google OAuth       - Email/Password      - Apple Sign-In     │
│  - Token Management   - Email Verification  - Phone Auth        │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                          │ 2. Returns ID Token (JWT)
                          │    { uid, email, name, ... }
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│              Mobile App makes API requests                      │
│  Authorization: Bearer <firebase-id-token>                      │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                          │ 3. HTTP Request with Token
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js + Express)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Firebase Auth Middleware (firebaseAuth.js)      │  │
│  │  1. Extract token from Authorization header             │  │
│  │  2. Verify token with Firebase Admin SDK                │  │
│  │  3. Get Firebase UID & email                             │  │
│  │  4. Find/Create user in MongoDB                          │  │
│  │  5. Attach user to request (req.customer)                │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│                          │ 4. Token Verified                    │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (/api/public/*)                  │  │
│  │  - /firebase-auth/sync      - /firebase-auth/profile    │  │
│  │  - /firebase-auth/addresses - /orders                    │  │
│  │  - /products               - /categories                 │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                          │
                          │ 5. Query/Update User Data
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                           │
├─────────────────────────────────────────────────────────────────┤
│  Customers Collection:                                          │
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    firebaseUid: "abc123...",     ← Links to Firebase           │
│    email: "user@example.com",                                   │
│    fullName: "John Doe",                                        │
│    phone: "+971501234567",                                      │
│    authProvider: "firebase",     ← Auth method                 │
│    emailVerified: true,                                         │
│    addresses: [...],             ← Custom business data        │
│    active: true,                                                │
│    createdAt: Date,                                             │
│    updatedAt: Date                                              │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Sequence

### First-Time Sign-In Flow

```
User                 Mobile App          Firebase Auth       Backend API        MongoDB
  │                      │                      │                  │               │
  │  1. Click "Sign In"  │                      │                  │               │
  │─────────────────────>│                      │                  │               │
  │                      │                      │                  │               │
  │                      │  2. initiate OAuth   │                  │               │
  │                      │─────────────────────>│                  │               │
  │                      │                      │                  │               │
  │  3. Google Login     │                      │                  │               │
  │<─────────────────────┼──────────────────────│                  │               │
  │                      │                      │                  │               │
  │  4. Approve Access   │                      │                  │               │
  │─────────────────────>│                      │                  │               │
  │                      │                      │                  │               │
  │                      │  5. Return ID Token  │                  │               │
  │                      │<─────────────────────│                  │               │
  │                      │   + User Info        │                  │               │
  │                      │                      │                  │               │
  │                      │  6. POST /firebase-auth/sync            │               │
  │                      │  Authorization: Bearer <token>          │               │
  │                      │─────────────────────────────────────────>│               │
  │                      │                      │                  │               │
  │                      │                      │  7. Verify Token │               │
  │                      │                      │<─────────────────│               │
  │                      │                      │  8. Token Valid  │               │
  │                      │                      │─────────────────>│               │
  │                      │                      │                  │               │
  │                      │                      │                  │ 9. Find User  │
  │                      │                      │                  │ by firebaseUid│
  │                      │                      │                  │──────────────>│
  │                      │                      │                  │ 10. Not Found │
  │                      │                      │                  │<──────────────│
  │                      │                      │                  │               │
  │                      │                      │                  │ 11. Create    │
  │                      │                      │                  │ New User      │
  │                      │                      │                  │──────────────>│
  │                      │                      │                  │ 12. User Doc  │
  │                      │                      │                  │<──────────────│
  │                      │                      │                  │               │
  │                      │  13. Return User Profile                │               │
  │                      │<─────────────────────────────────────────│               │
  │  14. Navigate Home   │                      │                  │               │
  │<─────────────────────│                      │                  │               │
```

### Subsequent API Request Flow

```
Mobile App          Backend API        Firebase Admin       MongoDB
    │                   │                     │                │
    │  1. API Request   │                     │                │
    │  + ID Token       │                     │                │
    │──────────────────>│                     │                │
    │                   │                     │                │
    │                   │  2. Verify Token    │                │
    │                   │────────────────────>│                │
    │                   │  3. Valid + UID     │                │
    │                   │<────────────────────│                │
    │                   │                     │                │
    │                   │  4. Find User       │                │
    │                   │────────────────────────────────────>│
    │                   │  5. User Document   │                │
    │                   │<────────────────────────────────────│
    │                   │                     │                │
    │                   │  6. Process Request │                │
    │                   │  (req.customer set) │                │
    │                   │                     │                │
    │  7. Response      │                     │                │
    │<──────────────────│                     │                │
```

## Key Components

### 1. Firebase Authentication
- **Purpose:** Handles user authentication securely
- **Provides:** User UID, ID tokens, OAuth integration
- **Benefits:** Industry-standard security, easy OAuth setup

### 2. Firebase Admin SDK (Backend)
- **Purpose:** Verify ID tokens server-side
- **File:** `backend/config/firebase.js`
- **Function:** Validates tokens, prevents token forgery

### 3. Firebase Auth Middleware
- **Purpose:** Protect API routes
- **File:** `backend/middleware/firebaseAuth.js`
- **Function:** Extract token → Verify → Load user → Attach to request

### 4. MongoDB Customer Collection
- **Purpose:** Store user profiles and business data
- **Link:** `firebaseUid` field connects to Firebase
- **Data:** Addresses, orders, preferences, custom fields

### 5. Mobile App Services
- **FirebaseAuthService:** Handle Firebase sign-in operations
- **BackendApiService:** Make authenticated API calls with auto-token-refresh

## Security Features

```
┌─────────────────────────────────────────────────────┐
│                 Security Layers                     │
├─────────────────────────────────────────────────────┤
│ 1. HTTPS Encryption                                 │
│    ↓ All data encrypted in transit                  │
│                                                     │
│ 2. Firebase ID Token (JWT)                          │
│    ↓ Signed by Firebase, cannot be forged           │
│                                                     │
│ 3. Token Verification (Backend)                     │
│    ↓ Firebase Admin SDK validates signature         │
│                                                     │
│ 4. Token Expiration                                 │
│    ↓ Tokens expire after 1 hour                     │
│                                                     │
│ 5. Rate Limiting                                    │
│    ↓ Prevents brute force attacks                   │
│                                                     │
│ 6. MongoDB Sanitization                             │
│    ↓ Prevents NoSQL injection                       │
│                                                     │
│ 7. User Authentication                              │
│    ↓ Every request verified                         │
└─────────────────────────────────────────────────────┘
```

## Data Synchronization

```
Firebase Auth                    MongoDB
┌──────────────┐                ┌──────────────┐
│ UID: abc123  │───────────────>│ firebaseUid  │
│ Email        │───────────────>│ email        │
│ Name         │───────────────>│ fullName     │
│ Email Verify │───────────────>│ emailVerified│
└──────────────┘                │              │
                               │ phone        │ ← App-specific
                               │ addresses    │ ← App-specific
                               │ orders       │ ← App-specific
                               │ preferences  │ ← App-specific
                               └──────────────┘
```

## Benefits of This Architecture

✅ **Secure:** Firebase handles authentication complexity  
✅ **Scalable:** Each service scales independently  
✅ **Flexible:** Easy to add new OAuth providers  
✅ **Maintainable:** Clear separation of concerns  
✅ **Cost-effective:** Free tier for Firebase Auth  
✅ **User-friendly:** One-tap OAuth sign-in  
✅ **Reliable:** Firebase 99.95% uptime SLA  

## Files Reference

### Backend
- `config/firebase.js` - Firebase Admin initialization
- `middleware/firebaseAuth.js` - Token verification middleware
- `models/Customer.js` - User data model with Firebase UID
- `routes/public/firebaseAuth.js` - Firebase auth endpoints

### Mobile
- `lib/core/services/firebase_auth_service.dart` - Firebase operations
- `lib/core/services/backend_api_service.dart` - API client
- `lib/core/providers/auth_provider_example.dart` - State management
- `lib/firebase_options.dart` - Firebase configuration

---

**Architecture Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Production Ready
