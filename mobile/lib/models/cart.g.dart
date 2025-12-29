// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartItem _$CartItemFromJson(Map<String, dynamic> json) => CartItem(
  productId: json['productId'] as String,
  variantId: json['variantId'] as String,
  productName: json['productName'] as String,
  variantLabel: json['variantLabel'] as String,
  productImage: json['productImage'] as String?,
  unitPrice: (json['unitPrice'] as num).toDouble(),
  qty: (json['qty'] as num).toInt(),
);

Map<String, dynamic> _$CartItemToJson(CartItem instance) => <String, dynamic>{
  'productId': instance.productId,
  'variantId': instance.variantId,
  'productName': instance.productName,
  'variantLabel': instance.variantLabel,
  'productImage': instance.productImage,
  'unitPrice': instance.unitPrice,
  'qty': instance.qty,
};
