# World Map Widget Documentation

## Overview

This directory contains two implementations of the world map widget for the Coffee Beans World mobile app. Both widgets display an interactive world map highlighting coffee-producing countries and regions.

## Implementation Files

### 1. `world_map_simple.dart` ✅ **ACTIVE**
- **Package**: `countries_world_map` ^1.3.0
- **Status**: Currently imported and used by `home_screen.dart`
- **Features**:
  - Uses SimpleMap with SVG-based world map
  - Interactive country tapping with ISO3 code support
  - Region-based country highlighting
  - Responsive sizing with InteractiveViewer
  - Glow animations for selected regions

### 2. `world_map_widget.dart` 🔧 **ALTERNATIVE**
- **Packages**: `flutter_map`, `latlong2`
- **Status**: Available but not currently in use
- **Features**:
  - Uses OpenStreetMap-style markers
  - Real LatLng coordinates for 11 coffee countries
  - Interactive pan/zoom gestures
  - Distance-based tap detection
  - Custom coffee icon markers

---

## Active Implementation: world_map_simple.dart

### Dependencies
```yaml
dependencies:
  countries_world_map: ^1.3.0
```

### Usage
```dart
import '../../../widgets/world_map_simple.dart';

WorldMapWidget(
  selectedRegion: 'Asia', // or 'Africa', 'America', 'Oceania'
  selectedCountry: 'Ethiopia',
  onCountryTap: (countryName) {
    print('Tapped: $countryName');
    // Handle country selection
  },
)
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selectedRegion` | `String?` | No | Current region filter ('Asia', 'Africa', 'America', 'Oceania') |
| `selectedCountry` | `String?` | No | Currently selected country name |
| `onCountryTap` | `Function(String)?` | No | Callback when country is tapped |

### Coffee-Producing Countries by Region

#### Asia
- Indonesia
- Vietnam  
- Yemen

#### Africa
- Ethiopia
- Kenya

#### America
- Colombia
- Brazil
- Ecuador
- Jamaica

#### Oceania
- Australia

### Layout Implementation

```dart
SizedBox(
  height: MediaQuery.of(context).size.height * 0.55, // 55% screen height
  child: ClipRRect(
    borderRadius: BorderRadius.circular(18),
    child: WorldMapWidget(
      selectedRegion: selectedRegion,
      selectedCountry: selectedCountry,
      onCountryTap: (country) {
        // Handle tap
      },
    ),
  ),
)
```

### Key Features

#### 1. Responsive Sizing
- Uses `LayoutBuilder` to adapt to parent constraints
- `InteractiveViewer` with min/max scale (0.8 - 4.0)
- `FittedBox` with `BoxFit.contain` for proper aspect ratio
- Fixed internal dimensions: 1000×500

#### 2. Country ISO3 Mapping
```dart
final countryIso3ToName = {
  'ETH': 'Ethiopia',
  'KEN': 'Kenya',
  'COL': 'Colombia',
  'BRA': 'Brazil',
  'IDN': 'Indonesia',
  'VNM': 'Vietnam',
  'JAM': 'Jamaica',
  'YEM': 'Yemen',
  'AUS': 'Australia',
  'ECU': 'Ecuador',
  'USA': 'Hawaii', // Special case for Hawaii
};
```

#### 3. Color Scheme
- **Highlighted**: `#D4A574` (Gold) with glow effect
- **Default**: `#6B4423` (Brown) with 50% opacity
- **Selected**: Full gold with enhanced glow

#### 4. Glow Animation
- Duration: 2000ms
- Repeating pulse effect
- Range: 0.6 - 1.0 opacity
- Curve: `Curves.easeInOut`

#### 5. Dynamic Zoom Animation (v2.0)
- **AnimationController**: 600ms duration with `SingleTickerProviderStateMixin`
- **Region-based Scaling**:
  ```dart
  if (selectedRegion == 'Asia') scale = 1.8;
  else if (selectedRegion == 'Africa') scale = 2.2;
  else if (selectedRegion == 'America') scale = 2.0;
  else if (selectedRegion == 'Oceania') scale = 2.5;
  else scale = 1.0; // World view
  ```
- **Smooth Transitions**: Uses `Tween<double>` with `Curves.easeInOut`
- **Automatic Updates**: `didUpdateWidget` detects region changes
- Wrapped in `AnimatedBuilder` for efficient rebuilds

#### 6. Full Region Highlighting (v2.0)
- **Comprehensive Country Arrays**: ALL countries in each region highlighted when selected
- **Two-Tier Color System**:
  - Coffee-producing countries: Full gold `#D7AA7F` (opacity 1.0)
  - Other region countries: Light gold `#D7AA7F` (opacity 0.7)
  - Non-highlighted countries: Brown `#6B4423` (opacity 0.3)
- **Region Coverage**:
  - Asia: 47 countries (AFG, ARM, AZE, BHR, BGD, BTN, BRN, KHM, CHN, CYP...)
  - Africa: 54 countries (DZA, AGO, BEN, BWA, BFA, BDI, CMR, CPV, CAF...)
  - Americas: 29 countries (ARG, BHS, BRB, BLZ, BOL, BRA, CAN, CHL, COL...)
  - Oceania: 14 countries (AUS, FJI, KIR, MHL, FSM, NRU, NZL, PLW...)

---

## Alternative Implementation: world_map_widget.dart

### Dependencies
```yaml
dependencies:
  flutter_map: ^7.0.2
  latlong2: ^0.9.1
```

### Installation
```bash
flutter pub add flutter_map latlong2
```

### Country Coordinates
```dart
final Map<String, LatLng> countryLocations = {
  'Ethiopia': LatLng(9.145, 40.4897),
  'Kenya': LatLng(-0.0236, 37.9062),
  'Colombia': LatLng(4.5709, -74.2973),
  'Brazil': LatLng(-14.2350, -51.9253),
  'Indonesia': LatLng(-0.7893, 113.9213),
  'Vietnam': LatLng(14.0583, 108.2772),
  'Jamaica': LatLng(18.1096, -77.2975),
  'Yemen': LatLng(15.5527, 48.5164),
  'Australia': LatLng(-25.2744, 133.7751),
  'Ecuador': LatLng(-1.8312, -78.1834),
  'Hawaii': LatLng(19.8968, -155.5828),
};
```

### Key Features

#### 1. Map Configuration
- Initial center: `LatLng(20, 0)` (equatorial view)
- Initial zoom: 2
- Min zoom: 1, Max zoom: 6
- Rotation disabled
- Transparent background

#### 2. Tap Detection
- Distance-based nearest country detection
- Maximum tap distance: 500km radius
- Uses `latlong2` Distance calculator

#### 3. Marker Styling
- Size: 40×40 pixels
- Coffee icon (Icons.coffee)
- Dynamic color based on highlight state
- Glow effect when selected

---

## Comparison: Simple vs FlutterMap

| Feature | world_map_simple.dart | world_map_widget.dart |
|---------|----------------------|----------------------|
| **Package** | countries_world_map | flutter_map + latlong2 |
| **Map Style** | SVG world silhouette | Marker-based |
| **Performance** | Lightweight | Moderate (map engine) |
| **Visual** | Flat, clean design | Geographic markers |
| **Interaction** | Country shapes | Circular markers |
| **Zoom** | Limited interactive | Full pan/zoom |
| **Dependencies** | 1 package | 2 packages |
| **File Size** | Smaller | Larger |
| **Status** | ✅ Active | 🔧 Alternative |

---

## Integration with Home Screen

### Location
`/mobile/lib/features/home/presentation/home_screen.dart`

### Import Statement
```dart
import '../../../widgets/world_map_simple.dart';
```

### Implementation Context
```dart
CustomScrollView(
  slivers: [
    // ... other slivers
    SliverToBoxAdapter(
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.55,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: WorldMapWidget(
            selectedRegion: selectedRegion,
            selectedCountry: selectedCountry,
            onCountryTap: (country) {
              setState(() {
                selectedCountry = country;
              });
            },
          ),
        ),
      ),
    ),
  ],
)
```

---

## Theme Colors

Matching website dark theme:

```dart
// Background
Primary: #120a07
Surface: #2a1812

// Accents
Gold: #D7AA7F
Secondary Gold: #D4A574
Brown: #6B4423

// Text
Light: #F4EFEA
Medium: #EAD9C3
```

---

## Troubleshooting

### Issue: Map not displaying
**Solution**: Ensure proper height constraint with `SizedBox` wrapper

### Issue: Countries not tapping
**Solution**: Check ISO3 country code mapping in `countryIso3ToName`

### Issue: Layout overflow
**Solution**: Wrap in `ClipRRect` and use bounded height (55% of screen)

### Issue: Console errors for non-coffee countries
**Behavior**: Expected - widget correctly filters and logs countries not in coffee list

---

## Future Enhancements

### ✅ Implemented Features (v2.0)
1. **Dynamic Zoom**: ✅ Region-specific zoom levels matching website behavior
   - World view: 1.0x (default)
   - Asia: 1.8x scale
   - Africa: 2.2x scale
   - Americas: 2.0x scale
   - Oceania: 2.5x scale

2. **Full Region Highlighting**: ✅ Shows ALL countries in selected region
   - Asia: 47 countries
   - Africa: 54 countries
   - Americas: 29 countries
   - Oceania: 14 countries
   - Coffee countries display in full gold (#D7AA7F)
   - Non-coffee countries in lighter gold (70% opacity)
   - Non-highlighted countries at 30% opacity

3. **Smooth Transitions**: ✅ Animated zoom/pan when switching regions
   - Duration: 600ms
   - Curve: `Curves.easeInOut`
   - Automatic scale animation on region change

### Future Planned Features
1. **Country Tooltips**: Show country names on hover/long-press
2. **Coffee Production Data**: Display production statistics on tap
3. **Region-specific Centering**: Auto-center view on selected region
4. **Accessibility**: VoiceOver support and semantic labels

---

## Related Files

- `/mobile/lib/features/home/presentation/home_screen.dart` - Map integration
- `/mobile/lib/core/theme/app_theme.dart` - Theme colors
- `/frontend/src/components/WorldMap.jsx` - Website reference implementation

---

## Website Reference

The Flutter implementation is based on the React website map:

### Key Website Features
- Dynamic projection with region-specific scale/center
- Full region arrays (all countries, not just coffee)
- Opacity-based highlighting (0.3 vs 1.0)
- Smooth 0.6s CSS transitions
- Country click handler with name mapping

### Website Code Structure
```javascript
const getProjectionConfig = () => {
  if (!selectedRegion) return { scale: 160, center: [0, 20] };
  return regionConfigs[selectedRegion];
};

// Highlight ALL countries in region
const isHighlighted = selectedRegion && 
  regionCountries[selectedRegion].includes(countryCode);
```

---

## Notes

- **Active file**: Only `world_map_simple.dart` is currently imported
- **Editing**: Ensure you're editing the correct file when making changes
- **Testing**: Test on various screen sizes for responsive behavior
- **Performance**: Simple implementation is recommended for better performance

---

## Version History

- **v1.0** - Initial implementation with countries_world_map
- **v1.1** - Added flutter_map alternative
- **v1.2** - Fixed layout constraints and sizing
- **v1.3** - Removed backgrounds for transparency
- **v1.4** - Added glow animations and theme colors
- **v2.0** ✨ **LATEST** - Implemented responsive features:
  - Dynamic zoom with region-specific scaling (Asia: 1.8x, Africa: 2.2x, Americas: 2.0x, Oceania: 2.5x)
  - Full region highlighting (all countries in selected region, not just coffee producers)
  - Smooth animated transitions (600ms with easeInOut curve)
  - Color distinction between coffee-producing and non-coffee countries
  - Non-highlighted countries show at 30% opacity matching website behavior

---

## Contact

For questions or issues related to the world map implementation, refer to:
- Main project README: `/coffee-beans-world/README.md`
- Mobile README: `/coffee-beans-world/mobile/README.md`
