# Firebase Authentication + MongoDB Integration

This document explains how Firebase Authentication works with MongoDB in the Coffee Beans World application.

## Architecture Overview

```
Mobile App (Flutter)
    ↓ Firebase Sign-In
Firebase Auth (Google/Email)
    ↓ ID Token
Backend API (Node.js + Express)
    ↓ Verify Token
MongoDB (User Data)
```

## How It Works

### 1. User Authentication Flow

1. **User signs in** on mobile app using:
   - Email/Password via Firebase
   - Google Sign-In via Firebase
   - Apple Sign-In via Firebase (future)

2. **Firebase returns:**
   - User UID (unique identifier)
   - ID Token (JWT)
   - Email & profile info

3. **Mobile app sends requests** to backend with:
   - `Authorization: Bearer <firebase-id-token>` header

4. **Backend verifies token:**
   - Uses Firebase Admin SDK
   - Validates token authenticity
   - Extracts user info (UID, email)

5. **Backend manages user in MongoDB:**
   - Links Firebase UID to MongoDB user
   - Stores custom business data
   - Returns user profile

### 2. Data Structure

#### Firebase Auth Stores:
- Authentication credentials
- OAuth tokens
- User UID
- Email verification status

#### MongoDB Stores:
```javascript
{
  _id: ObjectId,
  firebaseUid: "abc123...",  // Links to Firebase
  email: "user@example.com",
  fullName: "John Doe",
  phone: "+971501234567",
  authProvider: "firebase",  // or "local"
  emailVerified: true,
  addresses: [...],
  // Custom business data
  active: true,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install firebase-admin
```

### 2. Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `coffeebeansworld-v1`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Configure Environment Variables

Add to `backend/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=coffeebeansworld-v1

# Option 1: Path to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json

# Option 2: Service account JSON as string (for deployment)
# FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

### 4. Backend is Ready!

The backend will automatically:
- ✅ Initialize Firebase Admin SDK
- ✅ Verify Firebase ID tokens
- ✅ Create/update users in MongoDB
- ✅ Sync user data between Firebase & MongoDB

## Mobile App Setup

### 1. Firebase Configuration

Already configured in:
- `mobile/lib/firebase_options.dart`
- `mobile/android/app/google-services.json`
- `mobile/ios/Runner/GoogleService-Info.plist`

### 2. Initialize Firebase Auth Service

In your app initialization:

```dart
// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Initialize Google Sign-In
  final authService = FirebaseAuthService();
  await authService.initializeGoogleSignIn();
  
  runApp(MyApp());
}
```

### 3. Sign In and Sync User

```dart
// Sign in with Firebase
final credential = await FirebaseAuthService().signInWithGoogle();

if (credential != null) {
  // Sync user with backend MongoDB
  final apiService = BackendApiService();
  await apiService.syncUser();
  
  // Now you can make authenticated API calls
  final profile = await apiService.getProfile();
  print('User profile: $profile');
}
```

## API Endpoints

### Firebase Auth Routes (`/api/public/firebase-auth`)

All routes require `Authorization: Bearer <firebase-id-token>` header.

#### Sync User
```
POST /api/public/firebase-auth/sync
Body: { phone?, addresses? }
Response: { success, data: { customer } }
```

#### Get Profile
```
GET /api/public/firebase-auth/profile
Response: { success, data: { customer } }
```

#### Update Profile
```
PATCH /api/public/firebase-auth/profile
Body: { fullName?, phone? }
Response: { success, data: { customer } }
```

#### Manage Addresses
```
POST   /api/public/firebase-auth/addresses
PATCH  /api/public/firebase-auth/addresses/:addressId
DELETE /api/public/firebase-auth/addresses/:addressId
```

#### Delete Account
```
DELETE /api/public/firebase-auth/account
```

## Usage Examples

### 1. Complete Sign-In Flow

```dart
// In your login screen
Future<void> signInWithGoogle() async {
  try {
    final authService = FirebaseAuthService();
    final credential = await authService.signInWithGoogle();
    
    if (credential != null) {
      // Sync with backend
      final apiService = BackendApiService();
      final response = await apiService.syncUser();
      
      print('User synced: ${response['data']['customer']}');
      
      // Navigate to home
      Navigator.pushReplacementNamed(context, '/home');
    }
  } catch (e) {
    print('Sign-in error: $e');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Sign-in failed: $e')),
    );
  }
}
```

### 2. Making Authenticated API Calls

```dart
// The BackendApiService automatically attaches Firebase ID token
final apiService = BackendApiService();

// Get user profile
final profile = await apiService.getProfile();

// Update profile
await apiService.updateProfile(
  fullName: 'John Doe',
  phone: '+971501234567',
);

// Add address
await apiService.addAddress(
  name: 'John Doe',
  phone: '+971501234567',
  street: 'Sheikh Zayed Road',
  city: 'Dubai',
  emirate: 'Dubai',
  label: 'Home',
  isDefault: true,
);

// Create order
await apiService.createOrder(
  items: [
    {'productId': '123', 'quantity': 2},
  ],
  addressId: 'address123',
  notes: 'Please ring the doorbell',
);
```

### 3. Protecting Backend Routes

To protect other routes with Firebase auth:

```javascript
const { requireFirebaseAuth } = require('./middleware/firebaseAuth');

// Protected route
router.get('/api/public/orders', requireFirebaseAuth, async (req, res) => {
  // req.customer contains the MongoDB customer document
  // req.firebaseUser contains the Firebase user info
  
  const orders = await Order.find({ customerId: req.customer._id });
  res.json({ success: true, data: { orders } });
});
```

## Security Best Practices

1. **Never share service account JSON** - Add to `.gitignore`
2. **Use environment variables** for sensitive data
3. **Token verification** happens on every request
4. **Tokens expire automatically** - Firebase handles refresh
5. **HTTPS only in production** - Protect tokens in transit
6. **Rate limiting enabled** - Prevents brute force attacks

## Troubleshooting

### Backend Errors

**"Firebase Admin initialization failed"**
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify service account JSON is valid
- Ensure file permissions allow reading

**"Invalid or expired token"**
- Token may have expired (1 hour lifetime)
- App will automatically refresh token
- Check clock sync on devices

### Mobile App Errors

**"GoogleSignIn class doesn't have constructor"**
- Use `GoogleSignIn.instance` (singleton pattern)
- Call `initialize()` before using

**"No token provided"**
- Ensure user is signed in with Firebase
- Check Authorization header is being set
- Use `BackendApiService` which handles this automatically

## Migration from JWT to Firebase

If you have existing JWT-based auth:

1. Keep existing routes working (backward compatibility)
2. Add Firebase routes as alternative
3. Gradually migrate mobile app to Firebase
4. Update Customer model to support both:
   - `passwordHash` for JWT auth (local)
   - `firebaseUid` for Firebase auth
5. Eventually deprecate JWT routes

## Testing

### Test Firebase Token Verification

```bash
# Get a Firebase ID token from your mobile app (print it in debug)
export FIREBASE_TOKEN="eyJhbGc..."

# Test the sync endpoint
curl -X POST http://localhost:4000/api/public/firebase-auth/sync \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971501234567"}'
```

### Test User Creation

1. Sign in on mobile app
2. Check MongoDB for new user:
```bash
mongosh
use coffee_beans_db
db.customers.find({ authProvider: "firebase" })
```

## Production Deployment

1. **Use secure service account storage:**
   - Store JSON in secure environment variables
   - Or use cloud provider's secret management

2. **Update base URL in mobile app:**
```dart
static const String baseUrl = 'https://api.yourdomain.com/api';
```

3. **Enable HTTPS:**
   - Use SSL certificates
   - Enforce HTTPS only

4. **Monitor Firebase usage:**
   - Check Firebase Console for usage
   - Set up billing alerts

## Summary

✅ **Firebase handles:** Authentication, OAuth, security  
✅ **MongoDB stores:** User profiles, orders, business data  
✅ **Backend verifies:** Every request with Firebase Admin SDK  
✅ **Mobile app:** Automatically includes Firebase token in requests  
✅ **Seamless integration:** User data synced between systems  

---

For questions or issues, check the code comments or create an issue in the repository.
