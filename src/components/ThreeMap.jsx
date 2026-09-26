import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Search, ToggleLeft, ToggleRight, Layers, Compass, ZoomIn, ZoomOut } from "lucide-react";

export default function ThreeMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  viewMode,
  setViewMode,
  heatmapMetric,
  setHeatmapMetric,
  poiFilters,
  highlightedPropertyIds = []
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Refs for Three.js instances to access inside animations/effects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const buildingsMapRef = useRef(new Map()); // Map of buildingId -> THREE.Mesh
  const poiMeshesRef = useRef([]); // List of POI meshes in scene
  const linesRef = useRef([]); // Visual connector lines
  
  // Hover state
  const [hoveredBuildingName, setHoveredBuildingName] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState("");
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Camera Target for smooth interpolation
  const cameraTargetPos = useRef(new THREE.Vector3());
  const controlsTargetLookAt = useRef(new THREE.Vector3());
  const isTransitioningRef = useRef(false);
  const transitionProgressRef = useRef(0);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.04);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 2. Camera Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Set initial camera position based on mode
    if (viewMode === "2D") {
      camera.position.set(0, 12, 0);
      controls.target.set(0, 0, 0);
      controls.enableRotate = false; // Lock rotation in 2D
    } else {
      camera.position.set(0, 7, 9);
      controls.target.set(0, 0, 0);
      controls.enableRotate = true;
    }
    controls.update();

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Extra subtle blue light from bottom to lift dark side of buildings
    const hemiLight = new THREE.HemisphereLight(0x2e86de, 0x080c14, 0.3);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // 4. City Floor / Grid
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1524,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Overlay
    const gridHelper = new THREE.GridHelper(24, 24, 0x2563eb, 0x1e293b);
    gridHelper.position.y = 0.005;
    // Lower opacity grid
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Inner blocks / grass zones / roads layout
    createCityLayout(scene);

    // 5. Render Properties (Buildings)
    buildPropertyMeshes(scene, properties);

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Mouse Events for Raycasting
    const handleMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    renderer.domElement.addEventListener("mousemove", handleMouseMove);

    const handleClick = () => {
      // Find intersections
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(Array.from(buildingsMapRef.current.values()));

      if (intersects.length > 0) {
        // Find which building has this mesh
        const clickedMesh = intersects[0].object;
        for (const [id, mesh] of buildingsMapRef.current.entries()) {
          if (mesh === clickedMesh) {
            onSelectProperty(id);
            break;
          }
        }
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // 8. Animation Loop
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Perform camera interpolation if transitioning
      if (isTransitioningRef.current) {
        transitionProgressRef.current += 0.04;
        if (transitionProgressRef.current >= 1) {
          transitionProgressRef.current = 1;
          isTransitioningRef.current = false;
        }
        
        // Lerp camera position
        camera.position.lerpVectors(camera.position, cameraTargetPos.current, 0.08);
        controls.target.lerpVectors(controls.target, controlsTargetLookAt.current, 0.08);
      }

      controls.update();

      // Check mouse hover
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(Array.from(buildingsMapRef.current.values()));

      let currentHoveredId = null;
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        document.body.style.cursor = "pointer";

        for (const [id, mesh] of buildingsMapRef.current.entries()) {
          if (mesh === hoveredMesh) {
            currentHoveredId = id;
            break;
          }
        }
      } else {
        document.body.style.cursor = "default";
      }

      // Update hover effects on building meshes
      buildingsMapRef.current.forEach((mesh, id) => {
        const isHovered = id === currentHoveredId;
        const isSelected = id === selectedPropertyId;
        const isHighlighted = highlightedPropertyIds.length > 0 && highlightedPropertyIds.includes(id);

        // Adjust scale slightly on hover/selection
        let targetScale = 1.0;
        if (isSelected) targetScale = 1.05;
        else if (isHovered) targetScale = 1.03;

        mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, targetScale, 0.2);

        // Set emissive glow intensity
        const mat = mesh.material;
        if (isSelected) {
          mat.emissive.setHex(0x3b82f6);
          mat.emissiveIntensity = 0.45;
        } else if (isHovered) {
          mat.emissive.setHex(0x60a5fa);
          mat.emissiveIntensity = 0.3;
        } else if (isHighlighted) {
          // AI prompt highlight pulsing
          const pulse = (Math.sin(Date.now() * 0.007) + 1) / 2; // 0 to 1
          mat.emissive.setHex(0xf59e0b);
          mat.emissiveIntensity = 0.2 + pulse * 0.4;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      });

      // Update tooltip content
      if (currentHoveredId) {
        const prop = properties.find(p => p.id === currentHoveredId);
        if (prop) {
          setHoveredBuildingName(prop.name);
          const occupiedCount = prop.units.filter(u => u.status === "occupied").length;
          setHoveredStatus(`${occupiedCount}/${prop.units.length} Units Occupied`);
        }
      } else {
        setHoveredBuildingName(null);
      }

      // Animate POIs slightly (spin floating icons or bounce them)
      poiMeshesRef.current.forEach(mesh => {
        mesh.rotation.y += 0.01;
        mesh.position.y = mesh.userData.originalY + Math.sin(Date.now() * 0.003 + mesh.userData.phase) * 0.05;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener("mousemove", handleMouseMove);
        rendererRef.current.domElement.removeEventListener("click", handleClick);
        rendererRef.current.dispose();
      }
    };
  }, [properties]);

  // Handle View Mode changes (2D / 3D camera sweeps)
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    isTransitioningRef.current = true;
    transitionProgressRef.current = 0;

    if (viewMode === "2D") {
      // Look straight down
      cameraTargetPos.current.set(0, 11, 0.01);
      controlsTargetLookAt.current.set(0, 0, 0);
      controls.enableRotate = false;
    } else {
      // 3D perspective rotation
      if (selectedPropertyId) {
        const prop = properties.find(p => p.id === selectedPropertyId);
        if (prop) {
          cameraTargetPos.current.set(prop.coords.x, 3.5, prop.coords.z + 4);
          controlsTargetLookAt.current.set(prop.coords.x, 0.5, prop.coords.z);
        } else {
          cameraTargetPos.current.set(0, 6, 7);
          controlsTargetLookAt.current.set(0, 0, 0);
        }
      } else {
        cameraTargetPos.current.set(0, 6, 7);
        controlsTargetLookAt.current.set(0, 0, 0);
      }
      controls.enableRotate = true;
    }
  }, [viewMode, selectedPropertyId]);

  // Handle building re-coloring based on metric heatmap
  useEffect(() => {
    buildingsMapRef.current.forEach((mesh, id) => {
      const prop = properties.find(p => p.id === id);
      if (!prop) return;

      let color = 0x3b82f6; // Fallback Blue

      if (heatmapMetric === "status") {
        // Color based on majority status or custom states
        const occupied = prop.units.filter(u => u.status === "occupied").length;
        const available = prop.units.filter(u => u.status === "available").length;
        const vacant = prop.units.filter(u => u.status === "vacant").length;
        const maint = prop.units.filter(u => u.status === "maintenance").length;

        // Color based on primary characteristics
        if (maint > 0 && vacant === 0 && occupied === 0) {
          color = 0xf59e0b; // Yellow
        } else if (vacant > 0 && occupied === 0) {
          color = 0xef4444; // Red
        } else if (occupied === prop.units.length) {
          color = 0x10b981; // Green
        } else {
          // Multi-unit blend (gradient colors or dominant status)
          const occupancyRate = occupied / prop.units.length;
          if (occupancyRate >= 0.8) color = 0x10b981; // High occupancy green
          else if (occupancyRate >= 0.4) color = 0x0ea5e9; // Medium available blue
          else color = 0xf59e0b; // Low occupancy warning yellow/orange
        }
      } else if (heatmapMetric === "yield") {
        // Rent Yield (Simulated annual yield 4% - 10%)
        // High Yield: Green, Average: Yellow, Low: Red
        const yieldPercentage = getSimulatedYield(prop.id);
        if (yieldPercentage >= 7.5) color = 0x10b981; // 🟢 High
        else if (yieldPercentage >= 5.5) color = 0xf59e0b; // 🟡 Average
        else color = 0xef4444; // 🔴 Low
      } else if (heatmapMetric === "occupancy") {
        // Occupancy Percentage
        const occupied = prop.units.filter(u => u.status === "occupied").length;
        const rate = occupied / prop.units.length;
        if (rate >= 0.9) color = 0x10b981; // 🟢 90%+
        else if (rate >= 0.6) color = 0x0ea5e9; // 🔵 60%-90%
        else if (rate >= 0.3) color = 0xf59e0b; // 🟡 30%-60%
        else color = 0xef4444; // 🔴 Under 30%
      } else if (heatmapMetric === "value") {
        // Value: High (Purple/Indigo) -> Average (Blue) -> Low (Teal)
        const val = getPropertyTotalValue(prop);
        if (val > 1500000) color = 0x8b5cf6; // Premium Violet
        else if (val > 600000) color = 0x3b82f6; // Mid Blue
        else color = 0x06b6d4; // Entry level Cyan
      } else if (heatmapMetric === "maintenance") {
        // Active maintenance ticket severity
        const ticketCount = prop.units.reduce((sum, u) => sum + u.maintenance.length, 0);
        if (ticketCount === 0) color = 0x10b981; // No issues: Green
        else if (prop.units.some(u => u.maintenance.some(m => m.priority === "High"))) color = 0xef4444; // High severity issues: Red
        else color = 0xf59e0b; // Minor issues: Yellow
      }

      mesh.material.color.setHex(color);
    });
  }, [heatmapMetric, properties]);

  // Handle POI Filters & selected lines
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old POIs and lines
    poiMeshesRef.current.forEach(mesh => scene.remove(mesh));
    poiMeshesRef.current = [];

    linesRef.current.forEach(line => scene.remove(line));
    linesRef.current = [];

    if (!selectedPropertyId) return;

    const selectedProp = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProp) return;

    // Plot nearby POIs that match active filters
    selectedProp.nearbyPOIs.forEach((poi, index) => {
      // Check if filter is active
      const filterKey = poi.type; // 'school', 'market', etc.
      if (poiFilters && !poiFilters[filterKey]) return;

      // Draw POI marker on grid
      // Angles arranged in a circle relative to the selected building
      const angle = (index * (Math.PI * 2)) / selectedProp.nearbyPOIs.length;
      const radius = 2.0; // Distance on 3D map
      const x = selectedProp.coords.x + Math.cos(angle) * radius;
      const z = selectedProp.coords.z + Math.sin(angle) * radius;

      // Renders small customized geometric shapes for POIs
      let geom;
      let poiColor = 0xffffff;
      
      switch (poi.type) {
        case "school":
          geom = new THREE.ConeGeometry(0.15, 0.3, 4); // Diamond/Cone (Orange)
          poiColor = 0xf97316;
          break;
        case "market":
          geom = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Cube (Pink)
          poiColor = 0xec4899;
          break;
        case "hospital":
          geom = new THREE.BoxGeometry(0.12, 0.35, 0.12); // Tall Cross (Red)
          poiColor = 0xef4444;
          break;
        case "station":
          geom = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 6); // Hex Tube (Indigo)
          poiColor = 0x6366f1;
          break;
        case "park":
          geom = new THREE.SphereGeometry(0.18, 8, 8); // Sphere (Green)
          poiColor = 0x22c55e;
          break;
        default:
          geom = new THREE.SphereGeometry(0.15, 6, 6);
          poiColor = 0xa855f7;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: poiColor,
        roughness: 0.3,
        metalness: 0.8,
        emissive: poiColor,
        emissiveIntensity: 0.4
      });

      const poiMesh = new THREE.Mesh(geom, mat);
      poiMesh.position.set(x, 0.2, z);
      poiMesh.castShadow = true;
      
      // Save original values for bounce animations
      poiMesh.userData = {
        id: poi.id,
        originalY: 0.25,
        phase: Math.random() * Math.PI * 2,
        name: poi.name,
        dist: poi.distance
      };

      scene.add(poiMesh);
      poiMeshesRef.current.push(poiMesh);

      // Draw dashed connector line from building to POI
      const points = [];
      points.push(new THREE.Vector3(selectedProp.coords.x, 0.2, selectedProp.coords.z));
      points.push(new THREE.Vector3(x, 0.2, z));

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      
      // Dashed styling
      const lineMat = new THREE.LineDashedMaterial({
        color: poiColor,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 1 // Windows only supports 1px anyway
      });
      
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances(); // Necessary for dashed lines
      scene.add(line);
      linesRef.current.push(line);
    });

  }, [selectedPropertyId, poiFilters, properties]);

  // Helpers
  const getPropertyTotalValue = (prop) => {
    // Sum unit values or size
    const pricePerSqm = prop.type === "Commercial" ? 4500 : prop.type === "House" ? 3500 : 2800;
    return prop.units.reduce((sum, u) => sum + u.area * pricePerSqm, 0);
  };

  const getSimulatedYield = (id) => {
    const yields = {
      "skyline-heights": 6.8,
      "oakridge-villas": 4.5,
      "emerald-plaza": 8.7,
      "horizon-apts": 7.1,
      "summit-duplex": 5.8,
      "marina-cove": 3.9
    };
    return yields[id] || 5.0;
  };

  // Construct building extruded meshes
  const buildPropertyMeshes = (scene, propsList) => {
    // Clean old
    buildingsMapRef.current.forEach(mesh => scene.remove(mesh));
    buildingsMapRef.current.clear();

    propsList.forEach(prop => {
      const dim = prop.dimensions;
      // Building Geometry (Box mesh)
      const geometry = new THREE.BoxGeometry(dim.w, dim.h, dim.d);
      
      // Move pivot to bottom of building so it stands on floor
      geometry.translate(0, dim.h / 2, 0);

      // Glassy standard material matching theme
      const material = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.88,
        flatShading: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(prop.coords.x, 0, prop.coords.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      buildingsMapRef.current.set(prop.id, mesh);

      // Add a thin glowing wireframe overlay for high-tech OS look
      const wireGeo = new THREE.EdgesGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.18
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wireframe);
    });
  };

  // Helper: Generates secondary structural details on map (lawns, blocks, roads)
  const createCityLayout = (scene) => {
    // Central Road grid intersection: roads from x = -0.5 to 0.5 and z = -0.5 to 0.5
    // Road mats
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.95,
      metalness: 0.05
    });

    // Main Horizontal Road
    const hRoadGeo = new THREE.PlaneGeometry(24, 0.9);
    const hRoad = new THREE.Mesh(hRoadGeo, roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.01, 0);
    hRoad.receiveShadow = true;
    scene.add(hRoad);

    // Main Vertical Road
    const vRoadGeo = new THREE.PlaneGeometry(0.9, 24);
    const vRoad = new THREE.Mesh(vRoadGeo, roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(0, 0.01, 0);
    vRoad.receiveShadow = true;
    scene.add(vRoad);

    // Green park in center-ish
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x0b251e,
      roughness: 0.9,
      metalness: 0.05
    });
    const parkGeo = new THREE.BoxGeometry(2.4, 0.02, 2.4);
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.set(0, 0.015, 0);
    park.receiveShadow = true;
    scene.add(park);

    // Draw little trees in the park
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * 0.7;
      const z = Math.sin(angle) * 0.7;
      
      const treeTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x4d2a15 })
      );
      treeTrunk.position.set(x, 0.15, z);
      treeTrunk.castShadow = true;

      const treeLeaves = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.35, 5),
        new THREE.MeshStandardMaterial({ color: 0x1e824c, roughness: 0.8 })
      );
      treeLeaves.position.y = 0.3;
      treeTrunk.add(treeLeaves);
      
      park.add(treeTrunk);
    }
  };

  const handleZoom = (amount) => {
    const controls = controlsRef.current;
    if (!controls) return;
    
    // Zoom camera by adjusting standard controls radius limits
    const dir = new THREE.Vector3();
    cameraRef.current.getWorldDirection(dir);
    if (amount > 0) {
      cameraRef.current.position.addScaledVector(dir, 0.8);
    } else {
      cameraRef.current.position.addScaledVector(dir, -0.8);
    }
    controls.update();
  };

  const handleCompassReset = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    
    // Reset camera angle to facing north (positive Z)
    isTransitioningRef.current = true;
    transitionProgressRef.current = 0;
    
    if (selectedPropertyId) {
      const prop = properties.find(p => p.id === selectedPropertyId);
      cameraTargetPos.current.set(prop.coords.x, 3.5, prop.coords.z + 4);
      controlsTargetLookAt.current.set(prop.coords.x, 0.5, prop.coords.z);
    } else {
      cameraTargetPos.current.set(0, 6, 7);
      controlsTargetLookAt.current.set(0, 0, 0);
    }
  };

  return (
    <div className="map-container-wrapper" ref={containerRef}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Floating Tooltip */}
      {hoveredBuildingName && (
        <div 
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(11, 15, 25, 0.9)",
            border: "1px solid var(--border-medium)",
            backdropFilter: "blur(12px)",
            padding: "8px 16px",
            borderRadius: "30px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            zIndex: 100,
            pointerEvents: "none"
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-white)" }}>{hoveredBuildingName}</span>
          <span style={{ width: "4px", height: "4px", background: "rgba(255,255,255,0.3)", borderRadius: "50%" }}></span>
          <span style={{ color: "var(--text-secondary)" }}>{hoveredStatus}</span>
        </div>
      )}

      {/* Floating Toolbar Controls */}
      <div 
        style={{
          position: "absolute",
          bottom: "24px",
          left: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 8
        }}
      >
        {/* 2D / 3D Toggle */}
        <div 
          className="glass-panel" 
          style={{ 
            flexDirection: "row", 
            padding: "6px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-lg)"
          }}
        >
          <button 
            className={`btn ${viewMode === "2D" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem" }}
            onClick={() => setViewMode("2D")}
          >
            2D Mode
          </button>
          <button 
            className={`btn ${viewMode === "3D" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", marginLeft: "4px" }}
            onClick={() => setViewMode("3D")}
          >
            3D Mode
          </button>
        </div>

        {/* Camera Operations */}
        <div 
          style={{
            display: "flex",
            gap: "8px"
          }}
        >
          <button 
            className="btn btn-secondary" 
            style={{ padding: "8px", borderRadius: "8px" }} 
            title="Recenter Camera"
            onClick={handleCompassReset}
          >
            <Compass size={18} />
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "8px", borderRadius: "8px" }} 
            title="Zoom In"
            onClick={() => handleZoom(1)}
          >
            <ZoomIn size={18} />
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "8px", borderRadius: "8px" }} 
            title="Zoom Out"
            onClick={() => handleZoom(-1)}
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>

      {/* Floating Heatmap Selector */}
      <div 
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          display: "flex",
          gap: "8px",
          zIndex: 8
        }}
      >
        <div 
          className="glass-panel" 
          style={{ 
            flexDirection: "row", 
            alignItems: "center",
            padding: "4px 8px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-lg)",
            gap: "6px"
          }}
        >
          <Layers size={14} style={{ color: "var(--text-secondary)", marginRight: "4px" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, marginRight: "4px" }}>Overlay:</span>
          <select 
            value={heatmapMetric}
            onChange={(e) => setHeatmapMetric(e.target.value)}
            style={{
              background: "transparent",
              color: "var(--text-white)",
              border: "none",
              fontFamily: "var(--font-display)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="status" style={{ background: "var(--bg-panel-solid)" }}>Building Status</option>
            <option value="yield" style={{ background: "var(--bg-panel-solid)" }}>Rental Yield %</option>
            <option value="occupancy" style={{ background: "var(--bg-panel-solid)" }}>Occupancy Rate</option>
            <option value="value" style={{ background: "var(--bg-panel-solid)" }}>Property Value</option>
            <option value="maintenance" style={{ background: "var(--bg-panel-solid)" }}>Maintenance Alerts</option>
          </select>
        </div>
      </div>

      {/* Heatmap Legend indicator */}
      {heatmapMetric !== "status" && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-medium)",
            fontSize: "0.75rem",
            zIndex: 8,
            width: "180px",
            boxShadow: "var(--shadow-lg)"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px", textTransform: "capitalize" }}>{heatmapMetric} Heatmap</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: heatmapMetric === "value" ? "#8b5cf6" : "#10b981" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {heatmapMetric === "yield" && "High Yield (>7.5%)"}
                {heatmapMetric === "occupancy" && "High (90%+)"}
                {heatmapMetric === "value" && "Premium (> $1.5M)"}
                {heatmapMetric === "maintenance" && "No Tickets Open"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: heatmapMetric === "value" ? "#3b82f6" : "#f59e0b" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {heatmapMetric === "yield" && "Average (5.5% - 7.5%)"}
                {heatmapMetric === "occupancy" && "Mid (60% - 90%)"}
                {heatmapMetric === "value" && "Moderate ($600k - $1.5M)"}
                {heatmapMetric === "maintenance" && "Minor Tickets Open"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: heatmapMetric === "value" ? "#06b6d4" : "#ef4444" }}></span>
              <span style={{ color: "var(--text-secondary)" }}>
                {heatmapMetric === "yield" && "Low Yield (<5.5%)"}
                {heatmapMetric === "occupancy" && "Low (<60%)"}
                {heatmapMetric === "value" && "Starter (< $600k)"}
                {heatmapMetric === "maintenance" && "Urgent/Critical Tasks"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
