import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../models/product.dart';
import '../../../models/carousel_slide.dart';
import '../../../widgets/app_network_image.dart';
import '../providers/home_providers.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _selectedCategory = 'all';
  int _currentCarouselIndex = 0;
  int _currentPremiumIndex = 0;
  late PageController _carouselController;
  late PageController _premiumController;

  @override
  void initState() {
    super.initState();
    _carouselController = PageController();
    _premiumController = PageController();
    _startCarouselAutoScroll();
    _startPremiumAutoScroll();
  }

  void _startCarouselAutoScroll() {
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        final slides = ref.read(carouselSlidesProvider).valueOrNull ?? [];
        if (slides.isNotEmpty && _carouselController.hasClients) {
          final nextIndex = (_currentCarouselIndex + 1) % slides.length;
          _carouselController.animateToPage(
            nextIndex,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
          );
        }
        _startCarouselAutoScroll();
      }
    });
  }

  void _startPremiumAutoScroll() {
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        final beans = ref.read(premiumBeansProvider).valueOrNull ?? [];
        if (beans.isNotEmpty && _premiumController.hasClients) {
          final nextIndex = (_currentPremiumIndex + 1) % beans.length;
          _premiumController.animateToPage(
            nextIndex,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
        }
        _startPremiumAutoScroll();
      }
    });
  }

  @override
  void dispose() {
    _carouselController.dispose();
    _premiumController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartItemCount = ref.watch(cartProvider).items.length;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(carouselSlidesProvider);
          ref.invalidate(premiumBeansProvider);
          ref.invalidate(categoriesProvider);
          ref.invalidate(allProductsProvider);
        },
        child: CustomScrollView(
          slivers: [
            // App Bar with Search and Cart
            SliverAppBar(
              floating: true,
              title: Row(
                children: [
                  Image.asset(
                    'assets/images/cbw-logo.png',
                    width: 32,
                    height: 32,
                    errorBuilder: (_, __, ___) => Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.coffee,
                        size: 18,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Coffee Beans World',
                    style: TextStyle(fontSize: 16),
                  ),
                ],
              ),
              actions: [
                // Search button
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () => context.push('/search'),
                ),
                // Cart button with badge
                Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.shopping_cart_outlined),
                      onPressed: () => context.push('/cart'),
                    ),
                    if (cartItemCount > 0)
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: AppColors.secondary,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            cartItemCount.toString(),
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 8),
              ],
            ),

            // Hero Carousel Section
            SliverToBoxAdapter(child: _buildCarouselSection()),

            // Premium Beans Section
            SliverToBoxAdapter(child: _buildPremiumBeansSection()),

            // Category Chips
            SliverToBoxAdapter(child: _buildCategoryChips()),

            // Products Grid
            _buildProductsGrid(),

            // Bottom padding for nav bar
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  // ==================== CAROUSEL SECTION ====================
  Widget _buildCarouselSection() {
    final carouselAsync = ref.watch(carouselSlidesProvider);

    return carouselAsync.when(
      loading: () => _buildCarouselSkeleton(),
      error: (_, __) => const SizedBox.shrink(),
      data: (slides) {
        if (slides.isEmpty) return const SizedBox.shrink();
        return SizedBox(
          height: 200,
          child: Stack(
            children: [
              PageView.builder(
                controller: _carouselController,
                onPageChanged: (index) =>
                    setState(() => _currentCarouselIndex = index),
                itemCount: slides.length,
                itemBuilder: (context, index) =>
                    _buildCarouselSlide(slides[index]),
              ),
              // Page indicators
              Positioned(
                bottom: 12,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    slides.length,
                    (index) => Container(
                      width: index == _currentCarouselIndex ? 20 : 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: index == _currentCarouselIndex
                            ? Colors.white
                            : Colors.white.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCarouselSlide(CarouselSlide slide) {
    return GestureDetector(
      onTap: () => _handleCarouselTap(slide),
      child: Stack(
        fit: StackFit.expand,
        children: [
          AppNetworkImage(imageUrl: slide.imageUrl, fit: BoxFit.cover),
          // Gradient overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.7),
                ],
              ),
            ),
          ),
          // Content
          Positioned(
            left: 16,
            right: 16,
            bottom: 40,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slide.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (slide.subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    slide.subtitle!,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontSize: 14,
                    ),
                  ),
                ],
                if (slide.ctaLabel != null && slide.ctaType != 'NONE') ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.secondary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      slide.ctaLabel!,
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleCarouselTap(CarouselSlide slide) {
    switch (slide.ctaType) {
      case 'PRODUCT':
        if (slide.ctaValue != null) context.push('/products/${slide.ctaValue}');
        break;
      case 'CATEGORY':
        if (slide.ctaValue != null) {
          setState(() => _selectedCategory = slide.ctaValue!);
        }
        break;
      case 'COLLECTION':
        context.push('/products?collection=${slide.ctaValue}');
        break;
      case 'URL':
        // Open URL in browser
        break;
    }
  }

  Widget _buildCarouselSkeleton() {
    return Container(
      height: 200,
      color: Colors.grey[200],
      child: const Center(child: CircularProgressIndicator()),
    );
  }

  // ==================== PREMIUM BEANS SECTION ====================
  Widget _buildPremiumBeansSection() {
    final premiumAsync = ref.watch(premiumBeansProvider);

    return premiumAsync.when(
      loading: () => _buildPremiumSkeleton(),
      error: (_, __) => const SizedBox.shrink(),
      data: (beans) {
        if (beans.isEmpty) return const SizedBox.shrink();
        return Container(
          height: 300,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF120a07), Color(0xFF2a1812)],
            ),
          ),
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    const Icon(
                      Icons.star,
                      color: AppColors.secondary,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Premium Collection',
                      style: TextStyle(
                        color: AppColors.secondary.withValues(alpha: 0.9),
                        fontSize: 12,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              // Premium Bean Showcase
              Expanded(
                child: PageView.builder(
                  controller: _premiumController,
                  onPageChanged: (index) =>
                      setState(() => _currentPremiumIndex = index),
                  itemCount: beans.length,
                  itemBuilder: (context, index) =>
                      _buildPremiumCard(beans[index]),
                ),
              ),
              // Indicators
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    beans.length,
                    (index) => Container(
                      width: index == _currentPremiumIndex ? 20 : 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: index == _currentPremiumIndex
                            ? AppColors.secondary
                            : AppColors.secondary.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPremiumCard(dynamic bean) {
    return GestureDetector(
      onTap: () {
        if (bean.productId != null) {
          context.push('/products/${bean.productId}');
        } else {
          setState(() => _selectedCategory = 'premium');
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            Expanded(
              flex: 5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Kicker text
                  if (bean.kicker != null)
                    Text(
                      bean.kicker!,
                      style: TextStyle(
                        color: AppColors.secondary.withValues(alpha: 0.7),
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  const SizedBox(height: 4),
                  // Title Main
                  Text(
                    bean.titleMain,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      height: 1.1,
                    ),
                  ),
                  // Title Sub
                  Text(
                    bean.titleSub,
                    style: const TextStyle(
                      color: AppColors.secondary,
                      fontSize: 24,
                      fontWeight: FontWeight.w300,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Description
                  Text(
                    bean.desc,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 12,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Pills (badges)
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: bean.pills
                        .take(2)
                        .map<Widget>(
                          (pill) => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: AppColors.secondary.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              pill,
                              style: TextStyle(
                                color: AppColors.secondary.withValues(
                                  alpha: 0.9,
                                ),
                                fontSize: 9,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 12),
                  // CTA Button
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.secondary,
                          AppColors.secondary.withValues(alpha: 0.8),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.secondary.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Text(
                      'Shop Collection',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 4,
              child: Transform.scale(
                scale: bean.imgScale ?? 1.0,
                child: Transform.translate(
                  offset: Offset(bean.imgX ?? 0, 0),
                  child: AppNetworkImage(
                    imageUrl: bean.image,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPremiumSkeleton() {
    return Container(
      height: 300,
      color: AppColors.primary,
      child: const Center(
        child: CircularProgressIndicator(color: AppColors.secondary),
      ),
    );
  }

  // ==================== CATEGORY CHIPS ====================
  Widget _buildCategoryChips() {
    final categoriesAsync = ref.watch(categoriesProvider);

    return categoriesAsync.when(
      loading: () => const SizedBox(height: 60),
      error: (_, __) => const SizedBox.shrink(),
      data: (categories) {
        final allCategories = categories.any((c) => c.slug == 'all')
            ? categories.map((c) => _CategoryItem(slug: c.slug, name: c.name)).toList()
            : [
                _CategoryItem(slug: 'all', name: 'All'),
                ...categories.map((c) => _CategoryItem(slug: c.slug, name: c.name)),
              ];

        return Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Our Coffee Collection',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: allCategories.map((cat) {
                    final isSelected = _selectedCategory == cat.slug;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: FilterChip(
                        selected: isSelected,
                        label: Text(cat.name),
                        labelStyle: TextStyle(
                          color: isSelected
                               ? Colors.white
                               : AppColors.textPrimary,
                          fontWeight: isSelected
                               ? FontWeight.bold
                               : FontWeight.normal,
                        ),
                        backgroundColor: AppColors.surface,
                        selectedColor: AppColors.primary,
                        showCheckmark: false,
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = cat.slug;
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ==================== PRODUCTS GRID ====================
  Widget _buildProductsGrid() {
    final productsAsync = ref.watch(allProductsProvider);

    return productsAsync.when(
      loading: () => SliverToBoxAdapter(child: _buildProductsSkeleton()),
      error: (error, _) => SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('Failed to load products'),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(allProductsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      data: (products) {
        final filtered = _selectedCategory == 'all'
            ? products
            : products.where((p) => p.category == _selectedCategory).toList();

        if (filtered.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.coffee, size: 48, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No products in this category',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
          );
        }

        return SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.65,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _buildProductCard(filtered[index]),
              childCount: filtered.length,
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductCard(Product product) {
    final defaultVariant = product.defaultVariant;
    final isInStock = defaultVariant?.inStock ?? product.inStock;
    final price = defaultVariant?.price ?? product.displayPrice;

    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => context.push('/products/${product.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          const Color(0xFF3a2319).withOpacity(0.3),
                          const Color(0xFF2a1812).withOpacity(0.5),
                        ],
                      ),
                    ),
                    child: AppNetworkImage(
                      imageUrl: product.displayImage,
                      fit: BoxFit.contain,
                    ),
                  ),
                  // Out of stock overlay
                  if (!isInStock)
                    Container(
                      color: Colors.black.withValues(alpha: 0.5),
                      child: const Center(
                        child: Text(
                          'Out of Stock',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  // Bestseller badge
                  if (product.bestseller)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Bestseller',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Product Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${product.roast ?? ''} • ${product.region ?? ''}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 10,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          formatPrice(price),
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        // Add to Cart button
                        GestureDetector(
                          onTap: isInStock ? () => _addToCart(product) : null,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isInStock
                                  ? AppColors.primary
                                  : Colors.grey,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              isInStock ? Icons.add : Icons.block,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addToCart(Product product) {
    final variant = product.defaultVariant;
    if (variant == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a size')));
      return;
    }

    ref.read(cartProvider.notifier).addToCart(product, variant, 1);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${product.name} added to cart'),
        action: SnackBarAction(
          label: 'View Cart',
          onPressed: () => context.push('/cart'),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Widget _buildProductsSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.65,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: 4,
        itemBuilder: (context, index) => Card(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryItem {
  final String slug;
  final String name;
  _CategoryItem({required this.slug, required this.name});
}
