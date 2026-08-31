"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Place N random points on a sphere surface using Fibonacci lattice
function fibonacciSphere(n: number, r: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r));
  }
  return pts;
}

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;

    // ── Scene setup ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03020d);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    el.appendChild(renderer.domElement);

    // ── Globe group (so everything rotates together) ──────────────
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ── Invisible sphere to guide points ──────────────────────────
    const RADIUS = 5.5;
    const nodePoints = fibonacciSphere(180, RADIUS);

    // ── Node dots on sphere surface ───────────────────────────────
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const nodeGeoPilot = new THREE.SphereGeometry(0.055, 8, 8);
    nodePoints.forEach((pos) => {
      const node = new THREE.Mesh(nodeGeoPilot, nodeMat);
      node.position.copy(pos);
      globeGroup.add(node);
    });

    // ── Wireframe sphere shell ─────────────────────────────────────
    const shellGeo = new THREE.SphereGeometry(RADIUS, 48, 48);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x3730a3,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    globeGroup.add(new THREE.Mesh(shellGeo, shellMat));

    // ── Connections: draw edges between nearby nodes ───────────────
    const MAX_DIST = 2.6;
    const edgePositions: number[] = [];

    for (let i = 0; i < nodePoints.length; i++) {
      for (let j = i + 1; j < nodePoints.length; j++) {
        if (nodePoints[i].distanceTo(nodePoints[j]) < MAX_DIST) {
          edgePositions.push(
            nodePoints[i].x, nodePoints[i].y, nodePoints[i].z,
            nodePoints[j].x, nodePoints[j].y, nodePoints[j].z
          );
        }
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.22,
    });
    globeGroup.add(new THREE.LineSegments(edgeGeo, edgeMat));

    // ── Highlighted nodes (brighter accent dots) ───────────────────
    const accentIndices = Array.from({ length: 18 }, () => Math.floor(Math.random() * nodePoints.length));
    const accentColors = [0x6366f1, 0x06b6d4, 0xa78bfa, 0xf472b6, 0x34d399];
    accentIndices.forEach((idx, i) => {
      const color = accentColors[i % accentColors.length];
      const g = new THREE.SphereGeometry(0.14, 12, 12);
      const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, metalness: 0.6, roughness: 0.1 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.copy(nodePoints[idx]);
      globeGroup.add(mesh);
    });

    // ── Animated "data packet" particles flying along edges ────────
    // Pick random edges and spawn particles along them
    const edgeCount = edgePositions.length / 6;
    interface Packet { mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; t: number; speed: number }
    const packets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.07, 6, 6);
    const packetColors = [0x818cf8, 0x22d3ee, 0xc4b5fd, 0xf9a8d4];

    for (let k = 0; k < 60; k++) {
      const eIdx = Math.floor(Math.random() * edgeCount) * 6;
      const start = new THREE.Vector3(edgePositions[eIdx], edgePositions[eIdx+1], edgePositions[eIdx+2]);
      const end   = new THREE.Vector3(edgePositions[eIdx+3], edgePositions[eIdx+4], edgePositions[eIdx+5]);
      const color = packetColors[k % packetColors.length];
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(packetGeo, mat);
      mesh.position.copy(start);
      globeGroup.add(mesh);
      packets.push({ mesh, start, end, t: Math.random(), speed: 0.003 + Math.random() * 0.007 });
    }

    // ── Outer glow ring ────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(RADIUS + 0.5, 0.03, 16, 160);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.8;
    globeGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(RADIUS + 1.1, 0.02, 16, 160),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2 })
    );
    ring2.rotation.x = Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    globeGroup.add(ring2);

    // ── Background stars ───────────────────────────────────────────
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 80 + Math.random() * 120;
      starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i*3+2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.6, sizeAttenuation: true })));

    // ── Central glowing core ───────────────────────────────────────
    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 2.5, metalness: 1, roughness: 0 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // ── Lights ─────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1e1b4b, 2));
    const pl1 = new THREE.PointLight(0x6366f1, 10, 40);
    pl1.position.set(0, 0, 0);
    globeGroup.add(pl1);
    const pl2 = new THREE.PointLight(0x06b6d4, 6, 50);
    pl2.position.set(12, 8, 10);
    scene.add(pl2);

    // ── Mouse tracking ─────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ─────────────────────────────────────────────
    let t = 0, rafId: number;
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      t += 0.004;

      // Auto rotation + mouse tilt
      targetRot.y = t + mouse.x * 0.4;
      targetRot.x = mouse.y * 0.25;
      currentRot.x += (targetRot.x - currentRot.x) * 0.04;
      currentRot.y += (targetRot.y - currentRot.y) * 0.04;

      globeGroup.rotation.y = currentRot.y;
      globeGroup.rotation.x = currentRot.x;

      // Rings pulse/orbit
      ring1.rotation.y = t * 0.6;
      ring2.rotation.x = t * 0.4;

      // Core pulse
      const pulse = 1 + Math.sin(t * 3) * 0.12;
      core.scale.setScalar(pulse);
      coreMat.emissiveIntensity = 2 + Math.sin(t * 3) * 0.8;

      // Move data packets
      packets.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        p.mesh.position.lerpVectors(p.start, p.end, p.t);
      });

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}
