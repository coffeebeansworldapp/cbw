import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/storage_keys.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  // Token management
  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: StorageKeys.accessToken, value: accessToken),
      _storage.write(key: StorageKeys.refreshToken, value: refreshToken),
    ]);
  }

  static Future<String?> getAccessToken() async {
    return await _storage.read(key: StorageKeys.accessToken);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: StorageKeys.refreshToken);
  }

  static Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: StorageKeys.accessToken),
      _storage.delete(key: StorageKeys.refreshToken),
    ]);
  }

  // User info
  static Future<void> saveUserInfo({
    required String id,
    required String email,
    String? name,
  }) async {
    await Future.wait([
      _storage.write(key: StorageKeys.userId, value: id),
      _storage.write(key: StorageKeys.userEmail, value: email),
      if (name != null) _storage.write(key: StorageKeys.userName, value: name),
    ]);
  }

  static Future<Map<String, String?>> getUserInfo() async {
    final results = await Future.wait([
      _storage.read(key: StorageKeys.userId),
      _storage.read(key: StorageKeys.userEmail),
      _storage.read(key: StorageKeys.userName),
    ]);
    return {'id': results[0], 'email': results[1], 'name': results[2]};
  }

  static Future<void> clearUserInfo() async {
    await Future.wait([
      _storage.delete(key: StorageKeys.userId),
      _storage.delete(key: StorageKeys.userEmail),
      _storage.delete(key: StorageKeys.userName),
    ]);
  }

  // Clear all
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
