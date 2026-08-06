import React, { useState, useRef, useEffect } from "react";

interface SharedAddressFieldProps {
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
  onUpdateCountry: (val: string) => void;
  onUpdateAddress: (val: string) => void;
  onUpdateCity?: (val: string) => void;
  onUpdateCoordinates: (lat: number | undefined, lng: number | undefined) => void;
  errors?: { country?: string, address?: string };
  idPrefix: string;
}

function InteractiveMap({ lat, lng, onDragEnd }: { lat: number; lng: number; onDragEnd: (lat: number, lng: number) => void }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const isManualDragRef = useRef(false);

  useEffect(() => {
    // Load Leaflet CSS dynamically
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([lat, lng], 16);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="width: 32px; height: 32px; background: #7e22ce; border: 3px solid #fff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; alignItems: center; justifyContent: center;"><div style="width: 10px; height: 10px; background: #fff; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
        markerRef.current = marker;

        marker.on("dragend", () => {
          isManualDragRef.current = true;
          const position = marker.getLatLng();
          onDragEnd(position.lat, position.lng);
        });

        // Add custom "Detect my location" button directly below zoom controls (+ / -)
        const LocateControl = L.Control.extend({
          options: { position: 'topleft' },
          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const btn = L.DomUtil.create('a', '', container);
            btn.href = '#';
            btn.title = 'Auto-detect my location';
            btn.innerHTML = `<i class="ti ti-target" style="font-size: 16px; color: #7e22ce; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"></i>`;
            btn.style.width = '30px';
            btn.style.height = '30px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.background = '#fff';

            L.DomEvent.on(btn, 'click', function(e: any) {
              L.DomEvent.stopPropagation(e);
              L.DomEvent.preventDefault(e);
              if (navigator.geolocation) {
                btn.innerHTML = `<i class="ti ti-loader-2 spin" style="font-size: 15px; color: #7e22ce; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"></i>`;
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const uLat = pos.coords.latitude;
                    const uLng = pos.coords.longitude;
                    isManualDragRef.current = true;
                    map.setView([uLat, uLng], 17);
                    marker.setLatLng([uLat, uLng]);
                    onDragEnd(uLat, uLng);
                    btn.innerHTML = `<i class="ti ti-target" style="font-size: 16px; color: #7e22ce; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"></i>`;
                  },
                  (err) => {
                    alert("Location access denied or unavailable.");
                    btn.innerHTML = `<i class="ti ti-target" style="font-size: 16px; color: #334155; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"></i>`;
                  },
                  { enableHighAccuracy: true }
                );
              }
            });

            return container;
          }
        });
        map.addControl(new LocateControl());
      } else {
        if (!isManualDragRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
        isManualDragRef.current = false;
      }
    };

    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [lat, lng]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: "100%", height: "220px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", overflow: "hidden" }} 
    />
  );
}

const COUNTRIES = [
  ["GB", "United Kingdom"], ["US", "United States"], ["NG", "Nigeria"], ["GH", "Ghana"], ["KE", "Kenya"],
  ["ZA", "South Africa"], ["CA", "Canada"], ["AU", "Australia"], ["IE", "Ireland"], ["IN", "India"],
  ["PK", "Pakistan"], ["BD", "Bangladesh"], ["LK", "Sri Lanka"], ["PH", "Philippines"], ["JM", "Jamaica"],
  ["TT", "Trinidad & Tobago"], ["BB", "Barbados"], ["NZ", "New Zealand"], ["FR", "France"], ["DE", "Germany"],
  ["NL", "Netherlands"], ["ES", "Spain"], ["PT", "Portugal"], ["IT", "Italy"], ["BE", "Belgium"],
  ["CH", "Switzerland"], ["AT", "Austria"], ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"],
  ["FI", "Finland"], ["PL", "Poland"], ["RO", "Romania"], ["UA", "Ukraine"], ["GR", "Greece"],
  ["HU", "Hungary"], ["CZ", "Czechia"], ["LT", "Lithuania"], ["LV", "Latvia"], ["BG", "Bulgaria"],
  ["HR", "Croatia"], ["RS", "Serbia"], ["AL", "Albania"], ["BR", "Brazil"], ["MX", "Mexico"],
  ["AR", "Argentina"], ["CO", "Colombia"], ["CL", "Chile"], ["PE", "Peru"], ["EC", "Ecuador"],
  ["VE", "Venezuela"], ["GT", "Guatemala"], ["CN", "China"], ["HK", "Hong Kong"], ["TW", "Taiwan"],
  ["KR", "South Korea"], ["JP", "Japan"], ["VN", "Vietnam"], ["TH", "Thailand"], ["MY", "Malaysia"],
  ["SG", "Singapore"], ["ID", "Indonesia"], ["NP", "Nepal"], ["AE", "United Arab Emirates"], ["SA", "Saudi Arabia"],
  ["QA", "Qatar"], ["KW", "Kuwait"], ["IL", "Israel"], ["TR", "Turkey"], ["EG", "Egypt"],
  ["MA", "Morocco"], ["DZ", "Algeria"], ["ET", "Ethiopia"], ["UG", "Uganda"], ["TZ", "Tanzania"],
  ["RW", "Rwanda"], ["ZW", "Zimbabwe"], ["ZM", "Zambia"], ["CM", "Cameroon"], ["CI", "Côte d'Ivoire"],
  ["SN", "Senegal"], ["AO", "Angola"], ["MZ", "Mozambique"], ["BW", "Botswana"], ["MW", "Malawi"],
  ["NA", "Namibia"], ["SL", "Sierra Leone"], ["LR", "Liberia"], ["GM", "Gambia"], ["CD", "DR Congo"],
  ["RU", "Russia"], ["BY", "Belarus"], ["MD", "Moldova"], ["GE", "Georgia"], ["AM", "Armenia"],
  ["MT", "Malta"], ["CY", "Cyprus"], ["LU", "Luxembourg"], ["IS", "Iceland"], ["EE", "Estonia"],
  ["SK", "Slovakia"], ["SI", "Slovenia"]
];

function flagEmoji(code: string) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function SharedAddressField({ country, address, latitude, longitude, onUpdateCountry, onUpdateAddress, onUpdateCity, onUpdateCoordinates, errors, idPrefix }: SharedAddressFieldProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const countryRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (addressRef.current && !addressRef.current.contains(event.target as Node)) {
        (window as any)[`predictions_${idPrefix}`] = [];
        (window as any)[`hasNoPredictions_${idPrefix}`] = false;
        setTrigger(Math.random());
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseTypedAddress = () => {
    const extractedCity = getLocality(address);
    if (extractedCity && onUpdateCity) {
      onUpdateCity(extractedCity);
    }
    onUpdateCoordinates(0.0001, 0.0001);
    (window as any)[`predictions_${idPrefix}`] = [];
    (window as any)[`hasNoPredictions_${idPrefix}`] = false;
    setTrigger(Math.random());
  };

  const predictions = typeof window !== 'undefined' ? (window as any)[`predictions_${idPrefix}`] || [] : [];
  const hasNoPredictions = typeof window !== 'undefined' ? (window as any)[`hasNoPredictions_${idPrefix}`] || false : false;

  const filteredCountries = COUNTRIES.filter(c => c[1].toLowerCase().includes((country || '').toLowerCase())).slice(0, 50);

  const selectCountry = (name: string) => {
    onUpdateCountry(name);
    setShowDropdown(false);
  };

  const getLocality = (addressStr: string) => {
    let q = addressStr || '';
    q = q.replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/ig,'').replace(/\b\d{5}(?:-\d{4})?\b/g,'');
    const parts = q.split(',').map(s=>s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const loc = parts[parts.length-1].replace(/,+$/,'').trim();
      if (loc.length > 1 && /[a-zA-Z]/.test(loc)) return loc;
    }
    return '';
  };

  const formatAddress = (p: any, typedAddress: string) => {
    const a = p.address || {};
    const typedNum = (typedAddress.match(/^\s*(\d+[a-zA-Z]?)\b/)||[])[1]||'';
    const building = a.building || a.amenity || a.place || '';
    const num = a.house_number || typedNum || '';
    const road = [num, a.road || a.pedestrian || a.path].filter(Boolean).join(' ');
    const line1 = [building, road].filter(Boolean).join(', ') || p.display_name.split(',')[0];
    const town = getLocality(typedAddress) || a.city || a.town || a.village || a.municipality || '';
    const line2 = [town, a.postcode, a.country].filter(Boolean).join(', ');
    return { line1, line2 };
  };

  const selectedCountryCode = COUNTRIES.find(c => c[1] === country)?.[0];

  return (
    <>
      <label>Country <span className="req-badge">REQUIRED</span></label>
      <div id={`f-country-${idPrefix}`} style={{ position: "relative", marginBottom: "18px" }} ref={countryRef}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", zIndex: 2 }}>{selectedCountryCode ? flagEmoji(selectedCountryCode) : "🌍"}</span>
        <input 
          placeholder="Select your country" 
          style={{ paddingLeft: "44px", paddingRight: "44px", backgroundColor: country && !showDropdown ? "#f0fdf4" : "", border: errors?.country ? "1.5px solid red" : (country && !showDropdown ? "1.5px solid #16a34a" : "") }} 
          value={country || ""}
          onChange={(e) => {
            onUpdateCountry(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {country && !showDropdown && (
          <i className="ti ti-circle-check-filled" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#16a34a" }}></i>
        )}
        {showDropdown && (
          <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 10, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 10px 25px rgba(15,15,26,0.08)" }}>
            {filteredCountries.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: "12px", color: "var(--cn-gray)" }}>No matching country</div>
            ) : (
              filteredCountries.map(c => (
                <div 
                  key={c[0]} 
                  className="autocomplete-item" 
                  style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.2s" }}
                  onClick={() => selectCountry(c[1])}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--cn-surface)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{flagEmoji(c[0])}</span>
                  <div style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)" }}>{c[1]}</div>
                </div>
              ))
            )}
          </div>
        )}
        {errors?.country && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.country}</div>}
      </div>

      <label>Find your address <span className="req-badge">REQUIRED</span></label>
      {!latitude ? (
        <div id={`f-address-${idPrefix}`} style={{ position: "relative", marginBottom: "6px" }} ref={addressRef}>
          <i className="ti ti-search" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
          <input 
            placeholder="Type your street and number…" 
            style={{ paddingLeft: "42px", border: errors?.address ? "1.5px solid red" : "" }} 
            value={address || ""}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateAddress(val);
              
              const to = (window as any)[`addrTimeout_${idPrefix}`];
              if (to) clearTimeout(to);
              
              if (val.length > 3 && country) {
                (window as any)[`addrTimeout_${idPrefix}`] = setTimeout(async () => {
                  try {
                    const cc = COUNTRIES.find(c => c[1] === country)?.[0] || "";
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=${cc}&addressdetails=1&limit=5`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                      (window as any)[`predictions_${idPrefix}`] = data;
                      (window as any)[`hasNoPredictions_${idPrefix}`] = data.length === 0;
                    } else {
                      (window as any)[`predictions_${idPrefix}`] = [];
                      (window as any)[`hasNoPredictions_${idPrefix}`] = true;
                    }
                    setTrigger(Math.random());
                  } catch (err) {
                    (window as any)[`hasNoPredictions_${idPrefix}`] = true;
                    setTrigger(Math.random());
                  }
                }, 500);
              } else {
                (window as any)[`predictions_${idPrefix}`] = [];
                (window as any)[`hasNoPredictions_${idPrefix}`] = false;
                setTrigger(Math.random());
              }
            }}
          />
          
          {(Array.isArray(predictions) && predictions.length > 0 && address) ? (
            <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 9999, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", boxShadow: "0 10px 25px rgba(15,15,26,0.08)", maxHeight: "200px", overflowY: "auto" }}>
              {predictions.map((p: any, i: number) => {
                const { line1, line2 } = formatAddress(p, address || '');
                return (
                <div 
                  key={i} 
                  style={{ padding: "11px 14px", display: "flex", alignItems: "center", cursor: "pointer", borderBottom: "1px solid #f1f0f5" }}
                  onClick={() => {
                    const a = p.address || {};
                    const detectedCity = a.city || a.town || a.village || a.municipality || a.county || getLocality(address || '');
                    if (detectedCity && onUpdateCity) {
                      onUpdateCity(detectedCity);
                    }
                    onUpdateAddress([line1, line2].filter(Boolean).join(', '));
                    onUpdateCoordinates(parseFloat(p.lat), parseFloat(p.lon));
                    (window as any)[`predictions_${idPrefix}`] = [];
                    (window as any)[`hasNoPredictions_${idPrefix}`] = false;
                    setTrigger(Math.random());
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--cn-surface)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "12px" }}>
                    <i className="ti ti-map-pin" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {line1}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--cn-gray)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {line2}
                    </div>
                  </div>
                  <i className="ti ti-arrow-right" style={{ fontSize: "14px", color: "var(--cn-gray-light)", flexShrink: 0 }}></i>
                </div>
              )})}
            </div>
          ) : hasNoPredictions && address ? (
            <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 9999, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", boxShadow: "0 10px 25px rgba(15,15,26,0.08)", padding: "14px 16px" }}>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
                <i className="ti ti-map-pin" style={{ fontSize: "16px", color: "var(--cn-gray-light)", marginTop: "1px" }}></i>
                <span>We couldn't verify this exact address. You can continue with the address you typed — we'll save it as entered.</span>
              </div>
              <button 
                onClick={handleUseTypedAddress}
                style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", background: "var(--cn-purple)", border: "none", padding: "9px 16px", borderRadius: "9px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <i className="ti ti-check" style={{ fontSize: "14px" }}></i> Use the address I typed
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ marginBottom: "18px" }}>
          {latitude === 0.0001 ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px", position: "relative" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: "15px", color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i>
              <div style={{ fontSize: "12.5px", color: "#92400e", fontWeight: 600 }}>
                <strong>Saved as you entered it</strong> (not auto-verified): {address}
              </div>
              <button 
                onClick={() => { onUpdateCoordinates(undefined, undefined); onUpdateAddress(""); }}
                style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "#d97706" }}
                title="Change address"
              >
                <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i>
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px", position: "relative" }}>
                <i className="ti ti-circle-check-filled" style={{ fontSize: "15px", color: "#16a34a", flexShrink: 0, marginTop: "1px" }}></i>
                <div style={{ fontSize: "12.5px", color: "#15803d", fontWeight: 600 }}>{address}</div>
                <button 
                  onClick={() => { onUpdateCoordinates(undefined, undefined); onUpdateAddress(""); }}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}
                  title="Change address"
                >
                  <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i>
                </button>
              </div>
              
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "9px" }}>
                  <label style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--cn-ink)" }}>
                    Confirm or drag the pin to your exact building
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--cn-purple)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="ti ti-hand-grab" style={{ fontSize: "13px" }}></i> Drag pin to refine location
                  </span>
                </div>

                <InteractiveMap 
                  lat={latitude!} 
                  lng={longitude!} 
                  onDragEnd={(newLat, newLng) => {
                    onUpdateCoordinates(newLat, newLng);
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
      
      {errors?.address && !latitude ? (
         <div style={{ color: "red", fontSize: "12px", marginBottom: "14px" }}>{errors.address}</div>
      ) : !latitude ? (
        <div style={{ fontSize: "11.5px", color: "var(--cn-gray-light)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-info-circle" style={{ fontSize: "12px" }}></i>
          Just type your street and number — we validate it and store the rest for you.
        </div>
      ) : null}
    </>
  );
}
