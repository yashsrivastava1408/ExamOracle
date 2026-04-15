"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  ChevronRight,
  BookOpen,
  VenetianMask
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import DashboardCommunityFeed from "@/components/DashboardCommunityFeed";
import DashboardWhisperFeed from "@/components/DashboardWhisperFeed";

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const STAGGER_CHILDREN = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function ScrollSection({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ scale, opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const revealHero = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setSplashFinished(true);
    };

    if (typeof window !== "undefined" && sessionStorage.getItem("splash_seen") === "true") {
      revealHero();
    }
    const handleSplashComplete = () => revealHero();
    window.addEventListener("splashComplete", handleSplashComplete);
    return () => window.removeEventListener("splashComplete", handleSplashComplete);
  }, []);

  const { scrollYProgress: pageScrollProgress } = useScroll();
  const bgColor = useTransform(
    pageScrollProgress,
    [0, 0.4, 0.7, 1],
    ["#000000", "#000000", "#07111d", "#0a0118"]
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }}
      className="min-h-screen text-white selection:bg-white/20 overflow-x-hidden relative" 
      ref={containerRef}
    >
      {/* Abstract Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', backgroundRepeat: "repeat", mixBlendMode: "overlay" }}></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={splashFinished ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner pt-0.5">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base md:text-lg font-black tracking-tight uppercase">ExamOracle</span>
            <div className="hidden xs:block px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 tracking-widest uppercase">V2.1</div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/community" className="hidden sm:block text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Community
            </Link>
            <Link href="/whisper" className="hidden sm:block text-sm font-semibold text-fuchsia-400/90 hover:text-fuchsia-300 transition-colors">
              Whisper
            </Link>
            <Link href="/prep" className="group flex items-center gap-2 h-9 px-4 rounded-full bg-white text-black text-xs md:text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Start
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 pt-20 lg:pt-32">
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-16 lg:pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "120px 120px" }} />
          </div>

          <motion.div
            style={{ y: y1, opacity: opacity1, scale: scale1 }}
            variants={STAGGER_CHILDREN}
            initial="hidden"
            animate={splashFinished ? "show" : "hidden"}
            className="relative z-10 mx-auto -mt-12 grid w-full max-w-[90rem] items-center gap-8 lg:-mt-20 lg:grid-cols-[1.2fr_0.8fr]"
          >
            {/* Left side text */}
            <div className="w-full max-w-3xl text-center lg:text-left">
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="inline-flex items-center gap-4 rounded-full border border-cyan-400/20 bg-black/45 px-4 py-2 text-[11px] font-black tracking-[0.3em] text-cyan-300 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>100% FREE • NO SIGN UP REQUIRED</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/40">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="tracking-[0.15em]">340+ SIGNALS DETECTED</span>
                </div>
              </motion.div>

              <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="font-display mt-8 text-[2.75rem] font-black leading-[1.0] tracking-tighter text-white sm:text-7xl lg:text-[6.5rem]">
                Study Smarter. <br />
                <span className="block bg-gradient-to-r from-white via-cyan-200 to-indigo-400 bg-clip-text text-transparent mt-2">
                  Score More.
                </span>
              </motion.h1>

              <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-white/40 mx-auto lg:mx-0 font-light italic-none px-4 md:px-0">
                No Stress. Just Results. Turn your messy notes into 
                clear exam predictions, smart flashcards, and practice quizzes in seconds.
              </motion.p>

              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-12 flex flex-col items-center justify-center lg:justify-start gap-4 sm:flex-row">
                <Link href="/prep" className="group flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-white px-10 text-[15px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.04] active:scale-[0.98] shadow-[0_20px_50px_rgba(255,255,255,0.18)]">
                  Start for free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="flex h-14 w-full sm:w-auto items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-10 text-[15px] font-bold uppercase tracking-widest text-white backdrop-blur-xl transition-colors hover:bg-white/10">
                  View Features
                </a>
              </motion.div>

              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-16 flex flex-col gap-6 text-center lg:text-left sm:flex-row sm:items-center sm:gap-10 justify-center lg:justify-start px-2 md:px-0">
                <div className="flex -space-x-3 md:-space-x-4 justify-center scale-90 md:scale-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-black bg-zinc-900 shadow-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-black flex items-center justify-center">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white/20" />
                        </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-0.5 md:gap-1">
                  <div className="text-[11px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-widest text-white/90">Trusted by 10,000+ top students</div>
                  <div className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 truncate">Cleaner workflow. Higher confidence.</div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="relative mx-auto w-full lg:mx-0 mt-20 lg:-mt-24 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[550px] flex items-center justify-center scale-100 lg:scale-[1.1] lg:translate-x-12 -translate-y-8 pointer-events-none">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="ExamOracle Logo"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter brightness-110"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>        <ScrollSection id="features">
        <section className="py-32 relative border-t border-white/[0.05] bg-black/60 overflow-hidden">
          {/* Neural Transitions */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
             <motion.div
               animate={{
                 x: [-40, 60, -40],
                 y: [-40, -80, -40],
                 opacity: [0.1, 0.3, 0.1]
               }}
               transition={{ duration: 20, repeat: Infinity }}
               className="absolute top-1/4 left-1/4 w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[120px]"
             />
             <motion.div
               animate={{
                 x: [40, -60, 40],
                 y: [40, 80, 40],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 25, repeat: Infinity }}
               className="absolute bottom-1/4 right-1/4 w-[60rem] h-[60rem] bg-rose-600/10 rounded-full blur-[140px]"
             />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            {/* The Problem (Manual Prep is Dead) + Pricing Integration */}
            <div className="mb-20 md:mb-32">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
                <div className="text-center lg:text-left">
                   <div className="inline-flex items-center gap-2 py-1 px-3 md:py-1.5 md:px-4 mb-6 md:mb-8 rounded-full border border-rose-500/30 bg-rose-500/10 text-[9px] md:text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase">
                     Manual Prep Is Dead
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8 uppercase leading-[0.9]">Efficiency is NOT <br /><span className="text-white/20">A Choice.</span></h2>
                   <p className="text-lg md:text-xl text-white/30 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed italic-none mb-10 md:mb-0">
                      Stop spending hours on formatting. Start spending minutes on mastering. Your time is for learning, not mechanical drudgery.
                   </p>
                </div>

                <div className="relative group max-w-md mx-auto lg:max-w-none w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 rounded-[2.5rem] md:rounded-[3rem] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-[2.5rem] md:rounded-[3rem] border border-white/[0.08] bg-black p-8 md:p-12 text-center backdrop-blur-xl hover:border-white/20 transition-all duration-700">
                        <div className="inline-flex items-center gap-2 py-1 px-3 mb-6 md:mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] font-black tracking-[0.4em] text-indigo-400 uppercase">
                            Most Popular
                        </div>
                        
                        <div className="mb-8 md:mb-10">
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase mb-1">Student Zero</h3>
                            <div className="flex items-end justify-center gap-1 font-black">
                                <span className="text-3xl md:text-5xl text-white tracking-tighter">$0</span>
                                <span className="text-[10px] md:text-sm text-white/30 pb-1 md:pb-1.5">/ LIFETIME</span>
                            </div>
                        </div>

                        <div className="space-y-5 md:space-y-6 text-left mb-10 md:mb-12">
                            {[
                                { label: "Edge Inference", sub: "Local processing power.", icon: <BrainCircuit className="w-4 h-4" /> },
                                { label: "Whisper Network", sub: "Full clandestine intel.", icon: <VenetianMask className="w-4 h-4" /> },
                                { label: "Infinite Kits", sub: "No study limitations.", icon: <Zap className="w-4 h-4" /> },
                            ].map((perk, i) => (
                                <div key={i} className="flex items-center gap-4 md:gap-5 group/perk">
                                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover/perk:text-indigo-400 group-hover/perk:border-indigo-500/30 transition-all">
                                        {perk.icon}
                                    </div>
                                    <div>
                                        <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/80 group-hover/perk:text-white transition-colors">{perk.label}</div>
                                        <div className="text-[8px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest">{perk.sub}</div>
                                    </div>
                                    <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500/40 group-hover/perk:text-emerald-500 transition-colors" />
                                </div>
                            ))}
                        </div>

                        <Link href="/prep" className="flex items-center justify-center gap-2 w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-white text-black text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            Claim Access
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
              </div>

              <div className="mt-20 md:mt-32 grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Clock className="w-6 h-6 text-rose-400 transition-transform group-hover:scale-110" />,
                    title: "Dead End Cycles",
                    desc: "Hours making flashcards and summaries is wasted time. Your time is for learning, not formatting.",
                  },
                  {
                    icon: <BrainCircuit className="w-6 h-6 text-amber-400 transition-transform group-hover:scale-110" />,
                    title: "Dumb Content",
                    desc: "Current platforms require manual input or spit out random, unweighted questions without any logical context.",
                  },
                  {
                    icon: <Target className="w-6 h-6 text-emerald-400 transition-transform group-hover:scale-110" />,
                    title: "Precision Deficit",
                    desc: "Without analysis of lecture patterns and repetition, you're guessing what to study. We ensure you hit the mark.",
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group relative p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black border border-white/[0.08] flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                      {item.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-3 md:mb-4 text-white/90">{item.title}</h3>
                    <p className="text-white/40 text-xs md:text-sm leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The Solution (The Study Hub) */}
            <div className="pt-20 md:pt-24 border-t border-white/[0.05]">
              <div className="flex flex-col lg:flex-row gap-16 md:gap-20 items-center">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 py-1 px-3 md:py-1.5 md:px-4 mb-6 md:mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] md:text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
                    <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" /> Hero Feature
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 uppercase leading-[0.85]">The Study <br /><span className="text-white/20">Engine.</span></h2>
                  <p className="text-lg md:text-xl text-white/40 leading-relaxed font-light mb-8 md:mb-12 italic-none px-4 lg:px-0">
                    We built a study engine that doesn&apos;t just summarize—it predicts. By mapping concept complexity and topic recurrence, it surfaces exactly what your syllabus plans to test.
                  </p>

                  <div className="space-y-6 md:space-y-8 max-w-lg mx-auto lg:mx-0 text-left px-4 lg:px-0">
                    {[
                      "Copy your messy lecture notes",
                      "Advanced analysis identifies patterns",
                      "Receive probability-ranked questions"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-6 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs md:text-sm font-black text-white/40 transition-all group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 group-hover:text-indigo-400">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <span className="text-base md:text-lg font-bold text-white/80 uppercase tracking-tight italic-none transition-colors group-hover:text-white">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full max-w-2xl lg:max-w-none">
                  <div className="rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.08] bg-[#03060c] p-1 md:p-1.5 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                    {/* Window Controls */}
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/[0.05] bg-white/[0.01]">
                        <div className="flex gap-1.5 md:gap-2">
                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#ff5f56]"></div>
                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#ffbd2e]"></div>
                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="text-[8px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] md:tracking-[0.4em]">Oracle Analysis v4.0</div>
                        <div className="w-8 md:w-10"></div>
                    </div>

                    <div className="p-4 md:p-8 space-y-4 md:space-y-5">
                      {[
                        { q: "Stages of Mitosis Analysis", prob: "CRITICAL", color: "rose", engine: "CLOUD" },
                        { q: "Mitosis vs Meiosis Complexity", prob: "ELEVATED", color: "amber", engine: "CLOUD" },
                        { q: "Chromosomal Integrity", prob: "NOTABLE", color: "emerald", engine: "EDGE" },
                        { q: "Cell Theory Evolution", prob: "NORMAL", color: "zinc", engine: "EDGE" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] transition-all group/item">
                          <div className="flex flex-col gap-1 md:gap-2">
                            <span className="text-[11px] md:text-sm font-black text-white/80 uppercase tracking-tight group-hover/item:text-white transition-colors">{item.q}</span>
                            <div className="flex items-center gap-2 md:gap-3">
                                <span className="h-0.5 md:h-1 w-0.5 md:w-1 rounded-full bg-white/20"></span>
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-white/20">{item.engine} ENGINE VERIFIED</span>
                            </div>
                          </div>
                          <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full border text-[7px] md:text-[9px] font-black uppercase tracking-widest ${item.color === 'rose' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : item.color === 'amber' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : item.color === 'emerald' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10'}`}>
                            {item.prob}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </ScrollSection>

        {/* Neural Shift Divider */}
        <div className="mx-auto max-w-7xl px-8 my-24 relative z-10">
            <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400/50">Neural Shift</div>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            </div>
        </div>

        {/* Dashboard Sections Integrated into Landing */}
        <ScrollSection>
            <DashboardCommunityFeed />
        </ScrollSection>

        {/* Whisper Underground Divider */}
        <div className="mx-auto max-w-7xl px-8 my-16 relative z-10">
            <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
                <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-fuchsia-400/50">Internal Access</div>
                    <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-[pulse_2s_infinite]" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
            </div>
        </div>

        <ScrollSection>
            <DashboardWhisperFeed />
        </ScrollSection>

        {/* Feature Grid */}
        <ScrollSection>
        <section className="py-20 md:py-32 relative border-t border-white/[0.05] bg-[#03060c] overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                x: [-30, 30, -30],
                y: [-30, 30, -30],
                scale: [1, 1.25, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-0 w-[45rem] h-[45rem] bg-purple-500/10 rounded-full blur-[120px]"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24">
               <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4 md:mb-6">Modular Engine</div>
               <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none">A complete study suite. <br /><span className="text-white/20 text-2xl md:text-5xl">In one click.</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: <Target className="w-5 h-5" />, title: "Study Hub", desc: "Predicted topics mapped by how likely they are to appear.", color: "rose" },
                { icon: <Layers className="w-5 h-5" />, title: "Smart Flashcards", desc: "Active recall cards generated instantly from your notes.", color: "violet" },
                { icon: <CheckCircle2 className="w-5 h-5" />, title: "Practice Quizzes", desc: "MCQ tests generated and scored instantly locally or in cloud.", color: "emerald" },
                { icon: <BookOpen className="w-5 h-5" />, title: "Smart Summaries", desc: "No fluff. Only the core concepts and logic blocks stay.", color: "cyan" },
                { icon: <BrainCircuit className="w-5 h-5" />, title: "Readiness Signals", desc: "AI gauges your study aura and provides a rescue plan.", color: "amber" },
                { icon: <Sparkles className="w-5 h-5" />, title: "Saved Kits", desc: "Close the tab. Your study kits stay locally saved.", color: "indigo" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black border border-white/[0.06] flex items-center justify-center mb-4 md:mb-6 text-white/40 group-hover:text-white transition-colors`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-2 md:mb-3 text-white/80 group-hover:text-white transition-colors">{f.title}</h3>
                  <p className="text-xs md:text-sm text-white/30 leading-relaxed font-medium group-hover:text-white/50 transition-colors uppercase italic-none text-[10px] md:text-[12px]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </ScrollSection>

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.15, 0.5, 0.15]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] bg-blue-500/20 rounded-full blur-[100px] md:blur-[120px]"
            />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-20 text-center border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30"></div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 uppercase">Ready to score more?</h2>
              <p className="text-base md:text-lg text-white/40 mb-8 md:mb-10 max-w-lg mx-auto font-light italic-none px-4 md:px-0">It takes exactly 10 seconds to transform your notes. Join the top 1% of students today.</p>

              <Link href="/prep" className="inline-flex items-center justify-center gap-2 h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-white text-black text-sm md:text-[15px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                Start Prepping Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-white/[0.05] bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center py-12 gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-tight">ExamOracle</span>
            </div>
            <p className="text-xs text-white/30 tracking-wider">BUILT FOR STUDENTS, BY STUDENTS. © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </main>
    </motion.div>
  );
}
