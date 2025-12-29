import 'package:shared_preferences/shared_preferences.dart';
import '../constants/storage_keys.dart';

class LocalStorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw Exception(
        'LocalStorageService not initialized. Call init() first.',
      );
    }
    return _prefs!;
  }

  // Cart items (stored as JSON string)
  static Future<void> saveCartItems(String cartJson) async {
    await prefs.setString(StorageKeys.cartItems, cartJson);
  }

  static String? getCartItems() {
    return prefs.getString(StorageKeys.cartItems);
  }

  static Future<void> clearCartItems() async {
    await prefs.remove(StorageKeys.cartItems);
  }

  // First launch check
  static bool isFirstLaunch() {
    return prefs.getBool(StorageKeys.isFirstLaunch) ?? true;
  }

  static Future<void> setFirstLaunchComplete() async {
    await prefs.setBool(StorageKeys.isFirstLaunch, false);
  }

  // Clear all
  static Future<void> clearAll() async {
    await prefs.clear();
  }
}
