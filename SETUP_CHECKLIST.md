# ✅ Firebase Authentication + MongoDB - Setup Checklist

Use this checklist to ensure your Firebase Authentication integration is properly configured.

## 📋 Backend Setup Checklist

### Dependencies
- [x] `firebase-admin` package installed in package.json
- [x] Package installed with `npm install`

### Files Created/Updated
- [x] `config/firebase.js` - Firebase Admin SDK configuration
- [x] `middleware/firebaseAuth.js` - Token verification middleware
- [x] `routes/public/firebaseAuth.js` - Firebase auth API routes
- [x] `models/Customer.js` - Updated with `firebaseUid` field
- [x] `routes/public/index.js` - Firebase routes mounted

### Configuration Required (❗ Action Needed)
- [ ] Download Firebase service account JSON from Firebase Console
- [ ] Save service account JSON to secure location
- [ ] Add `FIREBASE_PROJECT_ID` to `.env`
- [ ] Add `GOOGLE_APPLICATION_CREDENTIALS` path to `.env`
- [ ] Restart backend server
- [ ] Verify log shows: "✅ Firebase Admin initialized"

### Testing Backend
- [ ] Start backend server (`npm start`)
- [ ] Check no errors in console
- [ ] Test health endpoint: `curl http://localhost:4000/api/health`

## 📱 Mobile App Setup Checklist

### Files Created/Updated
- [x] `firebase_auth_service.dart` - Fixed GoogleSignIn v7.x API
- [x] `backend_api_service.dart` - API client with auto-token handling
- [x] `auth_provider_example.dart` - Complete auth state management
- [x] `login_screen_example.dart` - Ready-to-use login UI
- [x] `firebase_options.dart` - iOS client ID completed

### Configuration Files (Already Done)
- [x] `firebase_options.dart` - Firebase configuration
- [x] `android/app/google-services.json` - Android config
- [x] `ios/Runner/GoogleService-Info.plist` - iOS config

### Code Integration Required (❗ Action Needed)
- [ ] Initialize Firebase in `main.dart`:
  ```dart
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  ```
- [ ] Initialize GoogleSignIn in `main.dart`:
  ```dart
  final authService = FirebaseAuthService();
  await authService.initializeGoogleSignIn();
  ```
- [ ] Replace existing auth screens with new Firebase auth
- [ ] Update API calls to use `BackendApiService`

### Testing Mobile App
- [ ] Run app on Android emulator/device
- [ ] Run app on iOS simulator/device
- [ ] Test Google Sign-In
- [ ] Test email/password sign-in
- [ ] Verify user appears in Firebase Console
- [ ] Verify user appears in MongoDB

## 🔐 Firebase Console Setup Checklist

### Authentication Providers (❗ Action Needed)
- [ ] Go to Firebase Console → Authentication → Sign-in method
- [ ] Enable **Google** sign-in provider
- [ ] Enable **Email/Password** sign-in provider
- [ ] (Optional) Enable **Apple** sign-in provider for iOS
- [ ] (Optional) Enable **Phone** sign-in provider

### Authorized Domains
- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Add your backend domain (if needed)
- [ ] Add your mobile app package name (already configured)

### Service Account
- [x] Service account can be generated
- [ ] Generate new private key
- [ ] Download JSON file
- [ ] Store securely (DO NOT commit to git)

## 🗄️ MongoDB Setup Checklist

### Database Updates
- [ ] Run backend once to let Mongoose create indexes
- [ ] Verify `firebaseUid` index exists on `customers` collection
- [ ] Check MongoDB connection is working

### Data Migration (If Needed)
- [ ] If you have existing users with email/password:
  - They will continue to work with old JWT system
  - New Firebase users will have `authProvider: "firebase"`
  - No migration needed - both systems coexist

## 🔒 Security Checklist

### Environment Variables
- [ ] `.env` file exists in `backend/` directory
- [ ] `.env` is in `.gitignore`
- [ ] Service account JSON is in `.gitignore`
- [ ] No sensitive data committed to git

### API Security
- [x] Rate limiting enabled
- [x] CORS configured properly
- [x] Helmet security headers enabled
- [x] MongoDB sanitization enabled
- [ ] HTTPS enabled (for production)

### Token Security
- [x] Tokens verified on every request
- [x] Expired tokens handled automatically
- [x] Token refresh implemented in mobile app

## 📡 API Endpoints Checklist

### New Firebase Auth Endpoints
- [x] `POST /api/public/firebase-auth/sync` - User sync
- [x] `GET /api/public/firebase-auth/profile` - Get profile
- [x] `PATCH /api/public/firebase-auth/profile` - Update profile
- [x] `POST /api/public/firebase-auth/addresses` - Add address
- [x] `PATCH /api/public/firebase-auth/addresses/:id` - Update address
- [x] `DELETE /api/public/firebase-auth/addresses/:id` - Delete address
- [x] `DELETE /api/public/firebase-auth/account` - Delete account

### Testing Endpoints
- [ ] Test sync endpoint with Firebase token
- [ ] Test profile endpoints
- [ ] Test address endpoints
- [ ] Verify authorization required (401 without token)

## 🧪 Testing Checklist

### Unit Tests (Optional)
- [ ] Test Firebase auth service methods
- [ ] Test API service methods
- [ ] Test auth provider state management

### Integration Tests
- [ ] Sign in with Google on mobile → Check user in MongoDB
- [ ] Sign in with email/password → Check user in MongoDB
- [ ] Create order → Verify it's linked to correct user
- [ ] Update profile → Verify changes in MongoDB

### User Flow Tests
- [ ] New user can sign up with email/password
- [ ] New user can sign in with Google
- [ ] Existing user can sign in
- [ ] User can view profile
- [ ] User can update profile
- [ ] User can add/edit/delete addresses
- [ ] User can create orders
- [ ] User can sign out
- [ ] Signed-out user cannot access protected endpoints

## 📚 Documentation Checklist

### Documentation Files
- [x] `QUICKSTART_FIREBASE_AUTH.md` - Quick setup guide
- [x] `FIREBASE_MONGODB_INTEGRATION.md` - Detailed integration guide
- [x] `IMPLEMENTATION_SUMMARY.md` - Implementation details
- [x] `ARCHITECTURE_DIAGRAM.md` - Visual architecture
- [x] `SETUP_CHECKLIST.md` - This checklist

### Code Documentation
- [x] All functions have doc comments
- [x] API endpoints documented
- [x] Example code provided

## 🚀 Production Deployment Checklist

### Backend Production Setup
- [ ] Environment variables configured in production
- [ ] Service account JSON securely stored (env var or secret manager)
- [ ] HTTPS certificate installed
- [ ] HTTPS enforced (no HTTP)
- [ ] Production MongoDB connection configured
- [ ] Logging and monitoring set up
- [ ] Error tracking configured (Sentry, etc.)

### Mobile App Production Setup
- [ ] Update `BackendApiService.baseUrl` to production URL
- [ ] Test on production backend
- [ ] Firebase authentication tested in production
- [ ] Google Sign-In tested with production SHA keys
- [ ] App store configurations completed

### Security Audit
- [ ] Service account JSON not in git
- [ ] `.env` file not in git
- [ ] API keys not exposed in client code
- [ ] HTTPS only in production
- [ ] Rate limiting tested
- [ ] Token expiration tested

## ✅ Final Verification

Run through this complete user flow:

1. [ ] Start backend server
2. [ ] Start mobile app
3. [ ] Tap "Sign in with Google"
4. [ ] Google OAuth flow completes
5. [ ] User redirected to app
6. [ ] Check Firebase Console - user exists
7. [ ] Check MongoDB - user exists with `firebaseUid`
8. [ ] Make API call (e.g., get profile)
9. [ ] API call succeeds with user data
10. [ ] Sign out
11. [ ] Verify signed out state

## 🆘 Troubleshooting

If any step fails, check:

### Backend Not Starting
- [ ] Check MongoDB is running
- [ ] Check `.env` file exists and is formatted correctly
- [ ] Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- [ ] Check service account JSON is valid

### Firebase Token Verification Fails
- [ ] Check Firebase project ID matches
- [ ] Check service account has correct permissions
- [ ] Check token is being sent in Authorization header
- [ ] Check token hasn't expired

### Mobile App Sign-In Fails
- [ ] Check Firebase is initialized in `main.dart`
- [ ] Check GoogleSignIn is initialized
- [ ] Check Firebase configuration files are correct
- [ ] Check internet connection
- [ ] Check device date/time is correct

### User Not Created in MongoDB
- [ ] Check backend receives the request
- [ ] Check Firebase token is valid
- [ ] Check MongoDB connection is working
- [ ] Check no validation errors in Customer model

## 📊 Status Summary

Count your checkmarks:

- **Backend Setup:** ___ / 12
- **Mobile Setup:** ___ / 12
- **Firebase Console:** ___ / 7
- **MongoDB:** ___ / 4
- **Security:** ___ / 9
- **API Endpoints:** ___ / 8
- **Testing:** ___ / 13
- **Documentation:** ___ / 7
- **Production:** ___ / 14
- **Final Verification:** ___ / 11

**Total:** ___ / 97

🎯 **Goal:** 97/97 for full production readiness

---

## Next Steps After Completion

Once all items are checked:

1. ✅ Run comprehensive testing
2. ✅ Deploy to staging environment
3. ✅ Perform user acceptance testing
4. ✅ Deploy to production
5. ✅ Monitor logs and error rates
6. ✅ Gather user feedback

---

**Checklist Version:** 1.0  
**Last Updated:** December 27, 2025  
**Ready for:** Production Deployment
