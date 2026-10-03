import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function AddressMapPicker({
  initialCoords = { lat: 12.9716, lng: 77.5946 }, // Default Bengaluru
  onLocationSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [currentCoords, setCurrentCoords] = useState(initialCoords);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pinInfo, setPinInfo] = useState('Indiranagar, Bengaluru');

  // Custom marker icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'plantme-location-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="width: 36px; height: 36px; background: #166534; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.35);">
            <div style="width: 14px; height: 14px; background: #22c55e; border-radius: 50%; transform: rotate(45deg); box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);"></div>
          </div>
          <div style="position: absolute; bottom: -6px; left: 14px; width: 8px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1.5px);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  };

  // Reverse geocode via free OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) return;
      const data = await response.json();
      const addr = data.address || {};
      
      const pincode = addr.postcode || '';
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.road || '';
      const road = addr.road || '';
      const city = addr.city || addr.town || addr.county || 'Bengaluru';
      const state = addr.state || 'Karnataka';
      const displayName = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : 'Selected Location';

      setPinInfo(`${road ? road + ', ' : ''}${city} ${pincode ? '(' + pincode + ')' : ''}`);

      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          pincode,
          area,
          street: road,
          city,
          state,
          landmark: addr.amenity || addr.building || '',
          fullAddress: displayName
        });
      }
    } catch (err) {
      console.warn("Geocoding notice:", err);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const startLat = currentCoords.lat || 12.9716;
    const startLng = currentCoords.lng || 77.5946;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 15,
        zoomControl: false
      });

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Draggable Pin Marker
      const marker = L.marker([startLat, startLng], {
        icon: createPinIcon(),
        draggable: true
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setCurrentCoords({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      // Click anywhere on map to reposition pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Trigger initial reverse geocode
      reverseGeocode(startLat, startLng);
    } catch (err) {
      console.warn("Leaflet map initialization notice:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Use Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Location error:", err);
        setIsLocating(false);
        alert("Could not access your location. Please ensure location permissions are granted.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search locality
  const handleSearchLocality = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = encodeURIComponent(`${searchQuery}, Bengaluru, Karnataka, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
      const results = await res.json();
      if (results && results.length > 0) {
        const target = results[0];
        const lat = parseFloat(target.lat);
        const lng = parseFloat(target.lon);
        setCurrentCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1 });
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
      } else {
        alert("Locality not found. You can drag the pin manually on the map.");
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
      {/* Top Search & GPS Control Bar */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        zIndex: 500,
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <form onSubmit={handleSearchLocality} style={{ flex: 1, display: 'flex', background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '2px 4px 2px 10px', border: '1px solid #e2e8f0' }}>
          <input
            type="text"
            placeholder="Search area (e.g. Indiranagar, Whitefield, Koramangala)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '11.5px', padding: '6px 0', background: 'transparent' }}
          />
          <button
            type="submit"
            disabled={isSearching}
            style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', margin: '2px' }}
          >
            {isSearching ? '...' : 'Find'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          title="Use my current GPS position"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '7px 12px',
            fontSize: '11.5px',
            fontWeight: 800,
            color: '#166534',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>📍</span>
          <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '240px',
          background: '#f1f5f9',
          cursor: 'crosshair'
        }}
      />

      {/* Bottom Pinned Coordinates Badge */}
      <div style={{
        background: '#ffffff',
        padding: '8px 14px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span style={{ color: '#166534', fontWeight: 800 }}>📍 Pinned:</span>
          <span style={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
            {pinInfo}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
          {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
