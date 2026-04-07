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
  BookOpen
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 overflow-hidden relative" ref={containerRef}>
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner pt-0.5">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ExamOracle</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/community" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Community
            </Link>
            <Link href="/whisper" className="text-sm font-semibold text-fuchsia-400/90 hover:text-fuchsia-300 transition-colors">
              The Whisper Network
            </Link>
            <Link href="/prep" className="group flex items-center gap-2 h-9 px-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Start Prepping
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
            style={{ y: y1, opacity: opacity1 }}
            variants={STAGGER_CHILDREN}
            initial="hidden"
            animate={splashFinished ? "show" : "hidden"}
            className="relative z-10 mx-auto -mt-12 grid w-full max-w-[90rem] items-center gap-8 lg:-mt-20 lg:grid-cols-[1.2fr_0.8fr]"
          >
            {/* Left side text */}
            <div className="w-full max-w-3xl text-center lg:text-left">
              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-black/45 px-4 py-2 text-[11px] font-semibold tracking-[0.24em] text-cyan-300 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100% FREE • NO SIGN UP REQUIRED</span>
              </motion.div>

              <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="font-display mt-7 text-[3.5rem] font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.5rem]">
                Stop guessing.
                <span className="block bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent mt-2">
                  Score with precision.
                </span>
              </motion.h1>

              <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="mt-8 max-w-xl text-lg leading-relaxed text-white/70 mx-auto lg:mx-0">
                ExamOracle turns raw lecture notes into ranked predictions, flashcards, quizzes, and summaries. Don&apos;t just study hard, study smart.
              </motion.p>

              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-10 flex flex-col items-center justify-center lg:justify-start gap-4 sm:flex-row">
                <Link href="/prep" className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-8 text-[15px] font-semibold text-black transition-all hover:scale-[1.04] active:scale-[0.98] shadow-[0_20px_50px_rgba(255,255,255,0.18)]">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#how" className="flex h-14 w-full sm:w-auto items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 text-[15px] font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/10">
                  View Features
                </a>
              </motion.div>

              <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-12 flex flex-col gap-6 text-center lg:text-left sm:flex-row sm:items-center sm:gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-3 justify-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-md">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/35 to-cyan-300/10" />
                    </div>
                  ))}
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-medium tracking-tight text-white/90">Trusted by 10,000+ top students</div>
                  <div className="text-sm text-white/55">Cleaner workflow. Higher confidence.</div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="relative mx-auto w-full lg:mx-0 mt-20 lg:-mt-32 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] flex items-center justify-center scale-100 lg:scale-[1.3] lg:translate-x-0 -translate-y-12 lg:-translate-y-16 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="ExamOracle Logo"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Value Prop Section */}
        <section id="how" className="py-32 relative border-t border-white/[0.05] bg-black/40 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                x: [-20, 50, -20],
                y: [-20, -50, -20],
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.45, 0.15]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-0 w-[40rem] h-[40rem] bg-rose-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                x: [20, -60, 20],
                y: [20, 60, 20],
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.4, 0.15]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 -right-10 w-[45rem] h-[45rem] bg-amber-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-emerald-500/15 rounded-full blur-[120px]"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Stop guessing what&apos;s on the exam.</h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto font-light leading-relaxed mb-4">
                &ldquo;I have all these notes, but I don&apos;t know what actually matters.&rdquo;
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {[
                {
                  icon: <Clock className="w-6 h-6 text-rose-400" />,
                  title: "Manual Prep Is Dead",
                  desc: "Hours making flashcards and summaries is wasted time. Your time is for learning, not formatting.",
                  glow: "group-hover:shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                },
                {
                  icon: <BrainCircuit className="w-6 h-6 text-amber-400" />,
                  title: "Dumb Tools Don't Work",
                  desc: "Current platforms require manual input or spit out random, unweighted questions without context.",
                  glow: "group-hover:shadow-[0_0_40px_rgba(251,191,36,0.1)]"
                },
                {
                  icon: <Target className="w-6 h-6 text-emerald-400" />,
                  title: "Precision Prediction",
                  desc: "We analyze lecture structure, weighting, and repetition to mathematically predict the exam.",
                  glow: "group-hover:shadow-[0_0_40px_rgba(52,211,153,0.1)]"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative p-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.04] ${item.glow}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-6 shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Oracle Feature Showcase */}
        <section className="py-32 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 40, 0],
                y: [0, -40, 0],
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.45, 0.15]
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-20 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                x: [0, -50, 0],
                y: [0, 50, 0],
                scale: [1, 1.4, 1],
                opacity: [0.15, 0.4, 0.15]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 -right-20 w-[45rem] h-[45rem] bg-cyan-500/20 rounded-full blur-[100px]"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="flex-1"
              >
                <div className="inline-flex items-center gap-2 py-1 px-3 mb-6 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-[10px] font-bold tracking-[0.2em] text-indigo-300">
                  <Sparkles className="w-3 h-3" /> HERO FEATURE
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">The Exam Oracle.</h2>
                <p className="text-lg text-white/50 leading-relaxed font-light mb-10">
                  We built an intelligence engine that doesn&apos;t just summarize—it predicts. By mapping concept complexity and topic recurrence, it surfaces exactly what your professor plans to test.
                </p>

                <div className="space-y-6">
                  {[
                    "Copy your messy lecture notes",
                    "Advanced analysis identifies patterns",
                    "Receive probability-ranked questions"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-sm font-medium text-white/70">
                        {i + 1}
                      </div>
                      <span className="text-base font-medium text-white/80">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="flex-1 w-full"
              >
                <div className="rounded-[2rem] border border-white/[0.08] bg-black/60 backdrop-blur-2xl p-2 shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Faux Window Header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                    <div className="text-[10px] uppercase font-semibold text-white/30 ml-4 tracking-wider">Exam Oracle Analysis Window</div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { q: "Explain the stages of Mitosis", prob: "HIGH", color: "rose" },
                        { q: "Compare Mitosis vs Meiosis", prob: "HIGH", color: "rose" },
                        { q: "Function of chromosomes", prob: "MEDIUM", color: "amber" },
                        { q: "Cell theory history", prob: "LOW", color: "emerald" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                          <span className="text-sm font-medium text-white/90 truncate mr-4">{item.q}</span>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20`}>
                            {item.prob} PROBABILITY
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-32 relative border-t border-white/[0.05] bg-white/[0.01] overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                x: [-30, 30, -30],
                y: [-30, 30, -30],
                scale: [1, 1.25, 1],
                opacity: [0.15, 0.35, 0.15]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-0 w-[45rem] h-[45rem] bg-purple-500/15 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                x: [30, -30, 30],
                y: [30, -30, 30],
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.4, 0.15]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-0 w-[50rem] h-[50rem] bg-pink-500/15 rounded-full blur-[120px]"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">A complete study suite. In one click.</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Target />, title: "Exam Oracle", desc: "Predicted questions mapped by probability." },
                { icon: <Layers />, title: "Smart Flashcards", desc: "Front-back active recall cards, zero manual creation." },
                { icon: <CheckCircle2 />, title: "Instant Quiz", desc: "MCQ tests generated and scored instantly." },
                { icon: <BookOpen />, title: "Distilled Summaries", desc: "Fluff removed. Only the core concepts remain." },
                { icon: <BrainCircuit />, title: "Difficulty Mapping", desc: "AI gauges how tough the material actually is." },
                { icon: <Sparkles />, title: "Auto-Save", desc: "Close the tab. Your session stays locally saved." },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="p-8 rounded-3xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 text-white/70">
                    <div className="scale-[0.8]">{f.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight text-white/90">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-light">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.15, 0.5, 0.15]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-blue-500/20 rounded-full blur-[120px]"
            />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-[3rem] p-12 md:p-20 text-center border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30"></div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Stop studying hard.<br />Start studying smart.</h2>
              <p className="text-lg text-white/40 mb-10 max-w-lg mx-auto font-light">It takes exactly 10 seconds to discover what your professor is going to ask you.</p>

              <Link href="/prep" className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white text-black text-[15px] font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                Launch App
                <ChevronRight className="w-4 h-4" />
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
    </div>
  );
}
