// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductVariant _$ProductVariantFromJson(Map<String, dynamic> json) =>
    ProductVariant(
      id: json['_id'] as String,
      label: json['label'] as String,
      weightGrams: (json['weightGrams'] as num).toInt(),
      sku: json['sku'] as String,
      price: (json['price'] as num).toDouble(),
      compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble(),
      stockQty: (json['stockQty'] as num?)?.toInt() ?? 0,
      active: json['active'] as bool? ?? true,
    );

Map<String, dynamic> _$ProductVariantToJson(ProductVariant instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'label': instance.label,
      'weightGrams': instance.weightGrams,
      'sku': instance.sku,
      'price': instance.price,
      'compareAtPrice': instance.compareAtPrice,
      'stockQty': instance.stockQty,
      'active': instance.active,
    };

ProductImage _$ProductImageFromJson(Map<String, dynamic> json) => ProductImage(
  secureUrl: json['secureUrl'] as String?,
  cloudinaryPublicId: json['cloudinaryPublicId'] as String?,
);

Map<String, dynamic> _$ProductImageToJson(ProductImage instance) =>
    <String, dynamic>{
      'secureUrl': instance.secureUrl,
      'cloudinaryPublicId': instance.cloudinaryPublicId,
    };

Product _$ProductFromJson(Map<String, dynamic> json) => Product(
  id: json['_id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  category: json['category'] as String?,
  region: json['region'] as String?,
  basePrice: (json['basePrice'] as num).toDouble(),
  roast: json['roast'] as String?,
  image: json['image'] as String?,
  features: (json['features'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  description: json['description'] as String?,
  tastingNotes: json['tastingNotes'] as String?,
  processing: json['processing'] as String?,
  bestseller: json['bestseller'] as bool? ?? false,
  inStock: json['inStock'] as bool? ?? true,
  active: json['active'] as bool? ?? true,
  images: (json['images'] as List<dynamic>?)
      ?.map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
      .toList(),
  variants:
      (json['variants'] as List<dynamic>?)
          ?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$ProductToJson(Product instance) => <String, dynamic>{
  '_id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
  'category': instance.category,
  'region': instance.region,
  'basePrice': instance.basePrice,
  'roast': instance.roast,
  'image': instance.image,
  'features': instance.features,
  'description': instance.description,
  'tastingNotes': instance.tastingNotes,
  'processing': instance.processing,
  'bestseller': instance.bestseller,
  'inStock': instance.inStock,
  'active': instance.active,
  'images': instance.images,
  'variants': instance.variants,
};
