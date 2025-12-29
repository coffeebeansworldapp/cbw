import 'package:json_annotation/json_annotation.dart';
import 'product.dart';

part 'cart.g.dart';

@JsonSerializable()
class CartItem {
  final String productId;
  final String variantId;
  final String productName;
  final String variantLabel;
  final String? productImage;
  final double unitPrice;
  final int qty;

  CartItem({
    required this.productId,
    required this.variantId,
    required this.productName,
    required this.variantLabel,
    this.productImage,
    required this.unitPrice,
    required this.qty,
  });

  double get lineTotal => unitPrice * qty;

  CartItem copyWith({
    String? productId,
    String? variantId,
    String? productName,
    String? variantLabel,
    String? productImage,
    double? unitPrice,
    int? qty,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      variantId: variantId ?? this.variantId,
      productName: productName ?? this.productName,
      variantLabel: variantLabel ?? this.variantLabel,
      productImage: productImage ?? this.productImage,
      unitPrice: unitPrice ?? this.unitPrice,
      qty: qty ?? this.qty,
    );
  }

  factory CartItem.fromProduct(
    Product product,
    ProductVariant variant,
    int qty,
  ) {
    return CartItem(
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label,
      productImage: product.displayImage,
      unitPrice: variant.price,
      qty: qty,
    );
  }

  factory CartItem.fromJson(Map<String, dynamic> json) =>
      _$CartItemFromJson(json);
  Map<String, dynamic> toJson() => _$CartItemToJson(this);
}

class Cart {
  final List<CartItem> items;

  Cart({this.items = const []});

  int get totalItems => items.fold(0, (sum, item) => sum + item.qty);

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.lineTotal);

  bool get isEmpty => items.isEmpty;

  bool get isNotEmpty => items.isNotEmpty;

  Cart copyWith({List<CartItem>? items}) {
    return Cart(items: items ?? this.items);
  }

  Cart addItem(CartItem item) {
    final existingIndex = items.indexWhere(
      (i) => i.productId == item.productId && i.variantId == item.variantId,
    );

    if (existingIndex >= 0) {
      final existingItem = items[existingIndex];
      final updatedItems = [...items];
      updatedItems[existingIndex] = existingItem.copyWith(
        qty: existingItem.qty + item.qty,
      );
      return Cart(items: updatedItems);
    }

    return Cart(items: [...items, item]);
  }

  Cart updateItemQty(String productId, String variantId, int qty) {
    if (qty <= 0) {
      return removeItem(productId, variantId);
    }

    final updatedItems = items.map((item) {
      if (item.productId == productId && item.variantId == variantId) {
        return item.copyWith(qty: qty);
      }
      return item;
    }).toList();

    return Cart(items: updatedItems);
  }

  Cart removeItem(String productId, String variantId) {
    final updatedItems = items
        .where(
          (item) =>
              !(item.productId == productId && item.variantId == variantId),
        )
        .toList();
    return Cart(items: updatedItems);
  }

  Cart clear() {
    return Cart(items: []);
  }

  // For API checkout payload
  List<Map<String, dynamic>> toCheckoutPayload() {
    return items
        .map(
          (item) => {
            'productId': item.productId,
            'variantId': item.variantId,
            'qty': item.qty,
          },
        )
        .toList();
  }
}
