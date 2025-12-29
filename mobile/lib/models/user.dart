import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class Address {
  @JsonKey(name: '_id')
  final String? id;
  final String label;
  final String name;
  final String phone;
  final String street;
  final String city;
  final String emirate;
  final String? building;
  final String? apartment;
  final String? instructions;
  final bool isDefault;

  Address({
    this.id,
    required this.label,
    required this.name,
    required this.phone,
    required this.street,
    required this.city,
    required this.emirate,
    this.building,
    this.apartment,
    this.instructions,
    this.isDefault = false,
  });

  factory Address.fromJson(Map<String, dynamic> json) =>
      _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);

  String get fullAddress {
    final parts = [
      street,
      building,
      apartment,
      city,
      emirate,
    ].where((p) => p != null && p.isNotEmpty).toList();
    return parts.join(', ');
  }
}

@JsonSerializable()
class User {
  @JsonKey(name: '_id', readValue: _readId)
  final String id;
  final String fullName;
  final String email;
  final String? phone;
  final List<Address> addresses;

  User({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.addresses = const [],
  });

  // Helper to read 'id' or '_id' from JSON
  static Object? _readId(Map<dynamic, dynamic> json, String key) {
    return json['_id'] ?? json['id'];
  }

  Address? get defaultAddress =>
      addresses.where((a) => a.isDefault).firstOrNull ?? addresses.firstOrNull;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
