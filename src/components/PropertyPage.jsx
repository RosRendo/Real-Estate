import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  PlayCircle, 
  Image, 
  MapPin, 
  Box, 
  Compass, 
  Activity, 
  Home, 
  Video, 
  CheckCircle,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  Calendar,
  X,
  Star
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PropertyPage({ listing, onBack, isSaved, onToggleSave, isCompared, onToggleCompare, onNavigate, currentUser, onLoginRequired }) {
  // Media view states
  const [activeMedia, setActiveMedia] = useState("photos"); // 'photos', 'video', 'location'
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  
  // Down payment percentage state (for buy properties)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Recommendations state fetched from database
  const [recommendations, setRecommendations] = useState([]);

  React.useEffect(() => {
    fetch("/api/listings?limit=50", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const allListings = data.listings || data || [];
        const currentCity = listing.address.includes("Vietnam") || listing.address.includes("Quận 1") || listing.address.includes("Saigon") ? "HCMC" : "Phnom Penh";
        let filtered = allListings.filter(l => l.id !== listing.id);
        filtered.sort((a, b) => {
          const aCity = a.address.includes("Vietnam") || a.address.includes("Quận 1") || a.address.includes("Saigon") ? "HCMC" : "Phnom Penh";
          const bCity = b.address.includes("Vietnam") || b.address.includes("Quận 1") || b.address.includes("Saigon") ? "HCMC" : "Phnom Penh";
          if (aCity === currentCity && bCity !== currentCity) return -1;
          if (aCity !== currentCity && bCity === currentCity) return 1;
          return 0;
        });
        setRecommendations(filtered.slice(0, 3));
      })
      .catch(err => console.error("Error loading recommendations:", err));
  }, [listing.id]);
  
  // Immersive full-screen 3D overlay
  const [immersive3d, setImmersive3d] = useState(false);

  // Walkthrough State (for Advanced Listings inside full-screen 3D)
  const [activeRoomId, setActiveRoomId] = useState("living_room");

  // Premium Tower States (inside full-screen 3D)
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [playUnitVideo, setPlayUnitVideo] = useState(false);

  // Reservation widget form state
  const [reservationCheckIn, setReservationCheckIn] = useState("2026-08-15");
  const [reservationCheckOut, setReservationCheckOut] = useState("2026-08-16");
  const [reservationGuests, setReservationGuests] = useState(1);
  const [reservationReserved, setReservationReserved] = useState(false);

  // Contact agent form state
  const [contactForm, setContactForm] = useState({ msg: "Hi, I am interested in this listing and would like to schedule a visit." });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const buildingFloorsMeshes = useRef([]);

  // Set up 3D WebGL Canvas inside Immersive Overlay
  useEffect(() => {
    if (!immersive3d || !canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Match light mode background
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 4, 7);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const floorGeo = new THREE.PlaneGeometry(15, 15);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // Build Model based on Tier
    if (listing.tier === "Advanced") {
      createModernVillaMesh(scene);
      camera.position.set(0, 3, 5);
      controls.target.set(0, 0.5, 0);
    } else if (listing.tier === "Premium") {
      createSkyscraperMesh(scene, listing.floors);
      camera.position.set(0, 5, 8);
      controls.target.set(0, 2.5, 0);
    }
    controls.update();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [immersive3d, listing]);

  // Handle floor camera sweep animations (Premium)
  useEffect(() => {
    if (listing.tier !== "Premium" || !cameraRef.current || !controlsRef.current || !immersive3d) return;

    if (selectedFloor) {
      const floorIndex = listing.floors.indexOf(selectedFloor);
      const floorHeight = 0.5 + floorIndex * 0.9;
      
      cameraRef.current.position.set(0, floorHeight + 1.2, 3.5);
      controlsRef.current.target.set(0, floorHeight, 0);
      controlsRef.current.update();

      // Highlight selected floor in building mesh list
      buildingFloorsMeshes.current.forEach((mesh, index) => {
        const mat = mesh.material;
        if (index === floorIndex) {
          mat.color.setHex(0x2563eb); // Corporate Blue selection
          mat.emissive.setHex(0x2563eb);
          mat.emissiveIntensity = 0.25;
        } else {
          mat.color.setHex(0xe2e8f0);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      });
    } else {
      cameraRef.current.position.set(0, 5, 8);
      controlsRef.current.target.set(0, 2.5, 0);
      controlsRef.current.update();

      buildingFloorsMeshes.current.forEach(mesh => {
        mesh.material.color.setHex(0xe2e8f0);
        mesh.material.emissive.setHex(0x000000);
      });
    }
  }, [selectedFloor, listing, immersive3d]);

  // Procedural Builder: Modern Villa Mesh (Light Theme)
  const createModernVillaMesh = (scene) => {
    const grass = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x86efac }) // Soft pastel green
    );
    scene.add(grass);

    const pool = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.1, metalness: 0.9, emissive: 0x22d3ee, emissiveIntensity: 0.15 })
    );
    pool.position.set(0.8, 0.01, 0.8);
    scene.add(pool);

    const groundFloor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.7, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    groundFloor.position.set(-0.2, 0.35, -0.2);
    scene.add(groundFloor);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.4, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
    );
    glass.position.set(-0.2, 0.35, 0.5);
    scene.add(glass);

    const firstFloor = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.65, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
    );
    firstFloor.position.set(-0.35, 1.025, -0.1);
    scene.add(firstFloor);

    const balcony = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.05, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    balcony.position.set(-0.2, 0.72, 0.6);
    scene.add(balcony);
  };

  // Procedural Builder: Skyscraper Mesh (Light Theme)
  const createSkyscraperMesh = (scene, floorsList) => {
    buildingFloorsMeshes.current = [];

    const lobbyGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const lobbyMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.2 });
    const lobby = new THREE.Mesh(lobbyGeo, lobbyMat);
    lobby.position.set(0, 0.4, 0);
    scene.add(lobby);

    floorsList.forEach((floorNum, index) => {
      const heightOffset = 0.5 + index * 0.9;
      const floorGeo = new THREE.BoxGeometry(1.4, 0.85, 1.4);
      const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0,
        metalness: 0.1, 
        roughness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(0, heightOffset + 0.425, 0);
      scene.add(floorMesh);
      buildingFloorsMeshes.current.push(floorMesh);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(floorGeo),
        new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 })
      );
      floorMesh.add(edge);
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    setContactLoading(true);
    setContactError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listingId: listing.id,
          message: contactForm.msg,
          source: "inquiry_form",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setContactSubmitted(true);
    } catch (err) {
      setContactError(err.message);
    } finally {
      setContactLoading(false);
    }
  };

  const activeRoom = listing.rooms ? listing.rooms[activeRoomId] : null;

  const floorUnits = React.useMemo(() => {
    if (listing.tier !== "PREMIUM" || !selectedFloor) return [];
    return (listing.units || []).filter(u => u.floor === selectedFloor);
  }, [selectedFloor, listing]);

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        height: "calc(100vh - var(--header-height))", 
        overflowY: immersive3d ? "hidden" : "auto", 
        background: "var(--bg-primary)" 
      }}
    >
      {/* 1. Immersive Full-Screen 3D Overlay View */}
      {immersive3d && (
        <div 
          ref={containerRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#f1f5f9",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Top Control Bar */}
          <div 
            style={{
              padding: "16px 24px",
              background: "#ffffff",
              borderBottom: "1px solid var(--border-medium)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 1010
            }}
          >
            <button 
              className="btn btn-secondary" 
              style={{ padding: "6px 12px", borderRadius: "8px" }}
              onClick={() => { setImmersive3d(false); setSelectedFloor(null); setSelectedUnit(null); }}
            >
              <ArrowLeft size={16} /> Back to Details
            </button>

            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-white)" }}>
              Explore: {listing.name}
            </h3>

            <button 
              className="btn btn-secondary" 
              style={{ padding: "6px", borderRadius: "50%" }}
              onClick={() => { setImmersive3d(false); setSelectedFloor(null); setSelectedUnit(null); }}
            >
              <X size={16} />
            </button>
          </div>

          {/* WebGL Canvas Viewport */}
          <div style={{ flex: 1, position: "relative" }}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

            {/* Advanced Walkthrough controls Overlay */}
            {listing.tier === "Advanced" && (
              <div 
                className="glass-panel animate-slide-up"
                style={{
                  position: "absolute",
                  bottom: "32px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "16px",
                  borderRadius: "16px",
                  width: "360px",
                  border: "1px solid var(--border-medium)",
                  background: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  zIndex: 1020
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-white)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Compass size={14} style={{ color: "var(--accent)" }} /> 
                    Interior 3D Walkthrough
                  </span>
                </div>

                {activeRoom && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-white)" }}>{activeRoom.name}</div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.3, fontSize: "0.78rem" }}>{activeRoom.description}</p>
                    
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Move to:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {activeRoom.connections.map(nextId => {
                          const r = listing.rooms[nextId];
                          return (
                            <button
                              key={nextId}
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "4px" }}
                              onClick={() => setActiveRoomId(nextId)}
                            >
                              {r.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Premium Skyscraper controls Overlay */}
            {listing.tier === "Premium" && (
              <div 
                style={{ 
                  position: "absolute", 
                  bottom: "32px", 
                  left: "32px", 
                  zIndex: 1020, 
                  display: "flex", 
                  gap: "12px", 
                  alignItems: "flex-end" 
                }}
              >
                {/* Floor indicators vertical block */}
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: "8px", 
                    borderRadius: "12px", 
                    border: "1px solid var(--border-medium)", 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "6px", 
                    background: "#ffffff",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                  }}
                >
                  <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textAlign: "center", marginBottom: "4px" }}>FLOORS</div>
                  {listing.floors.slice().reverse().map(floorNum => (
                    <button
                      key={floorNum}
                      className={`floor-indicator-btn ${selectedFloor === floorNum ? "active" : ""}`}
                      onClick={() => {
                        setSelectedFloor(selectedFloor === floorNum ? null : floorNum);
                        setSelectedUnit(null);
                      }}
                    >
                      FL {floorNum}
                    </button>
                  ))}
                </div>

                {/* Units selection popup */}
                {selectedFloor && (
                  <div 
                    className="glass-panel animate-slide-up" 
                    style={{ 
                      padding: "16px", 
                      borderRadius: "12px", 
                      border: "1px solid var(--border-medium)", 
                      width: "220px", 
                      background: "#ffffff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.06)" 
                    }}
                  >
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "8px", color: "var(--text-white)" }}>
                      Floor {selectedFloor} Units
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      {floorUnits.map(unit => (
                        <button
                          key={unit.id}
                          className={`btn ${selectedUnit?.id === unit.id ? "btn-primary" : "btn-secondary"}`}
                          style={{ padding: "6px 0", fontSize: "0.75rem", borderRadius: "6px" }}
                          onClick={() => {
                            setSelectedUnit(unit);
                            setPlayUnitVideo(false);
                          }}
                        >
                          Unit {unit.number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Unit detail block */}
                {selectedUnit && (
                  <div 
                    className="glass-panel animate-slide-up"
                    style={{ 
                      padding: "20px", 
                      borderRadius: "16px", 
                      border: "1px solid var(--border-medium)", 
                      width: "280px", 
                      background: "#ffffff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "1.0rem", color: "var(--text-white)" }}>Unit {selectedUnit.number}</h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Skyline Residence</span>
                      </div>
                      <button 
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}
                        onClick={() => setSelectedUnit(null)}
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-white)", marginBottom: "12px" }}>
                      ${selectedUnit.price.toLocaleString()}
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      {selectedUnit.beds} Bed • {selectedUnit.baths} Bath • {selectedUnit.area} m²
                    </div>

                    {playUnitVideo ? (
                      <div style={{ width: "100%", height: "130px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                        <video src={selectedUnit.videoUrl} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "6px 0", fontSize: "0.72rem" }}
                        onClick={() => setPlayUnitVideo(true)}
                      >
                        <PlayCircle size={14} /> Play Video Tour
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Standard Property Scroll Page Layout */}
      {!immersive3d && (
        <div style={{ maxWidth: "1120px", margin: "24px auto", padding: "0 24px" }}>
          {/* Top Breadcrumb & Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button 
              onClick={onBack}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", borderRadius: "24px", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={16} /> Back to results
            </button>
            
            {/* Top share/save actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-white)", cursor: "pointer", fontWeight: 600 }}
              >
                <Share2 size={15} /> Share
              </button>
              <button 
                onClick={() => onToggleSave(listing.id)}
                style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: isSaved ? "#ef4444" : "var(--text-white)", cursor: "pointer", fontWeight: 600 }}
              >
                <Heart size={15} fill={isSaved ? "#ef4444" : "none"} /> {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Title Area */}
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-white)", letterSpacing: "-0.03em" }}>{listing.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
              <span style={{ fontWeight: 700, color: "var(--text-white)", display: "flex", alignItems: "center", gap: "2px" }}>
                ★ 4.92 · <span style={{ textDecoration: "underline", fontWeight: 500 }}>49 reviews</span>
              </span>
              <span>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <MapPin size={13} /> {listing.address}
              </span>
            </div>
          </div>

          {/* Large Media & Grid Gallery Container */}
          <div 
            style={{ 
              position: "relative", 
              width: "100%", 
              height: "420px", 
              borderRadius: "16px", 
              overflow: "hidden", 
              background: "#f1f5f9",
              border: "1px solid var(--border-medium)",
              marginBottom: "28px"
            }}
          >
            {/* Standard Grid Layout for Photos */}
            {activeMedia === "photos" && (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px", width: "100%", height: "100%" }}>
                {/* Large Main Photo */}
                <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                  <img 
                    src={listing.photos[0]} 
                    alt={`${listing.name} Main`} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => setActivePhotoIdx(0)}
                  />
                </div>

                {/* Right Stack of two smaller photos */}
                <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "8px", height: "100%" }}>
                  <div style={{ overflow: "hidden" }}>
                    <img 
                      src={listing.photos[1] || listing.photos[0]} 
                      alt={`${listing.name} Detail 1`} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <img 
                      src={listing.photos[2] || listing.photos[0]} 
                      alt={`${listing.name} Detail 2`} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>

                {/* Dots indicator for carousel mode if they want to click through */}
                <div style={{ position: "absolute", bottom: "16px", right: "16px", zIndex: 10 }}>
                  <button
                    onClick={() => {
                      alert("Opening photo gallery mode!");
                      setActivePhotoIdx(0);
                    }}
                    style={{
                      background: "#ffffff",
                      color: "var(--text-white)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  >
                    📋 Show all photos
                  </button>
                </div>
              </div>
            )}

            {/* Video tour mode */}
            {activeMedia === "video" && (
              <video 
                src={listing.videoUrl} 
                controls 
                autoPlay 
                loop 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* Coordinates map */}
            {activeMedia === "location" && (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", background: "#f8fafc" }}>
                <MapPin size={40} style={{ color: "var(--accent)" }} />
                <h4 style={{ fontWeight: 700, color: "var(--text-white)" }}>Location Coordinates</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{listing.address}</p>
              </div>
            )}

            {/* 3D Model Explorer */}
            {activeMedia === "3d" && (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "#f8fafc", padding: "40px", textAlign: "center" }}>
                <Box size={40} style={{ color: "var(--accent)" }} />
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)" }}>Interactive 3D Model</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: 1.45 }}>
                  {listing.tier === "Premium" 
                    ? "Interactive 3D building tower. Rotate, zoom, and select individual floors to view unit layouts." 
                    : "Interactive 3D villa model. Orbit and zoom around the exterior structure."}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setImmersive3d(true)}
                  style={{ background: "var(--accent)" }}
                >
                  <Compass size={14} /> 
                  {listing.tier === "Premium" ? "Explore 3D Building" : "Explore Home in 3D"}
                </button>
              </div>
            )}

            {/* 360° Walkthrough */}
            {activeMedia === "360" && (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "#f8fafc", padding: "40px", textAlign: "center" }}>
                <Compass size={40} style={{ color: "var(--accent)" }} />
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)" }}>Indoor 360° Tour</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: 1.45 }}>
                  Walk room-to-room through the property interior (Living Room, Kitchen, Bedroom, Bathroom).
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setImmersive3d(true);
                    setActiveRoomId(Object.keys(listing.rooms)[0] || "living_room");
                  }}
                  style={{ background: "var(--accent)" }}
                >
                  <PlayCircle size={14} /> Start Walkthrough
                </button>
              </div>
            )}

            {/* Floating media switcher tabs (bottom-left overlay) */}
            <div style={{ position: "absolute", bottom: "16px", left: "24px", display: "flex", gap: "8px", zIndex: 10 }}>
              <button 
                className={`btn-tab ${activeMedia === "photos" ? "active" : ""}`}
                onClick={() => setActiveMedia("photos")}
              >
                <Image size={12} /> Photos
              </button>
              {listing.videoUrl && (
                <button 
                  className={`btn-tab ${activeMedia === "video" ? "active" : ""}`}
                  onClick={() => setActiveMedia("video")}
                >
                  <Video size={12} /> Video Tour
                </button>
              )}
              {listing.tier !== "Basic" && (
                <button 
                  className={`btn-tab ${activeMedia === "3d" ? "active" : ""}`}
                  onClick={() => setActiveMedia("3d")}
                >
                  <Box size={12} /> 3D Tour
                </button>
              )}
              {listing.rooms && (
                <button 
                  className={`btn-tab ${activeMedia === "360" ? "active" : ""}`}
                  onClick={() => setActiveMedia("360")}
                >
                  <Compass size={12} /> 360° Walkthrough
                </button>
              )}
            </div>
          </div>

          {/* Core Split Columns Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "48px", alignItems: "start" }}>
            
            {/* Left Column: Airbnb Detailed Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "80px" }}>
              
              {/* Host and General Rooms Spec */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-white)" }}>
                    {listing.type || "Apartment"} in {listing.address.includes("Vietnam") || listing.address.includes("Quận 1") ? "District 1, Ho Chi Minh City" : "Phnom Penh"}
                  </h3>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {listing.beds} Bedrooms · {listing.baths} Bathrooms · {listing.area} m² · Verified Listing
                  </div>
                </div>
                {/* Host Circle Avatar */}
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#1e293b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem" }}>
                  D
                </div>
              </div>

              {/* Listing Highlights list */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem", color: "var(--text-white)" }}>🛡️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-white)" }}>Verified Ownership Title</div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Legal title documents and certificates are verified by EstateX.</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem", color: "var(--text-white)" }}>📈</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-white)" }}>High Rental Yield Potential</div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Perfect for buy-to-let investment with strong historic capital gains.</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem", color: "var(--text-white)" }}>🏢</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-white)" }}>Full-Service Property Management</div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Access 24/7 security, building maintenance, and broker support.</span>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)", marginBottom: "12px" }}>About this space</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {listing.description}
                </p>
              </div>

              {/* Property Layout */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)", marginBottom: "16px" }}>Property Layout</h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1, border: "1px solid var(--border-medium)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>🛏️</span>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-white)" }}>Bedroom 1</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>1 double bed, 1 floor mattress</span>
                  </div>
                  {listing.beds > 1 && (
                    <div style={{ flex: 1, border: "1px solid var(--border-medium)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ fontSize: "1.2rem" }}>🛏️</span>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-white)" }}>Bedroom 2</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>1 double bed, 1 floor mattress</span>
                    </div>
                  )}
                </div>
              </div>

              {/* What this place offers */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)", marginBottom: "16px" }}>What this place offers</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {listing.amenities.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <span>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-white)" }}>★ 4.92</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>· 49 reviews</span>
                </div>

                {/* Rating Metrics mini bars */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px", marginBottom: "28px" }}>
                  {[
                    { label: "Cleanliness", score: 4.9 },
                    { label: "Accuracy", score: 4.9 },
                    { label: "Check-in", score: 4.9 },
                    { label: "Communication", score: 4.9 },
                    { label: "Location", score: 4.8 },
                    { label: "Value", score: 4.9 }
                  ].map((m, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{m.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end", paddingLeft: "20px" }}>
                        <div style={{ width: "80px", height: "4px", background: "var(--border-medium)", borderRadius: "2px", position: "relative" }}>
                          <div style={{ width: `${(m.score / 5) * 100}%`, height: "100%", background: "var(--text-white)", borderRadius: "2px" }} />
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-white)" }}>{m.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guest Reviews comments */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {[
                    { name: "Meijiao", date: "3 weeks ago", text: "The property tour was excellent. The apartment is built to high standards and well-maintained. Broker Dũng answered all our financing questions." },
                    { name: "Chris", date: "July 2026", text: "Great broker service. Dũng showed us around District 1, and explained the property boundaries and certificates in detail. 10/10." },
                    { name: "Luke", date: "July 2026", text: "A beautiful property located close to central highways. The city views from the balcony are amazing. Very helpful and responsive agent." },
                    { name: "Ivy", date: "June 2026", text: "Excellent property. Clean, secured, and has great design aesthetics. Agent was extremely responsive. Highly recommended." }
                  ].map((rev, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {rev.name[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-white)" }}>{rev.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{rev.date}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local neighborhood map */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-white)", marginBottom: "8px" }}>Where you’ll be</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px" }}>{listing.address}</p>

                {/* Inline SVG Map */}
                <div style={{ position: "relative", width: "100%", height: "240px", background: "#f8fafc", border: "1px solid var(--border-medium)", borderRadius: "12px", overflow: "hidden" }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 200" style={{ background: "#f8fafc" }}>
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <circle cx="200" cy="100" r="45" fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />
                    <circle cx="200" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />

                    <line x1="200" y1="100" x2="160" y2="60" stroke="#f97316" strokeDasharray="2 2" />
                    <line x1="200" y1="100" x2="250" y2="70" stroke="#ec4899" strokeDasharray="2 2" />
                    <line x1="200" y1="100" x2="270" y2="150" stroke="#ef4444" strokeDasharray="2 2" />
                    <line x1="200" y1="100" x2="110" y2="120" stroke="#3b82f6" strokeDasharray="2 2" />

                    <circle cx="200" cy="100" r="10" fill="var(--accent)" />
                    <circle cx="200" cy="100" r="18" fill="none" stroke="var(--accent)" strokeWidth="1" />
                    <text x="200" y="85" fontSize="10" fontWeight="bold" fill="var(--text-white)" textAnchor="middle">Our Property</text>

                    <circle cx="160" cy="60" r="6" fill="#f97316" />
                    <text x="160" y="50" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">🏫 School (480m)</text>

                    <circle cx="250" cy="70" r="6" fill="#ec4899" />
                    <text x="250" y="60" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">🛒 Market (350m)</text>

                    <circle cx="270" cy="150" r="6" fill="#ef4444" />
                    <text x="270" y="162" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">🏥 Hospital (1.2km)</text>

                    <circle cx="110" cy="120" r="6" fill="#3b82f6" />
                    <text x="110" y="132" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">🍜 Restaurant (180m)</text>
                  </svg>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Booking / Reservation Widget */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "24px" }}>
              
              {/* Airbnb Style booking widget */}
              <div 
                className="glass-card"
                style={{
                  padding: "24px",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "16px",
                  background: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
                }}
              >
                {/* Nightly price & ratings */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "18px" }}>
                  <div>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-white)" }}>
                      ${listing.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {listing.purpose === "Rent" ? " / month" : " total"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-white)", fontWeight: 600 }}>
                    ★ 4.92 · <span style={{ textDecoration: "underline", color: "var(--text-secondary)", fontWeight: 400 }}>Verified</span>
                  </div>
                </div>

                {reservationReserved ? (
                  <div 
                    className="animate-fade-in"
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      color: "#16a34a",
                      padding: "20px 16px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      marginBottom: "10px"
                    }}
                  >
                    <CheckCircle size={28} style={{ margin: "0 auto 8px auto" }} />
                    <div style={{ fontWeight: 700 }}>Viewing Scheduled!</div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Your property tour has been requested. Dũng (Agent) will contact you to confirm.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    
                    {/* Date and Time slots for viewing */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", border: "1px solid var(--border-medium)", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ padding: "8px 12px", borderRight: "1px solid var(--border-medium)" }}>
                        <label style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-white)", display: "block" }}>Tour Date</label>
                        <input 
                          type="date" 
                          value={reservationCheckIn}
                          onChange={(e) => setReservationCheckIn(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: "0.78rem", width: "100%", background: "transparent", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div style={{ padding: "8px 12px" }}>
                        <label style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-white)", display: "block" }}>Time Slot</label>
                        <select
                          value={reservationCheckOut}
                          onChange={(e) => setReservationCheckOut(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: "0.78rem", width: "100%", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Visitors Selector */}
                    <div style={{ border: "1px solid var(--border-medium)", borderRadius: "8px", padding: "8px 12px" }}>
                      <label style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-white)", display: "block" }}>Visitors</label>
                      <select 
                        value={reservationGuests}
                        onChange={(e) => setReservationGuests(Number(e.target.value))}
                        style={{ border: "none", outline: "none", fontSize: "0.82rem", width: "100%", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        <option value={1}>1 person</option>
                        <option value={2}>2 people</option>
                        <option value={3}>3 people</option>
                        <option value={4}>4 people</option>
                      </select>
                    </div>

                    {/* Schedule Button */}
                    <button 
                      onClick={() => {
                        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
                        setReservationReserved(true);
                      }}
                      className="btn btn-primary"
                      style={{ padding: "12px", borderRadius: "8px", fontWeight: 700, fontSize: "0.88rem", marginTop: "6px" }}
                    >
                      Schedule Property Tour
                    </button>
                    
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", display: "block" }}>
                      Free viewing scheduler · No obligations
                    </span>

                    {/* Estimated Mortgage / Lease Breakdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {listing.purpose === "Rent" ? (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Security Deposit (1mo)</span>
                            <span>${listing.price.toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Agency Service Fee</span>
                            <span>$0</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--text-white)", fontSize: "0.85rem", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid var(--border-light)" }}>
                            <span>Total Move-in Cost</span>
                            <span>${(listing.price * 2).toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Down Payment ({downPaymentPercent}%)</span>
                              <span style={{ fontWeight: 600, color: "var(--text-white)" }}>
                                ${(listing.price * downPaymentPercent / 100).toLocaleString()}
                              </span>
                            </div>
                            <input 
                              type="range"
                              min="10"
                              max="80"
                              step="5"
                              value={downPaymentPercent}
                              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer", margin: "4px 0 8px 0" }}
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Est. Mortgage Principal</span>
                            <span>${(listing.price * (1 - downPaymentPercent / 100)).toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Est. Monthly Payment (30yr @ 4.5%)</span>
                            <span style={{ fontWeight: 600, color: "var(--accent-light)" }}>
                              ${Math.round(listing.price * (1 - downPaymentPercent / 100) * 0.005).toLocaleString()} / mo
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--text-white)", fontSize: "0.85rem", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid var(--border-light)" }}>
                            <span>Broker Booking Fee</span>
                            <span>Free</span>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Contextual Inquiry Card */}
              <div 
                id="inquiry-card"
                className="glass-card" 
                style={{ 
                  padding: "20px", 
                  border: "1px solid var(--border-medium)", 
                  borderRadius: "16px", 
                  background: "#ffffff"
                }}
              >
                <h3 style={{ fontSize: "0.88rem", color: "var(--text-white)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={14} style={{ color: "var(--accent)" }} />
                  Send Private Inquiry
                </h3>

                {contactSubmitted ? (
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "8px", fontSize: "0.75rem", color: "#16a34a", textAlign: "center" }}>
                    ✓ Inquiry Sent! The agent will contact you soon.
                  </div>
                ) : !currentUser ? (
                  <div style={{ textAlign: "center", padding: "16px 8px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "12px" }}>Sign in to send an inquiry to the agent.</p>
                    <button
                      onClick={() => onLoginRequired && onLoginRequired()}
                      className="btn btn-primary"
                      style={{ width: "100%", padding: "8px", fontSize: "0.78rem" }}
                    >
                      Sign In to Inquire
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Logged-in user info */}
                    <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.75rem", color: "#475569" }}>
                      Sending as <strong>{currentUser.name}</strong> ({currentUser.email})
                    </div>
                    {/* Quick Template buttons */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "4px 0 8px 0" }}>
                      <span
                        onClick={() => setContactForm(prev => ({ ...prev, msg: "Hi, I am interested in this listing and would like to schedule a visit." }))}
                        style={{ fontSize: "0.65rem", padding: "4px 8px", background: "#f1f5f9", borderRadius: "20px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-medium)" }}
                      >
                        🗓️ Visit
                      </span>
                      <span
                        onClick={() => setContactForm(prev => ({ ...prev, msg: "Hi, could you please send me the verified ownership title documents for this listing?" }))}
                        style={{ fontSize: "0.65rem", padding: "4px 8px", background: "#f1f5f9", borderRadius: "20px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-medium)" }}
                      >
                        🛡️ Titles
                      </span>
                      <span
                        onClick={() => setContactForm(prev => ({ ...prev, msg: "Hi, I'm interested in this development. Is there a booking discount available?" }))}
                        style={{ fontSize: "0.65rem", padding: "4px 8px", background: "#f1f5f9", borderRadius: "20px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600, border: "1px solid var(--border-medium)" }}
                      >
                        💰 Discount
                      </span>
                    </div>
                    <textarea
                      placeholder="Your message"
                      required
                      value={contactForm.msg}
                      onChange={(e) => setContactForm(prev => ({ ...prev, msg: e.target.value }))}
                      style={{ width: "100%", height: "70px", padding: "7px 10px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "6px", fontSize: "0.78rem", outline: "none", resize: "none", boxSizing: "border-box" }}
                    />
                    {contactError && (
                      <div style={{ fontSize: "0.75rem", color: "#dc2626", background: "#fef2f2", padding: "6px 10px", borderRadius: "6px" }}>⚠️ {contactError}</div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={contactLoading}
                      style={{ width: "100%", padding: "8px", fontSize: "0.78rem", opacity: contactLoading ? 0.7 : 1 }}
                    >
                      {contactLoading ? "Sending..." : "Send Inquiry"}
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>


          {/* Nearby / Recommended Properties Panel */}
          <div style={{ marginTop: "48px", borderTop: "1px solid var(--border-medium)", paddingTop: "40px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
              Similar Properties You May Like
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {recommendations.map(item => (
                <div 
                  key={item.id}
                  className="glass-card"
                  onClick={() => onNavigate && onNavigate(item.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    background: "#ffffff",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    padding: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                    <img 
                      src={(item.photos && item.photos[0]) ? item.photos[0] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.name} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <span 
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        fontSize: "0.55rem",
                        fontWeight: 800,
                        background: "var(--accent)",
                        color: "#ffffff",
                        padding: "3px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      {item.purpose === "Rent" ? "For Rent" : "For Sale"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{item.name}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.8rem", color: "#f59e0b", fontWeight: 600 }}>
                        <Star size={11} fill="currentColor" /> 4.9
                      </span>
                    </div>
                    
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {item.address}
                    </span>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                        ${item.price.toLocaleString()}{item.purpose === "Rent" ? "/mo" : ""}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                        {item.beds}b · {item.baths}ba · {item.area}m²
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
