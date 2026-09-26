import React, { useState, useEffect } from "react";
import DiscoverView from "./DiscoverView";
import PropertyPage from "./PropertyPage";
import SellerWizard from "./SellerWizard";
import CompareView from "./CompareView";
import HomeView from "./HomeView";
import AuthModal from "./AuthModal";
import AdminPanel from "./AdminPanel";
import { Building, Heart, LogIn, LogOut, ShieldCheck, User, ChevronDown } from "lucide-react";

export default function EstateXDashboard() {
  // ─── Auth state ────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);    // null = logged out
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequired, setAuthRequired] = useState(null);  // message for gated actions

  // ─── Global app state ──────────────────────────────────────────────────────
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [comparedListingIds, setComparedListingIds] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    search: "", type: "All", minPrice: "", maxPrice: "", purpose: "Buy", isProject: false
  });

  // ─── On mount: check session + load data ──────────────────────────────────
  useEffect(() => {
    // Try to restore session from httpOnly cookie
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(user => { if (user) setCurrentUser(user); })
      .catch(() => {});

    // Load all published listings
    fetch("/api/listings?limit=50", { credentials: "include" })
      .then(res => res.json())
      .then(data => setListings(data.listings || []))
      .catch(err => console.error("Error loading listings:", err));
  }, []);

  // Reload saved properties whenever user changes
  useEffect(() => {
    if (currentUser) {
      fetch("/api/saved", { credentials: "include" })
        .then(res => res.json())
        .then(data => setSavedListingIds(Array.isArray(data) ? data : []))
        .catch(() => {});
    } else {
      setSavedListingIds([]);
    }
  }, [currentUser]);

  // ─── Auth handlers ─────────────────────────────────────────────────────────
  const handleAuth = (user) => {
    setCurrentUser(user);
    setAuthRequired(null);
    // Navigate pending action after login
    if (authRequired === "sell") setCurrentView("sell");
    if (authRequired === "saved") setCurrentView("saved");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setCurrentUser(null);
    setSavedListingIds([]);
    setCurrentView("home");
  };

  const requireLogin = (viewName) => {
    setAuthRequired(viewName);
    setShowAuthModal(true);
  };

  // ─── Navigation handlers ───────────────────────────────────────────────────
  const handleLogoClick = () => {
    setSearchFilters({ search: "", type: "All", minPrice: "", maxPrice: "", purpose: "Buy", isProject: false });
    setCurrentView("home");
    setSelectedListingId(null);
  };

  const handleViewProperty = (id) => {
    setSelectedListingId(id);
    setCurrentView("property");
  };

  const goToDiscover = (overrides = {}) => {
    setSearchFilters(prev => ({ ...prev, ...overrides }));
    setCurrentView("discover");
    setSelectedListingId(null);
  };

  // ─── Listing publish ───────────────────────────────────────────────────────
  const handlePublishListing = async (newListing) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newListing),
      });
      const saved = await res.json();
      if (res.ok) {
        setListings(prev => [saved, ...prev]);
        setCurrentView("discover");
        setSelectedListingId(saved.id);
      }
    } catch (err) {
      console.error("Error publishing listing:", err);
    }
  };

  // ─── Save toggle ───────────────────────────────────────────────────────────
  const handleToggleSave = async (id) => {
    if (!currentUser) return requireLogin("saved");
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId: id }),
      });
      const data = await res.json();
      setSavedListingIds(prev =>
        data.saved ? [...prev, id] : prev.filter(sid => sid !== id)
      );
    } catch (err) {
      console.error("Error toggling saved status:", err);
    }
  };

  // ─── Compare toggle ────────────────────────────────────────────────────────
  const handleToggleCompare = (id) => {
    setComparedListingIds(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) { alert("You can compare up to 3 properties at a time."); return prev; }
      return [...prev, id];
    });
  };

  // ─── Derived state ─────────────────────────────────────────────────────────
  const activeListing = React.useMemo(
    () => listings.find(l => l.id === selectedListingId) || null,
    [listings, selectedListingId]
  );

  const activeListings = React.useMemo(() => {
    if (currentView === "saved") return listings.filter(l => savedListingIds.includes(l.id));
    return listings;
  }, [listings, currentView, savedListingIds]);

  // ─── Role-gated nav ────────────────────────────────────────────────────────
  const handleSellClick = () => {
    if (!currentUser) return requireLogin("sell");
    if (currentUser.role === "CUSTOMER") {
      setShowAuthModal(true); // show login so they can switch account
      return;
    }
    setCurrentView("sell");
    setSelectedListingId(null);
  };

  const handleSavedClick = () => {
    if (!currentUser) return requireLogin("saved");
    setCurrentView("saved");
    setSelectedListingId(null);
  };

  const handleAdminClick = () => {
    if (!currentUser || currentUser.role !== "ADMIN") return;
    setCurrentView("admin");
    setSelectedListingId(null);
  };

  return (
    <div className="app-container">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setAuthRequired(null); }}
          onAuth={handleAuth}
        />
      )}

      {/* ── Header ── */}
      <header className="header-bar">
        <div className="brand-section" onClick={handleLogoClick}>
          <div className="brand-logo">
            <Building size={22} />
          </div>
          <h1 className="brand-title">EstateX</h1>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <span
            className={`nav-link ${currentView === "home" ? "active" : ""}`}
            onClick={() => { goToDiscover({}); setCurrentView("home"); }}
          >
            Home
          </span>
          <span
            className={`nav-link ${(currentView === "discover" && searchFilters.purpose === "Buy" && !searchFilters.isProject) ? "active" : ""}`}
            onClick={() => goToDiscover({ purpose: "Buy", isProject: false })}
          >
            Buy
          </span>
          <span
            className={`nav-link ${(currentView === "discover" && searchFilters.purpose === "Rent" && !searchFilters.isProject) ? "active" : ""}`}
            onClick={() => goToDiscover({ purpose: "Rent", isProject: false })}
          >
            Rent
          </span>
          <span
            className={`nav-link ${(currentView === "discover" && searchFilters.isProject) ? "active" : ""}`}
            onClick={() => goToDiscover({ purpose: "All", isProject: true })}
          >
            New Projects
          </span>
          <span
            className={`nav-link ${currentView === "sell" ? "active" : ""}`}
            onClick={handleSellClick}
          >
            Sell
          </span>
          <span
            className={`nav-link ${currentView === "saved" ? "active" : ""}`}
            onClick={handleSavedClick}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Heart size={14} />
            Saved
            {savedListingIds.length > 0 && (
              <span style={{ fontSize: "0.72rem", background: "var(--accent)", color: "#fff", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                {savedListingIds.length}
              </span>
            )}
          </span>
          {currentUser?.role === "ADMIN" && (
            <span
              className={`nav-link ${currentView === "admin" ? "active" : ""}`}
              onClick={handleAdminClick}
              style={{ display: "flex", alignItems: "center", gap: "5px", color: "#7c3aed" }}
            >
              <ShieldCheck size={14} />
              Admin
            </span>
          )}
        </nav>

        {/* Auth Area */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}>
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>{currentUser.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 12px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "20px",
                  color: "#fca5a5",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 18px",
                background: "var(--accent)",
                border: "none",
                borderRadius: "20px",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── View Router ── */}
      <div style={{ flex: 1, height: "100%", overflow: "hidden", position: "relative" }}>

        {currentView === "home" && (
          <HomeView
            listings={listings}
            onCategoryClick={(q) => {
              setSearchFilters(prev => ({ ...prev, search: q, type: "All", minPrice: "", maxPrice: "", purpose: "All", isProject: false }));
              setCurrentView("discover");
            }}
            onViewProperty={(id) => {
              setSelectedListingId(id);
              setCurrentView("discover");
            }}
            onToggleSave={handleToggleSave}
            savedListingIds={savedListingIds}
          />
        )}

        {(currentView === "discover" || currentView === "saved") && (
          <DiscoverView
            listings={activeListings}
            onViewProperty={handleViewProperty}
            filters={searchFilters}
            setFilters={setSearchFilters}
            selectedListingId={selectedListingId}
            setSelectedListingId={setSelectedListingId}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSave}
            comparedListingIds={comparedListingIds}
            onToggleCompare={handleToggleCompare}
            isSavedView={currentView === "saved"}
          />
        )}

        {currentView === "property" && activeListing && (
          <PropertyPage
            listing={activeListing}
            currentUser={currentUser}
            onBack={() => setCurrentView("discover")}
            isSaved={savedListingIds.includes(activeListing?.id)}
            onToggleSave={handleToggleSave}
            isCompared={comparedListingIds.includes(activeListing?.id)}
            onToggleCompare={handleToggleCompare}
            onNavigate={(id) => { setSelectedListingId(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onLoginRequired={() => setShowAuthModal(true)}
          />
        )}

        {currentView === "sell" && (
          <SellerWizard
            currentUser={currentUser}
            onPublish={handlePublishListing}
            onCancel={() => setCurrentView("discover")}
          />
        )}

        {currentView === "compare" && (
          <CompareView
            comparedIds={comparedListingIds}
            listings={listings}
            onRemove={handleToggleCompare}
            onView={handleViewProperty}
            onBack={() => setCurrentView("discover")}
          />
        )}

        {currentView === "admin" && currentUser?.role === "ADMIN" && (
          <AdminPanel
            user={currentUser}
            onShowListing={(id) => { setSelectedListingId(id); setCurrentView("property"); }}
          />
        )}

        {/* Compare floating bar */}
        {comparedListingIds.length > 0 && (
          <div className="compare-floating-bar">
            <span>{comparedListingIds.length} properties selected</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" disabled={comparedListingIds.length < 2} onClick={() => setCurrentView("compare")}>
                Compare Properties
              </button>
              <button className="btn btn-secondary" onClick={() => setComparedListingIds([])} style={{ padding: "8px 12px" }}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
