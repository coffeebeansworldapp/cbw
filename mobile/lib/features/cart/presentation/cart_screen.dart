import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../widgets/app_network_image.dart';
import '../../../widgets/error_view.dart';
import '../../../widgets/quantity_selector.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        actions: [
          if (cart.isNotEmpty)
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Clear Cart'),
                    content: const Text('Remove all items from your cart?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          ref.read(cartProvider.notifier).clearCart();
                          Navigator.pop(context);
                        },
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Clear'),
            ),
        ],
      ),
      body: cart.isEmpty
          ? EmptyView(
              message: 'Your cart is empty',
              subtitle: 'Add some delicious coffee to get started',
              icon: Icons.shopping_cart_outlined,
              action: ElevatedButton(
                onPressed: () => context.go(AppRoutes.products),
                child: const Text('Browse Products'),
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.items.length,
                    itemBuilder: (context, index) {
                      final item = cart.items[index];
                      return _CartItemCard(item: item);
                    },
                  ),
                ),
                _CartSummary(cart: cart),
              ],
            ),
    );
  }
}

class _CartItemCard extends ConsumerWidget {
  final dynamic item;

  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: AppNetworkImage(
                imageUrl: item.productImage,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.productName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.variantLabel,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    formatPrice(item.unitPrice),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            // Quantity and remove
            Column(
              children: [
                QuantitySelector(
                  quantity: item.qty,
                  onChanged: (value) {
                    ref
                        .read(cartProvider.notifier)
                        .updateQuantity(item.productId, item.variantId, value);
                  },
                  size: 28,
                ),
                const SizedBox(height: 8),
                IconButton(
                  icon: const Icon(
                    Icons.delete_outline,
                    color: AppColors.error,
                  ),
                  onPressed: () {
                    ref
                        .read(cartProvider.notifier)
                        .removeFromCart(item.productId, item.variantId);
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CartSummary extends ConsumerWidget {
  final dynamic cart;

  const _CartSummary({required this.cart});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isGuest = authState.status == AuthStatus.guest;
    final subtotal = cart.subtotal;
    final deliveryFee = subtotal >= AppConstants.freeDeliveryThreshold
        ? 0.0
        : AppConstants.deliveryFee;
    final vat = (subtotal + deliveryFee) * (AppConstants.vatPercentage / 100);
    final total = subtotal + deliveryFee + vat;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          children: [
            _SummaryRow(label: 'Subtotal', value: formatPrice(subtotal)),
            const SizedBox(height: 8),
            _SummaryRow(
              label: 'Delivery',
              value: deliveryFee == 0 ? 'Free' : formatPrice(deliveryFee),
              valueColor: deliveryFee == 0 ? AppColors.success : null,
            ),
            if (deliveryFee > 0)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Free delivery on orders over ${formatPrice(AppConstants.freeDeliveryThreshold)}',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: AppColors.textLight),
                ),
              ),
            const SizedBox(height: 8),
            _SummaryRow(
              label: 'VAT (${AppConstants.vatPercentage.toInt()}%)',
              value: formatPrice(vat),
            ),
            const Divider(height: 24),
            _SummaryRow(
              label: 'Total',
              value: formatPrice(total),
              isBold: true,
            ),
            const SizedBox(height: 16),
            if (isGuest) ...[
              // Guest user - show sign in prompt
              Text(
                'Sign in to checkout',
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(authProvider.notifier).logout();
                    context.go(AppRoutes.login);
                  },
                  child: const Text('Sign In to Checkout'),
                ),
              ),
            ] else ...[
              // Authenticated user
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push(AppRoutes.checkout),
                  child: const Text('Proceed to Checkout'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
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
