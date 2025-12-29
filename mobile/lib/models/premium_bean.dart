import 'package:json_annotation/json_annotation.dart';

part 'premium_bean.g.dart';

@JsonSerializable()
class PremiumBean {
  @JsonKey(name: '_id')
  final String? id;
  final String beanId;
  final String? kicker;
  final String titleMain;
  final String titleSub;
  final String desc;
  final List<String> pills;
  final String image;
  final double? imgScale;
  final double? imgX;
  final int sortOrder;
  final bool active;
  final String? productId;

  PremiumBean({
    this.id,
    required this.beanId,
    this.kicker,
    required this.titleMain,
    required this.titleSub,
    required this.desc,
    required this.pills,
    required this.image,
    this.imgScale,
    this.imgX,
    this.sortOrder = 0,
    this.active = true,
    this.productId,
  });

  // Convenience getters to match old usage
  String get name => '$titleMain $titleSub';
  String get origin => titleMain;
  String get description => desc;

  factory PremiumBean.fromJson(Map<String, dynamic> json) =>
      _$PremiumBeanFromJson(json);
  Map<String, dynamic> toJson() => _$PremiumBeanToJson(this);
}
