import React, { useEffect, useRef } from 'react';
import { MapLocation } from '../types';

interface MapVisualizationProps {
  locations: MapLocation[];
}

// Ensure Leaflet is recognized as a global variable
declare global {
  interface Window {
    L: any;
  }
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ locations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L || locations.length === 0) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      });
      
      // Add Zoom control to top-right
      window.L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
      
      // Add Attribution (minimal)
      window.L.control.attribution({ prefix: false }).addAttribution('&copy; OpenStreetMap').addTo(mapInstanceRef.current);

      // Add CartoDB Dark Matter tiles for a "hacker/dark mode" look
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create a custom icon using HTML/CSS for better styling without asset dependencies
    const createCustomIcon = (color: string) => {
      return window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid #0f172a;
            box-shadow: 0 0 10px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: #fff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    };

    // Add new markers
    const bounds = window.L.latLngBounds([]);
    
    locations.forEach((loc, index) => {
      const marker = window.L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(index === 0 ? '#10b981' : '#ef4444') // Emerald for first result, red for others
      })
      .bindPopup(`
        <div class="font-sans">
          <h3 class="font-bold text-sm text-emerald-400 mb-1">${loc.title}</h3>
          <p class="text-xs text-slate-300">Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}</p>
          ${loc.uri ? `<a href="${loc.uri}" target="_blank" class="block mt-2 text-xs text-blue-400 hover:underline">Открыть в Google Maps</a>` : ''}
        </div>
      `)
      .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([loc.lat, loc.lng]);
    });

    // Fit bounds with padding
    if (locations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Force map invalidation to ensure tiles load properly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [locations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-700 shadow-xl z-0">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-900" />
      {/* Overlay gradient for aesthetics */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default MapVisualization;