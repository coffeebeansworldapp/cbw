import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';
import '../services/firebase_auth_service.dart';
import '../../models/user.dart';

enum AuthStatus { initial, authenticated, guest, unauthenticated }

class AuthState {
  final AuthStatus status;
  final User? user;
  final firebase_auth.User? firebaseUser;
  final String? error;
  final bool isLoading;
  final bool isGuest;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.firebaseUser,
    this.error,
    this.isLoading = false,
    this.isGuest = false,
  });

  /// Check if user can access authenticated features
  bool get canBrowse =>
      status == AuthStatus.authenticated || status == AuthStatus.guest;

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    firebase_auth.User? firebaseUser,
    String? error,
    bool? isLoading,
    bool? isGuest,
    bool clearUser = false,
    bool clearFirebaseUser = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      firebaseUser: clearFirebaseUser
          ? null
          : (firebaseUser ?? this.firebaseUser),
      error: error,
      isLoading: isLoading ?? this.isLoading,
      isGuest: isGuest ?? this.isGuest,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final FirebaseAuthService _firebaseAuth;

  AuthNotifier(this._apiClient, this._firebaseAuth) : super(const AuthState()) {
    // Listen to Firebase auth state changes
    _firebaseAuth.authStateChanges.listen(_onAuthStateChanged);
  }

  void _onAuthStateChanged(firebase_auth.User? firebaseUser) {
    if (firebaseUser != null) {
      state = state.copyWith(firebaseUser: firebaseUser);
    } else {
      // Only change status if we're not in initial state (splash screen)
      // This prevents the redirect from happening before the splash video finishes
      if (state.status != AuthStatus.initial) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          clearUser: true,
          clearFirebaseUser: true,
        );
      }
    }
  }

  /// Continue as guest user (can browse but cannot checkout/access profile)
  Future<void> continueAsGuest() async {
    state = state.copyWith(
      status: AuthStatus.guest,
      isGuest: true,
      clearUser: true,
      clearFirebaseUser: true,
    );
  }

  Future<void> checkAuthStatus() async {
    // First check Firebase auth state
    final firebaseUser = _firebaseAuth.currentUser;

    if (firebaseUser == null) {
      // No Firebase user, check for existing backend token
      final token = await SecureStorageService.getAccessToken();
      if (token == null) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return;
      }
    }

    try {
      state = state.copyWith(isLoading: true);

      final response = await _apiClient.get(ApiConstants.me);

      if (response.data['success'] == true) {
        final user = User.fromJson(response.data['customer']);
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          firebaseUser: firebaseUser,
          isLoading: false,
        );
      } else {
        await _signOutCompletely();
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          isLoading: false,
        );
      }
    } catch (e) {
      await _signOutCompletely();
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
      );
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // Sign in with Firebase first
      final userCredential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Get Firebase ID token
      final idToken = await userCredential.user?.getIdToken();

      // Authenticate with backend using Firebase token
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {'email': email, 'password': password, 'firebaseToken': idToken},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        await SecureStorageService.saveTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );

        final user = User.fromJson(data['customer']);
        await SecureStorageService.saveUserInfo(
          id: user.id,
          email: user.email,
          name: user.fullName,
        );

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          firebaseUser: userCredential.user,
          isLoading: false,
        );
        return true;
      } else {
        // Backend auth failed, sign out from Firebase
        await _firebaseAuth.signOut();
        state = state.copyWith(
          error: response.data['message'] ?? 'Login failed',
          isLoading: false,
        );
        return false;
      }
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } catch (e) {
      await _firebaseAuth.signOut();
      state = state.copyWith(
        error: 'Login failed. Please check your credentials.',
        isLoading: false,
      );
      return false;
    }
  }

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // Sign in with Google via Firebase
      final userCredential = await _firebaseAuth.signInWithGoogle();

      final firebaseUser = userCredential.user;
      if (firebaseUser == null) {
        state = state.copyWith(
          error: 'Google sign-in failed',
          isLoading: false,
        );
        return false;
      }

      // Get Firebase ID token
      await firebaseUser.getIdToken();

      // Sync with backend MongoDB
      // This uses Firebase ID token for authentication
      final response = await _apiClient.post(
        '/public/firebase-auth/sync',
        data: {},
      );

      if (response.data['success'] == true) {
        final user = User.fromJson(response.data['data']['customer']);
        await SecureStorageService.saveUserInfo(
          id: user.id,
          email: user.email,
          name: user.fullName,
        );

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          firebaseUser: firebaseUser,
          isLoading: false,
        );
        return true;
      }

      state = state.copyWith(error: 'Google sign-in failed', isLoading: false);
      return false;
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } catch (e) {
      await _firebaseAuth.signOut();
      await _firebaseAuth.signOutFromGoogle();
      state = state.copyWith(
        error: 'Google sign-in failed: ${e.toString()}',
        isLoading: false,
      );
      return false;
    }
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // Create user with Firebase first
      final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name in Firebase
      await _firebaseAuth.updateDisplayName(fullName);

      // Get Firebase ID token
      final idToken = await userCredential.user?.getIdToken();

      // Register with backend
      final response = await _apiClient.post(
        ApiConstants.register,
        data: {
          'fullName': fullName,
          'email': email,
          'password': password,
          if (phone != null) 'phone': phone,
          'firebaseUid': userCredential.user?.uid,
          'firebaseToken': idToken,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        await SecureStorageService.saveTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );

        final user = User.fromJson(data['customer']);
        await SecureStorageService.saveUserInfo(
          id: user.id,
          email: user.email,
          name: user.fullName,
        );

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          firebaseUser: userCredential.user,
          isLoading: false,
        );
        return true;
      } else {
        // Backend registration failed, delete Firebase user
        await userCredential.user?.delete();
        state = state.copyWith(
          error: response.data['message'] ?? 'Registration failed',
          isLoading: false,
        );
        return false;
      }
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } on DioException catch (e) {
      // Backend error - clean up Firebase user if created
      if (_firebaseAuth.currentUser != null) {
        try {
          await _firebaseAuth.currentUser?.delete();
        } catch (_) {}
      }

      String errorMessage = 'Registration failed. Please try again.';
      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response?.data['message'];
      } else if (e.response?.statusCode == 409) {
        errorMessage = 'Email already registered. Please login instead.';
      }
      state = state.copyWith(error: errorMessage, isLoading: false);
      return false;
    } catch (e) {
      // Clean up Firebase user if created
      if (_firebaseAuth.currentUser != null) {
        try {
          await _firebaseAuth.currentUser?.delete();
        } catch (_) {}
      }

      state = state.copyWith(
        error: 'Registration failed: ${e.toString()}',
        isLoading: false,
      );
      return false;
    }
  }

  Future<void> logout() async {
    // Only call logout API if user is authenticated (not guest)
    if (state.status == AuthStatus.authenticated) {
      try {
        await _apiClient.post(ApiConstants.logout);
      } catch (_) {
        // Ignore logout API errors
      }
      await _signOutCompletely();
    }

    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> _signOutCompletely() async {
    await _firebaseAuth.signOut();
    await SecureStorageService.clearAll();
  }

  Future<void> refreshUser() async {
    try {
      final response = await _apiClient.get(ApiConstants.me);
      if (response.data['success'] == true) {
        final user = User.fromJson(response.data['customer']);
        state = state.copyWith(user: user);
      }
    } catch (e) {
      // Ignore refresh errors
    }
  }

  /// Send password reset email
  Future<bool> sendPasswordResetEmail(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _firebaseAuth.sendPasswordResetEmail(email);
      state = state.copyWith(isLoading: false);
      return true;
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        error: 'Failed to send password reset email.',
        isLoading: false,
      );
      return false;
    }
  }

  // ==================== EMAIL LINK AUTHENTICATION ====================

  /// Send sign-in link to email (passwordless authentication)
  Future<bool> sendSignInLinkToEmail(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _firebaseAuth.sendSignInLinkToEmail(email);
      state = state.copyWith(isLoading: false);
      return true;
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        error: 'Failed to send sign-in link.',
        isLoading: false,
      );
      return false;
    }
  }

  /// Check if the provided link is a sign-in with email link
  bool isSignInWithEmailLink(String link) {
    return _firebaseAuth.isSignInWithEmailLink(link);
  }

  /// Complete sign-in with email link
  Future<bool> signInWithEmailLink(String email, String emailLink) async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      // Sign in with Firebase email link
      final userCredential = await _firebaseAuth.signInWithEmailLink(
        email: email,
        emailLink: emailLink,
      );

      // Get Firebase ID token
      final idToken = await userCredential.user?.getIdToken();

      // Authenticate with backend
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {
          'email': email,
          'firebaseToken': idToken,
          'signInMethod': 'emailLink',
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        await SecureStorageService.saveTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );

        final user = User.fromJson(data['customer']);
        await SecureStorageService.saveUserInfo(
          id: user.id,
          email: user.email,
          name: user.fullName,
        );

        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: user,
          firebaseUser: userCredential.user,
          isLoading: false,
        );
        return true;
      } else {
        await _firebaseAuth.signOut();
        state = state.copyWith(
          error: response.data['message'] ?? 'Sign in failed',
          isLoading: false,
        );
        return false;
      }
    } on firebase_auth.FirebaseAuthException catch (e) {
      state = state.copyWith(
        error: FirebaseAuthService.getErrorMessage(e),
        isLoading: false,
      );
      return false;
    } catch (e) {
      await _firebaseAuth.signOut();
      state = state.copyWith(
        error: 'Sign in failed. Please try again.',
        isLoading: false,
      );
      return false;
    }
  }

  /// Get the current Firebase ID token for API calls
  Future<String?> getFirebaseIdToken() async {
    return await _firebaseAuth.getIdToken();
  }
}

// Providers
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final firebaseAuthServiceProvider = Provider<FirebaseAuthService>((ref) {
  return FirebaseAuthService();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(apiClientProvider),
    ref.watch(firebaseAuthServiceProvider),
  );
});
