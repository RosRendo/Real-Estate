import React from "react";
import { 
  TrendingUp, 
  Users, 
  Home, 
  Wrench, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  Clock
} from "lucide-react";

export default function CommandCenter({ 
  stats, 
  actions, 
  onSelectProperty,
  onSelectUnit 
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleActionClick = (action) => {
    onSelectProperty(action.propertyId);
    if (action.unitId) {
      // Small timeout to allow panels to slide in
      setTimeout(() => {
        onSelectUnit(action.unitId);
      }, 50);
    }
  };

  return (
    <div className="glass-panel animate-slide-left" style={{ borderRight: "1px solid var(--border-light)" }}>
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <TrendingUp style={{ color: "var(--accent)" }} size={20} />
          Command Center
        </h2>
        <div className="panel-subtitle">Real-time portfolio overview</div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px"
          }}
        >
          {/* Revenue */}
          <div className="glass-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Monthly Rev</span>
              <DollarSign size={14} style={{ color: "var(--status-occupied)" }} />
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {formatCurrency(stats.monthlyRevenue)}
            </div>
          </div>

          {/* Occupancy */}
          <div className="glass-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Occupancy</span>
              <Users size={14} style={{ color: "var(--accent)" }} />
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {stats.occupancyRate}%
            </div>
          </div>
        </div>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
          }}
        >
          {/* Vacant */}
          <div className="glass-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Vacant Units</span>
              <Home size={14} style={{ color: "var(--status-vacant)" }} />
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {stats.vacantUnits} <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>/ {stats.totalUnits}</span>
            </div>
          </div>

          {/* Maintenance */}
          <div className="glass-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Maintenance</span>
              <Wrench size={14} style={{ color: "var(--status-maintenance)" }} />
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {formatCurrency(stats.maintenanceCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Panel */}
      <div className="panel-body">
        <h3 
          style={{ 
            fontSize: "0.9rem", 
            textTransform: "uppercase", 
            letterSpacing: "0.05em", 
            color: "var(--text-secondary)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <AlertTriangle size={15} style={{ color: "var(--status-vacant)" }} />
          Action Required ({actions.length})
        </h3>

        {actions.length === 0 ? (
          <div 
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.85rem"
            }}
          >
            All clear! No urgent action items found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {actions.map(action => {
              const isHigh = action.severity === "high";
              const isLatePayment = action.type === "late-payment";
              const isMaint = action.type === "maintenance";
              
              // Border effect mapping
              const borderClass = isHigh 
                ? (isLatePayment ? "pulse-border-red" : "pulse-border-yellow") 
                : "";

              return (
                <div 
                  key={action.id}
                  className={`glass-card ${borderClass}`}
                  style={{
                    cursor: "pointer",
                    padding: "14px",
                    borderLeft: `3px solid ${
                      isLatePayment ? "var(--status-vacant)" : 
                      isMaint ? "var(--status-maintenance)" : "var(--status-available)"
                    }`
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span 
                      style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: 600, 
                        textTransform: "uppercase",
                        color: isLatePayment ? "var(--status-vacant)" : 
                               isMaint ? "var(--status-maintenance)" : "var(--status-available)"
                      }}
                    >
                      {action.type.replace("-", " ")}
                    </span>
                    
                    {isHigh && (
                      <span 
                        style={{ 
                          fontSize: "0.6rem", 
                          background: "rgba(239, 68, 68, 0.2)", 
                          color: "var(--status-vacant)", 
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: 700
                        }}
                      >
                        URGENT
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-white)", marginBottom: "4px" }}>
                    {action.title}
                  </h4>

                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
                    {action.desc}
                  </p>

                  <div 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      fontSize: "0.7rem",
                      color: "var(--text-muted)"
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={11} />
                      {action.date}
                    </span>
                    <span 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "2px", 
                        color: "var(--accent-light)",
                        fontWeight: 500
                      }}
                    >
                      View on Map
                      <ArrowRight size={10} />
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
