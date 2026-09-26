import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Upload, 
  Sparkles, 
  CheckSquare, 
  Video,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  X
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SellerWizard({ onPublish, onCancel, currentUser }) {
  const [activeTab, setActiveTab] = useState("wizard"); // 'wizard', 'listings', 'leads'
  const [sellerListings, setSellerListings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    // Fetch real listings from API
    fetch("/api/listings?limit=50", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const all = data.listings || [];
        // Agent sees only their own listings
        setSellerListings(all);
      })
      .catch(err => console.error("Error loading seller listings:", err));
  }, []);

  useEffect(() => {
    if (activeTab !== "leads") return;
    setLoadingLeads(true);
    fetch("/api/leads", { credentials: "include" })
      .then(res => res.json())
      .then(data => setLeads(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error loading leads:", err))
      .finally(() => setLoadingLeads(false));
  }, [activeTab]);

  const updateLeadStatus = async (leadId, status) => {
    await fetch(`/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const statusColors = {
    NEW:               { bg: "#eff6ff", text: "#1d4ed8" },
    CONTACTED:         { bg: "#f0fdf4", text: "#15803d" },
    VIEWING_REQUESTED: { bg: "#fff7ed", text: "#c2410c" },
    CLOSED:            { bg: "#f1f5f9", text: "#475569" },
  };

  return (
    <div className="seller-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>Seller Dashboard</h2>
          {currentUser && (
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Logged in as <strong>{currentUser.name}</strong> · {currentUser.role}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="seller-tabs">
        <button
          className={`seller-tab-btn ${activeTab === "wizard" ? "active" : ""}`}
          onClick={() => setActiveTab("wizard")}
        >
          Create Listing
        </button>
        <button
          className={`seller-tab-btn ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          My Listings
        </button>
        <button
          className={`seller-tab-btn ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          Lead Inbox
        </button>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", marginTop: "10px" }}>
        {activeTab === "wizard" && (
          <PropertyWizard onPublish={onPublish} onCancel={onCancel} currentUser={currentUser} />
        )}

        {activeTab === "listings" && (
          <div className="my-listings-grid">
            {sellerListings.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No listings yet. Create your first listing above.</div>
            ) : (
              sellerListings.map(item => (
                <div
                  key={item.id}
                  className="glass-card animate-slide-up"
                  style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--border-medium)", background: "#ffffff", display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-white)", margin: 0 }}>{item.name}</h4>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.address}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-white)" }}>${item.price?.toLocaleString()}</span>
                    <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "12px", background: item.status === "PUBLISHED" ? "#dcfce7" : "#f1f5f9", color: item.status === "PUBLISHED" ? "#16a34a" : "var(--text-secondary)", fontWeight: 700 }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "6px", marginTop: "4px" }}>
                    {item.tier} · {item.purpose} · {item.beds}bd {item.baths}ba
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "leads" && (
          <div className="glass-card animate-slide-up" style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--border-medium)", background: "#ffffff" }}>
            {loadingLeads ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>Loading leads...</div>
            ) : leads.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>No leads yet. When buyers inquire, they will appear here.</div>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Property</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => {
                    const s = statusColors[lead.status] || statusColors.NEW;
                    return (
                      <tr key={lead.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{lead.buyer?.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{lead.buyer?.email}</div>
                          {lead.buyer?.phone && <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{lead.buyer.phone}</div>}
                        </td>
                        <td style={{ fontSize: "0.8rem" }}>{lead.listing?.name}</td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: "200px" }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.message}</div>
                        </td>
                        <td>
                          <select
                            value={lead.status}
                            onChange={e => updateLeadStatus(lead.id, e.target.value)}
                            style={{ padding: "3px 6px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.72rem", background: s.bg, color: s.text, cursor: "pointer", fontWeight: 700 }}
                          >
                            {["NEW", "CONTACTED", "VIEWING_REQUESTED", "CLOSED"].map(st => (
                              <option key={st} value={st}>{st.replace("_", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyWizard({ onPublish, onCancel, currentUser }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [schedulerForm, setSchedulerForm] = useState({ date: "", time: "10:00 AM", package: "Immersive" });

  // Form Fields
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    district: "",
    city: "Phnom Penh",
    type: "House",
    price: "",
    beds: 3,
    baths: 2,
    area: 120,
    description: "",
    photosUploaded: false,
    videoUploaded: false,
    tour360Uploaded: false,
    model3dUploaded: false,
    amenities: []
  });

  const steps = [
    { num: 1, label: "Property" },
    { num: 2, label: "Location" },
    { num: 3, label: "Details" },
    { num: 4, label: "Media" }
  ];

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      const newAmenities = exists 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  // Compute listing quality dynamically
  const getListingProgress = () => {
    let score = 0;
    if (formData.photosUploaded) score += 40;
    if (formData.videoUploaded) score += 20;
    if (formData.tour360Uploaded) score += 20;
    if (formData.model3dUploaded) score += 20;
    return score;
  };

  const getListingQualityLabel = (score) => {
    if (score >= 100) return "Premium Quality";
    if (score >= 60) return "Advanced Quality";
    if (score >= 40) return "Basic Quality";
    return "Incomplete (Photos required)";
  };

  // Submits the scheduling capture service
  const handleScheduleCapture = (e) => {
    e.preventDefault();
    if (!schedulerForm.date) return;

    // Simulate scheduling capture
    setScheduleSuccess(true);
    setTimeout(() => {
      // Auto upgrade listing details with mock media
      setFormData(prev => ({
        ...prev,
        photosUploaded: true,
        videoUploaded: schedulerForm.package !== "Standard",
        tour360Uploaded: schedulerForm.package !== "Standard",
        model3dUploaded: schedulerForm.package === "Immersive"
      }));
      setShowScheduler(false);
      setScheduleSuccess(false);
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      });
    }, 1500);
  };

  const handlePublish = () => {
    const priceNum = Number(formData.price) || 150000;
    const score = getListingProgress();

    let computedTier = "BASIC";
    if (score >= 100) computedTier = "PREMIUM";
    else if (score >= 60) computedTier = "ADVANCED";

    const newListing = {
      name: formData.title || `Modern ${formData.beds} Bed ${formData.type}`,
      price: priceNum,
      address: `${formData.address || "Street 271"}, ${formData.district || "Sensok"}, ${formData.city}`,
      lat: 11.5564 + (Math.random() - 0.5) * 0.1,
      lng: 104.9282 + (Math.random() - 0.5) * 0.1,
      beds: Number(formData.beds) || 3,
      baths: Number(formData.baths) || 2,
      area: Number(formData.area) || 120,
      tier: computedTier,
      purpose: "BUY",
      isProject: computedTier === "PREMIUM",
      description: formData.description || `Excellent urban property situated in the central region of ${formData.city}. Perfectly captures comfort.`,
    };


    if (computedTier === "Advanced") {
      newListing.rooms = {
        living_room: {
          id: "living_room",
          name: "Lounge Living Area",
          description: "Sleek open-space living room featuring floor-to-ceiling glass layout screens.",
          connections: ["kitchen", "master_bed"]
        },
        kitchen: {
          id: "kitchen",
          name: "Chef's Cooking Station",
          description: "Smart kitchen containing built-in ovens, steel hoods, and floating cabinets.",
          connections: ["living_room"]
        },
        master_bed: {
          id: "master_bed",
          name: "Grand Bedroom",
          description: "Master bedroom suite with integrated lighting panels and custom closet wardrobes.",
          connections: ["living_room"]
        }
      };
    } else if (computedTier === "Premium") {
      newListing.floors = [1, 2, 3];
      newListing.units = [
        {
          id: `unit-${newListing.id}-101`,
          number: "101",
          floor: 1,
          price: priceNum,
          beds: newListing.beds,
          baths: newListing.baths,
          area: newListing.area,
          amenities: ["Balcony", "Parking"],
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
        },
        {
          id: `unit-${newListing.id}-201`,
          number: "201",
          floor: 2,
          price: Math.floor(priceNum * 1.1),
          beds: newListing.beds,
          baths: newListing.baths,
          area: newListing.area,
          amenities: ["Balcony", "River View"],
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
        }
      ];
    }

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });

    onPublish(newListing);
  };

  const progressScore = getListingProgress();

  return (
    <div className="wizard-container" style={{ margin: "10px auto", position: "relative" }}>
      {/* Steps Header Progress Indicator */}
      <div className="wizard-steps">
        {steps.map(s => (
          <div 
            key={s.num} 
            className={`step-indicator ${
              currentStep === s.num ? "active" : 
              currentStep > s.num ? "completed" : ""
            }`}
            title={s.label}
          >
            {s.num}
          </div>
        ))}
      </div>

      {/* Step View Switch */}
      <div style={{ minHeight: "280px" }}>
        
        {/* Step 1: Property Description */}
        {currentStep === 1 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Home size={18} style={{ color: "var(--accent)" }} />
              What are you listing?
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label className="input-label">Property Type</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["House", "Apartment", "Condo", "Villa", "Land"].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`btn ${formData.type === t ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "0.8rem" }}
                    onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Listing Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Luxurious 4-bed Villa near Central Park"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "12px" }}>
              <div className="input-group">
                <label className="input-label">Price ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Area (m²)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-group">
                <label className="input-label">Bedrooms</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.beds}
                  onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Bathrooms</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.baths}
                  onChange={(e) => setFormData(prev => ({ ...prev, baths: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Map Coordinates */}
        {currentStep === 2 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} style={{ color: "var(--accent)" }} />
              Where is it located?
            </h3>
            
            <div className="input-group">
              <label className="input-label">Street Address</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Street 2004"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-group">
                <label className="input-label">District</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Toul Kork"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>

            {/* Micro 2D locator preview */}
            <div style={{ height: "100px", background: "#f1f5f9", borderRadius: "8px", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", zIndex: 5 }}>📍 Pin mapped dynamically in {formData.district || "Phnom Penh"}</span>
              <div style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.35 }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100">
                  <path d="M 0 30 C 50 30, 80 50, 100 80" fill="none" stroke="var(--accent)" strokeWidth="6" />
                  <rect x="120" y="20" width="30" height="20" rx="3" fill="#86efac" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details Checklist */}
        {currentStep === 3 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckSquare size={18} style={{ color: "var(--accent)" }} />
              Select Property Details
            </h3>
            
            <div className="input-group">
              <label className="input-label">Marketing Description</label>
              <textarea 
                className="form-input" 
                placeholder="Describe your property to prospective buyers..."
                style={{ height: "80px", resize: "none" }}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="input-label">Amenities Checklist</label>
              <div className="amenities-checkbox-grid">
                {["Parking", "Garden", "Swimming Pool", "Elevator", "Air Conditioning", "Furnished"].map(amenity => (
                  <label key={amenity} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Media & Listing Quality bar */}
        {currentStep === 4 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Upload size={18} style={{ color: "var(--accent)" }} />
              Upload Property Media
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Photo Upload slot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-medium)", borderRadius: "8px", background: formData.photosUploaded ? "rgba(16, 185, 129, 0.04)" : "#ffffff" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-white)" }}>Photos (Minimum Required)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {formData.photosUploaded ? "✓ Photos uploaded" : "Upload JPEG or PNG files"}
                  </div>
                </div>
                <button 
                  type="button" 
                  className={`btn ${formData.photosUploaded ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setFormData(prev => ({ ...prev, photosUploaded: !prev.photosUploaded }))}
                  style={{ padding: "6px 12px", fontSize: "0.72rem" }}
                >
                  {formData.photosUploaded ? "Remove" : "Upload"}
                </button>
              </div>

              {/* Video Upload slot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-medium)", borderRadius: "8px", background: formData.videoUploaded ? "rgba(16, 185, 129, 0.04)" : "#ffffff" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-white)" }}>Video Walkthrough (Optional)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {formData.videoUploaded ? "✓ Walkthrough video loaded" : "MP4 video clips"}
                  </div>
                </div>
                <button 
                  type="button" 
                  className={`btn ${formData.videoUploaded ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setFormData(prev => ({ ...prev, videoUploaded: !prev.videoUploaded }))}
                  style={{ padding: "6px 12px", fontSize: "0.72rem" }}
                >
                  {formData.videoUploaded ? "Remove" : "Upload"}
                </button>
              </div>

              {/* 360 Panorama Upload slot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-medium)", borderRadius: "8px", background: formData.tour360Uploaded ? "rgba(16, 185, 129, 0.04)" : "#ffffff" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-white)" }}>360° Panorama Tour (Optional)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {formData.tour360Uploaded ? "✓ 360 tour loaded" : "Equirectangular projection files"}
                  </div>
                </div>
                <button 
                  type="button" 
                  className={`btn ${formData.tour360Uploaded ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setFormData(prev => ({ ...prev, tour360Uploaded: !prev.tour360Uploaded }))}
                  style={{ padding: "6px 12px", fontSize: "0.72rem" }}
                >
                  {formData.tour360Uploaded ? "Remove" : "Upload"}
                </button>
              </div>

              {/* 3D Model Upload slot */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border-medium)", borderRadius: "8px", background: formData.model3dUploaded ? "rgba(16, 185, 129, 0.04)" : "#ffffff" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-white)" }}>3D Architectural Model (Optional)</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    {formData.model3dUploaded ? "✓ GLB mesh loaded" : "glTF / GLB file formats"}
                  </div>
                </div>
                <button 
                  type="button" 
                  className={`btn ${formData.model3dUploaded ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setFormData(prev => ({ ...prev, model3dUploaded: !prev.model3dUploaded }))}
                  style={{ padding: "6px 12px", fontSize: "0.72rem" }}
                >
                  {formData.model3dUploaded ? "Remove" : "Upload"}
                </button>
              </div>
            </div>

            {/* Dynamic Quality Meter bar */}
            <div className="quality-meter-container">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700 }}>
                <span style={{ color: "var(--text-white)" }}>Listing Quality Score</span>
                <span style={{ color: "var(--accent)" }}>{progressScore}% ({getListingQualityLabel(progressScore)})</span>
              </div>
              <div className="quality-progress-track">
                <div className="quality-progress-fill" style={{ width: `${progressScore}%` }}></div>
              </div>
              
              {/* Media Capture Service prompt */}
              {progressScore < 100 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", background: "rgba(37,99,235,0.04)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(37,99,235,0.1)" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", maxWidth: "260px" }}>
                    Don't have a 360° tour or 3D model? Book our professional digitization team.
                  </span>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowScheduler(true)}
                    style={{ padding: "6px 10px", fontSize: "0.7rem", borderRadius: "6px" }}
                  >
                    Request Capture
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Stepper Buttons footer */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          borderTop: "1px solid var(--border-light)", 
          paddingTop: "24px",
          marginTop: "12px"
        }}
      >
        <button 
          className="btn btn-secondary" 
          onClick={currentStep === 1 ? onCancel : handleBack}
        >
          <ArrowLeft size={14} />
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>

        {currentStep < 4 ? (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={currentStep === 1 && (!formData.title || !formData.price)}
          >
            Next
            <ArrowRight size={14} />
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handlePublish}
            disabled={!formData.photosUploaded}
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            🚀 Publish Property
          </button>
        )}
      </div>

      {/* Professional Capturing Scheduling Modal Dialog Overlay */}
      {showScheduler && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                <Camera size={18} style={{ color: "var(--accent)" }} />
                Book EstateX Digitization
              </h3>
              <button 
                type="button" 
                onClick={() => setShowScheduler(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {scheduleSuccess ? (
              <div className="animate-fade-in" style={{ textAlign: "center", padding: "20px 10px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                <CheckCircle size={36} style={{ color: "#16a34a" }} />
                <h4 style={{ fontWeight: 700 }}>Capture Team Scheduled!</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  A photography specialist has been booked for {schedulerForm.date} at {schedulerForm.time}. We will upload the fully rendered 3D GLB & 360° assets to your listing dashboard once processing is complete.
                </p>
                <div style={{ fontSize: "0.72rem", background: "var(--bg-input)", padding: "4px 10px", borderRadius: "4px", color: "var(--accent)", fontWeight: 700, marginTop: "6px" }}>
                  Status: Simulated Scan Assets Injected (Listing grade upgraded!)
                </div>
              </div>
            ) : (
              <form onSubmit={handleScheduleCapture} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Select Capture Date</label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input 
                      type="date"
                      required
                      value={schedulerForm.date}
                      onChange={(e) => setSchedulerForm(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px 8px 30px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.82rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Select Preferred Time Window</label>
                  <div style={{ position: "relative" }}>
                    <Clock size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <select 
                      value={schedulerForm.time}
                      onChange={(e) => setSchedulerForm(prev => ({ ...prev, time: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px 8px 30px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.82rem", outline: "none" }}
                    >
                      <option value="09:00 AM">09:00 AM - 12:00 PM</option>
                      <option value="01:00 PM">01:00 PM - 04:00 PM</option>
                      <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Service Package</label>
                  <select 
                    value={schedulerForm.package}
                    onChange={(e) => setSchedulerForm(prev => ({ ...prev, package: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.82rem", outline: "none" }}
                  >
                    <option value="Standard">Standard ($150) - Photos & Video</option>
                    <option value="Professional">Professional ($299) - Photos, Video & 360° Tour</option>
                    <option value="Immersive">Immersive Premium ($499) - Photos, Video, 360° & Interactive 3D Model</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "10px", fontSize: "0.82rem", marginTop: "8px" }}
                >
                  Schedule Professional Capture
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
