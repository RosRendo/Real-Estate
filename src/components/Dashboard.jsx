import React, { useState, useMemo } from "react";
import { mockProperties, getPortfolioStats, getActionRequired } from "../utils/mockData";
import CommandCenter from "./CommandCenter";
import PropertyExplorer from "./PropertyExplorer";
import AnalyticsPanel from "./AnalyticsPanel";
import PropertyDetails from "./PropertyDetails";
import ThreeMap from "./ThreeMap";
import AiAssistant from "./AiAssistant";
import { Layers, Calendar, Building, Sparkles } from "lucide-react";

export default function Dashboard() {
  // Global States
  const [properties, setProperties] = useState(mockProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [activeTab, setActiveTab] = useState("command"); // 'command', 'explorer', 'analytics'
  const [viewMode, setViewMode] = useState("3D"); // '2D' or '3D'
  const [heatmapMetric, setHeatmapMetric] = useState("status"); // 'status', 'yield', 'occupancy', 'value', 'maintenance'
  
  // Highlighting elements from AI assistant
  const [highlightedPropertyIds, setHighlightedPropertyIds] = useState([]);

  // Explorer filters
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    maxPrice: "",
    status: "All", // 'All', 'occupied', 'vacant', 'maintenance', 'available'
    pois: {
      school: false,
      market: false,
      station: false,
      hospital: false
    }
  });

  // Derived states
  const stats = useMemo(() => getPortfolioStats(properties), [properties]);
  const actions = useMemo(() => getActionRequired(properties), [properties]);

  // Syncing selected property
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Handlers
  const handleSelectProperty = (id) => {
    setSelectedPropertyId(id);
    setSelectedUnitId(null); // Reset unit focus
  };

  const handleCloseDetails = () => {
    setSelectedPropertyId(null);
    setSelectedUnitId(null);
  };

  // Updates single unit values (e.g. lease changes, resolves maintenance, etc.)
  const handleUpdateUnitStatus = (propertyId, unitId, updatedFields) => {
    setProperties(prevProps => {
      return prevProps.map(prop => {
        if (prop.id !== propertyId) return prop;
        
        const updatedUnits = prop.units.map(unit => {
          if (unit.id !== unitId) return unit;
          return { ...unit, ...updatedFields };
        });

        return { ...prop, units: updatedUnits };
      });
    });
  };

  // Processes command events dispatched from AI Assistant
  const handleExecuteAiCommand = (command) => {
    const { type, value } = command;

    switch (type) {
      case "FILTER_STATUS":
        // Filter properties by status
        setFilters(prev => ({
          ...prev,
          search: "",
          type: "All",
          status: value,
          pois: { school: false, market: false, station: false, hospital: false }
        }));
        
        // Highlight matching property IDs
        const matchedIds = properties
          .filter(p => p.units.some(u => u.status === value))
          .map(p => p.id);
        
        setHighlightedPropertyIds(matchedIds);
        setActiveTab("explorer");
        break;

      case "SELECT_PROPERTY":
        // Select property and zoom camera in
        setSelectedPropertyId(value);
        setSelectedUnitId(null);
        setHighlightedPropertyIds([value]);
        break;

      case "SHOW_LATE_PAYMENTS":
        // Highlight buildings with late payments
        const lateIds = properties
          .filter(p => p.units.some(u => u.tenant && u.tenant.paymentStatus === "Late"))
          .map(p => p.id);
        
        setFilters(prev => ({
          ...prev,
          search: "",
          type: "All",
          status: "All",
          pois: { school: false, market: false, station: false, hospital: false }
        }));
        setHighlightedPropertyIds(lateIds);
        setActiveTab("explorer");
        break;

      case "SHOW_MAINTENANCE":
        // Turn on maintenance heatmap
        setHeatmapMetric("maintenance");
        
        // Highlight buildings with open issues
        const maintIds = properties
          .filter(p => p.units.some(u => u.maintenance.some(t => t.status === "Open")))
          .map(p => p.id);
        
        setHighlightedPropertyIds(maintIds);
        break;

      case "SHOW_HEATMAP":
        setHeatmapMetric(value);
        break;

      case "RESET_FILTERS":
        setFilters({
          search: "",
          type: "All",
          maxPrice: "",
          status: "All",
          pois: { school: false, market: false, station: false, hospital: false }
        });
        setHighlightedPropertyIds([]);
        setSelectedPropertyId(null);
        setSelectedUnitId(null);
        setHeatmapMetric("status");
        break;

      default:
        console.warn("Unhandled command:", command);
    }
  };

  // Left sidebar selector rendering
  const renderSidebar = () => {
    switch (activeTab) {
      case "command":
        return (
          <CommandCenter 
            stats={stats} 
            actions={actions} 
            onSelectProperty={handleSelectProperty}
            onSelectUnit={setSelectedUnitId}
          />
        );
      case "explorer":
        // Sync filter logic slightly with AI status triggers if needed
        const propertiesFiltered = properties.map(p => {
          if (filters.status !== "All") {
            const hasMatch = p.units.some(u => u.status === filters.status);
            return hasMatch ? p : null;
          }
          return p;
        }).filter(Boolean);

        return (
          <PropertyExplorer 
            properties={propertiesFiltered}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={handleSelectProperty}
            filters={filters}
            setFilters={setFilters}
          />
        );
      case "analytics":
        return <AnalyticsPanel properties={properties} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="header-bar">
        <div className="brand-section">
          <div className="brand-logo">
            <Building size={20} />
          </div>
          <div>
            <h1 className="brand-title">Real Estate OS</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "var(--accent-light)", fontWeight: 600 }}>
              <Sparkles size={10} />
              Next-Gen Management Platform
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === "command" ? "active" : ""}`}
            onClick={() => setActiveTab("command")}
          >
            Command Center
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === "explorer" ? "active" : ""}`}
            onClick={() => setActiveTab("explorer")}
          >
            Explorer
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </nav>

        {/* System Date Badge */}
        <div className="header-actions">
          <div className="time-display">
            <Calendar size={12} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Aug 15, 2026
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className={`main-content ${selectedPropertyId ? "has-details" : ""}`}>
        {/* Left Side: Controls & Directory */}
        {renderSidebar()}

        {/* Center: Interactive 3D WebGL Scene */}
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <ThreeMap 
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={handleSelectProperty}
            viewMode={viewMode}
            setViewMode={setViewMode}
            heatmapMetric={heatmapMetric}
            setHeatmapMetric={setHeatmapMetric}
            poiFilters={filters.pois}
            highlightedPropertyIds={highlightedPropertyIds}
          />
        </div>

        {/* Right Side: Building/Unit Inspection Details Panel */}
        {selectedPropertyId && selectedProperty && (
          <PropertyDetails 
            property={selectedProperty}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            onClose={handleCloseDetails}
            onUpdateUnitStatus={handleUpdateUnitStatus}
          />
        )}

        {/* Collapsible Floating AI assistant chat bubble */}
        <AiAssistant 
          onExecuteCommand={handleExecuteAiCommand}
          properties={properties}
        />
      </main>
    </div>
  );
}
