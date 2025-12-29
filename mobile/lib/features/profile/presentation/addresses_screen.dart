import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/router/app_router.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../widgets/error_view.dart';

class AddressesScreen extends ConsumerStatefulWidget {
  const AddressesScreen({super.key});

  @override
  ConsumerState<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends ConsumerState<AddressesScreen> {
  bool _isLoading = false;

  Future<void> _setAsDefault(String addressId) async {
    setState(() => _isLoading = true);
    try {
      await ApiClient().patch('${ApiConstants.addresses}/$addressId/default');
      await ref.read(authProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Default address updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update default address')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _deleteAddress(String addressId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Are you sure you want to delete this address?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);
    try {
      await ApiClient().delete('${ApiConstants.addresses}/$addressId');
      await ref.read(authProvider.notifier).refreshUser();
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Address deleted')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to delete address')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final addresses = user?.addresses ?? [];

    return Stack(
      children: [
        Scaffold(
          appBar: AppBar(
            title: const Text('My Addresses'),
            actions: [
              IconButton(
                icon: const Icon(Icons.add),
                onPressed: () => context.push(AppRoutes.addAddress),
              ),
            ],
          ),
          body: addresses.isEmpty
              ? EmptyView(
                  message: 'No addresses yet',
                  subtitle: 'Add your delivery address',
                  icon: Icons.location_off,
                  action: ElevatedButton.icon(
                    onPressed: () => context.push(AppRoutes.addAddress),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Address'),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: addresses.length,
                  itemBuilder: (context, index) {
                    final address = addresses[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: Icon(
                          Icons.location_on,
                          color: address.isDefault
                              ? AppColors.primary
                              : AppColors.textSecondary,
                        ),
                        title: Row(
                          children: [
                            Text(address.label),
                            if (address.isDefault) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.1,
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Default',
                                  style: Theme.of(context).textTheme.labelSmall
                                      ?.copyWith(color: AppColors.primary),
                                ),
                              ),
                            ],
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(address.fullAddress),
                            Text(address.phone),
                          ],
                        ),
                        trailing: PopupMenuButton(
                          itemBuilder: (context) => [
                            if (!address.isDefault)
                              const PopupMenuItem(
                                value: 'default',
                                child: Row(
                                  children: [
                                    Icon(Icons.check_circle_outline, size: 20),
                                    SizedBox(width: 8),
                                    Text('Set as Default'),
                                  ],
                                ),
                              ),
                            const PopupMenuItem(
                              value: 'edit',
                              child: Row(
                                children: [
                                  Icon(Icons.edit_outlined, size: 20),
                                  SizedBox(width: 8),
                                  Text('Edit'),
                                ],
                              ),
                            ),
                            PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.delete_outline,
                                    size: 20,
                                    color: AppColors.error,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Delete',
                                    style: TextStyle(color: AppColors.error),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          onSelected: (value) {
                            switch (value) {
                              case 'default':
                                if (address.id != null) {
                                  _setAsDefault(address.id!);
                                }
                                break;
                              case 'edit':
                                context.push(
                                  '/profile/addresses/${address.id}',
                                );
                                break;
                              case 'delete':
                                if (address.id != null) {
                                  _deleteAddress(address.id!);
                                }
                                break;
                            }
                          },
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                ),
          floatingActionButton: addresses.isNotEmpty
              ? FloatingActionButton(
                  onPressed: () => context.push(AppRoutes.addAddress),
                  child: const Icon(Icons.add),
                )
              : null,
        ),
        if (_isLoading)
          Container(
            color: Colors.black.withValues(alpha: 0.3),
            child: const Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }
}
