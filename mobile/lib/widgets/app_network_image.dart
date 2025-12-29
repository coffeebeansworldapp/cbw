import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../core/constants/api_constants.dart';
import '../core/theme/app_theme.dart';

class AppNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  const AppNetworkImage({
    super.key,
    this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final resolvedUrl = ApiConstants.getImageUrl(imageUrl);

    if (resolvedUrl.isEmpty) {
      return _placeholder();
    }

    Widget image = CachedNetworkImage(
      imageUrl: resolvedUrl,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => _shimmer(),
      errorWidget: (context, url, error) => _placeholder(),
    );

    if (borderRadius != null) {
      image = ClipRRect(borderRadius: borderRadius!, child: image);
    }

    return image;
  }

  Widget _placeholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.shimmerBase,
        borderRadius: borderRadius,
      ),
      child: Icon(
        Icons.coffee,
        size: (width ?? height ?? 100) / 3,
        color: AppColors.textLight,
      ),
    );
  }

  Widget _shimmer() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.shimmerBase,
        borderRadius: borderRadius,
      ),
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
    );
  }
}
