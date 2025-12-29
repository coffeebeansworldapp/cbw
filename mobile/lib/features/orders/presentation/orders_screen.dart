import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../widgets/loading.dart';
import '../../../widgets/error_view.dart';
import '../providers/orders_providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isGuest = authState.status == AuthStatus.guest;

    // Show sign in prompt for guest users
    if (isGuest) {
      return Scaffold(
        appBar: AppBar(title: const Text('My Orders')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.receipt_long_outlined,
                  size: 80,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(height: 24),
                Text(
                  'Sign in to view your orders',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Create an account or sign in to track your orders.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ref.read(authProvider.notifier).logout();
                      context.go(AppRoutes.login);
                    },
                    child: const Text('Sign In'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final ordersAsync = ref.watch(ordersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: ordersAsync.when(
        loading: () => const CenteredLoading(),
        error: (error, _) => ErrorView(
          message: 'Failed to load orders',
          onRetry: () => ref.invalidate(ordersProvider),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return const EmptyView(
              message: 'No orders yet',
              subtitle: 'Your order history will appear here',
              icon: Icons.receipt_long_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(ordersProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return _OrderCard(order: order);
              },
            ),
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final dynamic order;

  const _OrderCard({required this.order});

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
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/orders/${order.id}'),
        borderRadius: BorderRadius.circular(12),
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
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(
                        order.status,
                      ).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      order.statusDisplay,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _getStatusColor(order.status),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                formatOrderDate(order.createdAt),
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${order.totalItems} item${order.totalItems > 1 ? 's' : ''}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    formatPrice(order.pricing.grandTotal),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    order.fulfillment.type == 'DELIVERY'
                        ? Icons.delivery_dining
                        : Icons.store,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    order.fulfillment.type == 'DELIVERY'
                        ? 'Delivery'
                        : 'Pickup',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    order.payment.method == 'COD'
                        ? Icons.money
                        : Icons.credit_card,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    order.payment.method == 'COD' ? 'Cash' : 'Card',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
