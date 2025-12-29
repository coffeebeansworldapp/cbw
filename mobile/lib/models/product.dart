import 'package:json_annotation/json_annotation.dart';
import '../core/constants/api_constants.dart';

part 'product.g.dart';

@JsonSerializable()
class ProductVariant {
  @JsonKey(name: '_id')
  final String id;
  final String label;
  final int weightGrams;
  final String sku;
  final double price;
  final double? compareAtPrice;
  final int stockQty;
  final bool active;

  ProductVariant({
    required this.id,
    required this.label,
    required this.weightGrams,
    required this.sku,
    required this.price,
    this.compareAtPrice,
    this.stockQty = 0,
    this.active = true,
  });

  bool get inStock => stockQty > 0 && active;

  factory ProductVariant.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantFromJson(json);
  Map<String, dynamic> toJson() => _$ProductVariantToJson(this);
}

@JsonSerializable()
class ProductImage {
  final String? secureUrl;
  final String? cloudinaryPublicId;

  ProductImage({this.secureUrl, this.cloudinaryPublicId});

  factory ProductImage.fromJson(Map<String, dynamic> json) =>
      _$ProductImageFromJson(json);
  Map<String, dynamic> toJson() => _$ProductImageToJson(this);
}

@JsonSerializable()
class Product {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String slug;
  final String? category;
  final String? region;
  final double basePrice;
  final String? roast;
  final String? image;
  final List<String>? features;
  final String? description;
  final String? tastingNotes;
  final String? processing;
  final bool bestseller;
  final bool inStock;
  final bool active;
  final List<ProductImage>? images;
  final List<ProductVariant> variants;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.category,
    this.region,
    required this.basePrice,
    this.roast,
    this.image,
    this.features,
    this.description,
    this.tastingNotes,
    this.processing,
    this.bestseller = false,
    this.inStock = true,
    this.active = true,
    this.images,
    this.variants = const [],
  });

  String get displayImage =>
      ApiConstants.getImageUrl(images?.firstOrNull?.secureUrl ?? image);

  ProductVariant? get defaultVariant =>
      variants.where((v) => v.active && v.stockQty > 0).firstOrNull ??
      variants.firstOrNull;

  double get displayPrice => defaultVariant?.price ?? basePrice;

  bool get hasVariantsInStock => variants.any((v) => v.inStock);

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);
}
