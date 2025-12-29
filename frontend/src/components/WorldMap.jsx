import React, { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import './WorldMap.css'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function WorldMap({ selectedRegion, selectedCountry, onCountryClick, onClearCountry }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Map category names to country codes/regions
  const getHighlightedCountries = () => {
    if (!selectedRegion) return []
    
    const regionMap = {
      'Africa': ['DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV', 'CAF', 'TCD', 'COM', 'COG', 'COD', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'SWZ', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE'],
      'America': ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN', 'BLZ', 'CRI', 'SLV', 'GTM', 'HND', 'MEX', 'NIC', 'PAN'],
      'Asia': ['AFG', 'ARM', 'AZE', 'BHR', 'BGD', 'BTN', 'BRN', 'KHM', 'CHN', 'CYP', 'GEO', 'IND', 'IDN', 'IRN', 'IRQ', 'ISR', 'JPN', 'JOR', 'KAZ', 'KWT', 'KGZ', 'LAO', 'LBN', 'MYS', 'MDV', 'MNG', 'MMR', 'NPL', 'PRK', 'OMN', 'PAK', 'PSE', 'PHL', 'QAT', 'SAU', 'SGP', 'KOR', 'LKA', 'SYR', 'TWN', 'TJK', 'THA', 'TLS', 'TUR', 'TKM', 'ARE', 'UZB', 'VNM', 'YEM'],
      'Oceania': ['AUS', 'FJI', 'KIR', 'MHL', 'FSM', 'NRU', 'NZL', 'PLW', 'PNG', 'WSM', 'SLB', 'TON', 'TUV', 'VUT']
    }
    
    return regionMap[selectedRegion] || []
  }

  const highlightedCountries = getHighlightedCountries()

  const handleCountryClick = (geo) => {
    const countryCode = geo.properties?.ISO_A3 || geo.id;
    const geoName = geo.properties?.name || geo.properties?.NAME || geo.properties?.NAME_LONG;
    
    // Map geography names to our database region names
    const countryNameMap = {
      'Ethiopia': 'Ethiopia',
      'Colombia': 'Colombia',
      'Indonesia': 'Indonesia',
      'Kenya': 'Kenya',
      'Brazil': 'Brazil',
      'Vietnam': 'Vietnam',
      'Viet Nam': 'Vietnam',
      'Jamaica': 'Jamaica',
      'United States of America': 'Hawaii',
      'Yemen': 'Yemen',
      'Australia': 'Australia',
      'Ecuador': 'Ecuador'
    };
    
    const countryName = countryNameMap[geoName] || geoName;
    
    // Toggle: if clicking the same country, deselect it
    if (selectedCountry === countryName) {
      onClearCountry && onClearCountry();
    } else if (onCountryClick) {
      onCountryClick(countryName, countryCode);
    }
  }

  // Get projection config based on selected region
  const getProjectionConfig = () => {
    if (!selectedRegion) {
      return { scale: 160, center: [0, 20] }; // World view
    }
    
    const regionConfigs = {
      'Asia': { scale: 400, center: [100, 30] },
      'Africa': { scale: 400, center: [20, 0] },
      'America': { scale: 300, center: [-70, -10] },
      'Oceania': { scale: 500, center: [140, -25] }
    };
    
    return regionConfigs[selectedRegion] || { scale: 160, center: [0, 20] };
  };

  const projectionConfig = getProjectionConfig();

  return (
    <div className="world-map-container" onMouseMove={handleMouseMove}>
      <ComposableMap
        projectionConfig={projectionConfig}
        className="world-map"
        style={{ transition: 'all 0.6s ease' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryCode = geo.properties?.ISO_A3 || geo.id;
              const geoName = geo.properties?.name || geo.properties?.NAME || geo.properties?.NAME_LONG;
              
              // Map geography names to our database region names
              const countryNameMap = {
                'Ethiopia': 'Ethiopia',
                'Colombia': 'Colombia',
                'Indonesia': 'Indonesia',
                'Kenya': 'Kenya',
                'Brazil': 'Brazil',
                'Vietnam': 'Vietnam',
                'Viet Nam': 'Vietnam',
                'Jamaica': 'Jamaica',
                'United States of America': 'Hawaii',
                'Yemen': 'Yemen',
                'Australia': 'Australia',
                'Ecuador': 'Ecuador'
              };
              
              const countryName = countryNameMap[geoName] || geoName;
              const isRegionHighlighted = highlightedCountries.includes(countryCode);
              const isCountrySelected = selectedCountry === countryName;
              const isHighlighted = isRegionHighlighted || isCountrySelected;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={() => setHoveredCountry(geoName)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    default: {
                      fill: isHighlighted ? "#D4A574" : "#6B4423",
                      opacity: isHighlighted ? 1 : 0.3,
                      stroke: "#3D2F2A",
                      strokeWidth: 0.5,
                      outline: "none",
                      transition: "all 0.4s ease"
                    },
                    hover: {
                      fill: isHighlighted ? "#E5B585" : "#8B5A3C",
                      opacity: isHighlighted ? 0.95 : 0.5,
                      stroke: "#3D2F2A",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer"
                    },
                    pressed: {
                      fill: isHighlighted ? "#D4A574" : "#6B4423",
                      outline: "none"
                    }
                  }}
                  className={isHighlighted ? "highlighted-region" : ""}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
      
      {hoveredCountry && (
        <div 
          className="map-tooltip"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`
          }}
        >
          {hoveredCountry}
        </div>
      )}
      
      {selectedRegion && !selectedCountry && (
        <div className="map-label">
          <span className="map-label-icon">☕</span>
          <span>{selectedRegion} Coffee Origins</span>
        </div>
      )}
    </div>
  )
}
