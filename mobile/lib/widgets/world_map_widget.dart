import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

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

class _WorldMapWidgetState extends State<WorldMapWidget> {
  late final MapController _mapController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
  }

  // Country coordinates with real LatLng
  final Map<String, LatLng> countryLocations = {
    'Ethiopia': const LatLng(9.145, 40.4897),
    'Kenya': const LatLng(-0.0236, 37.9062),
    'Colombia': const LatLng(4.5709, -74.2973),
    'Brazil': const LatLng(-14.2350, -51.9253),
    'Indonesia': const LatLng(-0.7893, 113.9213),
    'Vietnam': const LatLng(14.0583, 108.2772),
    'Jamaica': const LatLng(18.1096, -77.2975),
    'Yemen': const LatLng(15.5527, 48.5164),
    'Australia': const LatLng(-25.2744, 133.7751),
    'Ecuador': const LatLng(-1.8312, -78.1834),
    'Hawaii': const LatLng(19.8968, -155.5828),
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      margin: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: const LatLng(20, 0),
                initialZoom: 2,
                minZoom: 1,
                maxZoom: 6,
                backgroundColor: Colors.transparent,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                ),
                onTap: (tapPosition, point) {
                  // Find nearest country
                  String? nearestCountry;
                  double nearestDistance = double.infinity;

                  countryLocations.forEach((country, location) {
                    final distance = const Distance().as(
                      LengthUnit.Meter,
                      point,
                      location,
                    );

                    if (distance < nearestDistance && distance < 500000) {
                      // Within 500km
                      nearestDistance = distance;
                      nearestCountry = country;
                    }
                  });

                  if (nearestCountry != null) {
                    widget.onCountryTap?.call(nearestCountry!);
                  }
                },
              ),
              children: [
                // Country markers
                MarkerLayer(
                  markers: countryLocations.entries.map((entry) {
                    final isHighlighted = _isCountryHighlighted(entry.key);
                    final isSelected = widget.selectedCountry == entry.key;

                    return Marker(
                      point: entry.value,
                      width: 40,
                      height: 40,
                      child: GestureDetector(
                        onTap: () {
                          if (widget.onCountryTap != null) {
                            widget.onCountryTap!(entry.key);
                          }
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: (isHighlighted || isSelected)
                                ? const Color(0xFFD4A574)
                                : const Color(0xFF6B4423).withOpacity(0.5),
                            shape: BoxShape.circle,
                            boxShadow: (isHighlighted || isSelected)
                                ? [
                                    BoxShadow(
                                      color: const Color(
                                        0xFFD4A574,
                                      ).withOpacity(0.6),
                                      blurRadius: 20,
                                      spreadRadius: 5,
                                    ),
                                  ]
                                : null,
                          ),
                          child: const Icon(
                            Icons.coffee,
                            color: Color(0xFF120a07),
                            size: 20,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
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
                        colors: [Color(0xFFD4A574), Color(0xFF6B4423)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFD4A574).withOpacity(0.3),
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
      ),
    );
  }

  bool _isCountryHighlighted(String country) {
    if (widget.selectedRegion == null) return false;

    final regionCountries = {
      'Asia': ['Indonesia', 'Vietnam', 'Yemen'],
      'Africa': ['Ethiopia', 'Kenya'],
      'America': ['Colombia', 'Brazil', 'Ecuador', 'Jamaica'],
      'Oceania': ['Australia'],
    };

    return regionCountries[widget.selectedRegion]?.contains(country) ?? false;
  }

  @override
  void dispose() {
    super.dispose();
  }
}
