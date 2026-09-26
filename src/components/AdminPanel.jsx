import React, { useState, useEffect } from "react";
import {
  BarChart3, Users, Home, MessageSquare, TrendingUp,
  ChevronDown, CheckCircle, Clock, Eye, XCircle, LayoutDashboard
} from "lucide-react";

const statusColors = {
  NEW:               { bg: "#eff6ff", text: "#1d4ed8", label: "New" },
  CONTACTED:         { bg: "#f0fdf4", text: "#15803d", label: "Contacted" },
  VIEWING_REQUESTED: { bg: "#fff7ed", text: "#c2410c", label: "Viewing" },
  CLOSED:            { bg: "#f1f5f9", text: "#475569", label: "Closed" },
};

const roleColors = {
  ADMIN:    { bg: "#fdf4ff", text: "#7e22ce" },
  AGENT:    { bg: "#eff6ff", text: "#1d4ed8" },
  OWNER:    { bg: "#f0fdf4", text: "#15803d" },
  CUSTOMER: { bg: "#f8fafc", text: "#475569" },
};

const tierColors = {
  PREMIUM:  { bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", text: "#ffffff" },
  ADVANCED: { bg: "linear-gradient(135deg,#3b82f6,#06b6d4)", text: "#ffffff" },
  BASIC:    { bg: "#f1f5f9", text: "#475569" },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "20px",
      border: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}>
      <div style={{
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: color || "linear-gradient(135deg,#3b82f6,#6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={22} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginTop: "3px" }}>{label}</div>
        {sub && <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminPanel({ user, onShowListing }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, usersRes, leadsRes] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }),
        fetch("/api/listings?limit=50", { credentials: "include" }),
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/leads", { credentials: "include" }),
      ]);
      const [s, l, u, ld] = await Promise.all([statsRes.json(), listingsRes.json(), usersRes.json(), leadsRes.json()]);
      setStats(s);
      setListings(l.listings || []);
      setUsers(u || []);
      setLeads(ld || []);
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    await fetch(`/api/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const updateUserRole = async (userId, role) => {
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "listings", label: "Listings", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "leads", label: "Leads", icon: MessageSquare },
  ];

  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9" };
  const tdStyle = { padding: "12px 14px", fontSize: "0.82rem", color: "#374151", borderBottom: "1px solid #f8fafc" };

  const Badge = ({ label, bg, text }) => (
    <span style={{ background: bg, color: text, padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700 }}>{label}</span>
  );

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
          ADMIN CONSOLE
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          EstateX Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "0.85rem" }}>
          Logged in as <strong>{user.name}</strong> · {user.email}
        </p>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#fff", padding: "6px", borderRadius: "14px", border: "1px solid #f1f5f9", width: "fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "10px",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "#64748b",
                fontWeight: active ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading...</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {activeTab === "overview" && stats && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                <StatCard icon={Home} label="Total Listings" value={stats.totalListings} sub={`${stats.publishedListings} published`} color="linear-gradient(135deg,#3b82f6,#06b6d4)" />
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="linear-gradient(135deg,#8b5cf6,#ec4899)" />
                <StatCard icon={MessageSquare} label="Total Leads" value={stats.totalLeads} sub={`${stats.newLeads} new`} color="linear-gradient(135deg,#f59e0b,#ef4444)" />
                <StatCard icon={TrendingUp} label="Saved Properties" value={stats.totalSaved} color="linear-gradient(135deg,#10b981,#3b82f6)" />
              </div>

              {/* Recent leads quick view */}
              <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "16px" }}>Recent Leads</div>
                {leads.slice(0, 5).length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No leads yet.</div>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Buyer</th>
                        <th style={thStyle}>Listing</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map(lead => {
                        const s = statusColors[lead.status] || statusColors.NEW;
                        return (
                          <tr key={lead.id}>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: 600 }}>{lead.buyer?.name}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{lead.buyer?.email}</div>
                            </td>
                            <td style={tdStyle}>{lead.listing?.name}</td>
                            <td style={tdStyle}><Badge label={s.label} bg={s.bg} text={s.text} /></td>
                            <td style={{ ...tdStyle, color: "#94a3b8" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* LISTINGS */}
          {activeTab === "listings" && (
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a" }}>
                All Listings ({listings.length})
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Listing</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Tier</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Purpose</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => {
                    const t = tierColors[l.tier] || tierColors.BASIC;
                    return (
                      <tr key={l.id} style={{ cursor: "pointer" }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{l.name}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{l.address}</div>
                        </td>
                        <td style={tdStyle}>
                          ${l.price?.toLocaleString()}
                          {l.purpose === "RENT" && <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>/mo</span>}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ background: t.bg, color: t.text, padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700 }}>
                            {l.tier}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ background: l.status === "PUBLISHED" ? "#f0fdf4" : "#f8fafc", color: l.status === "PUBLISHED" ? "#15803d" : "#94a3b8", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700 }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={tdStyle}>{l.purpose}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => onShowListing && onShowListing(l.id)}
                            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#f8fafc", fontSize: "0.75rem", cursor: "pointer", color: "#374151" }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a" }}>
                All Users ({users.length})
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Member Since</th>
                    <th style={thStyle}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const r = roleColors[u.role] || roleColors.CUSTOMER;
                    return (
                      <tr key={u.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{u.name}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{u.email}</div>
                        </td>
                        <td style={{ ...tdStyle, color: "#64748b" }}>{u.phone || "—"}</td>
                        <td style={tdStyle}>
                          <span style={{ background: r.bg, color: r.text, padding: "2px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "#94a3b8" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={tdStyle}>
                          {u.id !== user.id && (
                            <select
                              value={u.role}
                              onChange={e => updateUserRole(u.id, e.target.value)}
                              style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer" }}
                            >
                              {["CUSTOMER", "AGENT", "OWNER", "ADMIN"].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          )}
                          {u.id === user.id && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>You</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* LEADS */}
          {activeTab === "leads" && (
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a" }}>
                All Leads ({leads.length})
              </div>
              {leads.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No leads yet.</div>
              ) : (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Buyer</th>
                      <th style={thStyle}>Listing</th>
                      <th style={thStyle}>Message</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => {
                      const s = statusColors[lead.status] || statusColors.NEW;
                      return (
                        <tr key={lead.id}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 700 }}>{lead.buyer?.name}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{lead.buyer?.email}</div>
                            {lead.buyer?.phone && <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{lead.buyer.phone}</div>}
                          </td>
                          <td style={{ ...tdStyle, maxWidth: "160px" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{lead.listing?.name}</div>
                          </td>
                          <td style={{ ...tdStyle, maxWidth: "220px" }}>
                            <div style={{ fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lead.message}
                            </div>
                          </td>
                          <td style={tdStyle}><Badge label={s.label} bg={s.bg} text={s.text} /></td>
                          <td style={tdStyle}>
                            <select
                              value={lead.status}
                              onChange={e => updateLeadStatus(lead.id, e.target.value)}
                              style={{ padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer" }}
                            >
                              {["NEW", "CONTACTED", "VIEWING_REQUESTED", "CLOSED"].map(st => (
                                <option key={st} value={st}>{st.replace("_", " ")}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
