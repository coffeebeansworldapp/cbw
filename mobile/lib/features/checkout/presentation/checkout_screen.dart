import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../widgets/loading.dart';
import '../../orders/providers/orders_providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _fulfillmentType = AppConstants.fulfillmentDelivery;
  String _paymentMethod = AppConstants.paymentCOD;
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleCheckout() async {
    final cart = ref.read(cartProvider);
    final user = ref.read(authProvider).user;

    if (cart.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Your cart is empty')));
      return;
    }

    // Get address snapshot
    Map<String, dynamic>? addressSnapshot;
    if (_fulfillmentType == AppConstants.fulfillmentDelivery) {
      final defaultAddress = user?.defaultAddress;
      if (defaultAddress == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please add a delivery address')),
        );
        context.push(AppRoutes.addAddress);
        return;
      }
      addressSnapshot = defaultAddress.toJson();
    }

    final order = await ref
        .read(createOrderProvider.notifier)
        .createOrder(
          items: cart.toCheckoutPayload(),
          fulfillmentType: _fulfillmentType,
          addressSnapshot: addressSnapshot,
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
          paymentMethod: _paymentMethod,
        );

    if (order != null && mounted) {
      ref.read(cartProvider.notifier).clearCart();
      ref.invalidate(ordersProvider);

      // Show success dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.success, size: 28),
              SizedBox(width: 8),
              Text('Order Placed!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Order #${order.orderNo}'),
              const SizedBox(height: 8),
              Text('Total: ${formatPrice(order.pricing.grandTotal)}'),
              const SizedBox(height: 8),
              const Text('You will receive a confirmation soon.'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.orders);
              },
              child: const Text('View Orders'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.home);
              },
              child: const Text('Continue Shopping'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final user = ref.watch(authProvider).user;
    final createOrderState = ref.watch(createOrderProvider);

    final subtotal = cart.subtotal;
    final deliveryFee = _fulfillmentType == AppConstants.fulfillmentPickup
        ? 0.0
        : (subtotal >= AppConstants.freeDeliveryThreshold
              ? 0.0
              : AppConstants.deliveryFee);
    final vat = (subtotal + deliveryFee) * (AppConstants.vatPercentage / 100);
    final total = subtotal + deliveryFee + vat;

    return LoadingOverlay(
      isLoading: createOrderState.isLoading,
      message: 'Placing your order...',
      child: Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Fulfillment type
              Text(
                'Delivery Method',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _OptionCard(
                      icon: Icons.delivery_dining,
                      label: 'Delivery',
                      isSelected:
                          _fulfillmentType == AppConstants.fulfillmentDelivery,
                      onTap: () {
                        setState(
                          () => _fulfillmentType =
                              AppConstants.fulfillmentDelivery,
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _OptionCard(
                      icon: Icons.store,
                      label: 'Pickup',
                      isSelected:
                          _fulfillmentType == AppConstants.fulfillmentPickup,
                      onTap: () {
                        setState(
                          () =>
                              _fulfillmentType = AppConstants.fulfillmentPickup,
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Delivery address (if delivery)
              if (_fulfillmentType == AppConstants.fulfillmentDelivery) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Delivery Address',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    TextButton(
                      onPressed: () => context.push(AppRoutes.addresses),
                      child: const Text('Change'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (user?.defaultAddress != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                user!.defaultAddress!.label,
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(user.defaultAddress!.fullAddress),
                          const SizedBox(height: 4),
                          Text(user.defaultAddress!.phone),
                        ],
                      ),
                    ),
                  )
                else
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.add_location),
                      title: const Text('Add delivery address'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push(AppRoutes.addAddress),
                    ),
                  ),
                const SizedBox(height: 24),
              ],

              // Payment method
              Text(
                'Payment Method',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              _OptionCard(
                icon: Icons.money,
                label: 'Cash on Delivery',
                isSelected: _paymentMethod == AppConstants.paymentCOD,
                onTap: () {
                  setState(() => _paymentMethod = AppConstants.paymentCOD);
                },
              ),
              const SizedBox(height: 8),
              _OptionCard(
                icon: Icons.credit_card,
                label: 'Card Payment',
                subtitle: 'Coming soon',
                isSelected: _paymentMethod == AppConstants.paymentCard,
                enabled: false,
                onTap: null,
              ),
              const SizedBox(height: 24),

              // Order notes
              Text(
                'Order Notes (Optional)',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Any special instructions...',
                ),
              ),
              const SizedBox(height: 24),

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
                      ...cart.items.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '${item.productName} (${item.variantLabel}) x${item.qty}',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ),
                              Text(formatPrice(item.lineTotal)),
                            ],
                          ),
                        ),
                      ),
                      const Divider(),
                      _SummaryRow(
                        label: 'Subtotal',
                        value: formatPrice(subtotal),
                      ),
                      const SizedBox(height: 4),
                      _SummaryRow(
                        label: 'Delivery',
                        value: deliveryFee == 0
                            ? 'Free'
                            : formatPrice(deliveryFee),
                      ),
                      const SizedBox(height: 4),
                      _SummaryRow(
                        label: 'VAT (${AppConstants.vatPercentage.toInt()}%)',
                        value: formatPrice(vat),
                      ),
                      const Divider(),
                      _SummaryRow(
                        label: 'Total',
                        value: formatPrice(total),
                        isBold: true,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Error message
              if (createOrderState.error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.error),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          createOrderState.error!,
                          style: const TextStyle(color: AppColors.error),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Place order button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: createOrderState.isLoading
                      ? null
                      : _handleCheckout,
                  child: Text('Place Order - ${formatPrice(total)}'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final bool isSelected;
  final bool enabled;
  final VoidCallback? onTap;

  const _OptionCard({
    required this.icon,
    required this.label,
    this.subtitle,
    required this.isSelected,
    this.enabled = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : null,
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.divider,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: enabled
                    ? (isSelected ? AppColors.primary : AppColors.textSecondary)
                    : AppColors.disabled,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: enabled ? null : AppColors.disabled,
                      ),
                    ),
                    if (subtitle != null)
                      Text(
                        subtitle!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textLight,
                        ),
                      ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(Icons.check_circle, color: AppColors.primary),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
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
          style: isBold
              ? Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)
              : Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }
}
