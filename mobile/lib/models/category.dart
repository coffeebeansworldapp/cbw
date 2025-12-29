import 'package:json_annotation/json_annotation.dart';

part 'category.g.dart';

@JsonSerializable()
class Category {
  @JsonKey(name: '_id')
  final String id;
  final String slug;
  final String name;
  final String? description;
  final int sortOrder;
  final bool active;

  Category({
    required this.id,
    required this.slug,
    required this.name,
    this.description,
    this.sortOrder = 0,
    this.active = true,
  });

  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
}
