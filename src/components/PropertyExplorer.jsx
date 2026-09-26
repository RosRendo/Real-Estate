import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MapPin, School, Train, ShoppingCart, Activity } from "lucide-react";

export default function PropertyExplorer({ 
  properties, 
  selectedPropertyId, 
  onSelectProperty,
  filters,
  setFilters
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Available Property Types
  const propertyTypes = ["All", "Apartment", "House", "Duplex", "Commercial"];

  // Filter handlers
  const handleTypeChange = (e) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || "" }));
  };

  const togglePoisFilter = (poiType) => {
    setFilters(prev => {
      const activePois = { ...prev.pois };
      activePois[poiType] = !activePois[poiType];
      return { ...prev, pois: activePois };
    });
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // 1. Search Query (name or address)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = prop.name.toLowerCase().includes(query);
        const matchesAddress = prop.address.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress) return false;
      }

      // 2. Property Type
      if (filters.type !== "All" && prop.type !== filters.type) {
        return false;
      }

      // 3. Max Price (Rent)
      if (filters.maxPrice) {
        // Find minimum unit price
        const minRent = Math.min(...prop.units.map(u => u.rent));
        if (minRent > filters.maxPrice) return false;
      }

      // 4. Proximity (POIs within 500m)
      // Check if any checked POI filters are violated
      const activePoiTypes = Object.entries(filters.pois)
        .filter(([_, active]) => active)
        .map(([type, _]) => type);

      for (const reqType of activePoiTypes) {
        // Find if this property has a POI of reqType with distance <= 500
        const hasClosePoi = prop.nearbyPOIs.some(
          poi => poi.type === reqType && poi.distance <= 500
        );
        if (!hasClosePoi) return false; // Fails proximity requirement
      }

      return true;
    });
  }, [properties, filters]);

  // Aggregate unit details for cards
  const getPropertySummary = (prop) => {
    const total = prop.units.length;
    const occupied = prop.units.filter(u => u.status === "occupied").length;
    const minRent = Math.min(...prop.units.map(u => u.rent));
    const maxRent = Math.max(...prop.units.map(u => u.rent));
    
    return {
      total,
      occupied,
      rentRange: total === 1 ? `$${minRent}` : `$${minRent} - $${maxRent}`
    };
  };

  return (
    <div className="glass-panel animate-slide-left">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <MapPin style={{ color: "var(--accent)" }} size={20} />
          Property Directory
        </h2>
        <div className="panel-subtitle">Explore portfolio layout</div>
      </div>

      {/* Search & Filters */}
      <div 
        style={{ 
          padding: "16px 24px", 
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div style={{ position: "relative" }}>
          <Search 
            size={16} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} 
          />
          <input 
            type="text" 
            placeholder="Search location / property..."
            value={filters.search}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-white)",
              fontSize: "0.85rem",
              outline: "none",
              fontFamily: "var(--font-body)"
            }}
          />
        </div>

        <button 
          className="btn btn-secondary"
          style={{ width: "100%", padding: "8px 12px", fontSize: "0.8rem", justifyContent: "space-between" }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={14} />
            Filters
          </span>
          <span style={{ 
            fontSize: "0.75rem", 
            background: "rgba(59, 130, 246, 0.2)", 
            color: "var(--accent-light)", 
            padding: "2px 8px", 
            borderRadius: "10px" 
          }}>
            {Object.values(filters.pois).filter(Boolean).length + (filters.type !== "All" ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
          </span>
        </button>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div 
            className="glass-card animate-fade-in"
            style={{ 
              padding: "14px", 
              fontSize: "0.8rem", 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px" 
            }}
          >
            {/* Property Type selection */}
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 500 }}>Property Type</label>
              <select 
                value={filters.type}
                onChange={handleTypeChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "6px",
                  color: "var(--text-white)",
                  outline: "none"
                }}
              >
                {propertyTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Max Budget Limit */}
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 500 }}>Max Rent Limit</label>
              <input 
                type="number"
                placeholder="e.g. 2000"
                value={filters.maxPrice}
                onChange={handlePriceChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "6px",
                  color: "var(--text-white)",
                  outline: "none"
                }}
              />
            </div>

            {/* Proximity / POI filters */}
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 500 }}>Proximity (Within 500m of:)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.pois.school} 
                    onChange={() => togglePoisFilter("school")} 
                  />
                  <School size={12} style={{ color: "#f97316" }} /> School
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.pois.market} 
                    onChange={() => togglePoisFilter("market")} 
                  />
                  <ShoppingCart size={12} style={{ color: "#ec4899" }} /> Supermarket
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.pois.station} 
                    onChange={() => togglePoisFilter("station")} 
                  />
                  <Train size={12} style={{ color: "#6366f1" }} /> Transit Station
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={filters.pois.hospital} 
                    onChange={() => togglePoisFilter("hospital")} 
                  />
                  <Activity size={12} style={{ color: "#ef4444" }} /> Hospital
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property List Results */}
      <div className="panel-body">
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          Showing {filteredProperties.length} properties
        </div>

        {filteredProperties.length === 0 ? (
          <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No properties found matching current filter values.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredProperties.map(prop => {
              const { total, occupied, rentRange } = getPropertySummary(prop);
              const isSelected = prop.id === selectedPropertyId;

              return (
                <div 
                  key={prop.id}
                  className={`glass-card ${isSelected ? "glow-active" : ""}`}
                  style={{
                    cursor: "pointer",
                    borderLeft: isSelected ? "3px solid var(--accent)" : "1px solid var(--border-light)"
                  }}
                  onClick={() => onSelectProperty(prop.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{prop.name}</h3>
                    <span 
                      style={{ 
                        fontSize: "0.65rem", 
                        background: "rgba(255,255,255,0.05)", 
                        color: "var(--text-secondary)",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}
                    >
                      {prop.type}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={11} />
                    {prop.address}
                  </p>

                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      paddingTop: "10px",
                      fontSize: "0.75rem"
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {occupied} / {total} Units Occupied
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--text-white)" }}>
                      {rentRange} <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}>/mo</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
