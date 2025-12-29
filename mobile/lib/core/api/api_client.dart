import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../constants/api_constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(_authInterceptor());
    _dio.interceptors.add(_loggingInterceptor());
  }

  Dio get dio => _dio;

  InterceptorsWrapper _authInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Use Firebase ID token for authentication
        final firebaseUser = FirebaseAuth.instance.currentUser;
        if (firebaseUser != null) {
          final idToken = await firebaseUser.getIdToken();
          if (idToken != null) {
            options.headers['Authorization'] = 'Bearer $idToken';
          }
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Try to refresh Firebase ID token
          final firebaseUser = FirebaseAuth.instance.currentUser;
          if (firebaseUser != null) {
            try {
              final newToken = await firebaseUser.getIdToken(
                true,
              ); // Force refresh

              // Retry the original request
              final opts = error.requestOptions;
              opts.headers['Authorization'] = 'Bearer $newToken';

              final response = await _dio.fetch(opts);
              handler.resolve(response);
              return;
            } catch (e) {
              handler.next(error);
              return;
            }
          }
        }
        handler.next(error);
      },
    );
  }

  InterceptorsWrapper _loggingInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        if (kDebugMode) {
          developer.log(
            '🌐 REQUEST: ${options.method} ${options.uri}',
            name: 'ApiClient',
          );
          developer.log('📍 Full URL: ${options.uri}', name: 'ApiClient');
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          developer.log(
            '✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}',
            name: 'ApiClient',
          );
        }
        handler.next(response);
      },
      onError: (error, handler) {
        if (kDebugMode) {
          developer.log(
            '❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.uri}',
            name: 'ApiClient',
            error: '${error.type}: ${error.message}',
          );
          developer.log(
            '❌ ERROR DETAILS: ${error.toString()}',
            name: 'ApiClient',
          );
        }
        handler.next(error);
      },
    );
  }

  // Generic request methods
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
