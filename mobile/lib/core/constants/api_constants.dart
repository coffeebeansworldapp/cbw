import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  ApiConstants._();

  // Base URL - dynamic based on platform
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:4000/api';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:4000/api';
    } catch (_) {}
    return 'http://127.0.0.1:4000/api';
  }

  // Server base URL (without /api) for static assets like images
  static String get serverBaseUrl {
    if (kIsWeb) return 'http://localhost:4000';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:4000';
    } catch (_) {}
    return 'http://127.0.0.1:4000';
  }

  // For physical device use your machine's IP: 'http://192.168.x.x:4000/api'

  /// Helper to get full image URL from relative path
  static String getImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) return '';
    // Already a full URL (Cloudinary or other)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Relative path - prepend server base URL
    return '$serverBaseUrl$imagePath';
  }

  // Auth endpoints
  static const String login = '/public/auth/login';
  static const String register = '/public/auth/register';
  static const String refreshToken = '/public/auth/refresh';
  static const String logout = '/public/auth/logout';
  static const String me = '/public/auth/me';

  // Catalog endpoints
  static const String categories = '/public/categories';
  static const String products = '/public/products';
  static const String premiumBeans = '/public/premium-beans';
  static const String carousel = '/public/carousel';
  static const String home = '/public/home';

  // Orders endpoints
  static const String orders = '/public/orders';

  // Address endpoints
  static const String addresses = '/public/addresses';

  // Timeout durations
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
