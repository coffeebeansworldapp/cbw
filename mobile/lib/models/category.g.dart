// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Category _$CategoryFromJson(Map<String, dynamic> json) => Category(
  id: json['_id'] as String,
  slug: json['slug'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
  active: json['active'] as bool? ?? true,
);

Map<String, dynamic> _$CategoryToJson(Category instance) => <String, dynamic>{
  '_id': instance.id,
  'slug': instance.slug,
  'name': instance.name,
  'description': instance.description,
  'sortOrder': instance.sortOrder,
  'active': instance.active,
};
