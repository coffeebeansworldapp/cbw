import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Backend API Service for Firebase-authenticated requests
/// Handles communication between mobile app and backend MongoDB
class BackendApiService {
  final Dio _dio;
  final FirebaseAuth _auth;

  // Base URL Configuration
  // iOS Simulator: MUST use 127.0.0.1 (localhost won't work on iOS)
  // Physical Device: Use Mac's LAN IP (get with: ipconfig getifaddr en0)
  // Production: Use your deployed backend URL
  static const String baseUrl = 'http://127.0.0.1:4000/api';

  // Alternative for physical device (uncomment and update IP):
  // static const String baseUrl = 'http://192.168.1.100:4000/api';

  // Production:
  // static const String baseUrl = 'https://your-api.com/api';

  BackendApiService({Dio? dio, FirebaseAuth? auth})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              baseUrl: baseUrl,
              // Allow 400 responses to be inspected (don't throw immediately)
              // This helps debug authentication issues
              validateStatus: (status) {
                return status != null && status < 500;
              },
            ),
          ),
      _auth = auth ?? FirebaseAuth.instance {
    // Add interceptor to attach Firebase ID token to all requests
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final user = _auth.currentUser;
            print('📡 Backend API Request: ${options.method} ${options.path}');
            print(
              '   User signed in: ${user != null} (${user?.email ?? "none"})',
            );
            if (user != null) {
              final idToken = await user.getIdToken();
              if (idToken != null) {
                options.headers['Authorization'] = 'Bearer $idToken';
                print('   ✅ Token attached: ${idToken.substring(0, 20)}...');
              } else {
                print('   ❌ Failed to get ID token');
              }
            } else {
              print('   ❌ No user signed in - request will fail');
            }
          } catch (e) {
            print('   ❌ Error getting ID token: $e');
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // COMPREHENSIVE ERROR LOGGING FOR DEBUGGING 400 ERRORS
          print(
            '\n🔴 ════════════════════════════════════════════════════════',
          );
          print('🔴 DIO REQUEST FAILED');
          print('🔴 ════════════════════════════════════════════════════════');
          print('📍 URL: ${error.requestOptions.uri}');
          print('📍 Method: ${error.requestOptions.method}');
          print(
            '📍 Status Code: ${error.response?.statusCode ?? "NO RESPONSE"}',
          );
          print(
            '📍 Status Message: ${error.response?.statusMessage ?? "NO MESSAGE"}',
          );
          print('\n📤 REQUEST DETAILS:');
          print('   Headers: ${error.requestOptions.headers}');
          print('   Body: ${error.requestOptions.data}');
          print('\n📥 RESPONSE DETAILS:');
          print('   Data: ${error.response?.data}');
          print('   Headers: ${error.response?.headers}');
          print(
            '🔴 ════════════════════════════════════════════════════════\n',
          );

          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            print('🔄 Attempting token refresh for 401 error...');
            try {
              final user = _auth.currentUser;
              if (user != null) {
                // Force refresh the token
                final newToken = await user.getIdToken(true);
                print('✅ Token refreshed, retrying request...');

                // Retry the request with new token
                final options = error.requestOptions;
                options.headers['Authorization'] = 'Bearer $newToken';

                final response = await _dio.fetch(options);
                return handler.resolve(response);
              } else {
                print('❌ No user to refresh token for');
              }
            } catch (e) {
              print('❌ Token refresh failed: $e');
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  // ==================== User Profile ====================

  /// Sync user with backend after Firebase sign-in
  /// This ensures the user exists in MongoDB
  Future<Map<String, dynamic>> syncUser({
    String? phone,
    List<Map<String, dynamic>>? addresses,
  }) async {
    try {
      final response = await _dio.post(
        '/public/firebase-auth/sync',
        data: {
          if (phone != null) 'phone': phone,
          if (addresses != null) 'addresses': addresses,
        },
      );

      print('✅ Backend OK: ${response.statusCode} ${response.data}');

      // Check for 400 Bad Request explicitly
      if (response.statusCode == 400) {
        print('❌ Backend returned 400: ${response.data}');
        throw Exception(
          'Backend sync failed: ${response.data['message'] ?? 'Invalid request'}',
        );
      }

      // Check for other error status codes
      if (response.statusCode != 200) {
        print('❌ Backend returned ${response.statusCode}: ${response.data}');
        throw Exception(
          'Backend sync failed with status ${response.statusCode}',
        );
      }

      return response.data;
    } on DioException catch (e) {
      print('🔴 BACKEND FAIL');
      print('URL: ${e.requestOptions.uri}');
      print('METHOD: ${e.requestOptions.method}');
      print('HEADERS: ${e.requestOptions.headers}');
      print('BODY: ${e.requestOptions.data}');
      print('STATUS: ${e.response?.statusCode}');
      print('RESP: ${e.response?.data}');
      rethrow;
    } catch (e) {
      rethrow;
    }
  }

  /// Get current user profile from MongoDB
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/public/firebase-auth/profile');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? phone,
  }) async {
    try {
      final response = await _dio.patch(
        '/public/firebase-auth/profile',
        data: {
          if (fullName != null) 'fullName': fullName,
          if (phone != null) 'phone': phone,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== Addresses ====================

  /// Add a new address
  Future<Map<String, dynamic>> addAddress({
    required String name,
    required String phone,
    required String street,
    required String city,
    required String emirate,
    String? building,
    String? apartment,
    String? instructions,
    String label = 'Home',
    bool isDefault = false,
  }) async {
    try {
      final response = await _dio.post(
        '/public/firebase-auth/addresses',
        data: {
          'name': name,
          'phone': phone,
          'street': street,
          'city': city,
          'emirate': emirate,
          if (building != null) 'building': building,
          if (apartment != null) 'apartment': apartment,
          if (instructions != null) 'instructions': instructions,
          'label': label,
          'isDefault': isDefault,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Update an existing address
  Future<Map<String, dynamic>> updateAddress(
    String addressId,
    Map<String, dynamic> updates,
  ) async {
    try {
      final response = await _dio.patch(
        '/public/firebase-auth/addresses/$addressId',
        data: updates,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Delete an address
  Future<void> deleteAddress(String addressId) async {
    try {
      await _dio.delete('/public/firebase-auth/addresses/$addressId');
    } catch (e) {
      rethrow;
    }
  }

  // ==================== Orders ====================

  /// Create a new order
  Future<Map<String, dynamic>> createOrder({
    required List<Map<String, dynamic>> items,
    required String addressId,
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        '/public/orders',
        data: {
          'items': items,
          'addressId': addressId,
          if (notes != null) 'notes': notes,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Get user's orders
  Future<Map<String, dynamic>> getOrders({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get(
        '/public/orders',
        queryParameters: {'page': page, 'limit': limit},
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Get order details
  Future<Map<String, dynamic>> getOrderDetails(String orderId) async {
    try {
      final response = await _dio.get('/public/orders/$orderId');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== Catalog ====================

  /// Get products (no auth required)
  Future<Map<String, dynamic>> getProducts({
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '/public/products',
        queryParameters: {
          if (category != null) 'category': category,
          'page': page,
          'limit': limit,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Get premium beans (no auth required)
  Future<Map<String, dynamic>> getPremiumBeans() async {
    try {
      final response = await _dio.get('/public/premium-beans');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  /// Get categories (no auth required)
  Future<Map<String, dynamic>> getCategories() async {
    try {
      final response = await _dio.get('/public/categories');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== Account ====================

  /// Delete user account
  Future<void> deleteAccount() async {
    try {
      await _dio.delete('/public/firebase-auth/account');
    } catch (e) {
      rethrow;
    }
  }
}
