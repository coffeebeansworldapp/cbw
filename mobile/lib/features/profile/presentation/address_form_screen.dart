import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/utils/validators.dart';
import '../../../widgets/loading.dart';

class AddressFormScreen extends ConsumerStatefulWidget {
  final String? addressId;

  const AddressFormScreen({super.key, this.addressId});

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _labelController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _streetController = TextEditingController();
  final _buildingController = TextEditingController();
  final _apartmentController = TextEditingController();
  final _cityController = TextEditingController();
  final _instructionsController = TextEditingController();
  String _selectedEmirate = 'Dubai';
  bool _isDefault = false;
  bool _isLoading = false;

  final List<String> _emirates = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.addressId != null) {
      _loadAddress();
    }
  }

  void _loadAddress() {
    final user = ref.read(authProvider).user;
    final address = user?.addresses.firstWhere(
      (a) => a.id == widget.addressId,
      orElse: () => throw Exception('Address not found'),
    );
    if (address != null) {
      _labelController.text = address.label;
      _nameController.text = address.name;
      _phoneController.text = address.phone;
      _streetController.text = address.street;
      _buildingController.text = address.building ?? '';
      _apartmentController.text = address.apartment ?? '';
      _cityController.text = address.city;
      _selectedEmirate = address.emirate;
      _instructionsController.text = address.instructions ?? '';
      _isDefault = address.isDefault;
    }
  }

  @override
  void dispose() {
    _labelController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _buildingController.dispose();
    _apartmentController.dispose();
    _cityController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final data = {
        'label': _labelController.text.trim(),
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'street': _streetController.text.trim(),
        'building': _buildingController.text.trim(),
        'apartment': _apartmentController.text.trim(),
        'city': _cityController.text.trim(),
        'emirate': _selectedEmirate,
        'instructions': _instructionsController.text.trim(),
        'isDefault': _isDefault,
      };

      if (widget.addressId != null) {
        await ApiClient().put(
          '${ApiConstants.addresses}/${widget.addressId}',
          data: data,
        );
      } else {
        await ApiClient().post(ApiConstants.addresses, data: data);
      }

      // Refresh user data
      await ref.read(authProvider.notifier).refreshUser();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.addressId != null
                  ? 'Address updated successfully'
                  : 'Address added successfully',
            ),
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to save address')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            widget.addressId != null ? 'Edit Address' : 'Add Address',
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _labelController,
                  decoration: const InputDecoration(
                    labelText: 'Label',
                    hintText: 'e.g., Home, Office',
                    prefixIcon: Icon(Icons.label_outline),
                  ),
                  validator: (value) => validateRequired(value, 'Label'),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Contact Name',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) => validateRequired(value, 'Name'),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                  validator: validatePhone,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _streetController,
                  decoration: const InputDecoration(
                    labelText: 'Street Address',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                  validator: (value) => validateRequired(value, 'Street'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _buildingController,
                        decoration: const InputDecoration(
                          labelText: 'Building',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _apartmentController,
                        decoration: const InputDecoration(
                          labelText: 'Apt/Suite',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _cityController,
                  decoration: const InputDecoration(
                    labelText: 'City',
                    prefixIcon: Icon(Icons.location_city),
                  ),
                  validator: (value) => validateRequired(value, 'City'),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _selectedEmirate,
                  decoration: const InputDecoration(
                    labelText: 'Emirate',
                    prefixIcon: Icon(Icons.map_outlined),
                  ),
                  items: _emirates.map((emirate) {
                    return DropdownMenuItem(
                      value: emirate,
                      child: Text(emirate),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _selectedEmirate = value);
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _instructionsController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Delivery Instructions (Optional)',
                    hintText: 'e.g., Ring the doorbell, leave at door',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  value: _isDefault,
                  onChanged: (value) {
                    setState(() => _isDefault = value);
                  },
                  title: const Text('Set as default address'),
                  contentPadding: EdgeInsets.zero,
                  activeTrackColor: AppColors.primary.withValues(alpha: 0.5),
                  thumbColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppColors.primary;
                    }
                    return null;
                  }),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleSave,
                  child: Text(
                    widget.addressId != null
                        ? 'Update Address'
                        : 'Save Address',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
