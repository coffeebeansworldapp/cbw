class AppConstants {
  AppConstants._();

  static const String appName = 'Coffee Beans World';
  static const String currency = 'AED';
  static const String currencySymbol = 'AED ';

  // Order status
  static const List<String> orderStatuses = [
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  // Payment methods
  static const String paymentCOD = 'COD';
  static const String paymentCard = 'CARD';

  // Fulfillment types
  static const String fulfillmentDelivery = 'DELIVERY';
  static const String fulfillmentPickup = 'PICKUP';

  // VAT percentage
  static const double vatPercentage = 5.0;

  // Delivery fee
  static const double deliveryFee = 10.0;

  // Free delivery threshold
  static const double freeDeliveryThreshold = 150.0;
}
