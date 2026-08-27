"use client";

import React, { useEffect, useRef } from "react";
import type { Church } from "@/lib/types";

interface ChurchMapProps {
  churches: Church[];
  selectedChurchId: string | null;
  hoveredChurchId: string | null;
  onSelectChurch: (church: Church) => void;
  center?: [number, number];
  zoom?: number;
}

export default function ChurchMap({
  churches,
  selectedChurchId,
  hoveredChurchId,
  onSelectChurch,
  center,
  zoom = 12,
}: ChurchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    let isMounted = true;

    const setupMap = (L: any) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      // Find first church with coordinates or default to London / US
      const validChurch = churches.find(
        (c) => typeof c.latitude === "number" && typeof c.longitude === "number" && !isNaN(c.latitude) && !isNaN(c.longitude)
      );

      const defaultLat = center ? center[0] : validChurch?.latitude ?? 51.5074;
      const defaultLng = center ? center[1] : validChurch?.longitude ?? -0.1278;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([defaultLat, defaultLng], zoom);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // OpenStreetMap Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Render markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      const bounds: any[] = [];

      churches.forEach((church) => {
        if (
          typeof church.latitude !== "number" ||
          typeof church.longitude !== "number" ||
          isNaN(church.latitude) ||
          isNaN(church.longitude)
        ) {
          return;
        }

        const isSelected = church.id === selectedChurchId;
        const isHovered = church.id === hoveredChurchId;

        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected || isHovered ? "38px" : "32px"};
            height: ${isSelected || isHovered ? "38px" : "32px"};
            background: ${isSelected ? "linear-gradient(135deg, #e11d48, #7c3aed)" : isHovered ? "#7c3aed" : "#1e1b4b"};
            color: #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid #ffffff;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; font-weight: 800; margin-bottom: 2px; margin-left: 2px;">
              ${(church as any).type === "pastor" ? "👤" : (church as any).type === "event" ? "📅" : "✝"}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-church-pin",
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const detailUrl = (church as any).type === "pastor"
          ? `/pastor/${church.slug}`
          : (church as any).type === "event"
            ? `/events/${church.slug}`
            : `/church/${church.slug}`;

        const btnLabel = (church as any).type === "pastor"
          ? "View Pastor"
          : (church as any).type === "event"
            ? "View Event"
            : "View Church";

        const marker = L.marker([church.latitude, church.longitude], { icon })
          .addTo(map)
          .on("click", () => {
            onSelectChurch(church);
          });

        marker.bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; width: 220px; padding: 2px;">
            ${
              church.cover_url
                ? `<div style="height: 90px; width: 100%; border-radius: 8px; background: url('${church.cover_url.split("|||")[0]}') center/cover; margin-bottom: 8px;"></div>`
                : `<div style="height: 70px; width: 100%; border-radius: 8px; background: linear-gradient(135deg, #7c3aed, #ec4899); margin-bottom: 8px;"></div>`
            }
            <div style="font-weight: 800; font-size: 15px; color: #0f172a; margin-bottom: 4px; line-height: 1.2;">
              ${church.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
              📍 ${church.city || church.address_line || "Location"}
            </div>
            <a href="${detailUrl}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 6px;">
              ${btnLabel} &rarr;
            </a>
          </div>
        `);

        markersRef.current[church.id] = marker;
        bounds.push([church.latitude, church.longitude]);
      });

      if (bounds.length > 0) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 14);
        } else {
          map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
        }
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    };

    // Load Leaflet module or global
    const init = async () => {
      let L = (window as any).L;
      if (!L) {
        try {
          const mod = await import("leaflet");
          L = mod.default || mod;
        } catch (err) {
          console.error("Failed to import leaflet dynamically", err);
        }
      }
      if (L) {
        setupMap(L);
      }
    };

    init();

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [churches]);

  // Center on marker when selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedChurchId && markersRef.current[selectedChurchId]) {
      const marker = markersRef.current[selectedChurchId];
      const targetLatLng = marker.getLatLng();
      map.panTo(targetLatLng, { animate: true, duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedChurchId]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        minHeight: "100%",
        position: "relative",
        zIndex: 1 
      }} 
    />
  );
}
