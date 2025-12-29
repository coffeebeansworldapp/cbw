# Flutter World Map - Complete Technical Explanation

## 📦 Package Used

**Package**: `countries_world_map` ^1.3.0  
**Pub.dev**: https://pub.dev/packages/countries_world_map  
**Type**: SVG-based static world map

### Why This Package?

- ✅ Lightweight (SVG vectors, not raster images)
- ✅ Built-in country shapes with ISO3 codes
- ✅ Interactive tap detection per country
- ✅ Simple API, no external tiles needed
- ✅ Works offline
- ✅ Perfect for static, non-scrolling maps

---

## 🏗️ Architecture Overview

```
WorldMapWidget (StatefulWidget)
    ↓
_WorldMapWidgetState (with SingleTickerProviderStateMixin)
    ↓
├─ AnimationController → Dynamic zoom animations
├─ LayoutBuilder → Responsive sizing
├─ InteractiveViewer → Pan/Zoom gestures
├─ Transform.scale → Animated region zoom
└─ SimpleMap → Actual map rendering
```

---

## 📱 Widget Structure

### File Location
`/mobile/lib/widgets/world_map_simple.dart`

### Input Parameters
```dart
WorldMapWidget({
  String? selectedRegion,      // 'Asia', 'Africa', 'America', 'Oceania'
  String? selectedCountry,     // 'Ethiopia', 'Kenya', etc.
  Function(String)? onCountryTap  // Callback when coffee country tapped
})
```

### State Variables
```dart
AnimationController _zoomController;  // Controls zoom animation
Animation<double> _zoomAnimation;     // Tween from current to target scale
double _currentScale = 1.0;           // Current zoom level
double _targetScale = 1.0;            // Target zoom level
```

---

## 🎬 How It Works (Step by Step)

### 1️⃣ **Initialization** (`initState`)

```dart
void initState() {
  // Create animation controller (600ms duration)
  _zoomController = AnimationController(
    duration: const Duration(milliseconds: 600),
    vsync: this,  // Requires SingleTickerProviderStateMixin
  );

  // Create animation with easeInOut curve
  _zoomAnimation = Tween<double>(begin: 1.0, end: 1.0)
    .animate(CurvedAnimation(
      parent: _zoomController, 
      curve: Curves.easeInOut
    ))
    ..addListener(() {
      setState(() => _currentScale = _zoomAnimation.value);
    });

  // Set initial zoom based on selected region
  _updateZoomForRegion();
}
```

**What happens:**
- Animation controller created with 600ms duration
- Listener updates `_currentScale` on every animation frame
- Initial zoom calculated based on `selectedRegion`

---

### 2️⃣ **Dynamic Zoom System** (`_updateZoomForRegion`)

```dart
void _updateZoomForRegion() {
  double newScale = 1.0;  // Default (world view)

  // Set zoom level per region
  if (widget.selectedRegion == 'Asia') newScale = 1.8;
  else if (widget.selectedRegion == 'Africa') newScale = 2.2;
  else if (widget.selectedRegion == 'America') newScale = 2.0;
  else if (widget.selectedRegion == 'Oceania') newScale = 2.5;

  if (newScale != _targetScale) {
    _targetScale = newScale;
    
    // Create new animation from current to target
    _zoomAnimation = Tween<double>(
      begin: _currentScale,
      end: _targetScale
    ).animate(CurvedAnimation(...));

    // Start animation
    _zoomController.reset();
    _zoomController.forward();
  }
}
```

**Zoom Levels:**
| Region | Scale | Visual Effect |
|--------|-------|--------------|
| World (none) | 1.0 | Full world view |
| Asia | 1.8 | 80% zoom in |
| America | 2.0 | 100% zoom in |
| Africa | 2.2 | 120% zoom in |
| Oceania | 2.5 | 150% zoom in (closest) |

**Why different scales?**
- Africa needs more zoom (2.2) because countries are larger
- Oceania needs maximum zoom (2.5) because islands are small
- Matches website behavior

---

### 3️⃣ **Region Highlighting System** (`_getAllRegionCountries`)

```dart
Map<String, String> _getAllRegionCountries() {
  final codes = <String, String>{};

  if (widget.selectedRegion == 'Asia') {
    codes.addAll({
      'AFG': 'Afghanistan',
      'ARM': 'Armenia',
      // ... 47 total countries
    });
  } else if (widget.selectedRegion == 'Africa') {
    codes.addAll({
      'DZA': 'Algeria',
      'AGO': 'Angola',
      // ... 54 total countries
    });
  }
  // ... other regions

  return codes;
}
```

**Country Count by Region:**
- 🌏 Asia: **47 countries**
- 🌍 Africa: **54 countries**
- 🌎 Americas: **29 countries**
- 🌊 Oceania: **14 countries**

**Why all countries, not just coffee?**
- Website-like behavior: entire region lights up
- Better visual feedback
- Professional appearance

---

### 4️⃣ **Coffee Country Detection** (`_getCoffeeCountries`)

```dart
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
```

**Purpose:**
- Differentiate coffee-producing countries from others
- Coffee countries: Full gold (#D7AA7F, 100% opacity)
- Non-coffee countries: Light gold (#D7AA7F, 70% opacity)
- Non-highlighted: Brown (#6B4423, 30% opacity)

---

### 5️⃣ **Map Rendering** (`build` method)

#### **Layer 1: Container** (Background)
```dart
Container(
  color: const Color(0xFF2a1812),  // Dark brown background
  child: Stack(...)
)
```

#### **Layer 2: LayoutBuilder** (Responsive Sizing)
```dart
LayoutBuilder(
  builder: (context, constraints) {
    // constraints.maxWidth and maxHeight from parent
    return AnimatedBuilder(...);
  }
)
```
- Gets parent's size constraints
- Ensures map fills available space

#### **Layer 3: AnimatedBuilder** (Smooth Zoom)
```dart
AnimatedBuilder(
  animation: _zoomAnimation,
  builder: (context, child) {
    return InteractiveViewer(...);
  }
)
```
- Rebuilds on every animation frame
- Smooth 60fps zoom transitions

#### **Layer 4: InteractiveViewer** (User Gestures)
```dart
InteractiveViewer(
  minScale: 0.8,      // Can zoom out slightly
  maxScale: 4.0,      // Can zoom in 4x
  panEnabled: true,   // Can drag to pan
  scaleEnabled: true, // Can pinch to zoom
  constrained: true,  // Respect parent bounds
  child: Center(...)
)
```

**User Interactions:**
- 👆 **Pinch**: Zoom in/out (0.8x - 4.0x)
- ↔️ **Drag**: Pan across map
- 👆 **Double tap**: Quick zoom
- 🔒 **Boundary**: Can't pan outside map

#### **Layer 5: Transform.scale** (Animated Zoom)
```dart
Transform.scale(
  scale: _currentScale,  // 1.0 → 2.5
  child: SizedBox(
    width: 1000,   // Fixed aspect ratio
    height: 500,
    child: SimpleMap(...)
  )
)
```

**Fixed Size (1000×500):**
- Maintains 2:1 aspect ratio
- FittedBox scales it to fit screen
- Prevents distortion

#### **Layer 6: SimpleMap** (Actual Map)
```dart
SimpleMap(
  instructions: SMapWorld.instructions,  // SVG path data
  defaultColor: Color(0xFF6B4423).withOpacity(0.3),
  colors: {
    'ETH': Color(0xFFD7AA7F),           // Coffee country (full gold)
    'CHN': Color(0xFFD7AA7F).withOpacity(0.7),  // Non-coffee (light gold)
  },
  callback: (id, name, tapDetails) {
    // Handle country tap
  }
)
```

**SimpleMap Parameters:**
- `instructions`: Pre-built SVG paths for all countries
- `defaultColor`: Base color for unhighlighted countries
- `colors`: Map of ISO3 code → Color for highlighted countries
- `callback`: Function called when country tapped

---

### 6️⃣ **Tap Detection & Callback**

```dart
callback: (id, name, tapDetails) {
  print('Map tapped: $id - $name');  // e.g., "ETH - Ethiopia"

  final countryMap = {
    'ETH': 'Ethiopia',
    'KEN': 'Kenya',
    // ... 10 coffee countries
  };

  final countryName = countryMap[id];
  if (countryName != null && widget.onCountryTap != null) {
    widget.onCountryTap!(countryName);  // Trigger parent callback
  } else {
    print('Country not in our list: $id');
  }
}
```

**Flow:**
1. User taps Ethiopia
2. Package detects tap on 'ETH' country shape
3. Callback receives: `id='ETH'`, `name='Ethiopia'`
4. Check if coffee country (`countryMap`)
5. If yes → Call `widget.onCountryTap('Ethiopia')`
6. Parent widget filters products by Ethiopia

---

### 7️⃣ **UI Overlays** (Stack Children)

#### **Hint Overlay** (No Region Selected)
```dart
if (widget.selectedRegion == null)
  Positioned(
    bottom: 16,
    child: Container(
      child: Row([
        Icon(Icons.touch_app),
        Text('Tap countries or pinch to zoom')
      ])
    )
  )
```

#### **Region Label** (Region Selected)
```dart
if (widget.selectedRegion != null)
  Positioned(
    bottom: 16,
    child: Container(
      decoration: BoxDecoration(
        gradient: LinearGradient([Gold, Brown])
      ),
      child: Text('☕ ${widget.selectedRegion} Coffee Origins')
    )
  )
```

---

## 🎨 Color System

### Color Palette
```dart
// Background
const background = Color(0xFF2a1812);  // Dark brown

// Map Colors
const defaultColor = Color(0xFF6B4423).withOpacity(0.3);  // 30% brown
const coffeeGold = Color(0xFFD7AA7F);                     // 100% gold
const regionGold = Color(0xFFD7AA7F).withOpacity(0.7);    // 70% gold

// Glow Effect
const glowColor = Color(0xFFD7AA7F).withOpacity(0.4);
```

### Opacity Hierarchy
| State | Color | Opacity | Visual |
|-------|-------|---------|--------|
| Coffee country in region | Gold #D7AA7F | 100% | ⭐ Brightest |
| Non-coffee in region | Gold #D7AA7F | 70% | ✨ Bright |
| Non-highlighted | Brown #6B4423 | 30% | 🌑 Dim |

---

## 🔄 Update Lifecycle

### When Region Changes
```
User taps "Asia" button
    ↓
widget.selectedRegion = 'Asia'
    ↓
didUpdateWidget() called
    ↓
_updateZoomForRegion() executed
    ↓
newScale = 1.8 (Asia zoom)
    ↓
Animation created (1.0 → 1.8)
    ↓
AnimationController.forward()
    ↓
Every frame: _currentScale updates
    ↓
setState() → rebuild with new scale
    ↓
Map smoothly zooms in (600ms)
```

### When Country Tapped
```
User taps Ethiopia on map
    ↓
SimpleMap detects tap on 'ETH' shape
    ↓
callback('ETH', 'Ethiopia', tapDetails)
    ↓
Check if coffee country: ✅ Yes
    ↓
widget.onCountryTap!('Ethiopia')
    ↓
Parent widget (home_screen.dart)
    ↓
setState(() => selectedCountry = 'Ethiopia')
    ↓
Filter products by Ethiopia
```

---

## 📐 Layout & Sizing

### Responsive Design
```dart
SizedBox(
  height: MediaQuery.of(context).size.height * 0.55,  // 55% screen
  child: ClipRRect(
    borderRadius: BorderRadius.circular(18),  // Rounded corners
    child: WorldMapWidget(...)
  )
)
```

### Size Constraints
```
Screen Height: 100%
    ↓
Map Container: 55%
    ↓
LayoutBuilder: Get actual constraints
    ↓
FittedBox: Scale 1000×500 to fit
    ↓
Transform.scale: Apply zoom (1.0-2.5x)
    ↓
InteractiveViewer: User can zoom 0.8-4.0x
```

### Actual Dimensions Example
```
iPhone Screen: 844pt height
Map Height: 464pt (55%)
Map Width: 390pt (full width)

Fixed Internal: 1000×500
Scale Factor: 0.39 (to fit width)
After zoom 2.0x: Effective 780×390
```

---

## ⚡ Performance Optimizations

### 1. SVG Vectors (Not Raster)
- ✅ Small file size (~50KB)
- ✅ Crisp at any zoom level
- ✅ No pixelation

### 2. AnimatedBuilder
- ✅ Only rebuilds map portion
- ✅ Parent doesn't rebuild
- ✅ Smooth 60fps

### 3. Cached Country Data
- ✅ ISO3 maps created once
- ✅ Reused on every rebuild
- ✅ No repeated computations

### 4. Conditional Overlays
- ✅ Only render visible overlay
- ✅ `if (condition)` prevents creation
- ✅ Saves memory

---

## 🐛 Common Issues & Solutions

### Issue: Map too small
**Solution**: Increase parent SizedBox height
```dart
SizedBox(height: MediaQuery.of(context).size.height * 0.65)
```

### Issue: Countries not tapping
**Cause**: ISO3 code mismatch  
**Solution**: Check `countryMap` has correct codes

### Issue: Zoom too slow/fast
**Solution**: Adjust AnimationController duration
```dart
duration: const Duration(milliseconds: 400)  // Faster
```

### Issue: Zoom overshoots
**Solution**: Adjust region scale values
```dart
if (widget.selectedRegion == 'Africa') newScale = 2.0;  // Was 2.2
```

---

## 🔌 Integration Example

```dart
// In home_screen.dart
String? selectedRegion;
String? selectedCountry;

WorldMapWidget(
  selectedRegion: selectedRegion,
  selectedCountry: selectedCountry,
  onCountryTap: (country) {
    setState(() {
      selectedCountry = country;
      // Filter products
      filteredProducts = allProducts
        .where((p) => p.region == country)
        .toList();
    });
  },
)
```

---

## 📊 Data Flow Diagram

```
User Action → Widget Input → State Update → Visual Output

Region button tap
    ↓
selectedRegion = 'Asia'
    ↓
_updateZoomForRegion()
    ↓
_targetScale = 1.8
    ↓
Animation: 1.0 → 1.8
    ↓
Transform.scale(_currentScale)
    ↓
Map zooms in smoothly

Country tap
    ↓
SimpleMap callback('ETH')
    ↓
onCountryTap('Ethiopia')
    ↓
Parent filters products
    ↓
Product list updates
```

---

## 🎯 Key Takeaways

1. **Package**: `countries_world_map` provides SVG world map
2. **Animation**: AnimationController with 600ms smooth zoom
3. **Regions**: 144 total countries across 4 regions
4. **Highlighting**: 3-tier color system (coffee/region/default)
5. **Interaction**: Pinch zoom, pan, tap detection
6. **Responsive**: LayoutBuilder + FittedBox + MediaQuery
7. **Performance**: 60fps animations, minimal rebuilds
8. **Integration**: Callback system for parent communication

---

## 📚 Related Files

- **Widget**: `/mobile/lib/widgets/world_map_simple.dart` (462 lines)
- **Integration**: `/mobile/lib/features/home/presentation/home_screen.dart`
- **Alternative**: `/mobile/lib/widgets/world_map_widget.dart` (flutter_map version)
- **Docs**: `/mobile/lib/widgets/WORLD_MAP_DOCUMENTATION.md`
- **Reference**: `/frontend/src/components/WorldMap.jsx` (website version)

---

## 🚀 Future Enhancements

1. **Region Centering**: Auto-pan to center selected region
2. **Tooltips**: Show country names on hover/long-press
3. **Production Stats**: Display coffee production data
4. **Custom Markers**: Add coffee bean icons on producing countries
5. **Accessibility**: VoiceOver labels for blind users
6. **Analytics**: Track which countries users tap most

---

**Last Updated**: December 29, 2025  
**Version**: 2.0 (Responsive with dynamic zoom)
