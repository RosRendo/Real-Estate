import React, { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Layers, 
  Info, 
  User, 
  Calendar, 
  DollarSign, 
  Wrench, 
  Mail, 
  Phone, 
  BellRing,
  School,
  ShoppingCart,
  Activity,
  Train,
  CheckCircle
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PropertyDetails({ 
  property, 
  selectedUnitId,
  onSelectUnit,
  onClose,
  onUpdateUnitStatus 
}) {
  const [activeUnit, setActiveUnit] = useState(null);
  const [showReminderSent, setShowReminderSent] = useState(false);

  // Group units by floor (descending so top floors are rendered on top)
  const unitsByFloor = React.useMemo(() => {
    if (!property) return {};
    const floors = {};
    property.units.forEach(unit => {
      if (!floors[unit.floor]) floors[unit.floor] = [];
      floors[unit.floor].push(unit);
    });
    // Sort units within floor numerically
    Object.keys(floors).forEach(f => {
      floors[f].sort((a, b) => a.number.localeCompare(b.number));
    });
    return Object.keys(floors)
      .sort((a, b) => Number(b) - Number(a))
      .reduce((obj, key) => {
        obj[key] = floors[key];
        return obj;
      }, {});
  }, [property]);

  // Sync active unit with selectedUnitId prop
  useEffect(() => {
    if (property && selectedUnitId) {
      const unit = property.units.find(u => u.id === selectedUnitId);
      if (unit) setActiveUnit(unit);
    } else {
      // If no unit is selected, default to null or stay on previous
      setActiveUnit(null);
    }
  }, [selectedUnitId, property]);

  if (!property) return null;

  const handleUnitClick = (unit) => {
    setActiveUnit(unit);
    onSelectUnit(unit.id);
  };

  const handleSendReminder = (tenantName, unitNumber) => {
    // 1. Confetti burst!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    // 2. Trigger visual alert message
    setShowReminderSent(true);
    setTimeout(() => {
      setShowReminderSent(false);
    }, 4000);

    // 3. Update payment status to simulated "Pending" or update backend
    if (onUpdateUnitStatus) {
      onUpdateUnitStatus(property.id, activeUnit.id, {
        tenant: {
          ...activeUnit.tenant,
          paymentStatus: "Pending"
        }
      });
    }
  };

  const handleToggleMaintenance = (ticketId) => {
    if (!onUpdateUnitStatus || !activeUnit) return;
    
    // Resolve ticket: remove from active maintenance list
    const updatedTickets = activeUnit.maintenance.map(t => 
      t.id === ticketId ? { ...t, status: "Resolved" } : t
    );

    // If all resolved, change unit status if it was in maintenance
    let newStatus = activeUnit.status;
    if (activeUnit.status === "maintenance" && updatedTickets.every(t => t.status === "Resolved")) {
      newStatus = activeUnit.tenant ? "occupied" : "available";
    }

    onUpdateUnitStatus(property.id, activeUnit.id, {
      status: newStatus,
      maintenance: updatedTickets
    });
  };

  return (
    <div className="glass-panel glass-panel-right animate-slide-right" style={{ position: "relative" }}>
      {/* Close button */}
      <button 
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border-medium)",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-secondary)",
          transition: "var(--transition)",
          zIndex: 10
        }}
        onClick={onClose}
        title="Close Panel"
      >
        <X size={14} />
      </button>

      {/* Property Overview */}
      <div className="panel-header" style={{ paddingRight: "64px" }}>
        <h2 className="panel-title" style={{ fontSize: "1.2rem" }}>
          {property.name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
          <MapPin size={11} />
          {property.address}
        </div>
      </div>

      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Description */}
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
          {property.description}
        </p>

        {/* Nearby Highlights */}
        <div>
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Nearby Distance Highlights
          </h4>
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "8px",
              fontSize: "0.75rem"
            }}
          >
            {property.nearbyPOIs.map(poi => {
              let Icon = Info;
              let iconColor = "#a855f7";
              if (poi.type === "school") { Icon = School; iconColor = "#f97316"; }
              else if (poi.type === "market") { Icon = ShoppingCart; iconColor = "#ec4899"; }
              else if (poi.type === "hospital") { Icon = Activity; iconColor = "#ef4444"; }
              else if (poi.type === "station") { Icon = Train; iconColor = "#6366f1"; }

              return (
                <div 
                  key={poi.id} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    background: "rgba(255,255,255,0.02)",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)"
                  }}
                >
                  <Icon size={12} style={{ color: iconColor }} />
                  <span style={{ color: "var(--text-white)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {poi.name} ({poi.distance}m)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Unit Grid Floor Matrix */}
        <div>
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
            Building Units Stack
          </h4>

          {/* Unit selection colors */}
          <div style={{ display: "flex", gap: "10px", fontSize: "0.7rem", marginBottom: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-occupied)" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>Occupied</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-vacant)" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>Vacant</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-maintenance)" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>Maintenance</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-available)" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>Available</span>
            </div>
          </div>

          {/* Floor Matrix Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {Object.entries(unitsByFloor).map(([floor, units]) => (
              <div 
                key={floor} 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "50px 1fr", 
                  alignItems: "center",
                  background: "rgba(255,255,255,0.01)",
                  borderRadius: "6px",
                  padding: "4px",
                  border: "1px solid var(--border-light)"
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, paddingLeft: "8px" }}>
                  FL {floor}
                </div>
                
                {/* Units container */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {units.map(unit => {
                    const isSelected = activeUnit && activeUnit.id === unit.id;
                    let bg = "var(--status-available-bg)";
                    let text = "var(--status-available)";
                    let border = "var(--status-available-border)";

                    if (unit.status === "occupied") {
                      bg = "var(--status-occupied-bg)";
                      text = "var(--status-occupied)";
                      border = "var(--status-occupied-border)";
                    } else if (unit.status === "vacant") {
                      bg = "var(--status-vacant-bg)";
                      text = "var(--status-vacant)";
                      border = "var(--status-vacant-border)";
                    } else if (unit.status === "maintenance") {
                      bg = "var(--status-maintenance-bg)";
                      text = "var(--status-maintenance)";
                      border = "var(--status-maintenance-border)";
                    }

                    // Highlight active
                    if (isSelected) {
                      border = text;
                    }

                    return (
                      <button
                        key={unit.id}
                        onClick={() => handleUnitClick(unit)}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          borderRadius: "4px",
                          background: isSelected ? text : bg,
                          color: isSelected ? "var(--bg-primary)" : text,
                          border: `1px solid ${border}`,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "var(--transition)",
                          textAlign: "center",
                          boxShadow: isSelected ? `0 0 10px ${text}` : "none"
                        }}
                      >
                        {unit.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Details Display Card */}
        {activeUnit ? (
          <div className="glass-card animate-slide-up" style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1.0rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                Unit {activeUnit.number}
                <span className={`status-badge ${activeUnit.status}`}>
                  {activeUnit.status}
                </span>
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {activeUnit.beds} Bed • {activeUnit.baths} Bath • {activeUnit.area} m²
              </span>
            </div>

            {/* Occupied State Details */}
            {activeUnit.tenant ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem" }}>
                {/* Tenant Name */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <User size={14} style={{ color: "var(--accent)" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-white)" }}>{activeUnit.tenant.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tenant</div>
                  </div>
                </div>

                {/* Lease Term */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <Calendar size={14} style={{ color: "var(--accent)" }} />
                  <div>
                    <div style={{ color: "var(--text-white)" }}>
                      {activeUnit.tenant.leaseStart} → {activeUnit.tenant.leaseEnd}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Lease Agreement</div>
                  </div>
                </div>

                {/* Payments */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <DollarSign size={14} style={{ color: "var(--accent)" }} />
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "var(--text-white)", fontWeight: 600 }}>
                        ${activeUnit.tenant.paymentAmount.toLocaleString()} / month
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Next Payment: {activeUnit.tenant.nextPayment}
                      </div>
                    </div>

                    <span 
                      style={{
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: activeUnit.tenant.paymentStatus === "Paid" ? "var(--status-occupied)" :
                               activeUnit.tenant.paymentStatus === "Late" ? "var(--status-vacant)" : "var(--status-maintenance)",
                        background: activeUnit.tenant.paymentStatus === "Paid" ? "var(--status-occupied-bg)" :
                                    activeUnit.tenant.paymentStatus === "Late" ? "var(--status-vacant-bg)" : "var(--status-maintenance-bg)"
                      }}
                    >
                      {activeUnit.tenant.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Contact information */}
                <div 
                  style={{ 
                    display: "flex", 
                    gap: "8px", 
                    marginTop: "6px",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    paddingTop: "12px"
                  }}
                >
                  <a href={`mailto:${activeUnit.tenant.email}`} className="btn btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "0.75rem" }}>
                    <Mail size={12} /> Email
                  </a>
                  <a href={`tel:${activeUnit.tenant.phone}`} className="btn btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "0.75rem" }}>
                    <Phone size={12} /> Call
                  </a>
                </div>

                {/* Action: Late Payment reminder */}
                {activeUnit.tenant.paymentStatus === "Late" && (
                  <button 
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "4px" }}
                    onClick={() => handleSendReminder(activeUnit.tenant.name, activeUnit.number)}
                  >
                    <BellRing size={14} />
                    Send Payment Reminder
                  </button>
                )}

                {/* Visual feedback notice */}
                {showReminderSent && (
                  <div 
                    className="animate-fade-in"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "var(--status-occupied-bg)",
                      border: "1px solid var(--status-occupied)",
                      color: "var(--status-occupied)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      marginTop: "6px"
                    }}
                  >
                    <CheckCircle size={14} />
                    Payment reminder sent successfully!
                  </div>
                )}
              </div>
            ) : (
              // Vacant / Available details
              <div style={{ padding: "16px 8px", textAlign: "center" }}>
                <Info size={24} style={{ color: "var(--accent-light)", marginBottom: "8px" }} />
                <div style={{ color: "var(--text-white)", fontSize: "0.85rem", fontWeight: 600 }}>This unit is currently unoccupied.</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "4px", lineHeight: 1.4 }}>
                  List this unit on portals or coordinate maintenance before scheduling new tenant showings.
                </p>
                <button className="btn btn-primary" style={{ width: "100%", marginTop: "14px", fontSize: "0.8rem", padding: "8px 12px" }}>
                  Create Listing
                </button>
              </div>
            )}

            {/* Maintenance Tickets section */}
            {activeUnit.maintenance && activeUnit.maintenance.length > 0 && (
              <div 
                style={{ 
                  marginTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  paddingTop: "14px"
                }}
              >
                <h4 
                  style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--text-muted)", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Wrench size={12} />
                  Maintenance Tasks
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activeUnit.maintenance.map(ticket => (
                    <div 
                      key={ticket.id}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-light)",
                        padding: "10px",
                        borderRadius: "6px",
                        fontSize: "0.75rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-white)" }}>{ticket.issue}</span>
                        <span style={{ 
                          color: ticket.priority === "High" ? "var(--status-vacant)" : "var(--status-maintenance)",
                          fontWeight: 700,
                          fontSize: "0.65rem"
                        }}>
                          {ticket.priority}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "8px" }}>
                        <span>Reported: {ticket.date}</span>
                        {ticket.status === "Open" ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: "2px 8px", fontSize: "0.65rem", borderRadius: "4px" }}
                            onClick={() => handleToggleMaintenance(ticket.id)}
                          >
                            Resolve Task
                          </button>
                        ) : (
                          <span style={{ color: "var(--status-occupied)", fontWeight: 600 }}>Resolved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            style={{ 
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed var(--border-medium)",
              borderRadius: "var(--radius-md)",
              padding: "24px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginTop: "10px"
            }}
          >
            Select a unit from the matrix stack above to view tenant details, payment logs, and maintenance tasks.
          </div>
        )}
      </div>
    </div>
  );
}
