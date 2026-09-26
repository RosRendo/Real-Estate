import React, { useMemo } from "react";
import { TrendingUp, BarChart2, DollarSign, Percent, PiggyBank, Briefcase } from "lucide-react";

export default function AnalyticsPanel({ properties }) {
  // Compute analytics
  const analyticsData = useMemo(() => {
    let totalValue = 0;
    let totalRevenue = 0;
    const typeBreakdown = { Apartment: 0, House: 0, Duplex: 0, Commercial: 0 };
    const buildingRevenue = [];

    properties.forEach(prop => {
      // Calculate building value
      const pricePerSqm = prop.type === "Commercial" ? 4500 : prop.type === "House" ? 3500 : 2800;
      const bValue = prop.units.reduce((sum, u) => sum + u.area * pricePerSqm, 0);
      totalValue += bValue;

      // Calculate active revenue
      const bRev = prop.units
        .filter(u => u.status === "occupied" || (u.tenant && u.status === "maintenance"))
        .reduce((sum, u) => sum + u.rent, 0);
      totalRevenue += bRev;

      // Type breakdown
      typeBreakdown[prop.type] = (typeBreakdown[prop.type] || 0) + prop.units.length;

      buildingRevenue.push({
        name: prop.name,
        revenue: bRev,
        type: prop.type,
        value: bValue
      });
    });

    // Average yield: Annual revenue / total value
    const annualRevenue = totalRevenue * 12;
    const averageYield = totalValue > 0 ? (annualRevenue / totalValue) * 100 : 0;

    return {
      totalValue,
      totalRevenue,
      averageYield,
      typeBreakdown,
      buildingRevenue: buildingRevenue.sort((a, b) => b.revenue - a.revenue)
    };
  }, [properties]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Find max revenue for chart scaling
  const maxRevenue = useMemo(() => {
    return Math.max(...analyticsData.buildingRevenue.map(b => b.revenue), 1);
  }, [analyticsData]);

  return (
    <div className="glass-panel animate-slide-left">
      {/* Header */}
      <div className="panel-header">
        <h2 className="panel-title">
          <BarChart2 style={{ color: "var(--accent)" }} size={20} />
          Portfolio Analytics
        </h2>
        <div className="panel-subtitle">Financial yields & ROI insights</div>
      </div>

      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Metric Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="glass-card" style={{ padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.75rem", marginBottom: "4px" }}>
              <PiggyBank size={14} style={{ color: "var(--accent-light)" }} />
              Portfolio Value
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-white)" }}>
              {formatCurrency(analyticsData.totalValue)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.75rem", marginBottom: "4px" }}>
              <Percent size={14} style={{ color: "var(--status-occupied)" }} />
              Avg Rental Yield
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--status-occupied)" }}>
              {analyticsData.averageYield.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Visual 1: Building Revenue Contribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Monthly Revenue Contribution
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {analyticsData.buildingRevenue.map(building => {
              const percentage = (building.revenue / maxRevenue) * 100;
              return (
                <div key={building.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-white)", fontWeight: 500 }}>{building.name}</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{formatCurrency(building.revenue)}</span>
                  </div>
                  {/* Progress Bar container */}
                  <div 
                    style={{ 
                      width: "100%", 
                      height: "8px", 
                      background: "rgba(255,255,255,0.03)", 
                      borderRadius: "4px",
                      overflow: "hidden" 
                    }}
                  >
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: "100%", 
                        background: "linear-gradient(95deg, var(--accent), var(--accent-light))",
                        borderRadius: "4px",
                        boxShadow: "0 0 10px rgba(59, 130, 246, 0.4)",
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual 2: Unit Type Distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Portfolio Unit Mix
          </h3>

          {/* Simple Radial Donut SVG Representation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
              {/* Apartment */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke="var(--accent)" strokeWidth="3" 
                strokeDasharray="45 100" strokeDashoffset="0" 
              />
              {/* House */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke="var(--status-occupied)" strokeWidth="3" 
                strokeDasharray="15 100" strokeDashoffset="-45" 
              />
              {/* Commercial */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke="var(--status-maintenance)" strokeWidth="3" 
                strokeDasharray="25 100" strokeDashoffset="-60" 
              />
              {/* Duplex */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke="var(--status-available)" strokeWidth="3" 
                strokeDasharray="15 100" strokeDashoffset="-85" 
              />
            </svg>

            {/* Legend with percentages */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Apartments (45%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-occupied)" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Houses (15%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-maintenance)" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Commercial (25%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-available)" }}></span>
                <span style={{ color: "var(--text-secondary)" }}>Duplex (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual 3: ROI Insights */}
        <div className="glass-card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--status-occupied)", padding: "10px", borderRadius: "10px" }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-white)" }}>ROI Projection</h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Portfolio net value increased by <span style={{ color: "var(--status-occupied)", fontWeight: 600 }}>+8.4%</span> since last year, outperforming the municipal average index.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
