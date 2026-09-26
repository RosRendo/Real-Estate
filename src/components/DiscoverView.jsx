import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Star, Heart } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const getLatLng = (item) => {
  if (item.address.toLowerCase().includes("bangkok")) {
    if (item.id.includes("sathorn")) return [13.7201, 100.5273];
    if (item.id.includes("sukhumvit")) return [13.7367, 100.5604];
    return [13.7563, 100.5018];
  }
  if (item.address.toLowerCase().includes("ho chi minh") || item.address.toLowerCase().includes("vietnam") || item.address.toLowerCase().includes("saigon")) {
    if (item.id.includes("riverside")) return [10.7903, 106.7214];
    return [10.7769, 106.7009];
  }
  if (item.address.toLowerCase().includes("toul kork")) return [11.5683, 104.8906];
  if (item.address.toLowerCase().includes("tonle bassac")) return [11.5516, 104.9329];
  if (item.address.toLowerCase().includes("sen sok") || item.address.toLowerCase().includes("sensok")) return [11.5833, 104.8667];
  if (item.address.toLowerCase().includes("chroy changvar")) return [11.5973, 104.9318];
  if (item.address.toLowerCase().includes("bkk1") || item.address.toLowerCase().includes("bkk 1")) return [11.5471, 104.9254];
  if (item.address.toLowerCase().includes("diamond island")) return [11.5452, 104.9392];
  
  // default offset based on coords to prevent overlap
  const offsetLat = (item.coords?.x || 0) * 0.01;
  const offsetLng = (item.coords?.z || 0) * 0.01;
  return [11.5564 + offsetLat, 104.9282 + offsetLng];
};

export default function DiscoverView({ 
  listings, 
  onViewProperty,
  filters,
  setFilters,
  selectedListingId,
  setSelectedListingId,
  savedListingIds = [],
  onToggleSave,
  comparedListingIds = [],
  onToggleCompare,
  isSavedView = false
}) {
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [popupPixelCoords, setPopupPixelCoords] = useState(null);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const inName = item.name.toLowerCase().includes(query);
        const inAddress = item.address.toLowerCase().includes(query);
        if (!inName && !inAddress) return false;
      }
      if (filters.type !== "All" && item.type !== filters.type) {
        return false;
      }
      if (filters.minPrice && item.price < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && item.price > Number(filters.maxPrice)) {
        return false;
      }
      // Purpose & Project filtering (Only if we are NOT in the Saved view)
      if (!isSavedView) {
        if (filters.isProject) {
          if (!item.isProject) return false;
        } else {
          if (item.isProject) return false;
          if (filters.purpose && filters.purpose !== "All" && item.purpose !== filters.purpose) return false;
        }
      }
      return true;
    });
  }, [listings, filters, isSavedView]);

  // Auto-scroll sidebar results to show selected card when price pin is clicked
  useEffect(() => {
    if (selectedListingId) {
      const element = document.getElementById(`listing-card-${selectedListingId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedListingId]);

  // Compute active city for dynamic map labels
  const activeCity = useMemo(() => {
    const q = (filters.search || "").toLowerCase();
    if (q.includes("bangkok") || q.includes("thailand")) return "Bangkok";
    if (q.includes("ho chi minh") || q.includes("hcmc") || q.includes("vietnam") || q.includes("saigon")) return "HCMC";
    return "Phnom Penh";
  }, [filters.search]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    let center = [11.5564, 104.9282]; // Phnom Penh
    if (activeCity === "Bangkok") center = [13.7201, 100.5273];
    if (activeCity === "HCMC") center = [10.7769, 106.7009];

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false // Custom zoom buttons in top overlay
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Custom zoom actions matching map container buttons
    const zoomInBtn = document.getElementById("leaflet-zoom-in-btn");
    const zoomOutBtn = document.getElementById("leaflet-zoom-out-btn");
    if (zoomInBtn) {
      zoomInBtn.onclick = () => map.zoomIn();
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = () => map.zoomOut();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, activeCity]);

  // Sync Leaflet markers when listings filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredListings.forEach(item => {
      const position = getLatLng(item);
      const isSelected = item.id === selectedListingId;
      const priceText = formatPrice(item.price);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div class="map-price-pin ${isSelected ? 'selected' : ''}">${priceText}</div>`,
        iconSize: [64, 28],
        iconAnchor: [32, 14]
      });

      const marker = L.marker(position, { icon: customIcon }).addTo(markersLayerRef.current);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedListingId(item.id);
        mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom(), { animate: true });
      });
    });

    // Auto-center map if a property is selected
    if (selectedListingId) {
      const selectedItem = filteredListings.find(l => l.id === selectedListingId);
      if (selectedItem) {
        const position = getLatLng(selectedItem);
        mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom(), { animate: true });
      }
    }
  }, [filteredListings, selectedListingId]);

  // Sync selected listing pixel coordinates for popup card placing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedListingId) {
      setPopupPixelCoords(null);
      return;
    }

    const item = listings.find(l => l.id === selectedListingId);
    if (!item) {
      setPopupPixelCoords(null);
      return;
    }

    const updatePopupPosition = () => {
      const position = getLatLng(item);
      const point = map.latLngToContainerPoint(position);
      setPopupPixelCoords({ x: point.x, y: point.y });
    };

    updatePopupPosition();

    map.on('move zoom viewreset', updatePopupPosition);

    return () => {
      map.off('move zoom viewreset', updatePopupPosition);
    };
  }, [selectedListingId, listings, showMap]);

  // Auto-scroll sidebar results to show selected card when price pin is clicked
  useEffect(() => {
    if (selectedListingId) {
      const element = document.getElementById(`listing-card-${selectedListingId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedListingId]);




  const formatPrice = (val) => {
    return val >= 1000000 
      ? `$${(val / 1000000).toFixed(1)}M` 
      : `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="discover-layout" style={{ gridTemplateColumns: showMap ? "var(--sidebar-width) 1fr" : "1fr" }}>
      <aside className="search-sidebar" style={{ overflow: "hidden" }}>
        {/* Sidebar Filters */}
        <div className="sidebar-header">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--text-white)" }}>
            {isSavedView ? "Saved Properties" : "Discover Phnom Penh"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input 
                type="text"
                placeholder="Search location, listing..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.82rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Filters Row */}
            <div style={{ display: "flex", gap: "8px" }}>
              <select 
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  outline: "none"
                }}
              >
                <option value="All">All Types</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Duplex">Duplex</option>
              </select>

              <input 
                type="number" 
                placeholder="Max price ($)"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                style={{
                  flex: 1.2,
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {/* Airbnb Style Listing Cards */}
        <div 
          className="sidebar-results"
          style={{
            flex: 1,
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {filteredListings.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 10px", fontSize: "0.85rem" }}>
              No matches found.
            </div>
          ) : (
            filteredListings.map(item => {
              const isSelected = item.id === selectedListingId;
              return (
                <div
                  key={item.id}
                  id={`listing-card-${item.id}`}
                  className={`glass-card ${isSelected ? "glow-active" : ""}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                    background: "#ffffff",
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border-medium)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    padding: "12px",
                    boxShadow: isSelected ? "0 8px 24px rgba(37, 99, 235, 0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  onMouseEnter={() => setHoveredCardId(item.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  onClick={() => onViewProperty(item.id)}
                >
                  {/* Photo Container */}
                  <div style={{ position: "relative", display: "block", width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                    <img 
                      src={(item.photos && item.photos[0]) ? item.photos[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.name} 
                      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <span 
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        background: "var(--accent)",
                        color: "#ffffff",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        textTransform: "uppercase"
                      }}
                    >
                      {item.tier}
                    </span>

                    {/* Heart Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(item.id);
                      }}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(15, 23, 42, 0.5)",
                        border: "none",
                        cursor: "pointer",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        padding: 0,
                        backdropFilter: "blur(4px)"
                      }}
                    >
                      <Heart 
                        size={14} 
                        fill={savedListingIds.includes(item.id) ? "#ef4444" : "none"} 
                        style={{ 
                          color: savedListingIds.includes(item.id) ? "#ef4444" : "#ffffff"
                        }} 
                      />
                    </button>
                  </div>

                  {/* Airbnb Style Text Metadata */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "2px 4px" }}>
                    {/* Location & Star */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>{item.address.split(",")[0]}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b", fontWeight: 600 }}>
                        <Star size={12} fill="currentColor" /> 4.9
                      </span>
                    </div>

                    {/* Description subtitle */}
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {item.type || "Residential"} • {item.beds} beds • {item.baths} baths • {item.area} m²
                    </span>

                    {/* Neighborhood distance */}
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      📍 {(() => {
                        const x = item.coords?.x || 0;
                        const z = item.coords?.z || 0;
                        return (Math.sqrt(x * x + z * z) * 0.4).toFixed(1);
                      })()}km from downtown
                    </span>

                    {/* Media Feature Badges */}
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {item.tier !== "Basic" && (
                        <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          🏠 {item.tier === "Premium" ? "3D Building" : "3D Tour"}
                        </span>
                      )}
                      {item.videoUrl && (
                        <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          🎥 Video
                        </span>
                      )}
                      {item.rooms && (
                        <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          360° Tour
                        </span>
                      )}
                    </div>

                    {/* Contextual Compare Checkbox */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }} onClick={(e) => e.stopPropagation()}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                        <input 
                          type="checkbox"
                          checked={comparedListingIds.includes(item.id)}
                          onChange={() => onToggleCompare(item.id)}
                          style={{ cursor: "pointer" }}
                        />
                        Compare
                      </label>
                    </div>

                    {/* Price tag */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                        ${item.price.toLocaleString()} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-secondary)" }}>{item.purpose === "Rent" ? "/mo" : "total"}</span>
                      </span>
                      
                      {/* Slim text detail link instead of boxy buttons */}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProperty(item.id);
                        }}
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "var(--accent)",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Real Interactive Leaflet Map Area */}
      {showMap && (
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          {/* Leaflet container */}
          <div 
            ref={mapContainerRef} 
            style={{ width: "100%", height: "100%", zIndex: 1 }}
          />

          {/* Floating Zoom Controls Overlay (Sleek minimalist circles matching premium UI) */}
          <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              id="leaflet-zoom-in-btn"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid var(--border-medium)",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                outline: "none"
              }}
            >
              +
            </button>
            <button
              id="leaflet-zoom-out-btn"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid var(--border-medium)",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                outline: "none"
              }}
            >
              −
            </button>
          </div>

          {/* Selected preview popup card (floats dynamically next to clicked pin coordinates) */}
          {selectedListingId && popupPixelCoords && (
            (() => {
              const item = listings.find(l => l.id === selectedListingId);
              if (!item) return null;
              
              const xPercent = (popupPixelCoords.x / (mapContainerRef.current?.clientWidth || 800)) * 100;
              const yPercent = (popupPixelCoords.y / (mapContainerRef.current?.clientHeight || 600)) * 100;
              
              const showBelow = yPercent < 45;
              let translateX = "-50%";
              if (xPercent < 20) {
                translateX = "-15%";
              } else if (xPercent > 80) {
                translateX = "-85%";
              }
              
              return (
                <div 
                  className="glass-card animate-slide-up"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    left: `${popupPixelCoords.x}px`,
                    top: `${popupPixelCoords.y}px`,
                    transform: `translate(${translateX}, ${showBelow ? "15px" : "-105%"})`,
                    width: "240px",
                    padding: "12px",
                    zIndex: 1000, // Make sure it floats on top of all Leaflet elements
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    transition: "transform 0.15s ease"
                  }}
                >
                  {/* Popup Image */}
                  <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                    <img 
                      src={(item.photos && item.photos[0]) ? item.photos[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <span 
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        fontSize: "0.55rem",
                        fontWeight: 800,
                        background: "var(--accent)",
                        color: "#ffffff",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}
                    >
                      {item.purpose === "Rent" ? "For Rent" : "For Sale"}
                    </span>
                  </div>

                  {/* Popup Details */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "2px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "170px", margin: 0 }}>{item.name}</h4>
                    <button 
                      style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem", padding: "0 4px", display: "flex", alignItems: "center" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedListingId(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {item.address}
                  </span>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                      ${item.price.toLocaleString()}{item.purpose === "Rent" ? "/mo" : ""}
                    </span>
                    <span>
                      {item.beds} beds • {item.baths} baths
                    </span>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "8px", fontSize: "0.75rem", borderRadius: "8px", background: "var(--accent)", color: "#ffffff", border: "none", fontWeight: 600 }}
                    onClick={() => onViewProperty(item.id)}
                  >
                    View Details
                  </button>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Floating Map/List View Toggle Button (Zillow/Airbnb Style) */}
      <button 
        onClick={() => setShowMap(!showMap)}
        style={{
          position: "fixed",
          bottom: comparedListingIds.length > 0 ? "84px" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0f172a",
          color: "#ffffff",
          border: "none",
          borderRadius: "24px",
          padding: "10px 20px",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          zIndex: 90,
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {showMap ? (
          <>
            <span style={{ fontSize: "1rem" }}>📋</span> Show List Only
          </>
        ) : (
          <>
            <span style={{ fontSize: "1rem" }}>🗺️</span> Show Map
          </>
        )}
      </button>
    </div>
  );
}
