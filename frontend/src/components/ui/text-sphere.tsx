"use client";

import React, { useEffect, useRef } from "react";

// Greek letters, math symbols, numbers and letters matching the reference
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+ΣαΔΩπ£∞µφθλ∑≈≠≡≤≥";

interface Particle {
  x: number;
  y: number;
  z: number;
  char: string;
  isShedding: boolean;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  originalPosition: { x: number; y: number; z: number };
  screenX: number;
  screenY: number;
  finalZ: number;
  scale: number;
  opacity: number;
  fontSize: number;
}

export function TextSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    const numParticles = 800; 
    const radius = 220;
    
    // Initialize sphere points using Fibonacci sphere algorithm
    const initParticles = () => {
      particles = [];
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < numParticles; i++) {
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / numParticles);
        
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        
        particles.push({
          x, y, z,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          isShedding: false,
          vx: 0, vy: 0, vz: 0,
          life: 1,
          originalPosition: { x, y, z },
          screenX: 0,
          screenY: 0,
          finalZ: 0,
          scale: 1,
          opacity: 1,
          fontSize: 12
        });
      }
    };
    
    initParticles();

    let angleX = 0;
    let angleY = 0;
    let targetRotationSpeed = 0.003;
    let currentRotationSpeed = 0.003;

    let width = 0;
    let height = 0;
    let isVisible = true;
    let dpr = 1;

    const resize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    resize();

    // Pause canvas completely when scrolled off-screen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    }

    let animationFrameId: number;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      
      // Smoothly interpolate rotation speed
      currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.05;
      
      angleX += currentRotationSpeed;
      angleY += currentRotationSpeed * 1.2;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 600;

      // Phase 1: Fast math loop
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        
        if (p.isShedding) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.vy += 0.8;
          p.life -= 0.02;
          
          if (p.life <= 0) {
            p.isShedding = false;
            p.x = p.originalPosition.x;
            p.y = p.originalPosition.y;
            p.z = p.originalPosition.z;
            p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            p.life = 0;
          }
        } else if (p.life < 1) {
          p.life = Math.min(1, p.life + 0.05);
        }

        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;
        const ry = p.y * cosX - rz * sinX;
        const finalZ = p.y * sinX + rz * cosX;

        const scale = fov / (fov + finalZ);
        p.screenX = centerX + rx * scale;
        p.screenY = centerY + ry * scale;
        p.finalZ = finalZ;
        p.scale = scale;

        const depthNormalized = (finalZ + radius) / (radius * 2);
        let opacity = p.isShedding ? p.life : Math.max(0.12, 1 - depthNormalized) * p.life;
        if (!p.isShedding) {
          opacity = opacity * opacity;
        }
        p.opacity = opacity;
        p.fontSize = Math.round(Math.max(7, 13 * scale));
      }

      // Phase 2: In-place sort by precomputed finalZ
      particles.sort((a, b) => a.finalZ - b.finalZ);

      // Phase 3: Hardware-accelerated batched drawing
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#113248";

      let currentFont = "";

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        
        const fontStr = `bold ${p.fontSize}px "Courier New", monospace`;
        if (currentFont !== fontStr) {
          ctx.font = fontStr;
          currentFont = fontStr;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillText(p.char, p.screenX, p.screenY);
      }

      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const dx = mx - width / 2;
      const dy = my - height / 2;
      if (dx * dx + dy * dy < radius * radius) {
        targetRotationSpeed = 0.012;
        canvas.style.cursor = 'pointer';
      } else {
        targetRotationSpeed = 0.003;
        canvas.style.cursor = 'default';
      }
    };
    
    const handleClick = () => {
      for (let i = 0; i < 25; i++) {
        const idx = Math.floor(Math.random() * numParticles);
        const target = particles[idx];
        if (target && !target.isShedding) {
          target.isShedding = true;
          target.vx = (Math.random() - 0.5) * 15;
          target.vy = (Math.random() - 0.5) * 15 - 5;
          target.vz = (Math.random() - 0.5) * 15;
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick, { passive: true });

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-pointer group">
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
    </div>
  );
}
