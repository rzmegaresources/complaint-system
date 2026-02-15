"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  const updateMarker = useCallback(
    (lat: number, lng: number) => {
      if (!mapInstance.current) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          className: "custom-pin",
          html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(
          mapInstance.current
        );
      }

      mapInstance.current.setView([lat, lng], 15);
      onLocationChange(lat, lng);
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default to Kuala Lumpur center
    const defaultLat = latitude || 3.139;
    const defaultLng = longitude || 101.6869;

    mapInstance.current = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: latitude ? 15 : 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // If we already have coordinates, show the marker
    if (latitude && longitude) {
      updateMarker(latitude, longitude);
    }

    // Click to pin
    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateMarker(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      () => {
        alert("Unable to get your location. Please pin it manually on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          📍 Pin Location <span className="text-slate-400">(Optional)</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
        >
          {locating ? "Locating..." : "📍 Use My Location"}
        </button>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[220px] rounded-xl border border-slate-200 overflow-hidden z-0"
      />
      {latitude && longitude && (
        <p className="text-xs text-slate-400">
          📌 {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      )}
      <p className="text-xs text-slate-400">
        Click on the map to pin the complaint location
      </p>
    </div>
  );
}
