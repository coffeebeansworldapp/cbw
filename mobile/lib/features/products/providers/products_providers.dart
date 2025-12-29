import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../models/product.dart';

// Products list provider
class ProductsParams {
  final String? category;
  final String? search;
  final int page;
  final int limit;

  ProductsParams({this.category, this.search, this.page = 1, this.limit = 20});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProductsParams &&
          runtimeType == other.runtimeType &&
          category == other.category &&
          search == other.search &&
          page == other.page &&
          limit == other.limit;

  @override
  int get hashCode =>
      category.hashCode ^ search.hashCode ^ page.hashCode ^ limit.hashCode;
}

final productsProvider = FutureProvider.family<List<Product>, ProductsParams>((
  ref,
  params,
) async {
  final queryParams = <String, dynamic>{
    'page': params.page,
    'limit': params.limit,
  };

  if (params.category != null && params.category!.isNotEmpty) {
    queryParams['category'] = params.category;
  }
  if (params.search != null && params.search!.isNotEmpty) {
    queryParams['search'] = params.search;
  }

  final response = await ApiClient().get(
    ApiConstants.products,
    queryParameters: queryParams,
  );

  if (response.data['success'] == true) {
    final List<dynamic> data =
        response.data['products'] ?? response.data['data'] ?? [];
    return data.map((e) => Product.fromJson(e)).toList();
  }
  throw Exception('Failed to load products');
});

// Single product detail provider
final productDetailProvider = FutureProvider.family<Product, String>((
  ref,
  productId,
) async {
  final response = await ApiClient().get('${ApiConstants.products}/$productId');

  if (response.data['success'] == true) {
    return Product.fromJson(response.data['product'] ?? response.data['data']);
  }
  throw Exception('Failed to load product');
});
