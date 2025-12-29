class CarouselSlide {
  final String id;
  final String title;
  final String? subtitle;
  final String imageUrl;
  final String? ctaLabel;
  final String? ctaType; // PRODUCT, CATEGORY, COLLECTION, URL, NONE
  final String? ctaValue;
  final int sortOrder;
  final bool active;

  CarouselSlide({
    required this.id,
    required this.title,
    this.subtitle,
    required this.imageUrl,
    this.ctaLabel,
    this.ctaType,
    this.ctaValue,
    this.sortOrder = 0,
    this.active = true,
  });

  factory CarouselSlide.fromJson(Map<String, dynamic> json) {
    return CarouselSlide(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      imageUrl: json['imageUrl'] ?? '',
      ctaLabel: json['ctaLabel'],
      ctaType: json['ctaType'],
      ctaValue: json['ctaValue'],
      sortOrder: json['sortOrder'] ?? 0,
      active: json['active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'title': title,
    'subtitle': subtitle,
    'imageUrl': imageUrl,
    'ctaLabel': ctaLabel,
    'ctaType': ctaType,
    'ctaValue': ctaValue,
    'sortOrder': sortOrder,
    'active': active,
  };
}
