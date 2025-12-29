// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderItemVariantSnapshot _$OrderItemVariantSnapshotFromJson(
  Map<String, dynamic> json,
) => OrderItemVariantSnapshot(
  label: json['label'] as String,
  weightGrams: (json['weightGrams'] as num).toInt(),
  sku: json['sku'] as String,
);

Map<String, dynamic> _$OrderItemVariantSnapshotToJson(
  OrderItemVariantSnapshot instance,
) => <String, dynamic>{
  'label': instance.label,
  'weightGrams': instance.weightGrams,
  'sku': instance.sku,
};

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) => OrderItem(
  productId: json['productId'] as String,
  variantId: json['variantId'] as String,
  nameSnapshot: json['nameSnapshot'] as String,
  variantSnapshot: OrderItemVariantSnapshot.fromJson(
    json['variantSnapshot'] as Map<String, dynamic>,
  ),
  unitPrice: (json['unitPrice'] as num).toDouble(),
  qty: (json['qty'] as num).toInt(),
  lineTotal: (json['lineTotal'] as num).toDouble(),
);

Map<String, dynamic> _$OrderItemToJson(OrderItem instance) => <String, dynamic>{
  'productId': instance.productId,
  'variantId': instance.variantId,
  'nameSnapshot': instance.nameSnapshot,
  'variantSnapshot': instance.variantSnapshot,
  'unitPrice': instance.unitPrice,
  'qty': instance.qty,
  'lineTotal': instance.lineTotal,
};

OrderPricing _$OrderPricingFromJson(Map<String, dynamic> json) => OrderPricing(
  subtotal: (json['subtotal'] as num).toDouble(),
  discount: (json['discount'] as num?)?.toDouble() ?? 0,
  deliveryFee: (json['deliveryFee'] as num).toDouble(),
  vat: (json['vat'] as num).toDouble(),
  grandTotal: (json['grandTotal'] as num).toDouble(),
);

Map<String, dynamic> _$OrderPricingToJson(OrderPricing instance) =>
    <String, dynamic>{
      'subtotal': instance.subtotal,
      'discount': instance.discount,
      'deliveryFee': instance.deliveryFee,
      'vat': instance.vat,
      'grandTotal': instance.grandTotal,
    };

OrderPayment _$OrderPaymentFromJson(Map<String, dynamic> json) => OrderPayment(
  method: json['method'] as String,
  status: json['status'] as String,
  provider: json['provider'] as String?,
  transactionId: json['transactionId'] as String?,
);

Map<String, dynamic> _$OrderPaymentToJson(OrderPayment instance) =>
    <String, dynamic>{
      'method': instance.method,
      'status': instance.status,
      'provider': instance.provider,
      'transactionId': instance.transactionId,
    };

OrderFulfillment _$OrderFulfillmentFromJson(Map<String, dynamic> json) =>
    OrderFulfillment(
      type: json['type'] as String,
      addressSnapshot: json['addressSnapshot'] as Map<String, dynamic>?,
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$OrderFulfillmentToJson(OrderFulfillment instance) =>
    <String, dynamic>{
      'type': instance.type,
      'addressSnapshot': instance.addressSnapshot,
      'notes': instance.notes,
    };

OrderHistoryEntry _$OrderHistoryEntryFromJson(Map<String, dynamic> json) =>
    OrderHistoryEntry(
      status: json['status'] as String,
      at: DateTime.parse(json['at'] as String),
      byRole: json['byRole'] as String?,
      byId: json['byId'] as String?,
      note: json['note'] as String?,
    );

Map<String, dynamic> _$OrderHistoryEntryToJson(OrderHistoryEntry instance) =>
    <String, dynamic>{
      'status': instance.status,
      'at': instance.at.toIso8601String(),
      'byRole': instance.byRole,
      'byId': instance.byId,
      'note': instance.note,
    };

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
  id: json['_id'] as String,
  orderNo: json['orderNo'] as String,
  customerId: json['customerId'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  pricing: OrderPricing.fromJson(json['pricing'] as Map<String, dynamic>),
  payment: OrderPayment.fromJson(json['payment'] as Map<String, dynamic>),
  fulfillment: OrderFulfillment.fromJson(
    json['fulfillment'] as Map<String, dynamic>,
  ),
  status: json['status'] as String,
  adminNotes: json['adminNotes'] as String?,
  history:
      (json['history'] as List<dynamic>?)
          ?.map((e) => OrderHistoryEntry.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
  '_id': instance.id,
  'orderNo': instance.orderNo,
  'customerId': instance.customerId,
  'items': instance.items,
  'pricing': instance.pricing,
  'payment': instance.payment,
  'fulfillment': instance.fulfillment,
  'status': instance.status,
  'adminNotes': instance.adminNotes,
  'history': instance.history,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};
