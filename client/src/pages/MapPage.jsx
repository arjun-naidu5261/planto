import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';

export default function MapPage() {
  const { vendors, products } = useApp();
  const location = useLocation();
  
  // States
  const [mapMode, setMapMode] = useState('2d'); // '3d' or '2d' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'plant', 'seed', 'soil', 'pot'
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Refs
  const threeContainerRef = useRef(null);
  const leafletContainerRef = useRef(null);
  
  // Three.js instances
  const threeSceneRef = useRef(null);
  const threeCameraRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeControlsRef = useRef(null);
  const threeMarkersRef = useRef({});
  const animationFrameIdRef = useRef(null);
  const targetCamPosRef = useRef(null);
  const targetLookAtRef = useRef(null);
  const userPulseRingRef = useRef(null);

  // Leaflet instances
  const leafletMapRef = useRef(null);
  const leafletMarkersRef = useRef({});

  // Get initial filter from URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter) {
      setFilterType(filter);
    }
  }, [location]);

  // Coordinate math
  const latLngTo3D = (lat, lng) => {
    const minLat = 12.9100;
    const maxLat = 12.9900;
    const minLng = 77.5600;
    const maxLng = 77.6600;
    const x = ((lng - minLng) / (maxLng - minLng) - 0.5) * 130;
    const z = (0.5 - (lat - minLat) / (maxLat - minLat)) * 130;
    return { x, z };
  };

  // Filter vendors based on active filter
  const getFilteredVendors = () => {
    if (filterType === 'all') return vendors;
    const vendorIdsWithProductType = new Set(
      products.filter(p => p.type === filterType && p.quantity > 0).map(p => p.vendorId)
    );
    return vendors.filter(v => vendorIdsWithProductType.has(v.id));
  };

  const filteredVendors = getFilteredVendors();

  // Sync three.js visibility based on filters
  useEffect(() => {
    if (!threeSceneRef.current) return;
    const activeVendorIds = new Set(filteredVendors.map(v => v.id));
    Object.keys(threeMarkersRef.current).forEach(vId => {
      const grp = threeMarkersRef.current[vId];
      if (grp) {
        grp.visible = activeVendorIds.has(vId);
      }
    });
  }, [filterType, vendors, products]);

  // Highlight a seller on the maps
  const highlightSeller = (vendor) => {
    setSelectedVendor(vendor);

    // Three.js Camera Pivot
    if (mapMode === '3d' && threeMarkersRef.current[vendor.id]) {
      const vGroup = threeMarkersRef.current[vendor.id];
      const vx = vGroup.position.x;
      const vz = vGroup.position.z;
      
      targetLookAtRef.current = new THREE.Vector3(vx, 0, vz);
      targetCamPosRef.current = new THREE.Vector3(vx, 25, vz + 30);

      // Highlight selected mesh scale
      Object.keys(threeMarkersRef.current).forEach(vId => {
        const grp = threeMarkersRef.current[vId];
        if (grp) {
          const pinMesh = grp.children.find(c => c.geometry && c.geometry.type === "ConeGeometry");
          if (vId === vendor.id) {
            grp.scale.set(1.35, 1.35, 1.35);
            if (pinMesh) {
              pinMesh.material.emissiveIntensity = 1.0;
              pinMesh.material.color.setHex(0x2e7d32); // active green
            }
          } else {
            grp.scale.set(1.0, 1.0, 1.0);
            if (pinMesh) {
              pinMesh.material.emissiveIntensity = 0.4;
              pinMesh.material.color.setHex(0xd4af37); // standard gold
            }
          }
        }
      });
    }

    // Leaflet map pan
    if (mapMode === '2d' && leafletMapRef.current && leafletMarkersRef.current[vendor.id]) {
      leafletMapRef.current.flyTo([vendor.lat, vendor.lng], 15, {
        animate: true,
        duration: 1.2
      });
      leafletMarkersRef.current[vendor.id].openPopup();
    }
  };

  // --- LEAFLET 2D MAP INITIALIZATION ---
  useEffect(() => {
    if (mapMode === '2d') {
      // Destroy old Leaflet Map instance
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      if (!leafletContainerRef.current) return;

      const map = L.map(leafletContainerRef.current).setView([12.9545, 77.6150], 13);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        className: 'user-leaflet-dot',
        html: '<div style="background-color:#2196f3; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([12.9545, 77.6150], { icon: userIcon }).addTo(map).bindPopup("Your Location (Indiranagar / Domlur Link)");

      // Vendor markers
      leafletMarkersRef.current = {};
      vendors.forEach(vendor => {
        const pinIcon = L.divIcon({
          className: 'vendor-leaflet-pin',
          html: `<div style="background-color:var(--primary-green); width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><span style="color:white; font-size:12px;">🌿</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([vendor.lat, vendor.lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; padding: 4px;">
              <h4 style="margin:0 0 4px 0; font-size:13px; font-weight:700;">${vendor.name}</h4>
              <p style="margin:0 0 8px 0; font-size:11px; color:#555;">${vendor.address}</p>
              <a href="#/stall/${vendor.id}" style="background-color:var(--primary-green); color:white; padding:4px 10px; border-radius:12px; font-size:10px; font-weight:700; text-decoration:none; display:inline-block;">Open Stall Inventory</a>
            </div>
          `);

        marker.on('click', () => {
          setSelectedVendor(vendor);
        });

        leafletMarkersRef.current[vendor.id] = marker;
      });

      // Adjust map sizes
      setTimeout(() => {
        if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
      }, 200);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapMode, vendors]);

  // --- THREE.JS 3D MAP INITIALIZATION ---
  useEffect(() => {
    let active = true;

    if (mapMode === '3d') {
      const container = threeContainerRef.current;
      if (!container) return;

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 450;

      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xeef1ec);
      scene.fog = new THREE.FogExp2(0xeef1ec, 0.007);
      threeSceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      camera.position.set(0, 50, 75);
      threeCameraRef.current = camera;

      // 2. WebGL Renderer Setup
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      
      // Clear old canvas and append new
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      threeRendererRef.current = renderer;

      // 3. Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.15;
      controls.minDistance = 15;
      controls.maxDistance = 140;
      controls.target.set(0, 0, 0);
      threeControlsRef.current = controls;

      // 4. Lighting Setup
      const ambient = new THREE.AmbientLight(0xffffff, 0.65);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xffffff, 0.75);
      sun.position.set(40, 80, 20);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 250;
      const d = 60;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      scene.add(sun);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
      hemi.position.set(0, 100, 0);
      scene.add(hemi);

      // Helper canvas coordinate mapper
      const toCanvasCoords = (lat, lng) => {
        const x = ((lng - 77.5600) / 0.1) * 1024;
        const y = (1 - (lat - 12.9100) / 0.08) * 1024;
        return { x, y };
      };

      // 5. Draw 2D Stylized Bengaluru map on canvas texture
      const mapCanvas = document.createElement("canvas");
      mapCanvas.width = 1024;
      mapCanvas.height = 1024;
      const ctx = mapCanvas.getContext("2d");
      
      // land fill
      ctx.fillStyle = "#eef1ec";
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Lalbagh park oval overlay
      ctx.fillStyle = "rgba(129, 199, 132, 0.4)";
      const lalbagh = toCanvasCoords(12.9500, 77.5850);
      ctx.beginPath();
      ctx.ellipse(lalbagh.x, lalbagh.y, 90, 70, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Cubbon Park oval overlay
      const cubbon = toCanvasCoords(12.9730, 77.5970);
      ctx.beginPath();
      ctx.ellipse(cubbon.x, cubbon.y, 110, 80, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Ulsoor lake
      ctx.fillStyle = "rgba(187, 222, 251, 0.85)";
      const ulsoor = toCanvasCoords(12.9780, 77.6180);
      ctx.beginPath();
      ctx.arc(ulsoor.x, ulsoor.y, 50, 0, 2 * Math.PI);
      ctx.fill();

      // Roads
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#e0e5db";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const roadsList = [
        [ { lat: 12.9100, lng: 77.6480 }, { lat: 12.9900, lng: 77.6480 } ],
        [ { lat: 12.9740, lng: 77.5600 }, { lat: 12.9740, lng: 77.6600 } ],
        [ { lat: 12.9784, lng: 77.6408 }, { lat: 12.9568, lng: 77.6487 } ],
        [ { lat: 12.9507, lng: 77.5844 }, { lat: 12.9281, lng: 77.5830 } ],
        [ { lat: 12.9352, lng: 77.6244 }, { lat: 12.9568, lng: 77.6487 } ]
      ];
      roadsList.forEach(r => {
        ctx.beginPath();
        const pStart = toCanvasCoords(r[0].lat, r[0].lng);
        ctx.moveTo(pStart.x, pStart.y);
        for (let i = 1; i < r.length; i++) {
          const p = toCanvasCoords(r[i].lat, r[i].lng);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });

      // Neighborhood names
      ctx.fillStyle = "rgba(70, 85, 60, 0.7)";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      const labels = [
        { text: "INDIRANAGAR", lat: 12.9784, lng: 77.6450 },
        { text: "LALBAGH GARDENS", lat: 12.9500, lng: 77.5850 },
        { text: "CUBBON PARK", lat: 12.9730, lng: 77.5970 },
        { text: "JAYANAGAR", lat: 12.9280, lng: 77.5830 },
        { text: "KORAMANGALA", lat: 12.9350, lng: 77.6240 }
      ];
      labels.forEach(l => {
        const p = toCanvasCoords(l.lat, l.lng);
        ctx.fillText(l.text, p.x, p.y + 35);
      });

      // Ground plane mesh
      const groundGeo = new THREE.PlaneGeometry(130, 130);
      const mapTexture = new THREE.CanvasTexture(mapCanvas);
      const groundMat = new THREE.MeshStandardMaterial({ map: mapTexture, roughness: 0.6, metalness: 0.15 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // 6. Procedural Buildings
      const addSkyscraper = (x, z, h) => {
        const group = new THREE.Group();
        group.position.set(x, h / 2, z);
        const boxGeo = new THREE.BoxGeometry(6, h, 6);
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x80deea,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });
        const body = new THREE.Mesh(boxGeo, glassMat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        const edges = new THREE.EdgesGeometry(boxGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00acc1 });
        const line = new THREE.LineSegments(edges, lineMat);
        group.add(line);
        scene.add(group);
      };
      
      const Skyscrapers = [
        { x: -15, z: -25, h: 26 }, { x: -7, z: -22, h: 20 },
        { x: -22, z: -28, h: 22 }, { x: -2, z: -26, h: 18 }
      ];
      Skyscrapers.forEach(s => addSkyscraper(s.x, s.z, s.h));

      // Houses
      const addHouse = (x, z) => {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.9 }));
        base.position.y = 1.0;
        base.castShadow = true;
        group.add(base);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.6, 4), new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.8 }));
        roof.position.y = 2.8;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        scene.add(group);
      };
      
      const houses = [
        { x: 35, z: -32 }, { x: 42, z: -28 }, { x: -38, z: 32 },
        { x: -44, z: 38 }, { x: 12, z: 28 }, { x: 22, z: 22 }
      ];
      houses.forEach(h => addHouse(h.x, h.z));

      // Trees
      const addTree = (x, z) => {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        group.add(trunk);
        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85 }));
        foliage.position.y = 1.4;
        foliage.castShadow = true;
        group.add(foliage);
        scene.add(group);
      };
      
      // Tree loops
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 5;
        addTree(-32.5 + Math.cos(angle) * radius, 0 + Math.sin(angle) * radius);
        addTree(-16.9 + Math.cos(angle) * radius, -18.7 + Math.sin(angle) * radius);
      }

      // 7. Glowing User marker
      const userGroup = new THREE.Group();
      const uPos = latLngTo3D(12.9545, 77.6150);
      userGroup.position.set(uPos.x, 0, uPos.z);
      const blueDot = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0x2196f3 }));
      blueDot.position.y = 1.0;
      userGroup.add(blueDot);

      const ringGeo = new THREE.RingGeometry(0.1, 4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x2196f3, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.rotation.x = -Math.PI / 2;
      pulseRing.position.y = 0.05;
      userPulseRingRef.current = pulseRing;
      userGroup.add(pulseRing);
      scene.add(userGroup);

      // 8. Vendor Stalls
      threeMarkersRef.current = {};
      vendors.forEach(vendor => {
        const pos = latLngTo3D(vendor.lat, vendor.lng);
        const group = new THREE.Group();
        group.position.set(pos.x, 0, pos.z);
        group.userData = { vendorId: vendor.id, vendor: vendor };

        // Base wooden deck
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 4.0), new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.85 }));
        base.position.y = 0.125;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Sign cone pin above roof
        const pinGeo = new THREE.ConeGeometry(0.65, 1.4, 4);
        const pinMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37, // standard gold
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x2e7d32,
          emissiveIntensity: 0.4
        });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.rotation.x = Math.PI;
        pin.position.y = 5.2;
        pin.castShadow = true;
        group.add(pin);

        // Click Hitbox
        const hitbox = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
        hitbox.position.y = 2.2;
        group.add(hitbox);

        // Stall visual body
        const stallWall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 3.2), new THREE.MeshStandardMaterial({ color: 0xffe0b2, roughness: 0.8 }));
        stallWall.position.set(0, 1.0, -0.2);
        group.add(stallWall);

        // Stall awning roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.3, 3.8), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 }));
        roof.position.y = 2.15;
        group.add(roof);

        scene.add(group);
        threeMarkersRef.current[vendor.id] = group;
      });

      // Raycast click listener
      const onCanvasClick = (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        let targetVendor = null;
        for (let hit of intersects) {
          let obj = hit.object;
          while (obj && obj.parent) {
            if (obj.userData && obj.userData.vendorId) {
              targetVendor = obj.userData.vendor;
              break;
            }
            obj = obj.parent;
          }
          if (targetVendor) break;
        }

        if (targetVendor) {
          highlightSeller(targetVendor);
        }
      };

      renderer.domElement.addEventListener('click', onCanvasClick);

      // Window resize listener
      const onResize = () => {
        if (!renderer || !camera || !active) return;
        const rect = container.getBoundingClientRect();
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height);
      };
      window.addEventListener('resize', onResize);

      // Animation Loop
      const animate = (time) => {
        if (!active) return;
        animationFrameIdRef.current = requestAnimationFrame(animate);

        const t = time * 0.001;

        if (controls) controls.update();

        // Cam transition
        if (targetCamPosRef.current) {
          camera.position.lerp(targetCamPosRef.current, 0.06);
          if (camera.position.distanceTo(targetCamPosRef.current) < 0.1) {
            targetCamPosRef.current = null;
          }
        }
        if (targetLookAtRef.current) {
          controls.target.lerp(targetLookAtRef.current, 0.06);
          if (controls.target.distanceTo(targetLookAtRef.current) < 0.1) {
            targetLookAtRef.current = null;
          }
        }

        // Pulse user marker ring
        if (pulseRing) {
          const pulse = (t * 0.7) % 1.0;
          pulseRing.scale.set(1 + pulse * 2.2, 1 + pulse * 2.2, 1);
          pulseRing.material.opacity = 0.45 * (1.0 - pulse);
        }

        // Stall Pin bobbing
        Object.keys(threeMarkersRef.current).forEach(vId => {
          const grp = threeMarkersRef.current[vId];
          if (grp && grp.visible) {
            const pinMesh = grp.children.find(c => c.geometry && c.geometry.type === "ConeGeometry");
            if (pinMesh) {
              pinMesh.rotation.y = t * 1.6;
              pinMesh.position.y = 5.2 + Math.sin(t * 3.2 + grp.position.x) * 0.25;
            }
          }
        });

        renderer.render(scene, camera);
      };
      
      animate(0);
    }

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', () => {});
    };
  }, [mapMode, vendors]);

  const getVendorTags = (name) => {
    if (name.includes("Sai Baba")) return ["Plants", "Pots", "Succulents", "+3"];
    if (name.includes("Green Flora")) return ["Flower Plants", "Indoor Plants", "+4"];
    if (name.includes("Balaji")) return ["Seeds", "Soil", "Fertilizers", "+2"];
    if (name.includes("Lakshmi")) return ["Compost", "Vermicompost", "+1"];
    return ["Plants", "Gardening", "+2"];
  };

  const getVendorDesc = (name) => {
    if (name.includes("Lakshmi") || name.includes("Organic")) return "Organic compost distributor";
    return "Verified roadside stall";
  };

  return (
    <div id="view-map" className="page-view active" style={{ display: 'block' }}>
      {/* Title Header */}
      <div className="section-title-row" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>
            Discover Plant Sellers Near You <span style={{ fontSize: '22px' }}>🌿</span>
          </h1>
          <p className="section-subtitle" style={{ fontSize: '13.5px', color: '#666', marginTop: '4px' }}>
            Find verified plant stalls, nurseries, and organic compost distributors nearby.
          </p>
        </div>
      </div>
      
      <div className="map-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '600px' }}>
        {/* Sidebar filters and listings */}
        <div className="map-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Filter Tag pills */}
          <div className="map-filter-tags" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            <button className={`map-filter-tag ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: filterType === 'all' ? 'var(--primary-green)' : '#fff', color: filterType === 'all' ? '#fff' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>All</button>
            <button className={`map-filter-tag ${filterType === 'plant' ? 'active' : ''}`} onClick={() => setFilterType('plant')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: filterType === 'plant' ? 'var(--primary-green)' : '#fff', color: filterType === 'plant' ? '#fff' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Plants</button>
            <button className={`map-filter-tag ${filterType === 'seed' ? 'active' : ''}`} onClick={() => setFilterType('seed')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: filterType === 'seed' ? 'var(--primary-green)' : '#fff', color: filterType === 'seed' ? '#fff' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Seeds</button>
            <button className={`map-filter-tag ${filterType === 'soil' ? 'active' : ''}`} onClick={() => setFilterType('soil')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: filterType === 'soil' ? 'var(--primary-green)' : '#fff', color: filterType === 'soil' ? '#fff' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Soil</button>
            <button className={`map-filter-tag ${filterType === 'pot' ? 'active' : ''}`} onClick={() => setFilterType('pot')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: filterType === 'pot' ? 'var(--primary-green)' : '#fff', color: filterType === 'pot' ? '#fff' : '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Pots</button>
          </div>
          
          {/* Count and sorting dropdown row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12.5px', color: '#666', fontWeight: 600 }}>
            <span>Nearby Sellers ({filteredVendors.length} Found)</span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Closest First <span>▾</span></span>
          </div>
          
          {/* Stalls cards list */}
          <div id="map-sidebar-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
            {filteredVendors.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', padding: '30px 0' }}>No active stalls found for this category.</div>
            ) : (
              filteredVendors.map((vendor) => {
                const isSelected = selectedVendor?.id === vendor.id;
                return (
                  <div 
                    key={vendor.id} 
                    className={`seller-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => highlightSeller(vendor)}
                    style={{
                      background: '#ffffff',
                      border: isSelected ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    {/* Square stall image */}
                    <img 
                      src={vendor.photos[0]} 
                      alt={vendor.name} 
                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} 
                    />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dark)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{vendor.name}</h4>
                        <span style={{ fontSize: '9px', background: vendor.isOpen ? '#e8f5e9' : '#ffebee', color: vendor.isOpen ? 'var(--primary-green)' : '#c62828', padding: '2px 6px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                          {vendor.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#777', margin: 0 }}>{getVendorDesc(vendor.name)}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary-green)' }}>📍 {vendor.distance} away</span>
                        <span style={{ color: '#fb8c00' }}>⭐ {vendor.rating} ({vendor.reviewsCount})</span>
                      </div>

                      {/* Tags pills */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {getVendorTags(vendor.name).map((tag, idx) => (
                          <span 
                            key={idx} 
                            style={{ 
                              fontSize: '9px', 
                              background: '#f2f9f3', 
                              color: 'var(--primary-green)', 
                              padding: '1px 6px', 
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            <button style={{ width: '100%', padding: '10px 0', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '12px', fontSize: '12px', color: '#666', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f7fafc'} onMouseOut={(e) => e.currentTarget.style.background = '#fff'}>
              Load More Sellers ▾
            </button>
          </div>
        </div>
        
        {/* Map Canvas wrapper */}
        <div className="map-canvas-container" style={{ height: '100%', position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          {/* Mode toggle controls */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <button 
              onClick={() => setMapMode('2d')} 
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: mapMode === '2d' ? 'var(--primary-green)' : '#ffffff',
                color: mapMode === '2d' ? '#ffffff' : '#666',
                transition: 'all 0.2s'
              }}
            >
              🗺️ Map View
            </button>
            <button 
              onClick={() => setMapMode('list')} 
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: mapMode === 'list' ? 'var(--primary-green)' : '#ffffff',
                color: mapMode === 'list' ? '#ffffff' : '#666',
                transition: 'all 0.2s'
              }}
            >
              📋 List View
            </button>
          </div>

          {/* Search location HUD */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-pill)', padding: '6px 14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <input 
                type="text" 
                placeholder="Search location..." 
                style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '140px' }} 
              />
              <span style={{ cursor: 'pointer', color: '#888' }}>🔍</span>
            </div>

          </div>
          
          <div className="mock-map mode-2d" id="map-canvas" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* 2D Leaflet Map Container */}
            <div 
              ref={leafletContainerRef} 
              id="map-leaflet" 
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, display: (mapMode === '2d' || mapMode === '3d') ? 'block' : 'none' }}
            />

            {/* Custom map controls overlay */}
            {(mapMode === '2d' || mapMode === '3d') && (
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => leafletMapRef.current && leafletMapRef.current.zoomIn()}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                >
                  +
                </button>
                <button 
                  onClick={() => leafletMapRef.current && leafletMapRef.current.zoomOut()}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                >
                  −
                </button>
                <button 
                  onClick={() => leafletMapRef.current && leafletMapRef.current.setView([12.9545, 77.6150], 13)}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  title="Locate Me"
                >
                  🎯
                </button>
              </div>
            )}

            {/* List Mode overlay grid in place of Leaflet */}
            {mapMode === 'list' && (
              <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 5, background: '#ffffff', padding: '60px 24px 24px 24px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--dark)' }}>All Plant Sellers Listing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filteredVendors.map(vendor => (
                    <div 
                      key={vendor.id} 
                      style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '16px', 
                        padding: '16px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        display: 'flex',
                        gap: '12px',
                        background: '#fff'
                      }}
                      onClick={() => window.location.hash = `#/stall/${vendor.id}`}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-green)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <img src={vendor.photos[0]} alt={vendor.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', margin: '0 0 4px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{vendor.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 600 }}>{vendor.isOpen ? "Open Now" : "Closed"}</span>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>📍 {vendor.distance} away • ⭐ {vendor.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pop-up overlay when clicking map pins */}
            {selectedVendor && (
              <div 
                className="map-popup-card active" 
                id="map-popup"
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  zIndex: 10,
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px',
                  width: '320px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  display: 'flex',
                  gap: '14px',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <img 
                  src={selectedVendor.photos[0]} 
                  alt={selectedVendor.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} 
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{selectedVendor.name}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 600 }}>
                    Open <span style={{ color: '#666' }}>• Closes 9:00 PM</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#666', display: 'flex', gap: '8px' }}>
                    <span>📍 {selectedVendor.distance} away</span>
                    <span>⭐ {selectedVendor.rating} ({selectedVendor.reviewsCount})</span>
                  </div>
                  
                  {/* Mock Tags in Popup */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {getVendorTags(selectedVendor.name).map((tag, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '9px', 
                          background: '#f2f9f3', 
                          color: 'var(--primary-green)', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Link 
                      to={`/stall/${selectedVendor.id}`} 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        padding: '6px 0', 
                        fontSize: '11px', 
                        borderRadius: 'var(--radius-pill)', 
                        textAlign: 'center', 
                        textDecoration: 'none',
                        justifyContent: 'center',
                        height: '32px'
                      }}
                    >
                      View Stall
                    </Link>
                    <button 
                      onClick={() => alert(`Directions loaded for: ${selectedVendor.name}. Indiranagar corridor route active.`)}
                      style={{ 
                        flex: 1, 
                        padding: '6px 0', 
                        fontSize: '11px', 
                        borderRadius: 'var(--radius-pill)', 
                        border: '1px solid #ccc',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#444',
                        height: '32px'
                      }}
                    >
                      ↗️ Directions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row under map */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '20px' }}>🏪</span>
          <div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--dark)' }}>{filteredVendors.length} Sellers</strong>
            <span style={{ fontSize: '11px', color: '#666' }}>Nearby Stalls Found</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '180px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '20px' }}>🕒</span>
          <div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--dark)' }}>{filteredVendors.filter(v => v.isOpen).length} Sellers</strong>
            <span style={{ fontSize: '11px', color: '#666' }}>Open Now</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '180px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '20px' }}>⭐</span>
          <div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--dark)' }}>4.6 / 5</strong>
            <span style={{ fontSize: '11px', color: '#666' }}>Average Rating</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '180px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '20px' }}>🚚</span>
          <div>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--dark)' }}>Fast Delivery</strong>
            <span style={{ fontSize: '11px', color: '#666' }}>Available Nearby</span>
          </div>
        </div>
      </div>

      {/* Bottom Banners Section */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        {/* Banner 1: Request Item */}
        <div style={{ flex: '1 1 400px', background: '#f5f9f6', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🌱</span>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>Can't find what you need?</h4>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Request plants, seeds, soil & more from your nearest sellers.</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => alert("Custom requests feature: Local sellers notified to stock requested item!")}
            style={{ 
              padding: '10px 20px', 
              fontSize: '13px', 
              borderRadius: 'var(--radius-pill)', 
              borderColor: 'var(--primary-green)', 
              color: 'var(--primary-green)',
              background: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 Request Item
          </button>
        </div>

        {/* Banner 2: Join as Seller */}
        <div style={{ flex: '1 1 400px', background: '#f5f9f6', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>📱</span>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>Are you a seller?</h4>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Get your free stall QR code and start selling with PLANTO.</p>
            </div>
          </div>
          <button 
            className="btn" 
            onClick={() => window.location.hash = "#/vendor"}
            style={{ 
              padding: '10px 20px', 
              fontSize: '13px', 
              borderRadius: 'var(--radius-pill)', 
              background: 'var(--primary-green)',
              color: 'white',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Join as Seller
          </button>
        </div>
      </div>
    </div>
  );
}
