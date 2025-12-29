import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/formatters.dart';

class PriceText extends StatelessWidget {
  final double price;
  final double? compareAtPrice;
  final TextStyle? style;
  final TextStyle? compareStyle;

  const PriceText({
    super.key,
    required this.price,
    this.compareAtPrice,
    this.style,
    this.compareStyle,
  });

  @override
  Widget build(BuildContext context) {
    final defaultStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
      fontWeight: FontWeight.bold,
      color: AppColors.primary,
    );

    if (compareAtPrice != null && compareAtPrice! > price) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(formatPrice(price), style: style ?? defaultStyle),
          const SizedBox(width: 8),
          Text(
            formatPrice(compareAtPrice!),
            style:
                compareStyle ??
                Theme.of(context).textTheme.bodySmall?.copyWith(
                  decoration: TextDecoration.lineThrough,
                  color: AppColors.textLight,
                ),
          ),
        ],
      );
    }

    return Text(formatPrice(price), style: style ?? defaultStyle);
  }
}
