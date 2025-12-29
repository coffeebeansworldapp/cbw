import 'package:json_annotation/json_annotation.dart';

part 'order.g.dart';

@JsonSerializable()
class OrderItemVariantSnapshot {
  final String label;
  final int weightGrams;
  final String sku;

  OrderItemVariantSnapshot({
    required this.label,
    required this.weightGrams,
    required this.sku,
  });

  factory OrderItemVariantSnapshot.fromJson(Map<String, dynamic> json) =>
      _$OrderItemVariantSnapshotFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemVariantSnapshotToJson(this);
}

@JsonSerializable()
class OrderItem {
  final String productId;
  final String variantId;
  final String nameSnapshot;
  final OrderItemVariantSnapshot variantSnapshot;
  final double unitPrice;
  final int qty;
  final double lineTotal;

  OrderItem({
    required this.productId,
    required this.variantId,
    required this.nameSnapshot,
    required this.variantSnapshot,
    required this.unitPrice,
    required this.qty,
    required this.lineTotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) =>
      _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);
}

@JsonSerializable()
class OrderPricing {
  final double subtotal;
  final double discount;
  final double deliveryFee;
  final double vat;
  final double grandTotal;

  OrderPricing({
    required this.subtotal,
    this.discount = 0,
    required this.deliveryFee,
    required this.vat,
    required this.grandTotal,
  });

  factory OrderPricing.fromJson(Map<String, dynamic> json) =>
      _$OrderPricingFromJson(json);
  Map<String, dynamic> toJson() => _$OrderPricingToJson(this);
}

@JsonSerializable()
class OrderPayment {
  final String method;
  final String status;
  final String? provider;
  final String? transactionId;

  OrderPayment({
    required this.method,
    required this.status,
    this.provider,
    this.transactionId,
  });

  factory OrderPayment.fromJson(Map<String, dynamic> json) =>
      _$OrderPaymentFromJson(json);
  Map<String, dynamic> toJson() => _$OrderPaymentToJson(this);
}

@JsonSerializable()
class OrderFulfillment {
  final String type;
  final Map<String, dynamic>? addressSnapshot;
  final String? notes;

  OrderFulfillment({required this.type, this.addressSnapshot, this.notes});

  factory OrderFulfillment.fromJson(Map<String, dynamic> json) =>
      _$OrderFulfillmentFromJson(json);
  Map<String, dynamic> toJson() => _$OrderFulfillmentToJson(this);
}

@JsonSerializable()
class OrderHistoryEntry {
  final String status;
  final DateTime at;
  final String? byRole;
  final String? byId;
  final String? note;

  OrderHistoryEntry({
    required this.status,
    required this.at,
    this.byRole,
    this.byId,
    this.note,
  });

  factory OrderHistoryEntry.fromJson(Map<String, dynamic> json) =>
      _$OrderHistoryEntryFromJson(json);
  Map<String, dynamic> toJson() => _$OrderHistoryEntryToJson(this);
}

@JsonSerializable()
class Order {
  @JsonKey(name: '_id')
  final String id;
  final String orderNo;
  final String customerId;
  final List<OrderItem> items;
  final OrderPricing pricing;
  final OrderPayment payment;
  final OrderFulfillment fulfillment;
  final String status;
  final String? adminNotes;
  final List<OrderHistoryEntry> history;
  final DateTime createdAt;
  final DateTime updatedAt;

  Order({
    required this.id,
    required this.orderNo,
    required this.customerId,
    required this.items,
    required this.pricing,
    required this.payment,
    required this.fulfillment,
    required this.status,
    this.adminNotes,
    this.history = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderToJson(this);

  int get totalItems => items.fold(0, (sum, item) => sum + item.qty);

  String get statusDisplay {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return 'Pending Confirmation';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  }
}
