"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in leaflet + next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom orange driver icon (inline SVG avoids dangerouslySetInnerHTML)
const driverIcon = L.divIcon({
  className: "",
  html: '<div style="background:#FF8C00;color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.2);border:3px solid #fff;font-size:20px;">🚚</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Home marker
const homeIcon = L.divIcon({
  className: "",
  html: '<div style="background:#10B981;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.2);border:3px solid #fff;font-size:18px;">🏠</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface MapProps {
  driverLat: number;
  driverLng: number;
  homeLat: number;
  homeLng: number;
}

export default function MapComponent({ driverLat, driverLng, homeLat, homeLng }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-50 animate-pulse rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <span className="text-4xl mb-2 animate-bounce">📍</span>
        <span className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Map...</span>
      </div>
    );
  }

  const centerLat = (driverLat + homeLat) / 2;
  const centerLng = (driverLng + homeLng) / 2;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200" style={{ zIndex: 0 }}>
      <MapContainer center={[centerLat, centerLng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[driverLat, driverLng]} icon={driverIcon}>
          <Popup>
            <div style={{ textAlign: "center", minWidth: 120 }}>
              <p style={{ fontWeight: 700, color: "#FF8C00", fontSize: 14, margin: 0 }}>Driver</p>
              <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>In Transit</p>
            </div>
          </Popup>
        </Marker>
        <Marker position={[homeLat, homeLng]} icon={homeIcon}>
          <Popup>
            <div style={{ textAlign: "center", minWidth: 120 }}>
              <p style={{ fontWeight: 700, color: "#10B981", fontSize: 14, margin: 0 }}>Your Home</p>
              <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Delivery Destination</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
