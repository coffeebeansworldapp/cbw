import 'package:flutter/material.dart';
import 'package:countries_world_map/countries_world_map.dart';
import 'package:countries_world_map/data/maps/world_map.dart';

class WorldMapWidget extends StatefulWidget {
  final String? selectedRegion;
  final String? selectedCountry;
  final Function(String countryName)? onCountryTap;

  const WorldMapWidget({
    super.key,
    this.selectedRegion,
    this.selectedCountry,
    this.onCountryTap,
  });

  @override
  State<WorldMapWidget> createState() => _WorldMapWidgetState();
}

class _WorldMapWidgetState extends State<WorldMapWidget>
    with SingleTickerProviderStateMixin {
  late TransformationController _transformationController;
  late AnimationController _animationController;
  Animation<Matrix4>? _animation;

  @override
  void initState() {
    super.initState();
    _transformationController = TransformationController();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    // Set initial transformation after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateTransformationForRegion();
    });
  }

  @override
  void didUpdateWidget(WorldMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedRegion != widget.selectedRegion) {
      _updateTransformationForRegion();
    }
  }

  @override
  void dispose() {
    _transformationController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _updateTransformationForRegion() {
    double scale = 1.0;
    double centerX = 0.0;
    double centerY = 0.0;

    // Dynamic zoom and centering based on region
    if (widget.selectedRegion == 'Asia') {
      scale = 1.8;
      centerX = -0.35; // Pan east
      centerY = 0.05; // Pan slightly north
    } else if (widget.selectedRegion == 'Africa') {
      scale = 2.2;
      centerX = -0.05; // Slightly east
      centerY = 0.1; // Pan north
    } else if (widget.selectedRegion == 'America') {
      scale = 2.0;
      centerX = 0.25; // Pan west
      centerY = 0.0; // Centered vertically
    } else if (widget.selectedRegion == 'Oceania') {
      scale = 2.5;
      centerX = -0.5; // Pan far east
      centerY = -0.15; // Pan south
    }

    // Calculate transformation matrix
    final Matrix4 endMatrix = Matrix4.identity()
      ..translate(centerX * 1000 * scale, centerY * 500 * scale)
      ..scale(scale);

    // Animate from current to target transformation
    _animation =
        Matrix4Tween(
          begin: _transformationController.value,
          end: endMatrix,
        ).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );

    _animationController.reset();
    _animationController.forward();

    // Update controller as animation progresses
    _animation!.addListener(() {
      _transformationController.value = _animation!.value;
    });
  }

  // Get ALL countries in selected region (full region highlighting like website)
  Map<String, String> _getAllRegionCountries() {
    final codes = <String, String>{};

    if (widget.selectedRegion == 'Asia') {
      // All 47 Asian countries
      codes.addAll({
        'AFG': 'Afghanistan',
        'ARM': 'Armenia',
        'AZE': 'Azerbaijan',
        'BHR': 'Bahrain',
        'BGD': 'Bangladesh',
        'BTN': 'Bhutan',
        'BRN': 'Brunei',
        'KHM': 'Cambodia',
        'CHN': 'China',
        'CYP': 'Cyprus',
        'GEO': 'Georgia',
        'IND': 'India',
        'IDN': 'Indonesia',
        'IRN': 'Iran',
        'IRQ': 'Iraq',
        'ISR': 'Israel',
        'JPN': 'Japan',
        'JOR': 'Jordan',
        'KAZ': 'Kazakhstan',
        'KWT': 'Kuwait',
        'KGZ': 'Kyrgyzstan',
        'LAO': 'Laos',
        'LBN': 'Lebanon',
        'MYS': 'Malaysia',
        'MDV': 'Maldives',
        'MNG': 'Mongolia',
        'MMR': 'Myanmar',
        'NPL': 'Nepal',
        'PRK': 'North Korea',
        'OMN': 'Oman',
        'PAK': 'Pakistan',
        'PSE': 'Palestine',
        'PHL': 'Philippines',
        'QAT': 'Qatar',
        'SAU': 'Saudi Arabia',
        'SGP': 'Singapore',
        'KOR': 'South Korea',
        'LKA': 'Sri Lanka',
        'SYR': 'Syria',
        'TWN': 'Taiwan',
        'TJK': 'Tajikistan',
        'THA': 'Thailand',
        'TLS': 'Timor-Leste',
        'TUR': 'Turkey',
        'TKM': 'Turkmenistan',
        'ARE': 'UAE',
        'UZB': 'Uzbekistan',
        'VNM': 'Vietnam',
        'YEM': 'Yemen',
      });
    } else if (widget.selectedRegion == 'Africa') {
      // All 54 African countries
      codes.addAll({
        'DZA': 'Algeria',
        'AGO': 'Angola',
        'BEN': 'Benin',
        'BWA': 'Botswana',
        'BFA': 'Burkina Faso',
        'BDI': 'Burundi',
        'CMR': 'Cameroon',
        'CPV': 'Cape Verde',
        'CAF': 'Central African Republic',
        'TCD': 'Chad',
        'COM': 'Comoros',
        'COG': 'Congo',
        'COD': 'DR Congo',
        'CIV': 'Ivory Coast',
        'DJI': 'Djibouti',
        'EGY': 'Egypt',
        'GNQ': 'Equatorial Guinea',
        'ERI': 'Eritrea',
        'ETH': 'Ethiopia',
        'GAB': 'Gabon',
        'GMB': 'Gambia',
        'GHA': 'Ghana',
        'GIN': 'Guinea',
        'GNB': 'Guinea-Bissau',
        'KEN': 'Kenya',
        'LSO': 'Lesotho',
        'LBR': 'Liberia',
        'LBY': 'Libya',
        'MDG': 'Madagascar',
        'MWI': 'Malawi',
        'MLI': 'Mali',
        'MRT': 'Mauritania',
        'MUS': 'Mauritius',
        'MAR': 'Morocco',
        'MOZ': 'Mozambique',
        'NAM': 'Namibia',
        'NER': 'Niger',
        'NGA': 'Nigeria',
        'RWA': 'Rwanda',
        'STP': 'Sao Tome and Principe',
        'SEN': 'Senegal',
        'SYC': 'Seychelles',
        'SLE': 'Sierra Leone',
        'SOM': 'Somalia',
        'ZAF': 'South Africa',
        'SSD': 'South Sudan',
        'SDN': 'Sudan',
        'TZA': 'Tanzania',
        'TGO': 'Togo',
        'TUN': 'Tunisia',
        'UGA': 'Uganda',
        'ZMB': 'Zambia',
        'ZWE': 'Zimbabwe',
      });
    } else if (widget.selectedRegion == 'America') {
      // All 20 North and South American countries
      codes.addAll({
        'ARG': 'Argentina',
        'BHS': 'Bahamas',
        'BRB': 'Barbados',
        'BLZ': 'Belize',
        'BOL': 'Bolivia',
        'BRA': 'Brazil',
        'CAN': 'Canada',
        'CHL': 'Chile',
        'COL': 'Colombia',
        'CRI': 'Costa Rica',
        'CUB': 'Cuba',
        'DOM': 'Dominican Republic',
        'ECU': 'Ecuador',
        'SLV': 'El Salvador',
        'GTM': 'Guatemala',
        'GUY': 'Guyana',
        'HTI': 'Haiti',
        'HND': 'Honduras',
        'JAM': 'Jamaica',
        'MEX': 'Mexico',
        'NIC': 'Nicaragua',
        'PAN': 'Panama',
        'PRY': 'Paraguay',
        'PER': 'Peru',
        'SUR': 'Suriname',
        'TTO': 'Trinidad and Tobago',
        'USA': 'United States',
        'URY': 'Uruguay',
        'VEN': 'Venezuela',
      });
    } else if (widget.selectedRegion == 'Oceania') {
      // All 14 Oceania countries
      codes.addAll({
        'AUS': 'Australia',
        'FJI': 'Fiji',
        'KIR': 'Kiribati',
        'MHL': 'Marshall Islands',
        'FSM': 'Micronesia',
        'NRU': 'Nauru',
        'NZL': 'New Zealand',
        'PLW': 'Palau',
        'PNG': 'Papua New Guinea',
        'WSM': 'Samoa',
        'SLB': 'Solomon Islands',
        'TON': 'Tonga',
        'TUV': 'Tuvalu',
        'VUT': 'Vanuatu',
      });
    }

    return codes;
  }

  // Get only coffee-producing countries for color distinction
  Set<String> _getCoffeeCountries() {
    return {
      'ETH', // Ethiopia
      'KEN', // Kenya
      'COL', // Colombia
      'BRA', // Brazil
      'IDN', // Indonesia
      'VNM', // Vietnam
      'JAM', // Jamaica
      'YEM', // Yemen
      'AUS', // Australia
      'ECU', // Ecuador
    };
  }

  @override
  Widget build(BuildContext context) {
    final highlightedCountries = _getAllRegionCountries();
    final coffeeCountries = _getCoffeeCountries();

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF2a1812).withValues(alpha: 0.3),
            const Color(0xFF120a07).withValues(alpha: 0.5),
          ],
        ),
        border: Border.all(
          color: const Color(0xFFD7AA7F).withValues(alpha: 0.2),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Stack(
        children: [
          // World Map with interaction and animated zoom/pan
          LayoutBuilder(
            builder: (context, constraints) {
              return InteractiveViewer(
                transformationController: _transformationController,
                boundaryMargin: const EdgeInsets.all(20),
                minScale: 0.8,
                maxScale: 4.0,
                panEnabled: true,
                scaleEnabled: true,
                constrained: true,
                child: Container(
                  width: constraints.maxWidth,
                  height: constraints.maxHeight,
                  decoration: BoxDecoration(
                    boxShadow: highlightedCountries.isNotEmpty
                        ? [
                            BoxShadow(
                              color: const Color(
                                0xFFD7AA7F,
                              ).withValues(alpha: 0.4),
                              blurRadius: 40,
                              spreadRadius: 10,
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: AspectRatio(
                      aspectRatio: 2 / 1,
                      child: FittedBox(
                        fit: BoxFit.contain,
                        child: SizedBox(
                          width: 1000,
                          height: 500,
                          child: SimpleMap(
                            instructions: SMapWorld.instructions,
                            defaultColor: const Color(
                              0xFF6B4423,
                            ).withValues(alpha: 0.3),
                            colors: highlightedCountries.map((key, value) {
                              // Coffee countries get full gold, others get lighter gold
                              final isCoffeeCountry = coffeeCountries.contains(
                                key,
                              );
                              return MapEntry(
                                key,
                                isCoffeeCountry
                                    ? const Color(0xFFD7AA7F)
                                    : const Color(
                                        0xFFD7AA7F,
                                      ).withValues(alpha: 0.7),
                              );
                            }),
                            callback: (id, name, tapDetails) {
                              print('Map tapped: $id - $name');

                              // Map ISO2 code (lowercase) back to our country names
                              final countryMap = {
                                'et': 'Ethiopia',
                                'ke': 'Kenya',
                                'co': 'Colombia',
                                'br': 'Brazil',
                                'id': 'Indonesia',
                                'vn': 'Vietnam',
                                'jm': 'Jamaica',
                                'ye': 'Yemen',
                                'au': 'Australia',
                                'ec': 'Ecuador',
                              };

                              final countryName = countryMap[id];
                              if (countryName != null &&
                                  widget.onCountryTap != null) {
                                print('Triggering callback for: $countryName');
                                widget.onCountryTap!(countryName);
                              } else {
                                print('Country not in our list: $id');
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          // Interactive hint when no region selected
          if (widget.selectedRegion == null)
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.touch_app,
                        color: const Color(0xFFD7AA7F),
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Tap countries or pinch to zoom',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          // Region label
          if (widget.selectedRegion != null)
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFD7AA7F), Color(0xFF6B4423)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFD7AA7F).withValues(alpha: 0.3),
                        blurRadius: 15,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('☕', style: TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Text(
                        '${widget.selectedRegion} Coffee Origins',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
