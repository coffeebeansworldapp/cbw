import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class QuantitySelector extends StatelessWidget {
  final int quantity;
  final ValueChanged<int> onChanged;
  final int minValue;
  final int maxValue;
  final double size;

  const QuantitySelector({
    super.key,
    required this.quantity,
    required this.onChanged,
    this.minValue = 1,
    this.maxValue = 99,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.divider),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildButton(
            icon: Icons.remove,
            onPressed: quantity > minValue
                ? () => onChanged(quantity - 1)
                : null,
          ),
          Container(
            constraints: BoxConstraints(minWidth: size),
            alignment: Alignment.center,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              quantity.toString(),
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          _buildButton(
            icon: Icons.add,
            onPressed: quantity < maxValue
                ? () => onChanged(quantity + 1)
                : null,
          ),
        ],
      ),
    );
  }

  Widget _buildButton({required IconData icon, VoidCallback? onPressed}) {
    return SizedBox(
      width: size,
      height: size,
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, size: 18),
        onPressed: onPressed,
        color: onPressed != null ? AppColors.primary : AppColors.disabled,
      ),
    );
  }
}
