import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../models/category.dart';
import '../../../models/product.dart';
import '../../../models/premium_bean.dart';
import '../../../models/carousel_slide.dart';

// Carousel slides provider
final carouselSlidesProvider = FutureProvider<List<CarouselSlide>>((ref) async {
  final response = await ApiClient().get(ApiConstants.carousel);
  if (response.data['success'] == true) {
    final List<dynamic> data = response.data['slides'] ?? [];
    return data.map((e) => CarouselSlide.fromJson(e)).toList();
  }
  return []; // Return empty list if no carousel
});

// Categories provider
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final response = await ApiClient().get(ApiConstants.categories);
  if (response.data['success'] == true) {
    final List<dynamic> data =
        response.data['categories'] ?? response.data['data'] ?? [];
    return data.map((e) => Category.fromJson(e)).toList();
  }
  throw Exception('Failed to load categories');
});

// Premium beans provider
final premiumBeansProvider = FutureProvider<List<PremiumBean>>((ref) async {
  final response = await ApiClient().get(ApiConstants.premiumBeans);
  if (response.data['success'] == true) {
    final List<dynamic> data =
        response.data['premiumBeans'] ?? response.data['data'] ?? [];
    return data.map((e) => PremiumBean.fromJson(e)).toList();
  }
  throw Exception('Failed to load premium beans');
});

// All products provider (for home page grid - first page)
final allProductsProvider = FutureProvider<List<Product>>((ref) async {
  print('🔍 [allProductsProvider] Fetching products...');

  try {
    final response = await ApiClient().get(
      ApiConstants.products,
      queryParameters: {'limit': 20},
    );

    print('✅ [allProductsProvider] Response received');
    print('📦 [allProductsProvider] Status: ${response.statusCode}');
    print('📦 [allProductsProvider] Success: ${response.data['success']}');
    print('📦 [allProductsProvider] Data type: ${response.data.runtimeType}');
    print('📦 [allProductsProvider] Keys: ${response.data.keys}');

    if (response.data['success'] == true) {
      final List<dynamic> data =
          response.data['products'] ?? response.data['data'] ?? [];

      print('📦 [allProductsProvider] Products count: ${data.length}');
      if (data.isNotEmpty) {
        print('📦 [allProductsProvider] First product: ${data[0]['name']}');
      }

      final products = data.map((e) => Product.fromJson(e)).toList();
      print(
        '✅ [allProductsProvider] Successfully parsed ${products.length} products',
      );
      return products;
    }

    print('❌ [allProductsProvider] API returned success=false');
    throw Exception('Failed to load products');
  } catch (e, stack) {
    print('❌ [allProductsProvider] Error: $e');
    print('❌ [allProductsProvider] Stack: $stack');
    rethrow;
  }
});

// Featured products provider (bestsellers)
final featuredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final response = await ApiClient().get(
    ApiConstants.products,
    queryParameters: {'bestseller': 'true', 'limit': 10},
  );
  if (response.data['success'] == true) {
    final List<dynamic> data =
        response.data['products'] ?? response.data['data'] ?? [];
    return data.map((e) => Product.fromJson(e)).toList();
  }
  throw Exception('Failed to load featured products');
});

// Selected category state
final selectedCategoryProvider = StateProvider<String>((ref) => 'all');

// Current products page state
final currentPageProvider = StateProvider<int>((ref) => 1);
