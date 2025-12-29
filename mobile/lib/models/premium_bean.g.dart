// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'premium_bean.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PremiumBean _$PremiumBeanFromJson(Map<String, dynamic> json) => PremiumBean(
  id: json['_id'] as String?,
  beanId: json['beanId'] as String,
  kicker: json['kicker'] as String?,
  titleMain: json['titleMain'] as String,
  titleSub: json['titleSub'] as String,
  desc: json['desc'] as String,
  pills: (json['pills'] as List<dynamic>).map((e) => e as String).toList(),
  image: json['image'] as String,
  imgScale: (json['imgScale'] as num?)?.toDouble(),
  imgX: (json['imgX'] as num?)?.toDouble(),
  sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
  active: json['active'] as bool? ?? true,
  productId: json['productId'] as String?,
);

Map<String, dynamic> _$PremiumBeanToJson(PremiumBean instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'beanId': instance.beanId,
      'kicker': instance.kicker,
      'titleMain': instance.titleMain,
      'titleSub': instance.titleSub,
      'desc': instance.desc,
      'pills': instance.pills,
      'image': instance.image,
      'imgScale': instance.imgScale,
      'imgX': instance.imgX,
      'sortOrder': instance.sortOrder,
      'active': instance.active,
      'productId': instance.productId,
    };
