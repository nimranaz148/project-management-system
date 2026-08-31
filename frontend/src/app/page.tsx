"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { TextSphere } from "@/components/ui/text-sphere";

gsap.registerPlugin(ScrollTrigger);

// ── WordSplit OUTSIDE component (fix: no recreation on re-render) ──
function WordSplit({ text, cls = "" }: { text: string; cls?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ perspective: "800px" }}>
          <span className={`hero-word inline-block will-change-transform ${cls}`}>{w}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

// ── Mock task-board visual for showcase ───────────────────────────
function TaskBoardMock({ color, items }: { color: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-100"
      style={{ boxShadow: `0 24px 64px ${color}10` }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {["#f87171","#fbbf24","#4ade80"].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="w-24 h-2 rounded-full bg-slate-100" />
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      </div>
      {/* Rows */}
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50 group hover:border-opacity-60 transition-all"
            style={{ borderLeftColor: color, borderLeftWidth: 2 }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
              style={{ background: color + (i === 0 ? "ff" : i === 1 ? "cc" : "88") }}>
              {i === 0 ? "✓" : i + 1}
            </div>
            <span className="text-slate-700 text-xs font-medium flex-1">{item}</span>
            <div className="w-10 h-1.5 rounded-full" style={{ background: `${color}${40 + i * 25}` }} />
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "72%", background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        </div>
        <span className="text-[11px] text-slate-400 font-medium">72%</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // ── Lenis: ONLY via gsap.ticker ───────────────
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.on("scroll", ScrollTrigger.update);

    // ── Auto-hide Navbar ──────────────────────────────────────────
    const showAnim = gsap.fromTo(".main-nav", 
      { yPercent: 0 }, 
      { yPercent: -100, paused: true, duration: 0.3, ease: "power2.out" }
    );
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1 && self.progress > 0.01) {
          showAnim.play();
        } else {
          showAnim.reverse();
        }
      }
    });

    // ── Hero Cinematic Reveal ───────────────────────────────────────
    gsap.fromTo(".hero-pill",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.1 }
    );
    gsap.fromTo(".hero-line",
      { y: 100, rotateX: -15 },
      { y: 0, rotateX: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", delay: 0.2 }
    );
    gsap.fromTo(".hero-sub",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.7 }
    );
    gsap.fromTo(".hero-bottom",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "expo.out", delay: 0.9 }
    );

    // Hero right panel float in
    gsap.fromTo(".hero-panel",
      { opacity: 0, x: 60, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.6 }
    );



    // ── Marquee ───────────────────────────────────────────────────
    gsap.to(".marquee-track", { xPercent: -50, repeat: -1, duration: 30, ease: "none" });

    // ── Scroll progress bar ───────────────────────────────────────
    gsap.to(".scroll-bar", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.1 },
    });

    // ── Parallax blobs ────────────────────────────────────────────
    gsap.to(".blob-slow", {
      y: -100, ease: "none",
      scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
    });

    // ── Showcase items ────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".showcase-item").forEach((item) => {
      const label = item.querySelector(".s-label");
      const heading = item.querySelector(".s-heading");
      const bar = item.querySelector(".s-bar");
      const desc = item.querySelector(".s-desc");
      const panel = item.querySelector(".s-panel");

      gsap.timeline({
        scrollTrigger: { trigger: item, start: "top 75%", toggleActions: "play none none none" },
      })
        .fromTo(label, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 })
        .fromTo(heading, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, "-=0.4")
        .fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3")
        .fromTo(panel, { opacity: 0, x: 40, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power3.out" }, "-=0.5");
    });

    // ── Horizontal scroll ─────────────────────────────────────────
    const hTrack = document.querySelector<HTMLElement>(".h-track");
    if (hTrack) {
      const totalW = hTrack.scrollWidth - window.innerWidth;
      hTweenRef.current = gsap.to(hTrack, {
        x: -totalW, ease: "none",
        scrollTrigger: {
          trigger: ".h-container",
          start: "top top",
          end: () => `+=${totalW + 160}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Cards fade-in as they scroll into view
      gsap.utils.toArray<HTMLElement>(".h-card").forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: i * 0.05,
            scrollTrigger: {
              trigger: ".h-container",
              start: "top 20%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }

    // ── Stats count-up ────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".count-num").forEach((el) => {
      const target = parseFloat(el.dataset.target || "0");
      const isFloat = (el.dataset.target || "").includes(".");
      ScrollTrigger.create({
        trigger: el, start: "top 82%",
        onEnter: () => {
          const counter = { v: 0 };
          gsap.to(counter, {
            v: target, duration: 2.2, ease: "power2.out",
            onUpdate: () => {
              el.textContent = isFloat
                ? counter.v.toFixed(1)
                : Math.floor(counter.v).toLocaleString();
            },
          });
        },
      });
    });

    // ── Reveal-up stagger ─────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 87%", toggleActions: "play none none none" } }
      );
    });

    // ── Clip-path quote reveal ────────────────────────────────────
    gsap.fromTo(".clip-reveal",
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "power3.inOut",
        scrollTrigger: { trigger: ".clip-reveal", start: "top 78%" } }
    );

    // ── CTA zoom ──────────────────────────────────────────────────
    gsap.fromTo(".cta-box",
      { scale: 0.92, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".cta-box", start: "top 82%" } }
    );

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenisTicker);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="bg-[#f8f7f3] text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-700">
      <style>{`
        .font-syne { font-family: var(--font-syne); }
        .grad {
          background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#0891b2 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .pill {
          display:inline-flex; align-items:center; gap:6px; padding:5px 14px;
          border-radius:999px; background:rgba(79,70,229,0.07); color:#4f46e5;
          font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          border:1px solid rgba(79,70,229,0.15);
        }
        .scroll-bar { transform-origin:left; transform:scaleX(0); }
        .hero-word { opacity:0; }
        .hero-sub, .hero-bottom { opacity:0; }
        .hero-panel { opacity:0; }
        .showcase-item .s-label,
        .showcase-item .s-heading,
        .showcase-item .s-desc { opacity:0; }
        .showcase-item .s-bar { transform:scaleX(0); transform-origin:left; }
        .showcase-item .s-panel { opacity:0; }
        .cta-box { opacity:0; }
        @media (prefers-reduced-motion:reduce) {
          *, *::before, *::after { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
        }
        @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes scroll-drop {
          0%{opacity:0;transform:translateY(-100%)} 50%{opacity:1} 100%{opacity:0;transform:translateY(100%)}
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 4s linear infinite;
        }
      `}</style>

      {/* ── Scroll progress bar ───────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[300] h-[3px]">
        <div className="scroll-bar h-full"
          style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed,#0891b2)" }} />
      </div>

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav className="main-nav fixed top-[3px] left-0 right-0 z-[200] border-b border-slate-200/80 backdrop-blur-2xl"
        style={{ background: "rgba(248,247,243,0.88)", willChange: "transform" }}>
        <div className="max-w-7xl mx-auto px-6 h-[62px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-syne font-bold text-[15px] text-slate-900 tracking-tight">Project Camp</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7">
            {["Features","How it works","Pricing","Blog"].map((l) => (
              <a key={l} href="#"
                className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors duration-200 relative group">
                {l}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-indigo-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/auth"
              className="hidden sm:block text-slate-500 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200">
              Log in
            </Link>
            <Link href="/auth"
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}>
              Get started →
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 bg-white">
            <div className="flex flex-col px-6 py-4 space-y-4">
              {["Features", "How it works", "Pricing", "Blog"].map((l) => (
                <a key={l} href="#"
                  className="text-slate-600 font-medium hover:text-indigo-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {l}
                </a>
              ))}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Link href="/auth" className="text-center text-slate-600 font-medium py-2">
                  Log in
                </Link>
                <Link href="/auth" className="text-center text-white font-bold py-2.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}>
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════ HERO ══════════════════════════ */}
      <section
        className="hero-section relative min-h-screen flex items-center pt-[62px] overflow-hidden"
      >
        {/* Background blobs */}
        <div className="blob-slow absolute top-16 right-[6%] w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle at 40% 40%, rgba(79,70,229,0.09), transparent 65%)" }} />
        <div className="blob-slow absolute bottom-0 left-[10%] w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(8,145,178,0.06), transparent 70%)" }} />

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{ backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div className="relative z-10 max-w-xl">
              {/* Premium Top Pill */}
              <div className="hero-pill inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm mb-8 opacity-0">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full text-indigo-600 text-xs shadow-inner"
                       style={{ background: "linear-gradient(135deg, #e0e7ff, #ede9fe)" }}>✨</span>
                 <span className="text-[11px] font-extrabold text-slate-800 tracking-widest uppercase">Project Camp v2.0</span>
              </div>

              {/* Cinematic Line-by-Line Reveal */}
              <h1 className="font-syne font-extrabold text-[3.8rem] lg:text-[4.6rem] leading-[1.05] tracking-tight mb-7 text-slate-900" style={{ perspective: "1000px" }}>
                <div className="overflow-hidden py-1"><div className="hero-line will-change-transform">Manage your</div></div>
                <div className="overflow-hidden py-1"><div className="hero-line will-change-transform">projects at the</div></div>
                <div className="overflow-hidden py-1">
                  <div className="hero-line flex flex-wrap will-change-transform">
                    speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-x ml-2">thought.</span>
                  </div>
                </div>
              </h1>

              <p className="hero-sub text-slate-500 text-lg leading-[1.75] max-w-[480px] mb-9 font-light">
                From idea to execution in seconds. AI builds your roadmap, assigns tasks, and predicts blockers — before they happen.
              </p>

              {/* CTAs */}
              <div className="hero-bottom flex flex-wrap items-center gap-3 mb-9">
                <Link href="/auth"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)", boxShadow: "0 8px 28px rgba(79,70,229,0.38)" }}>
                  Start for free
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 font-semibold text-[15px] transition-all duration-250 bg-white/70 backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch demo
                </button>
              </div>

              {/* Social proof */}
              <div className="hero-bottom flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#4f46e5","#0891b2","#7c3aed","#059669","#dc2626"].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#f8f7f3] flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: c }}>{String.fromCharCode(65 + i)}</div>
                  ))}
                </div>
                <p className="text-slate-500 text-sm">
                  <span className="font-semibold text-slate-800">2,400+</span> teams ship faster
                </p>
                <div className="flex gap-0.5 ml-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-slate-400 text-xs ml-1">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right — Interactive AI Particle Core (Canvas) */}
            <div className="hero-panel hidden lg:flex relative items-center justify-center h-[550px] w-full">
               {/* Background glow */}
              <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-30 mix-blend-multiply pointer-events-none"
                   style={{ background: "radial-gradient(circle, #4f46e5, #0891b2)" }} />
              
              <div className="relative w-full h-full flex items-center justify-center -translate-y-12">
                 <TextSphere />
              </div>
            </div>

          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-slate-400 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
          <div className="w-px h-10 overflow-hidden">
            <div className="w-full h-full" style={{ background: "linear-gradient(to bottom,#4f46e5,transparent)", animation: "scroll-drop 1.6s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ═══════════════════ MARQUEE ════════════════════════════════ */}
      <div className="border-y border-slate-200 py-4 overflow-hidden bg-white">
        <div className="marquee-track flex gap-10 whitespace-nowrap" style={{ width: "200%" }}>
          {Array(2).fill(null).map((_, ri) => (
            <div key={ri} className="flex items-center gap-10">
              {["AI Task Generation","Real-time Sync","Risk Prediction","Smart Analytics","Kanban Boards","Team Collaboration","API Integrations","Roadmap Planning","Burndown Charts","Slack Alerts"].map((item) => (
                <span key={item} className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ SHOWCASE ═══════════════════════════════ */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 reveal-up">
            <p className="pill mb-5" style={{ margin: "0 auto 20px" }}>Why Project Camp</p>
            <h2 className="font-syne font-extrabold text-5xl md:text-6xl text-slate-900 leading-[1.1]">
              The platform that<br />
              <span className="grad">thinks with you</span>
            </h2>
            <p className="text-slate-400 text-lg mt-4 max-w-lg mx-auto font-light">Built for modern teams who move fast and ship with confidence.</p>
          </div>

          <div className="space-y-32">
            {[
              {
                num: "01", title: "AI Task Generation", color: "#4f46e5",
                desc: "Describe your goal in plain English. AI decomposes it into sprint-ready tasks with estimates, dependencies, and assignees — in under 3 seconds.",
                items: ["Plan sprint from brief", "Auto-assign by skill", "Set deadlines & deps", "Track live progress"],
                side: "right",
              },
              {
                num: "02", title: "Live Risk Radar", color: "#0891b2",
                desc: "ML models continuously scan velocity, team capacity, and scope — surfacing blockers before they become delays.",
                items: ["Velocity drop detected", "Scope creep +18%", "Deadline at risk: API", "Auto-rebalance team"],
                side: "left",
              },
              {
                num: "03", title: "Real-time Collaboration", color: "#7c3aed",
                desc: "Co-edit tasks, leave threaded comments, see live presence — all from one unified workspace.",
                items: ["5 members online now", "3 edits synced live", "2 unread comments", "1 PR merge pending"],
                side: "right",
              },
            ].map((f) => (
              <div key={f.num}
                className={`showcase-item grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${f.side === "left" ? "lg:[&>*:first-child]:order-2" : ""}`}>
                {/* Text side */}
                <div>
                  <span className="s-label block text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4"
                    style={{ color: f.color }}>Feature {f.num}</span>
                  <h3 className="s-heading font-syne font-extrabold text-4xl text-slate-900 mb-4">{f.title}</h3>
                  <div className="s-bar h-0.5 w-14 mb-6 origin-left rounded-full" style={{ background: f.color }} />
                  <p className="s-desc text-slate-500 text-lg leading-relaxed font-light max-w-[400px]">{f.desc}</p>
                </div>
                {/* Visual side */}
                <div className="s-panel">
                  <TaskBoardMock color={f.color} items={f.items} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HORIZONTAL FEATURE STRIP ═══════════════ */}
      <div className="h-container" style={{ height: "100vh", overflow: "hidden", position: "relative", background: "#0d0c1a" }}>
        <div className="h-track flex items-center" style={{ width: "max-content", height: "100%", paddingLeft: "10vw", gap: "24px" }}>

          <div className="flex-shrink-0 flex flex-col justify-center" style={{ width: "340px", paddingRight: "60px" }}>
            <p className="text-indigo-400 text-xs tracking-[0.3em] uppercase font-bold mb-4">Features</p>
            <h2 className="font-syne font-extrabold text-5xl text-white leading-tight mb-3">
              Built for<br />
              <span style={{ background: "linear-gradient(135deg,#a5b4fc,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>speed</span>
            </h2>
            <p className="text-slate-600 text-sm">Scroll to explore →</p>
          </div>

          {[
            { icon: "⚡", title: "AI Tasks", lines: ["Generate sprint in 3s","Auto-assign by skill","Estimate complexity"], color: "#818cf8", bg: "rgba(30,27,75,0.9)" },
            { icon: "📡", title: "Risk Radar", lines: ["Scan velocity daily","Flag scope creep early","Alert before crisis"], color: "#22d3ee", bg: "rgba(12,26,46,0.9)" },
            { icon: "🔗", title: "Live Sync", lines: ["Real-time co-editing","@mention teammates","Push to Slack/webhook"], color: "#c4b5fd", bg: "rgba(26,11,46,0.9)" },
            { icon: "📊", title: "Analytics", lines: ["Burndown charts","Velocity trends","Custom dashboards"], color: "#f9a8d4", bg: "rgba(45,10,26,0.9)" },
            { icon: "🔔", title: "Smart Alerts", lines: ["Context-aware only","No notification spam","Right signal, right time"], color: "#6ee7b7", bg: "rgba(10,31,26,0.9)" },
            { icon: "🔌", title: "Integrations", lines: ["GitHub, Slack, Figma","Linear, Jira, Notion","REST API + webhooks"], color: "#fcd34d", bg: "rgba(26,21,0,0.9)" },
          ].map((card) => {
            return (
              <div key={card.title}
                className="h-card group flex-shrink-0 rounded-3xl p-7 border relative overflow-hidden transition-colors"
                style={{ width: "320px", height: "360px", background: card.bg, borderColor: `${card.color}25` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                }}>
                
                {/* Dynamic Mouse Glow */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(400px circle at var(--x) var(--y), ${card.color}15, transparent 40%)` }} />
                
                {/* Static corner glow */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-10"
                  style={{ background: card.color, filter: "blur(40px)", transform: "translate(30%,-30%)" }} />
                
                <div className="relative z-10 text-4xl mb-5">{card.icon}</div>
                <div className="relative z-10 w-7 h-0.5 mb-4 rounded-full" style={{ background: card.color }} />
                <h3 className="relative z-10 font-syne font-extrabold text-xl text-white mb-4">{card.title}</h3>
                <ul className="relative z-10 space-y-2">
                  {card.lines.map((line) => (
                    <li key={line} className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: card.color }} />
                      {line}
                    </li>
                  ))}
                </ul>
                {/* Arrow button */}
                <div className="relative z-10 absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all group-hover:bg-opacity-30 group-hover:translate-x-1"
                  style={{ background: `${card.color}18`, color: card.color }}>
                  →
                </div>
              </div>
            );
          })}

          <div style={{ width: "10vw", flexShrink: 0 }} />
        </div>
      </div>

      {/* ═══════════════════ STATS ══════════════════════════════════ */}
      <section className="py-28 bg-[#f8f7f3] border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="pill reveal-up mb-4" style={{ margin: "0 auto 16px" }}>By the numbers</p>
            <h2 className="font-syne font-extrabold text-5xl text-slate-900 reveal-up">
              Trusted at <span className="grad">scale</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Teams worldwide", target: "2400", suffix: "+", icon: "🏢" },
              { label: "Tasks completed", target: "1200000", suffix: "+", icon: "✅" },
              { label: "Hours saved / month", target: "18000", suffix: "+", icon: "⚡" },
              { label: "Uptime SLA", target: "99.9", suffix: "%", icon: "🛡️" },
            ].map((s) => (
              <div key={s.label} className="reveal-up text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="font-syne font-extrabold text-4xl grad mb-1.5">
                  <span className="count-num" data-target={s.target}>0</span>{s.suffix}
                </div>
                <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIAL ════════════════════════════ */}
      <section className="py-36 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="reveal-up text-slate-400 text-xs tracking-[0.3em] uppercase font-bold mb-10">What teams say</p>
          <div className="reveal-up flex justify-center gap-1 mb-8">
            {Array(5).fill(0).map((_, i) => (
              <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <blockquote className="clip-reveal font-syne font-extrabold text-4xl md:text-5xl text-slate-900 leading-[1.15] mb-10">
            "Project Camp cut our sprint planning from{" "}
            <span style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              2 hours to 4 minutes.
            </span>
            {" "}It feels like cheating."
          </blockquote>
          <div className="reveal-up flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold font-syne"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>S</div>
            <div className="text-left">
              <div className="text-slate-800 font-semibold text-sm">Sarah Chen</div>
              <div className="text-slate-400 text-xs">Engineering Lead, Vercel</div>
            </div>
            <div className="ml-6 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-xs font-bold">▲ vercel</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ════════════════════════════════════ */}
      <section className="py-28 bg-[#f8f7f3]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="cta-box rounded-[2rem] p-14 md:p-20 text-center relative overflow-hidden border border-indigo-100/80"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #f5f0ff 100%)" }}>
            {/* Glow blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(#4f46e5,transparent 65%)", filter: "blur(50px)" }} />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-25 pointer-events-none"
              style={{ background: "radial-gradient(#0891b2,transparent 65%)", filter: "blur(50px)" }} />
            <div className="relative z-10">
              <p className="pill mb-6" style={{ margin: "0 auto 24px" }}>Start today</p>
              <h2 className="font-syne font-extrabold text-5xl md:text-6xl text-slate-900 mb-5 leading-[1.08]">
                Ready to build<br />
                <span className="grad">something remarkable?</span>
              </h2>
              <p className="text-slate-500 text-lg mb-10 font-light max-w-md mx-auto leading-relaxed">
                Free forever for up to 3 projects. No credit card. Cancel anytime.
              </p>
              <Link href="/auth"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)", boxShadow: "0 12px 40px rgba(79,70,229,0.4)" }}>
                Start building — it's free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <div className="mt-8 flex items-center justify-center gap-8 text-slate-400 text-sm">
                {["🔒 SOC 2 Type II","🇪🇺 GDPR Ready","⚡ 99.9% Uptime","💳 No credit card"].map((t) => (
                  <span key={t} className="font-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═════════════════════════════════ */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand col */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }} />
                <span className="font-syne font-bold text-slate-900">Project Camp</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mb-5 font-light">
                AI-powered project management for teams who move fast.
              </p>
              <div className="flex gap-3">
                {["𝕏","in","gh"].map((s) => (
                  <a key={s} href="#"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs font-bold transition-all">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            {/* Link cols */}
            {[
              { head: "Product", links: ["Features","Pricing","Changelog","Roadmap"] },
              { head: "Company", links: ["About","Blog","Careers","Press"] },
              { head: "Legal", links: ["Privacy","Terms","Security","GDPR"] },
            ].map((col) => (
              <div key={col.head}>
                <p className="font-syne font-bold text-slate-900 text-sm mb-4">{col.head}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-400 text-sm">© 2026 Project Camp · All rights reserved</p>
            <p className="text-slate-300 text-sm">Built for ambitious teams worldwide 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
