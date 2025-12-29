import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../widgets/loading.dart';
import '../../../widgets/error_view.dart';
import '../providers/orders_providers.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return AppColors.statusPending;
      case 'CONFIRMED':
        return AppColors.statusConfirmed;
      case 'PREPARING':
        return AppColors.statusPreparing;
      case 'OUT_FOR_DELIVERY':
        return AppColors.statusOutForDelivery;
      case 'DELIVERED':
        return AppColors.statusDelivered;
      case 'CANCELLED':
        return AppColors.statusCancelled;
      case 'REFUNDED':
        return AppColors.statusRefunded;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: orderAsync.when(
        loading: () => const CenteredLoading(),
        error: (error, _) => ErrorView(
          message: 'Failed to load order',
          onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
        ),
        data: (order) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order header
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              order.orderNo,
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusColor(
                                  order.status,
                                ).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                order.statusDisplay,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: _getStatusColor(order.status),
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Placed on ${formatDateTime(order.createdAt)}',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Order status timeline
                Text(
                  'Order Status',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: order.history.reversed.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                margin: const EdgeInsets.only(top: 4),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(entry.status),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _getStatusDisplay(entry.status),
                                      style: Theme.of(
                                        context,
                                      ).textTheme.titleSmall,
                                    ),
                                    Text(
                                      formatDateTime(entry.at),
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodySmall,
                                    ),
                                    if (entry.note != null)
                                      Text(
                                        entry.note!,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                              color: AppColors.textSecondary,
                                            ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Items
                Text('Items', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: order.items.map((item) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text(
                                    'x${item.qty}',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.titleSmall,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.nameSnapshot,
                                      style: Theme.of(
                                        context,
                                      ).textTheme.titleSmall,
                                    ),
                                    Text(
                                      item.variantSnapshot.label,
                                      style: Theme.of(
                                        context,
                                      ).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                formatPrice(item.lineTotal),
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Delivery info
                if (order.fulfillment.type == 'DELIVERY' &&
                    order.fulfillment.addressSnapshot != null) ...[
                  Text(
                    'Delivery Address',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  order.fulfillment.addressSnapshot!['name'] ??
                                      '',
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                                Text(
                                  _buildAddressString(
                                    order.fulfillment.addressSnapshot!,
                                  ),
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                Text(
                                  order.fulfillment.addressSnapshot!['phone'] ??
                                      '',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Payment info
                Text('Payment', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(
                          order.payment.method == 'COD'
                              ? Icons.money
                              : Icons.credit_card,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            order.payment.method == 'COD'
                                ? 'Cash on Delivery'
                                : 'Card Payment',
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: order.payment.status == 'PAID'
                                ? AppColors.success.withValues(alpha: 0.1)
                                : AppColors.warning.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            order.payment.status,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: order.payment.status == 'PAID'
                                      ? AppColors.success
                                      : AppColors.warning,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Order summary
                Text(
                  'Order Summary',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _SummaryRow(
                          label: 'Subtotal',
                          value: formatPrice(order.pricing.subtotal),
                        ),
                        const SizedBox(height: 8),
                        _SummaryRow(
                          label: 'Delivery',
                          value: order.pricing.deliveryFee == 0
                              ? 'Free'
                              : formatPrice(order.pricing.deliveryFee),
                        ),
                        if (order.pricing.discount > 0) ...[
                          const SizedBox(height: 8),
                          _SummaryRow(
                            label: 'Discount',
                            value: '-${formatPrice(order.pricing.discount)}',
                            valueColor: AppColors.success,
                          ),
                        ],
                        const SizedBox(height: 8),
                        _SummaryRow(
                          label: 'VAT',
                          value: formatPrice(order.pricing.vat),
                        ),
                        const Divider(height: 24),
                        _SummaryRow(
                          label: 'Total',
                          value: formatPrice(order.pricing.grandTotal),
                          isBold: true,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  String _getStatusDisplay(String status) {
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

  String _buildAddressString(Map<String, dynamic> address) {
    final parts = [
      address['street'],
      address['building'],
      address['apartment'],
      address['city'],
      address['emirate'],
    ].where((p) => p != null && p.isNotEmpty).toList();
    return parts.join(', ');
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: isBold
              ? Theme.of(context).textTheme.titleMedium
              : Theme.of(context).textTheme.bodyMedium,
        ),
        Text(
          value,
          style:
              (isBold
                      ? Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        )
                      : Theme.of(context).textTheme.bodyMedium)
                  ?.copyWith(color: valueColor),
        ),
      ],
    );
  }
}
