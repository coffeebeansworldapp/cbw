# 🚀 Quick Start Guide - Firebase Auth + MongoDB

Get Firebase Authentication working with your MongoDB backend in 5 minutes!

## Prerequisites

- ✅ Firebase project created (`coffeebeansworld-v1`)
- ✅ Mobile app has Firebase configuration files
- ✅ Backend running MongoDB
- ✅ `firebase-admin` package installed in backend

## Step 1: Get Firebase Service Account (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **coffeebeansworld-v1**
3. Click ⚙️ → **Project Settings** → **Service Accounts** tab
4. Click **Generate New Private Key** button
5. Save the JSON file to your computer

## Step 2: Configure Backend (1 min)

1. Place the service account JSON file somewhere safe:
```bash
# Example location
/Users/yourname/firebase/coffeebeansworld-serviceAccount.json
```

2. Add to `backend/.env`:
```env
FIREBASE_PROJECT_ID=coffeebeansworld-v1
GOOGLE_APPLICATION_CREDENTIALS=/Users/yourname/firebase/coffeebeansworld-serviceAccount.json
```

3. Restart backend:
```bash
cd backend
npm start
```

You should see: `✅ Firebase Admin initialized with service account file`

## Step 3: Initialize Firebase in Mobile App (1 min)

In your `main.dart`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/services/firebase_auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Initialize Google Sign-In
  final authService = FirebaseAuthService();
  await authService.initializeGoogleSignIn();
  
  runApp(const MyApp());
}
```

## Step 4: Test It! (1 min)

### Option A: Use the Example Login Screen

```dart
import 'features/auth/presentation/login_screen_example.dart';

// In your routes:
routes: {
  '/login': (context) => const LoginScreenExample(),
},
```

### Option B: Quick Test Code

```dart
import 'core/services/firebase_auth_service.dart';
import 'core/services/backend_api_service.dart';

// Sign in with Google
final authService = FirebaseAuthService();
final credential = await authService.signInWithGoogle();

if (credential != null) {
  print('✅ Signed in with Firebase!');
  
  // Sync with backend
  final apiService = BackendApiService();
  final response = await apiService.syncUser();
  
  print('✅ User synced with MongoDB!');
  print('User: ${response['data']['customer']}');
}
```

## Step 5: Verify in MongoDB

```bash
mongosh
use coffee_beans_db
db.customers.find({ authProvider: "firebase" }).pretty()
```

You should see your user with:
- ✅ `firebaseUid`
- ✅ `email`
- ✅ `authProvider: "firebase"`

## 🎉 Done!

Your Firebase Authentication is now connected to MongoDB!

## What You Can Do Now

### Sign In Users
```dart
final authProvider = AuthProvider();

// Google Sign-In
await authProvider.signInWithGoogle();

// Email/Password
await authProvider.signInWithEmailPassword(email, password);

// Register
await authProvider.registerWithEmailPassword(
  email: email, 
  password: password, 
  fullName: fullName,
);
```

### Make Authenticated API Calls
```dart
final apiService = BackendApiService();

// Get profile
final profile = await apiService.getProfile();

// Update profile
await apiService.updateProfile(fullName: 'John Doe');

// Add address
await apiService.addAddress(
  name: 'John Doe',
  phone: '+971501234567',
  street: 'Sheikh Zayed Road',
  city: 'Dubai',
  emirate: 'Dubai',
);

// Create order
await apiService.createOrder(
  items: [{'productId': '123', 'quantity': 2}],
  addressId: 'address-id',
);
```

### Protect Backend Routes
```javascript
const { requireFirebaseAuth } = require('./middleware/firebaseAuth');

router.get('/api/public/orders', requireFirebaseAuth, async (req, res) => {
  // req.customer has the MongoDB user
  // req.firebaseUser has the Firebase user
  
  const orders = await Order.find({ customerId: req.customer._id });
  res.json({ success: true, data: { orders } });
});
```

## Common Issues

### "Firebase Admin initialization failed"
**Solution:** Check the path in `GOOGLE_APPLICATION_CREDENTIALS` is correct

### "GoogleSignIn constructor error"
**Solution:** Already fixed! Using `GoogleSignIn.instance` and `authenticate()`

### "Token expired"
**Solution:** App automatically refreshes tokens - no action needed

### "User not found in MongoDB"
**Solution:** Call `apiService.syncUser()` after sign-in (or middleware auto-creates)

## Next Steps

1. ✅ Replace existing auth screens with new Firebase auth
2. ✅ Update all API calls to use `BackendApiService`
3. ✅ Test on both Android and iOS
4. ✅ Add email verification flow
5. ✅ Deploy to production

## Need Help?

- 📖 Read: `backend/FIREBASE_MONGODB_INTEGRATION.md`
- 📋 Check: `backend/IMPLEMENTATION_SUMMARY.md`
- 💬 Look at example code in `mobile/lib/core/providers/auth_provider_example.dart`

---

**Time to complete:** ~5 minutes  
**Status:** Ready to use  
**Tested:** ✅ Backend, ✅ Mobile  
**Production ready:** Yes (after testing)
