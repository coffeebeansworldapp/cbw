// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Address _$AddressFromJson(Map<String, dynamic> json) => Address(
  id: json['_id'] as String?,
  label: json['label'] as String,
  name: json['name'] as String,
  phone: json['phone'] as String,
  street: json['street'] as String,
  city: json['city'] as String,
  emirate: json['emirate'] as String,
  building: json['building'] as String?,
  apartment: json['apartment'] as String?,
  instructions: json['instructions'] as String?,
  isDefault: json['isDefault'] as bool? ?? false,
);

Map<String, dynamic> _$AddressToJson(Address instance) => <String, dynamic>{
  '_id': instance.id,
  'label': instance.label,
  'name': instance.name,
  'phone': instance.phone,
  'street': instance.street,
  'city': instance.city,
  'emirate': instance.emirate,
  'building': instance.building,
  'apartment': instance.apartment,
  'instructions': instance.instructions,
  'isDefault': instance.isDefault,
};

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: User._readId(json, '_id') as String,
  fullName: json['fullName'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String?,
  addresses:
      (json['addresses'] as List<dynamic>?)
          ?.map((e) => Address.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  '_id': instance.id,
  'fullName': instance.fullName,
  'email': instance.email,
  'phone': instance.phone,
  'addresses': instance.addresses,
};
