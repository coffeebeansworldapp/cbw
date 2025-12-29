import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

// ==================== Custom Exceptions ====================
// Clean, user-friendly exceptions instead of raw DioException

/// Thrown when user cancels Google Sign-In flow
class GoogleSignInCancelledException implements Exception {
  final String message;
  GoogleSignInCancelledException(this.message);
  @override
  String toString() => message;
}

/// Thrown when Google Sign-In returns null tokens (configuration error)
class GoogleSignInTokenException implements Exception {
  final String message;
  GoogleSignInTokenException(this.message);
  @override
  String toString() => message;
}

/// Thrown when Firebase authentication fails
class FirebaseAuthFailedException implements Exception {
  final String message;
  FirebaseAuthFailedException(this.message);
  @override
  String toString() => message;
}

/// Thrown for generic Google Sign-In errors
class GoogleSignInFailedException implements Exception {
  final String message;
  GoogleSignInFailedException(this.message);
  @override
  String toString() => message;
}

// ==================== Service ====================

/// Firebase Authentication Service
/// Handles all Firebase Auth operations including sign-in, registration,
/// sign-out, email link authentication, and auth state management.
class FirebaseAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // CRITICAL: For google_sign_in v7.x, use GoogleSignIn.instance (singleton)
  // ServerClientId configuration is done via GoogleService-Info.plist (iOS) and google-services.json (Android)
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  // Firebase project configuration
  static const String _firebaseProjectId = 'coffeebeansworld-v1';
  static const String _androidPackageName = 'com.coffeebeansworld.mobile';
  static const String _iosBundleId = 'com.coffeebeansworld.mobile';

  // Google Sign-In scopes
  static const List<String> _googleScopes = [
    'email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  /// Initialize Google Sign-In
  /// For v7.x, configuration comes from platform-specific files
  /// iOS: GoogleService-Info.plist with REVERSED_CLIENT_ID in Info.plist
  /// Android: google-services.json
  Future<void> initializeGoogleSignIn() async {
    print('🔧 Initializing GoogleSignIn (v7.x singleton pattern)...');
    // In v7.x, no explicit initialization needed - configuration is from platform files
    print('✅ GoogleSignIn ready (using platform OAuth config)');
  }

  /// Get the current Firebase user
  User? get currentUser => _auth.currentUser;

  /// Check if user is currently signed in
  bool get isSignedIn => currentUser != null;

  /// Stream of auth state changes
  /// Emits the current user when auth state changes (sign in/out)
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Stream of ID token changes
  /// Emits when the user's ID token changes
  Stream<User?> get idTokenChanges => _auth.idTokenChanges();

  /// Stream of user changes
  /// Emits when any user data changes (profile updates, etc.)
  Stream<User?> get userChanges => _auth.userChanges();

  /// Sign in with email and password
  /// Returns [UserCredential] on success
  /// Throws [FirebaseAuthException] on failure
  Future<UserCredential> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException {
      rethrow;
    }
  }

  /// Register a new user with email and password
  /// Returns [UserCredential] on success
  /// Throws [FirebaseAuthException] on failure
  Future<UserCredential> createUserWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException {
      rethrow;
    }
  }

  // ==================== GOOGLE SIGN IN ====================

  /// Sign in with Google (google_sign_in v7.x API)
  /// Returns [UserCredential] on success
  /// Throws custom exceptions with clean error messages
  ///
  /// FLOW EXPLANATION:
  /// 1. Call authenticate() to get GoogleSignInAccount (v7.x uses authenticate, not signIn)
  /// 2. Get authentication object (contains idToken)
  /// 3. Get authorization for scopes to get accessToken (v7.x API change)
  /// 4. VALIDATE both tokens are NOT null (critical!)
  /// 5. Create Firebase credential with tokens
  /// 6. Sign in to Firebase with credential
  ///
  /// WHY 400 ERROR HAPPENED:
  /// - OAuth configuration missing from Info.plist (iOS) or google-services.json (Android)
  /// - This caused invalid tokens that backend couldn't validate
  /// - Backend rejected the invalid Firebase token with 400 Bad Request
  Future<UserCredential> signInWithGoogle() async {
    try {
      print('🔵 [1/6] Starting Google Sign-In flow (v7.x)...');

      // STEP 1: Trigger Google Sign-In
      // NOTE: v7.x removed signIn(), authenticate() is the only option
      // The port 62797 error is normal OAuth flow - not an error
      final GoogleSignInAccount googleUser;
      try {
        googleUser = await _googleSignIn.authenticate(scopeHint: _googleScopes);
      } catch (e) {
        if (e.toString().contains('cancel')) {
          print('❌ User cancelled Google Sign-In');
          throw GoogleSignInCancelledException('Sign-in was cancelled');
        }
        print('❌ Google Sign-In error: $e');
        rethrow;
      }

      print('✅ [2/6] Google account selected: ${googleUser.email}');

      // STEP 2: Obtain authentication details (has idToken)
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // STEP 3: Get accessToken from authorization client (v7.x API)
      final GoogleSignInClientAuthorization? authorization = await googleUser
          .authorizationClient
          .authorizationForScopes(_googleScopes);

      // STEP 4: CRITICAL - Validate tokens before proceeding
      // WHY: If tokens are null, Firebase auth will fail and backend will return 400
      final String? idToken = googleAuth.idToken;
      final String? accessToken = authorization?.accessToken;

      print('📝 [3/6] Token validation:');
      print(
        '   - idToken: ${idToken != null ? "✅ Present (${idToken.substring(0, 20)}...)" : "❌ NULL"}',
      );
      print(
        '   - accessToken: ${accessToken != null ? "✅ Present (${accessToken.substring(0, 20)}...)" : "❌ NULL"}',
      );

      // VALIDATE: Both tokens must exist
      if (idToken == null) {
        print(
          '❌ FATAL: idToken is null - Google Sign-In OAuth is not properly configured',
        );
        throw GoogleSignInTokenException(
          'Google Sign-In configuration error. Please contact support.',
        );
      }

      if (accessToken == null) {
        print(
          '❌ FATAL: accessToken is null - Google Sign-In OAuth is not properly configured',
        );
        throw GoogleSignInTokenException(
          'Google Sign-In configuration error. Please contact support.',
        );
      }

      print('✅ [4/6] Both tokens validated successfully');

      // STEP 5: Create Firebase credential with validated tokens
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: accessToken,
        idToken: idToken,
      );

      // STEP 6: Sign in to Firebase using Google credential
      print('🔥 [5/6] Authenticating with Firebase...');
      final UserCredential result = await _auth.signInWithCredential(
        credential,
      );

      if (result.user == null) {
        print('❌ FATAL: Firebase returned null user after sign-in');
        throw FirebaseAuthFailedException(
          'Firebase authentication failed unexpectedly',
        );
      }

      print('✅ [6/6] SUCCESS: Firebase sign-in complete!');
      print('   - User: ${result.user!.email}');
      print('   - UID: ${result.user!.uid}');
      print('   - Email Verified: ${result.user!.emailVerified}');

      return result;
    } on GoogleSignInCancelledException catch (e) {
      // User-friendly: User cancelled the flow
      print('ℹ️ User cancelled sign-in: ${e.message}');
      rethrow;
    } on GoogleSignInTokenException catch (e) {
      // Configuration error: Missing or invalid tokens
      print('❌ Token error: ${e.message}');
      rethrow;
    } on FirebaseAuthException catch (e) {
      // Firebase-specific errors (invalid credentials, user disabled, etc.)
      print('❌ FirebaseAuthException: [${e.code}] ${e.message}');
      throw FirebaseAuthFailedException(getErrorMessage(e));
    } catch (e) {
      // Unexpected errors
      print('❌ Unexpected Google Sign-In error: $e');
      throw GoogleSignInFailedException(
        'An unexpected error occurred during sign-in. Please try again.',
      );
    }
  }

  /// Sign out from Google
  Future<void> signOutFromGoogle() async {
    await _googleSignIn.signOut();
  }

  // ==================== EMAIL LINK AUTHENTICATION ====================

  /// Send sign-in link to email (passwordless authentication)
  /// The user will receive an email with a link to sign in
  Future<void> sendSignInLinkToEmail(String email) async {
    final actionCodeSettings = ActionCodeSettings(
      // URL to redirect to after email link is clicked
      // This URL must be whitelisted in Firebase Console > Authentication > Settings > Authorized domains
      url:
          'https://$_firebaseProjectId.firebaseapp.com/__/auth/action?email=${Uri.encodeComponent(email)}',
      handleCodeInApp: true,
      iOSBundleId: _iosBundleId,
      androidPackageName: _androidPackageName,
      androidInstallApp: true,
      androidMinimumVersion: '21',
      // Don't specify linkDomain - let Firebase use its default email action handler
    );

    await _auth.sendSignInLinkToEmail(
      email: email,
      actionCodeSettings: actionCodeSettings,
    );
  }

  /// Check if the provided link is a sign-in with email link
  bool isSignInWithEmailLink(String link) {
    return _auth.isSignInWithEmailLink(link);
  }

  /// Complete sign-in with email link
  /// Call this when the app receives the deep link
  Future<UserCredential> signInWithEmailLink({
    required String email,
    required String emailLink,
  }) async {
    try {
      return await _auth.signInWithEmailLink(
        email: email,
        emailLink: emailLink,
      );
    } on FirebaseAuthException {
      rethrow;
    }
  }

  /// Link email link credential to existing user
  Future<UserCredential?> linkWithEmailLink({
    required String email,
    required String emailLink,
  }) async {
    final credential = EmailAuthProvider.credentialWithLink(
      email: email,
      emailLink: emailLink,
    );
    return await currentUser?.linkWithCredential(credential);
  }

  /// Re-authenticate user with email link
  Future<UserCredential?> reauthenticateWithEmailLink({
    required String email,
    required String emailLink,
  }) async {
    final credential = EmailAuthProvider.credentialWithLink(
      email: email,
      emailLink: emailLink,
    );
    return await currentUser?.reauthenticateWithCredential(credential);
  }

  // ==================== OTHER AUTH METHODS ====================

  /// Update the user's display name
  Future<void> updateDisplayName(String displayName) async {
    await currentUser?.updateDisplayName(displayName);
    await currentUser?.reload();
  }

  /// Update the user's profile (display name and/or photo URL)
  Future<void> updateProfile({String? displayName, String? photoURL}) async {
    await currentUser?.updateDisplayName(displayName);
    if (photoURL != null) {
      await currentUser?.updatePhotoURL(photoURL);
    }
    await currentUser?.reload();
  }

  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  /// Send email verification to current user
  Future<void> sendEmailVerification() async {
    await currentUser?.sendEmailVerification();
  }

  /// Get the current user's ID token
  /// Useful for authenticating with backend APIs
  Future<String?> getIdToken({bool forceRefresh = false}) async {
    return await currentUser?.getIdToken(forceRefresh);
  }

  /// Sign out the current user
  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Delete the current user's account
  Future<void> deleteAccount() async {
    await currentUser?.delete();
  }

  /// Re-authenticate user with email and password
  /// Required before sensitive operations like account deletion
  Future<UserCredential?> reauthenticate({
    required String email,
    required String password,
  }) async {
    final credential = EmailAuthProvider.credential(
      email: email,
      password: password,
    );
    return await currentUser?.reauthenticateWithCredential(credential);
  }

  /// Convert Firebase Auth error codes to user-friendly messages
  static String getErrorMessage(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'network-request-failed':
        return 'Network error. Please check your connection.';
      case 'expired-action-code':
        return 'This sign-in link has expired. Please request a new one.';
      case 'invalid-action-code':
        return 'This sign-in link is invalid. Please request a new one.';
      default:
        return e.message ?? 'An error occurred. Please try again.';
    }
  }
}
