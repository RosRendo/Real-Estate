import React from "react";
import { ArrowLeft, Trash2, Eye, HelpCircle, Star } from "lucide-react";

export default function CompareView({ 
  comparedIds = [], 
  listings, 
  onRemove, 
  onView, 
  onBack 
}) {
  // Filter listings by compared IDs
  const comparedListings = React.useMemo(() => {
    return listings.filter(l => comparedIds.includes(l.id));
  }, [listings, comparedIds]);

  if (comparedListings.length === 0) {
    return (
      <div 
        style={{
          maxWidth: "500px",
          margin: "80px auto",
          textAlign: "center",
          padding: "40px",
          background: "#ffffff",
          border: "1px solid var(--border-medium)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center"
        }}
      >
        <div 
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--bg-input)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)"
          }}
        >
          <HelpCircle size={28} />
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>No properties selected for comparison</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
          Go back to discover listings, check the compare box on any property cards, and they will appear here.
        </p>
        <button 
          className="btn btn-primary animate-fade-in" 
          onClick={onBack}
          style={{ marginTop: "10px" }}
        >
          <ArrowLeft size={16} /> Back to Search
        </button>
      </div>
    );
  }

  // Define comparison metric rows
  const comparisonRows = [
    { label: "Price", key: "price", render: (item) => `$${item.price.toLocaleString()}` },
    { label: "Property Type", key: "type", render: (item) => item.type },
    { label: "Bedrooms", key: "beds", render: (item) => `${item.beds} Bedrooms` },
    { label: "Bathrooms", key: "baths", render: (item) => `${item.baths} Bathrooms` },
    { label: "Area Size", key: "area", render: (item) => `${item.area} m²` },
    { 
      label: "3D Explore Tour", 
      key: "tier", 
      render: (item) => item.tier !== "Basic" ? (
        <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Available</span>
      ) : (
        <span style={{ color: "var(--text-secondary)" }}>—</span>
      )
    },
    { 
      label: "Parking Available", 
      key: "amenities", 
      render: (item) => item.amenities.some(a => a.toLowerCase().includes("parking")) ? (
        <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Included</span>
      ) : (
        <span style={{ color: "var(--text-secondary)" }}>—</span>
      )
    },
    { 
      label: "Pool / Gym Facilities", 
      key: "amenities", 
      render: (item) => item.amenities.some(a => a.toLowerCase().includes("pool") || a.toLowerCase().includes("gym")) ? (
        <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Included</span>
      ) : (
        <span style={{ color: "var(--text-secondary)" }}>—</span>
      )
    },
    { label: "Location District", key: "address", render: (item) => item.address.split(",")[1]?.trim() || "Phnom Penh" }
  ];

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        maxWidth: "1000px", 
        margin: "30px auto", 
        padding: "0 24px",
        height: "calc(100vh - 120px)",
        overflowY: "auto"
      }}
    >
      {/* Header bar */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "24px" 
        }}
      >
        <button 
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: "8px 12px", borderRadius: "8px" }}
        >
          <ArrowLeft size={16} /> Back to Discover
        </button>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Compare Properties ({comparedListings.length})</h2>
        <div style={{ width: "120px" }}></div> {/* Balance layout */}
      </div>

      {/* Grid Comparison Table */}
      <div 
        className="glass-card" 
        style={{ 
          padding: "24px", 
          borderRadius: "16px",
          border: "1px solid var(--border-medium)",
          background: "#ffffff",
          boxShadow: "var(--shadow-lg)",
          overflowX: "auto"
        }}
      >
        <table 
          style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            tableLayout: "fixed",
            minWidth: `${200 + comparedListings.length * 200}px` 
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-medium)" }}>
              {/* Corner Header cell */}
              <th style={{ width: "200px", textAlign: "left", paddingBottom: "20px" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Property Metrics</div>
              </th>
              
              {/* Listing Card Columns */}
              {comparedListings.map(item => (
                <th 
                  key={item.id} 
                  style={{ 
                    padding: "0 12px 20px 12px", 
                    fontWeight: "normal",
                    verticalAlign: "top"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                    {/* Thumbnail Image */}
                    <div style={{ width: "100%", height: "100px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                      <img 
                        src={item.photos[0]} 
                        alt={item.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>

                    {/* Listing Title */}
                    <div style={{ textAlign: "left" }}>
                      <h4 
                        style={{ 
                          fontSize: "0.85rem", 
                          fontWeight: 700, 
                          color: "var(--text-white)",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden" 
                        }}
                      >
                        {item.name}
                      </h4>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "2px" }}>
                        <Star size={10} fill="currentColor" /> 4.9 ({item.type})
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => onView(item.id)}
                        style={{ flex: 1, padding: "5px 0", fontSize: "0.7rem", borderRadius: "4px" }}
                        title="View Full Listing"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => onRemove(item.id)}
                        style={{ padding: "5px 8px", borderRadius: "4px" }}
                        title="Remove from Compare"
                      >
                        <Trash2 size={12} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Comparison Rows */}
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr 
                key={idx}
                style={{ 
                  borderBottom: "1px solid var(--border-light)",
                  background: idx % 2 === 0 ? "rgba(0,0,0,0.01)" : "transparent"
                }}
              >
                {/* Metric name */}
                <td style={{ padding: "16px 0", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {row.label}
                </td>

                {/* Values columns */}
                {comparedListings.map(item => (
                  <td 
                    key={item.id}
                    style={{ 
                      padding: "16px 12px", 
                      fontSize: "0.82rem", 
                      color: "var(--text-white)",
                      fontWeight: row.key === "price" ? 700 : 400
                    }}
                  >
                    {row.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
