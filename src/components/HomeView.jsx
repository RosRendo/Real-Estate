import React, { useState, useMemo } from "react";
import { 
  Search, 
  Star, 
  Heart, 
  MapPin, 
  ArrowRight,
  Play,
  Compass,
  Building,
  Video
} from "lucide-react";

export default function HomeView({ listings, onCategoryClick, onToggleSave, savedListingIds = [], onViewProperty }) {
  // Hero search states
  const [heroTab, setHeroTab] = useState("Buy"); // "Buy", "Rent", "New Projects"
  const [whereInput, setWhereInput] = useState("Phnom Penh");
  const [priceRange, setPriceRange] = useState("Any");
  const [propertyType, setPropertyType] = useState("All");

  // 3D filter tab state
  const [active3dTab, setActive3dTab] = useState("All");

  const formatPrice = (val) => {
    return val >= 1000000 
      ? `$${(val / 1000000).toFixed(1)}M` 
      : `$${val.toLocaleString()}`;
  };

  // Search Submit Handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onCategoryClick(whereInput || "");
  };

  // Filters listings for section 2: "Explore homes near you" (based on search region)
  const homesNearMe = useMemo(() => {
    const term = whereInput.toLowerCase();
    return listings.filter(l => 
      l.address.toLowerCase().includes(term) || l.name.toLowerCase().includes(term)
    ).slice(0, 4);
  }, [listings, whereInput]);

  // Filters listings for section 3: "Explore in 3D"
  const homesIn3d = useMemo(() => {
    let list = listings.filter(l => l.tier === "Premium" || l.coords);
    if (active3dTab !== "All") {
      list = list.filter(l => (l.type || "House").toLowerCase().includes(active3dTab.toLowerCase()));
    }
    return list.slice(0, 4);
  }, [listings, active3dTab]);

  // Filters listings for section 4: "Take a tour before you visit" (video listings)
  const videoTourListings = useMemo(() => {
    return listings.filter(l => l.photos && l.photos.length > 1).slice(0, 3);
  }, [listings]);

  // Filters listings for section 5: New developments
  const newDevelopments = useMemo(() => {
    return listings.filter(l => l.name.toLowerCase().includes("island") || l.name.toLowerCase().includes("sathorn")).slice(0, 2);
  }, [listings]);

  // Filters listings for section 8: Just Listed
  const justListedHomes = useMemo(() => {
    return listings.slice(0, 4);
  }, [listings]);

  return (
    <div className="home-view-container" style={{ padding: "40px 24px 80px 24px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "60px", overflowY: "auto", height: "100%" }}>
      
      {/* 1. HERO SECTION: Clean tabbed search console */}
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "48px 36px",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px"
        }}
      >
        <div style={{ text: "center" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", margin: 0, textAlign: "center" }}>
            Find a place worth calling home
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "6px", textAlign: "center" }}>
            Pre-audited deeds, virtual 3D builder interfaces, and interactive neighborhood tours.
          </p>
        </div>

        {/* Tab Selector Segment */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "32px", padding: "4px", border: "1px solid var(--border-medium)" }}>
          {["Buy", "Rent", "New Projects"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setHeroTab(opt)}
              style={{
                border: "none",
                outline: "none",
                background: heroTab === opt ? "var(--accent)" : "transparent",
                color: heroTab === opt ? "#ffffff" : "var(--text-secondary)",
                padding: "8px 20px",
                borderRadius: "24px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Horizontal Form Fields */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr auto",
            alignItems: "center",
            width: "100%",
            maxWidth: "800px",
            background: "#ffffff",
            borderRadius: "18px",
            border: "1px solid var(--border-medium)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            padding: "8px",
            gap: "12px"
          }}
        >
          {/* Where Input */}
          <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-secondary)" }}>📍 Where?</span>
            <input 
              type="text" 
              placeholder="City, area..."
              value={whereInput}
              onChange={(e) => setWhereInput(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", fontWeight: 600, marginTop: "2px" }}
            />
          </div>

          <div style={{ width: "1px", height: "30px", background: "var(--border-medium)", justifySelf: "center" }} />

          {/* Price Range Selector */}
          <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-secondary)" }}>💰 Price</span>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", fontWeight: 600, marginTop: "2px", background: "transparent", cursor: "pointer" }}
            >
              <option value="Any">Any price</option>
              <option value="150000">Under $150k</option>
              <option value="300000">$100k - $300k</option>
              <option value="500000">$300k - $500k</option>
              <option value="above">$500k+</option>
            </select>
          </div>

          <div style={{ width: "1px", height: "30px", background: "var(--border-medium)", justifySelf: "center" }} />

          {/* Property Type Selector */}
          <div style={{ display: "flex", flexDirection: "column", padding: "4px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-secondary)" }}>🏠 Property Type</span>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", fontWeight: 600, marginTop: "2px", background: "transparent", cursor: "pointer" }}
            >
              <option value="All">All Types</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Condo">Condo</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "12px 28px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. EXPLORE HOMES NEAR YOU */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
              Explore homes near {whereInput || "Phnom Penh"}
            </h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Zillow-like browsing mapped directly in your local area</span>
          </div>
          <button 
            onClick={() => onCategoryClick(whereInput || "")}
            style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", gap: "4px", color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
          >
            Explore on Map <ArrowRight size={14} />
          </button>
        </div>

        {homesNearMe.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No matching listings found nearby. Try searching Phnom Penh or Bangkok.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
            {homesNearMe.map(item => (
              <PropertyCard 
                key={item.id} 
                item={item} 
                onView={onViewProperty} 
                onSave={onToggleSave} 
                isSaved={savedListingIds.includes(item.id)} 
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. EXPLORE IN 3D (Showcases unique feature) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
            Explore these homes in 3D
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Interactive 3D tours, walk inside before scheduling viewing visits</span>
        </div>

        {/* 3D Filter Pills */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "All", label: "All 3D Listings" },
            { id: "Villa", label: "3D Villas" },
            { id: "Apartment", label: "3D Apartments" },
            { id: "Condo", label: "3D Condos" },
            { id: "House", label: "3D Houses" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive3dTab(tab.id)}
              style={{
                border: "1px solid",
                borderColor: active3dTab === tab.id ? "var(--accent)" : "var(--border-medium)",
                background: active3dTab === tab.id ? "rgba(37,99,235,0.05)" : "#ffffff",
                color: active3dTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
          {homesIn3d.map(item => (
            <PropertyCard 
              key={item.id} 
              item={item} 
              onView={onViewProperty} 
              onSave={onToggleSave} 
              isSaved={savedListingIds.includes(item.id)} 
              formatPrice={formatPrice}
              showExplore3dBadge={true}
            />
          ))}
        </div>
      </div>

      {/* 4. WATCH BEFORE YOU VISIT (TikTok/YouTube Tour style) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
            Take a tour before you visit
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Immersive digital walkthrough guide videos</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {videoTourListings.map(item => (
            <div 
              key={item.id}
              onClick={() => onViewProperty(item.id)}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-medium)",
                borderRadius: "20px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "180px", backgroundColor: "#0f172a" }}>
                <img 
                  src={item.photos[0]} 
                  alt={item.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} 
                />
                {/* Play Button Overlay */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.9)", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    <Play size={20} style={{ color: "var(--accent)", fill: "var(--accent)", marginLeft: "4px" }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1e293b" }}>{item.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.address}</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent)", marginTop: "4px" }}>{formatPrice(item.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. NEW DEVELOPMENTS SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
            Explore new developments
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Interactive skyscraper mapping and developer floor unit configurators</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
          {newDevelopments.map(item => (
            <div 
              key={item.id}
              onClick={() => onViewProperty(item.id)}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-medium)",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "240px", backgroundColor: "#f1f5f9" }}>
                <img 
                  src={item.photos[0]} 
                  alt={item.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                <span style={{ position: "absolute", top: "16px", left: "16px", background: "var(--accent)", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>
                  🏢 NEW PROJECT TOWER
                </span>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{item.name}</h3>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{item.address}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Features 3D Unit Builders, Floor Selector, and Direct Developer Bookings.
                </span>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                    From {formatPrice(item.price)}
                  </span>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "0.78rem", borderRadius: "8px" }}
                  >
                    Explore Building
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. NEIGHBORHOODS SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
            Explore neighborhoods
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Quick-browse popular residential developments and Borey locations</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { name: "Sen Sok", homes: "1,240 homes", price: "From $90K", query: "Sen Sok" },
            { name: "BKK 1", homes: "890 homes", price: "From $150K", query: "District 1" },
            { name: "Chroy Changvar", homes: "620 homes", price: "From $70K", query: "Phnom Penh" }
          ].map((area, idx) => (
            <div 
              key={idx}
              onClick={() => onCategoryClick(area.query)}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-medium)",
                borderRadius: "18px",
                padding: "20px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                transition: "transform 0.2s, border-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "var(--border-medium)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>
                <MapPin size={16} style={{ color: "var(--accent)" }} />
                {area.name}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                <span>{area.homes}</span>
                <span style={{ fontWeight: 600, color: "var(--accent)" }}>{area.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. HOMES FOR EVERY BUDGET */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h4 style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-white)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          Find your next home
        </h4>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Under $100K", val: "100000" },
            { label: "$100K – $200K", val: "200000" },
            { label: "$200K – $500K", val: "500000" },
            { label: "$500K+", val: "9999999" }
          ].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMaxPrice(tag.val);
                const target = document.getElementById("just-listed-header");
                if (target) target.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                border: "1px solid var(--border-medium)",
                background: "#ffffff",
                color: "var(--text-secondary)",
                padding: "8px 18px",
                borderRadius: "12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-medium)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8. RECENTLY LISTED */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 id="just-listed-header" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>
            Just listed
          </h2>
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Recently listed properties on the marketplace</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
          {justListedHomes.map(item => (
            <PropertyCard 
              key={item.id} 
              item={item} 
              onView={onViewProperty} 
              onSave={onToggleSave} 
              isSaved={savedListingIds.includes(item.id)} 
              formatPrice={formatPrice}
              showNewBadge={true}
            />
          ))}
        </div>
      </div>

      {/* 9. SIGNATURE BRAND MESSAGE FOOTER */}
      <div 
        style={{ 
          borderTop: "1px solid var(--border-medium)", 
          paddingTop: "40px", 
          marginTop: "20px", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "24px",
          textAlign: "center"
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-white)", margin: 0 }}>Explore it before you visit</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>Visual verification checks are integrated inside the core of our platform.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px", width: "100%", maxWidth: "600px", marginTop: "8px" }}>
          <div>
            <span style={{ fontSize: "1.6rem", display: "block" }}>📷</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-white)", display: "block", marginTop: "6px" }}>Photos</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>See it</span>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-medium)", borderRight: "1px solid var(--border-medium)" }}>
            <span style={{ fontSize: "1.6rem", display: "block" }}>🎥</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-white)", display: "block", marginTop: "6px" }}>Video</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>Watch it</span>
          </div>
          <div>
            <span style={{ fontSize: "1.6rem", display: "block" }}>🏠</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-white)", display: "block", marginTop: "6px" }}>3D</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>Explore it</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function PropertyCard({ item, onView, onSave, isSaved, formatPrice, showExplore3dBadge = false, showNewBadge = false }) {
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <div 
      className="glass-card animate-slide-up"
      onClick={() => onView(item.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
        background: "#ffffff",
        border: "1px solid var(--border-medium)",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
        setImgHovered(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.02)";
        setImgHovered(false);
      }}
    >
      {/* Photo Container */}
      <div style={{ position: "relative", width: "100%", height: "180px", borderRadius: "14px", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
        <img 
          src={item.photos && item.photos[0] ? item.photos[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
          alt={item.name} 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: imgHovered ? "scale(1.05)" : "scale(1)"
          }} 
        />
        
        {/* New or 3D overlay badges */}
        {showNewBadge && (
          <span 
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              fontSize: "0.55rem",
              fontWeight: 800,
              background: "#ef4444",
              color: "#ffffff",
              padding: "3px 8px",
              borderRadius: "4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
            }}
          >
            NEW · 2h ago
          </span>
        )}

        {!showNewBadge && item.tier && (
          <span 
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              fontSize: "0.55rem",
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
        )}

        {/* 3D badge on top right */}
        {(item.tier === "Premium" || item.coords) && (
          <span 
            style={{
              position: "absolute",
              top: "12px",
              right: "42px",
              fontSize: "0.55rem",
              fontWeight: 800,
              background: "rgba(15, 23, 42, 0.75)",
              color: "#ffffff",
              padding: "3px 6px",
              borderRadius: "4px",
              backdropFilter: "blur(4px)"
            }}
          >
            🏠 3D
          </span>
        )}

        {/* Heart Icon Save Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(item.id);
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(15, 23, 42, 0.5)",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            padding: 0,
            backdropFilter: "blur(4px)"
          }}
        >
          <Heart 
            size={12} 
            fill={isSaved ? "#ef4444" : "none"} 
            style={{ 
              color: isSaved ? "#ef4444" : "#ffffff"
            }} 
          />
        </button>
      </div>

      {/* Meta Text details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "2px 4px" }}>
        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </span>
        
        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "3px" }}>
          <MapPin size={11} style={{ color: "var(--accent)" }} />
          {item.address}
        </span>
        
        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
          {item.beds} beds • {item.baths} baths • {item.area} m²
        </span>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
            {formatPrice(item.price)}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            {item.purpose === "Rent" ? "/mo" : "total"}
          </span>
        </div>

        {/* Media Badges row at the bottom of the card */}
        <div style={{ display: "flex", gap: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginTop: "4px" }}>
          {(item.tier === "Premium" || item.coords) && (
            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
              🏠 3D
            </span>
          )}
          {item.photos && item.photos.length > 1 && (
            <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
              🎥 Video
            </span>
          )}
          <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
            📍 Map
          </span>
          {showExplore3dBadge && (
            <span style={{ fontSize: "0.62rem", fontWeight: 800, background: "rgba(37,99,235,0.08)", color: "var(--accent)", padding: "2px 6px", borderRadius: "4px", marginLeft: "auto", display: "flex", alignItems: "center", gap: "2px" }}>
              ◉ Explore 3D
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
