"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Radio, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Terminal, 
  FileText,
  Users2,
  Cpu,
  BarChart3,
  Flame,
  Globe2,
  Boxes
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ── Dynamic 3D WebGL Canvas Import (No SSR hydration issues) ───
const HeroCanvas = dynamic(() => import("@/components/HeroCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 pointer-events-none" />,
});

// ── Interactive 3D Perspective Tilt Card Component ────────────
function TiltCard({ 
  children, 
  className = "", 
  style = {} 
}: { 
  children: React.ReactNode; 
  className?: string; 
  style?: React.CSSProperties 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.16,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.18s ease-out",
        ...style,
      }}
      className={`relative overflow-hidden group/tilt ${className}`}
    >
      {/* 3D Specular Sheen Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 380px at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // ── Smooth Scroll (Lenis) ─────────────────────────────────────
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.on("scroll", ScrollTrigger.update);

    // ── Floating Navbar Auto-Hide on Scroll Down ──────────────────
    const showAnim = gsap.fromTo(
      ".main-nav",
      { y: 0 },
      { y: -100, paused: true, duration: 0.3, ease: "power2.out" }
    );
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1 && self.progress > 0.02) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }
      },
    });

    // ── Hero Animations ───────────────────────────────────────────
    gsap.fromTo(
      ".hero-badge",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
    );
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.25 }
    );
    gsap.fromTo(
      ".hero-desc",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.4 }
    );
    gsap.fromTo(
      ".hero-actions",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.55 }
    );
    gsap.fromTo(
      ".hero-preview",
      { opacity: 0, y: 50, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out", delay: 0.7 }
    );

    // ── Scroll Reveal Elements ────────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // ── Stats Counting Animation ──────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".count-stat").forEach((el) => {
      const target = parseFloat(el.dataset.target || "0");
      const isFloat = (el.dataset.target || "").includes(".");
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => {
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = isFloat
                ? counter.val.toFixed(1)
                : Math.floor(counter.val).toLocaleString();
            },
          });
        },
      });
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenisTicker);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="bg-[#07080b] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      
      {/* ── Ambient Background Glows & Grid ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Radial Aurora Spotlights */}
        <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-bl from-cyan-500/12 via-blue-600/8 to-transparent rounded-full blur-[160px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/10 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        
        {/* Cyber Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "44px 44px",
          }}
        />
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07080b]/40 to-[#07080b]" />
      </div>

      {/* ── Top Announcement Banner ───────────────────────────────── */}
      <div className="relative z-50 bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-950/80 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-medium text-slate-300 flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="text-white font-semibold">ProjectCamp v2.0 Live:</span>
        <span className="hidden sm:inline text-slate-300">Predictive AI Risk Modeling & Redis Job Queues are now active.</span>
        <Link href="/auth" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1">
          Explore Workspace →
        </Link>
      </div>

      {/* ── FLOATING NAVBAR ───────────────────────────────────────── */}
      <nav className="main-nav fixed top-11 left-0 right-0 z-40 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-[64px] rounded-2xl bg-[#0c0d12]/85 border border-white/[0.08] backdrop-blur-xl px-5 sm:px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-[0_0_20px_-3px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_25px_-1px_rgba(99,102,241,0.8)] transition-all">
              <div className="w-full h-full bg-[#0a0b0e] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-syne font-extrabold text-[16px] tracking-tight text-white flex items-center gap-1.5">
                ProjectCamp
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">3D PRO</span>
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#architecture" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Architecture</a>
            <a href="#ai-intelligence" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
              <span>AI Engine</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">GEMINI</span>
            </a>
            <a href="#realtime" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Real-Time</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link 
              href="/auth" 
              className="hidden sm:inline-flex text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/auth" 
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-300 group-hover:opacity-90" />
              <span className="relative flex items-center gap-2 px-4 py-2 rounded-[11px] bg-[#0c0d12] text-white transition-all duration-200 group-hover:bg-opacity-80">
                Launch App
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-current rounded" />
                <span className="w-full h-0.5 bg-current rounded" />
                <span className="w-full h-0.5 bg-current rounded" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-5 rounded-2xl bg-[#0c0d12] border border-white/[0.1] shadow-2xl space-y-4">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 text-sm py-1">Features</a>
            <a href="#architecture" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 text-sm py-1">Architecture</a>
            <a href="#ai-intelligence" onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-300 text-sm py-1">AI Engine</a>
            <Link href="/auth" className="block text-center w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════ HERO SECTION WITH LIVE 3D CANVAS ═══════════════════════════ */}
      <section className="relative z-10 pt-40 pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* ── 3D Interactive Three.js Cyber Globe / Orbital Canvas ── */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[650px] z-0 overflow-hidden pointer-events-none opacity-80 mix-blend-screen">
          <HeroCanvas />
        </div>

        {/* ── 3D Floating Holographic Badges (Levitation with Depth) ── */}
        <div className="hidden xl:flex absolute top-44 left-4 z-20 items-center gap-3 p-3.5 rounded-2xl bg-[#0c0e18]/85 border border-indigo-500/30 backdrop-blur-xl shadow-[0_20px_45px_-10px_rgba(99,102,241,0.35)] animate-[bounce_5s_ease-in-out_infinite]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block">WEBSOCKET ENGINE</span>
            <span className="text-xs font-semibold text-white">&lt;15ms Room Sync</span>
          </div>
        </div>

        <div className="hidden xl:flex absolute top-52 right-4 z-20 items-center gap-3 p-3.5 rounded-2xl bg-[#0c0e18]/85 border border-purple-500/30 backdrop-blur-xl shadow-[0_20px_45px_-10px_rgba(168,85,247,0.35)] animate-[bounce_6s_ease-in-out_infinite_1.2s]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono text-purple-400 font-bold block">GEMINI 1.5 FLASH</span>
            <span className="text-xs font-semibold text-white">Automated Risk Radar</span>
          </div>
        </div>

        {/* Top Floating Badge */}
        <div className="hero-badge relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-inner mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            Next-Gen Project Intelligence & Collaboration Platform
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-[11px] font-mono text-cyan-400 font-bold">3D Visual Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title relative z-10 font-syne font-extrabold text-4xl sm:text-6xl lg:text-[76px] leading-[1.06] tracking-tight max-w-5xl mb-7">
          Manage projects at the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-400 to-cyan-300 drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]">
            speed of thought.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-desc relative z-10 text-slate-400 text-base sm:text-xl max-w-2xl font-normal leading-relaxed mb-10">
          A high-concurrency, real-time workspace designed for ambitious teams. 
          Powered by Google Gemini for automated risk forecasting, live WebSocket task boards, and distributed job queues.
        </p>

        {/* Action Buttons */}
        <div className="hero-actions relative z-10 flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/auth"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-bold text-base shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_0_50px_0_rgba(99,102,241,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a
            href="#live-preview"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-semibold text-base backdrop-blur-xl transition-all duration-200 hover:border-white/20"
          >
            <Boxes className="w-4 h-4 text-indigo-400" />
            <span>Interactive 3D Hub</span>
          </a>
        </div>

        {/* Social Proof Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium mb-16">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Zero Setup Required
          </span>
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Bi-directional WebSockets
          </span>
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-violet-400" />
            Google Gemini 1.5 Flash
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Enterprise RBAC
          </span>
        </div>

        {/* ════════════════════ 3D INTERACTIVE TILT COMMAND HUB ════════════════════ */}
        <div id="live-preview" className="hero-preview relative z-10 w-full max-w-6xl mx-auto">
          <TiltCard className="rounded-3xl bg-[#0d0e15]/90 border border-white/[0.12] p-3 sm:p-5 shadow-[0_25px_90px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            
            {/* Ambient Top Rim Light */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />
            
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] px-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-500/20" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/20" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/20" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">projectcamp.app / workspace / 3d-core</span>
              </div>

              {/* Quick Command Pallette Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sprint: Active</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-slate-300 font-mono">⌘K</kbd>
              </div>

              {/* Live Socket Status */}
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400 hidden sm:inline">WS Sync: 12ms</span>
              </div>
            </div>

            {/* Interactive Workspace Body */}
            <div className="pt-5 text-left grid grid-cols-1 lg:grid-cols-4 gap-5">
              
              {/* Left Column: Project Stats & AI Risk Radar */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Health Score</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-syne text-4xl font-extrabold text-white">96</span>
                    <span className="text-slate-500 text-sm">/ 100</span>
                  </div>
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mb-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full w-[96%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Gemini analyzed 24 sprint tasks: 0 bottlenecks, velocity up 18%.
                  </p>
                </div>

                {/* AI Quick Suggestion Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                    <span>AI Workload Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    "Reassign Task #41 to @sarah to balance workload before Sprint Freeze."
                  </p>
                  <button className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-colors">
                    Apply Suggestion →
                  </button>
                </div>
              </div>

              {/* Right 3 Columns: Live Kanban Board */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Column 1: Backlog */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Backlog
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">4</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#11121a] border border-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer">
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold block mb-1">PROJ-108</span>
                      <h4 className="text-xs font-medium text-slate-200 mb-2">Configure Redis Cache for Session Auth</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">Low Priority</span>
                        <span>Est: 2h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      In Progress
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">2</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#12131f] border border-indigo-500/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] transition-all">
                      <span className="text-[10px] font-mono text-purple-400 font-semibold block mb-1">PROJ-94</span>
                      <h4 className="text-xs font-medium text-white mb-2">WebSocket Room Segregation & Live Push</h4>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">High Priority</span>
                        <span className="text-indigo-300">Live Syncing</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#11121a] border border-white/[0.06] hover:border-white/10 transition-all">
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold block mb-1">PROJ-102</span>
                      <h4 className="text-xs font-medium text-slate-200 mb-2">AWS S3 Presigned Attachment Storage</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Medium</span>
                        <span>3 files</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Shipped / Done */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Completed
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">18</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#11121a] border border-emerald-500/20 opacity-80">
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold block mb-1">PROJ-88</span>
                      <h4 className="text-xs font-medium text-slate-300 line-through mb-2">Audit Log Stream & Winston Monitoring</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="text-emerald-400">✓ Verified</span>
                        <span>Deployed</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </TiltCard>
        </div>

      </section>

      {/* ═══════════════════════ STATS TICKER ═══════════════════════ */}
      <section className="relative z-10 py-16 border-y border-white/[0.06] bg-[#090a0f]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-1">
              &lt;<span className="count-stat" data-target="15">0</span>ms
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Sync Latency</p>
          </div>
          <div>
            <div className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-1">
              <span className="count-stat" data-target="99.9">0</span>%
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Uptime SLA</p>
          </div>
          <div>
            <div className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-1">
              <span className="count-stat" data-target="2400">0</span>+
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Teams Shipping</p>
          </div>
          <div>
            <div className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-1">
              <span className="count-stat" data-target="10">0</span>x
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Sprint Velocity</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 3D INTERACTIVE BENTO GRID ═══════════════════════ */}
      <section id="features" className="relative z-10 py-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-3 block">
            Engineered For Scale
          </span>
          <h2 className="font-syne font-extrabold text-3xl sm:text-5xl text-white tracking-tight mb-5 leading-tight">
            Everything your team needs to ship on time, every time.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Eliminate endless status meetings. Let automated agents, live WebSockets, and distributed queues coordinate the work.
          </p>
        </div>

        {/* Bento Grid with 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Large Featured Card (Real-Time WebSockets) */}
          <TiltCard className="md:col-span-2 rounded-3xl bg-[#0c0d13] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">Live Protocol</span>
            </div>

            <h3 className="font-syne font-bold text-2xl sm:text-3xl text-white mb-3">
              Bi-directional WebSockets with Room Isolation
            </h3>
            <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed">
              Every project operates in an isolated Socket.io channel (<code className="text-xs font-mono text-cyan-300">project_&#123;id&#125;</code>). When a teammate drops a file, moves a card, or adds a subtask, your browser updates in under 15ms without polling.
            </p>

            {/* Visual Stream Mockup */}
            <div className="rounded-xl bg-[#08090d] border border-white/[0.06] p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-white/[0.05] pb-2">
                <span>EVENT STREAM DISPATCHER</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CONNECTED
                </span>
              </div>
              <p className="text-indigo-300">[20:12:04] &gt; socket.join("project_649f8a")</p>
              <p className="text-cyan-300">[20:12:05] &gt; emit("task_updated", &#123; id: 89, status: "done" &#125;)</p>
              <p className="text-emerald-300">[20:12:06] &gt; broadcastToRoom("project_649f8a", 4 recipients synced)</p>
            </div>
          </TiltCard>

          {/* Card 2: AI Risk Intelligence */}
          <TiltCard className="rounded-3xl bg-[#0c0d13] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-semibold">Gemini 1.5 Flash</span>
              </div>
              <h3 className="font-syne font-bold text-2xl text-white mb-3">
                Predictive Risk Radar
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Analyzes velocity, overdue dates, and member workload to output health scores, optimistic & pessimistic timelines, and mitigation steps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Predicted Delivery:</span>
                <span className="text-white font-semibold">Dec 14, 2026</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Confidence Factor:</span>
                <span className="text-emerald-400 font-semibold">94.8%</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 3: BullMQ & Redis Queues */}
          <TiltCard className="rounded-3xl bg-[#0c0d13] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">Distributed Queues</span>
            </div>
            <h3 className="font-syne font-bold text-2xl text-white mb-3">
              BullMQ + Redis Engine
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Heavy tasks like automated email verification and long AI summaries are offloaded to background workers, keeping your UI instantaneous.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Non-blocking HTTP event loop</span>
            </div>
          </TiltCard>

          {/* Card 4: Granular RBAC */}
          <TiltCard className="rounded-3xl bg-[#0c0d13] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">Security</span>
            </div>
            <h3 className="font-syne font-bold text-2xl text-white mb-3">
              Role-Based Access Control
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Granular permission matrix (Admins vs Members) ensuring sensitive project settings and member management remain strictly governed.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HttpOnly JWT Cookie Verification</span>
            </div>
          </TiltCard>

          {/* Card 5: AWS S3 Cloud Storage */}
          <TiltCard className="rounded-3xl bg-[#0c0d13] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">Cloud Infrastructure</span>
            </div>
            <h3 className="font-syne font-bold text-2xl text-white mb-3">
              AWS S3 File Pipeline
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Presigned multipart upload buffers for task attachments with automatic S3 garbage collection hooks on task deletion.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-region encrypted bucket</span>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* ═══════════════════════ ARCHITECTURE SECTION ═══════════════════════ */}
      <section id="architecture" className="relative z-10 py-24 border-t border-white/[0.08] bg-[#08090d]/80">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            ENTERPRISE ARCHITECTURE
          </div>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-white mb-4">
            Built from scratch for peak performance
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-14">
            From the Next.js 16 App Router on the edge to MongoDB 7 shard clusters and BullMQ message brokers — zero fluff, maximum efficiency.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { title: "Next.js 16 + React 19", sub: "Turbopack Bundler & Server Actions" },
              { title: "Socket.io 4 Cluster", sub: "Room Segregation & JWT Handshake" },
              { title: "Redis 7 & BullMQ", sub: "Distributed Task Offloading" },
              { title: "Google Gemini 1.5", sub: "Contextual Workload Modeling" },
            ].map((arch, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <span className="text-xs font-mono text-indigo-400 font-bold mb-2 block">0{idx + 1} // ARCH</span>
                <h4 className="text-sm font-semibold text-white mb-1">{arch.title}</h4>
                <p className="text-xs text-slate-500">{arch.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CALL TO ACTION ═══════════════════════ */}
      <section className="relative z-10 py-32 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-b from-[#131524] to-[#0a0b12] border border-indigo-500/30 text-center relative overflow-hidden shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)]">
          
          {/* Subtle Glow Spheres */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-6 inline-block">
              Ready to Upgrade Your Workflow?
            </span>
            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl text-white mb-6 tracking-tight leading-tight">
              Start building with ProjectCamp today.
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Experience the power of real-time coordination and AI-driven task intelligence. Free to get started with no credit card required.
            </p>
            
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold text-base shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
              <span>✓ Open Source MIT</span>
              <span>✓ Next.js 16 Compatible</span>
              <span>✓ Redis & Socket.io Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.08] py-12 px-6 bg-[#050608]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-syne font-bold text-white">ProjectCamp</span>
            <span className="text-xs text-slate-600 font-mono">© 2026</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">All Systems Operational · Socket.io & MongoDB Connected</span>
          </div>

          <div className="flex gap-6 text-xs text-slate-400">
            <Link href="/auth" className="hover:text-white transition-colors">Sign In</Link>
            <a href="https://github.com/nimranaz148/project-management-system" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="#features" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
