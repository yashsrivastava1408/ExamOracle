"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    Zap,
    Target,
    Layers,
    CheckCircle2,
    BookOpen,
    ChevronLeft,
    RefreshCw,
    AlertTriangle,
    Cpu,
    BrainCircuit,
    Radar,
    Gauge,
    FileText,
    History,
    ArrowUpRight,
    Share2,
    X,
    Activity,
    ShieldCheck,
    Globe,
    Sparkles
} from "lucide-react";
import NoteInput from "@/components/NoteInput";
import ExamOracle from "@/components/ExamOracle";
import Flashcards from "@/components/Flashcards";
import QuizSection from "@/components/QuizSection";
import Summary from "@/components/Summary";
import PrepSignals from "@/components/PrepSignals";
import FeatureOverview, { FeatureOverviewItem } from "@/components/FeatureOverview";
import SessionHistory, { SessionHistoryEntry } from "@/components/SessionHistory";
import { GeneratedContent } from "@/types";


type ActiveTab = "oracle" | "flashcards" | "quiz" | "summary";

const LAST_RESULT_KEY = "examprep_last_result";
const HISTORY_KEY = "examprep_history";
const MAX_HISTORY_ITEMS = 6;

export default function PrepPage() {
    const { scrollYProgress } = useScroll();
    const bgColor = useTransform(
        scrollYProgress,
        [0, 0.4, 0.8, 1],
        ["#03060c", "#03060c", "#07111d", "#0a0118"]
    );
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedContent | null>(null);
    const [lastNotes, setLastNotes] = useState("");
    const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
    const [retryCountdown, setRetryCountdown] = useState<number>(0);
    const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
    const noteInputRef = useRef<HTMLDivElement | null>(null);
    const resultPanelRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = async (notes: string) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setLastNotes(notes);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to generate exam prep");
            }

            setResult(data.data);
            setActiveTab(null);
            persistSession(data.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const persistSession = (data: GeneratedContent) => {
        const entry: SessionHistoryEntry = {
            id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}`,
            createdAt: new Date().toISOString(),
            data,
        };

        setHistory((current) => {
            const next = [entry, ...current].slice(0, MAX_HISTORY_ITEMS);
            return next;
        });
    };

    const handleClearResults = () => {
        setResult(null);
        setLastNotes("");
        setActiveTab(null);
    };

    useEffect(() => {
        if (result?.retryAfterSeconds && result.retryAfterSeconds > 0) {
            setRetryCountdown(result.retryAfterSeconds);
        }
    }, [result]);

    useEffect(() => {
        if (retryCountdown > 0) {
            const timer = setInterval(() => {
                setRetryCountdown((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [retryCountdown]);

    const restoreSession = (entry: SessionHistoryEntry) => {
        setResult(entry.data);
        setLastNotes("");
        setActiveTab(null);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const scrollToNoteInput = () => {
        noteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const openResultTab = (tab: ActiveTab) => {
        setActiveTab(tab);
        setTimeout(() => {
            resultPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { key: "oracle", label: "Exam Oracle", icon: <Target className="w-4 h-4" /> },
        { key: "flashcards", label: "Flashcards", icon: <Layers className="w-4 h-4" /> },
        { key: "quiz", label: "Quiz", icon: <CheckCircle2 className="w-4 h-4" /> },
        { key: "summary", label: "Summary", icon: <BookOpen className="w-4 h-4" /> },
    ];

    const leftPanelFeatures: FeatureOverviewItem[] = result
        ? [
            {
                key: "oracle",
                title: "Exam Oracle",
                description: "Open the ranked exam predictions and focus on the highest-probability prompts first.",
                value: `${result.examOracle.length} picks`,
                eyebrow: "Prediction Layer",
                icon: Radar,
                accentClass: "text-rose-300",
                onClick: () => openResultTab("oracle"),
            },
            {
                key: "flashcards",
                title: "Flashcards",
                description: "Review the generated recall deck for definitions, mechanisms, and key concepts.",
                value: `${result.flashcards.length} cards`,
                eyebrow: "Recall Layer",
                icon: Layers,
                accentClass: "text-indigo-300",
                onClick: () => openResultTab("flashcards"),
            },
            {
                key: "quiz",
                title: "MCQ Quiz",
                description: "Open the multiple-choice practice set with explanations.",
                value: `${result.mcqQuestions.length} probes`,
                eyebrow: "Assessment",
                icon: CheckCircle2,
                accentClass: "text-emerald-300",
                onClick: () => openResultTab("quiz"),
            },
            {
                key: "summary",
                title: "Summary",
                description: "Read the compressed overview, topic detection, and difficulty rating.",
                value: result.difficultyRating,
                eyebrow: "Compression",
                icon: FileText,
                accentClass: "text-amber-300",
                onClick: () => openResultTab("summary"),
            },
        ]
        : [
            {
                key: "oracle",
                title: "Oracle Engine",
                description: "Advanced probability analysis of note density to predict exam questions.",
                value: "Ready",
                eyebrow: "Core Unit",
                icon: Radar,
                accentClass: "text-rose-400",
                onClick: scrollToNoteInput,
            },
            {
                key: "analysis",
                title: "Semantic Scan",
                description: "Automatic extraction of formulas, dates, and critical entities.",
                value: "Standby",
                eyebrow: "Processing",
                icon: BrainCircuit,
                accentClass: "text-cyan-400",
                onClick: scrollToNoteInput,
            },
        ];

    return (
        <motion.div 
            style={{ backgroundColor: bgColor }}
            className="relative flex min-h-screen flex-col pt-16 font-sans text-white selection:bg-cyan-500/30 overflow-x-hidden"
        >
            {/* Global Grain Texture Overlay */}
            <div className="fixed inset-0 z-[99] pointer-events-none opacity-[0.035] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            {/* Neural Mesh Background Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none neural-mesh opacity-40" />

            {/* Navigation */}
            <nav className="fixed top-0 z-[60] h-16 w-full border-b border-white/[0.05] bg-[#03060c]/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-white/30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            <Zap className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.25em] text-white/90 glow-text-cyan">ExamOracle</span>
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        {result && (
                            <button
                                onClick={handleClearResults}
                                className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Initiate New Cycle
                            </button>
                        )}
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Engine: Online</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex w-full flex-1 flex-col px-4 py-12 sm:px-8 lg:px-12">
                
                {/* Loading State Overlay */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03060c]/95 p-6 backdrop-blur-3xl"
                        >
                            <div className="relative w-full max-w-md overflow-hidden rounded-[3rem] border border-white/10 bg-[#080c14] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                                    <Cpu className="w-48 h-48 animate-spin-slow" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-10 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                                        <BrainCircuit className="h-10 w-10 text-white animate-pulse" />
                                        <div className="absolute inset-0 rounded-[2rem] border border-white/20 opacity-30 animate-ping" />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-black tracking-tight text-white uppercase italic-none">Synthesizing Logic</h3>
                                    <p className="text-center text-[10px] font-black tracking-[0.3em] text-white/30 mb-10">Neural Construction in Progress</p>

                                    <div className="w-full space-y-4">
                                        <LoadingStep label="Parsing raw vectors" delay={0} />
                                        <LoadingStep label="Mapping concept clusters" delay={1500} />
                                        <LoadingStep label="Calibrating exam probability" delay={3000} />
                                        <LoadingStep label="Finalizing diagnostic kit" delay={4500} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live Neural Telemetry Bar */}
                <div className="mx-auto max-w-7xl px-8 mb-8">
                    <div className="flex items-center gap-6 overflow-hidden rounded-full border border-white/5 bg-white/[0.02] px-6 py-2 backdrop-blur-xl">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Global Status</span>
                        </div>
                        <div className="h-4 w-px bg-white/5" />
                        <div className="flex-1 overflow-hidden whitespace-nowrap">
                            <motion.div 
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="inline-flex gap-8 items-center"
                            >
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-8 items-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 flex items-center gap-2">
                                            <Globe className="h-3 w-3" /> {340 + i*12} Students Sharing Predictions
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 flex items-center gap-2">
                                            <Activity className="h-3 w-3" /> Neural Load: 12% Focused
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 flex items-center gap-2">
                                            <Radar className="h-3 w-3" /> New Intel Dropped in #DBMS
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[4rem] border border-white/5 glass-panel-overdrive px-10 py-24 lg:py-32 shadow-2xl backdrop-blur-3xl text-center mb-16 group"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none" />
                    
                    {/* Floating Neural Particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[1, 2, 3, 4, 5].map((p) => (
                            <motion.div
                                key={p}
                                animate={{
                                    y: [0, -40, 0],
                                    x: [0, p % 2 === 0 ? 20 : -20, 0],
                                    opacity: [0.1, 0.3, 0.1]
                                }}
                                transition={{
                                    duration: 8 + p,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute h-1 w-1 bg-white rounded-full"
                                style={{
                                    top: `${20 * p}%`,
                                    left: `${15 * p}%`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 mx-auto max-w-6xl flex flex-col items-center">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 group-hover:border-cyan-500/30 transition-all neon-border-cyan"
                        >
                            <Target className="h-4 w-4" />
                            Diagnostic Command Center
                        </motion.div>
                        <h1 className="mt-12 text-6xl font-black tracking-tighter sm:text-7xl lg:text-[7rem] text-white leading-[0.9] text-balance italic-none group-hover:scale-[1.01] transition-transform duration-700">
                            Study Smarter. <br />
                            <span className="text-white/20 font-light italic-none">Score More. Stress Less.</span>
                        </h1>
                        <p className="mt-12 text-2xl leading-relaxed text-white/40 text-balance max-w-4xl font-light tracking-tight italic-none">
                            Your Personal Study Sidekick. Turning messy notes into 
                            clear exam predictions and smart quiz kits in seconds.
                        </p>
                    </div>
                </motion.section>

                {/* 2-Column Command Grid (Refactored for Stability) */}
                <div className="mx-auto max-w-[1920px] w-full grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-10 lg:gap-14 items-start">
                    
                    {/* Left Sidebar: Engine Matrix */}
                    <aside className="hidden xl:flex flex-col gap-8 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-10 group">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative overflow-hidden rounded-[3rem] border border-white/5 glass-panel-overdrive p-10 backdrop-blur-3xl shadow-2xl transition-all hover:bg-white/[0.02]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                            
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30 transition-all">
                                    <Activity className="h-5 w-5 text-white/40 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Study Stats</h3>
                                    <span className="text-[10px] font-bold text-cyan-500/60 uppercase">System Ready</span>
                                </div>
                            </div>
                            
                            <FeatureOverview
                                heading="Study Tools"
                                subheading={result ? "Ready to Study" : "Mode: Idle"}
                                items={leftPanelFeatures}
                            />
                        </motion.div>

                        <div className="rounded-[2.5rem] border border-white/5 glass-panel-overdrive p-10 backdrop-blur-3xl relative overflow-hidden group/radar">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/radar:opacity-[0.05] transition-all">
                                <Radar className="w-32 h-32 text-cyan-400" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8 text-center italic-none">Scanning Notes</h3>
                            <div className="relative h-56 w-full overflow-hidden rounded-3xl border border-white/5 bg-[#03060c] shadow-inner flex items-center justify-center scanline">
                                <div className="absolute h-40 w-40 rounded-full border border-cyan-500/10" />
                                <div className="absolute h-24 w-24 rounded-full border border-cyan-500/20" />
                                <div className="origin-center h-24 w-0.5 bg-gradient-to-t from-transparent to-cyan-500 shadow-[0_0_20px_rgba(34,211,238,1)] absolute top-1/2 left-1/2 -translate-y-full animate-[spin_5s_linear_infinite]" />
                                <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] z-10">Searching...</div>
                            </div>
                        </div>
                    </aside>

                    {/* Central Work Zone */}
                    <div className="flex flex-col gap-10 w-full min-w-0">
                        <div ref={noteInputRef} className="w-full">
                            {!result && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-10 rounded-[3rem] border border-white/5 glass-panel-overdrive p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group neon-border-cyan"
                                >
                                    <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60">
                                            <Cpu className="w-4 h-4" />
                                            Study Feed
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight text-white leading-none">Upload Your Notes</h2>
                                        <p className="max-w-3xl text-xl leading-relaxed text-white/30 font-light italic-none">
                                            Drop your lecture notes or PDF textbooks here. 
                                            Our engine will process the text to predict your exam.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                            <NoteInput onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex w-full flex-col gap-10"
                            >
                                {/* Results Core Brief */}
                                <div className="relative overflow-hidden rounded-[3.5rem] border border-white/5 glass-panel-overdrive p-12 sm:p-16 shadow-2xl backdrop-blur-3xl group neon-border-indigo">
                                    <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
                                        <Sparkles className="w-64 h-64 text-indigo-400" />
                                    </div>
                                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                        <div className="max-w-2xl">
                                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                                <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Study Kit is Ready
                                                </div>
                                                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${result.isFallback ? 'border-amber-500/20 bg-amber-500/5 text-amber-500/60' : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-500/60'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${result.isFallback ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`} />
                                                    {result.isFallback ? 'Local Engine (Faster)' : 'Cloud AI (Premium)'}
                                                </div>
                                            </div>
                                            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-6 break-all">
                                                {result.topicName}
                                            </h2>
                                            <p className="text-xl text-white/30 font-light leading-relaxed italic-none">
                                                We've successfully processed your notes. Choose a study module below to start learning.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-4 shrink-0">
                                            <button
                                                onClick={handleClearResults}
                                                className="flex h-16 items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 transition-all hover:bg-white/10 hover:text-white"
                                            >
                                                <RefreshCw className="h-4 w-4" /> Start Over
                                            </button>

                                            {result.isFallback && (
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        disabled={retryCountdown > 0}
                                                        onClick={() => handleSubmit(lastNotes)}
                                                        className={`flex h-16 items-center justify-center gap-4 rounded-3xl border transition-all ${retryCountdown > 0 ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed' : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}
                                                    >
                                                        <BrainCircuit className={`h-4 w-4 ${retryCountdown > 0 ? 'opacity-20' : 'animate-pulse'}`} />
                                                        {retryCountdown > 0 ? `Wait ${retryCountdown}s for Cloud AI` : "Retry Cloud Engine"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <PrepSignals notes={lastNotes} result={result} />

                                {/* Interactive Tabs Navigation */}
                                <div className="flex gap-3 overflow-x-auto no-scrollbar rounded-3xl border border-white/5 bg-white/[0.02] p-2.5 backdrop-blur-3xl shadow-2xl">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => openResultTab(tab.key)}
                                            className={`relative flex min-w-[160px] flex-1 items-center justify-center gap-3 rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.key ? "text-white" : "text-white/30 hover:text-white/60"}`}
                                        >
                                            {activeTab === tab.key && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 shadow-inner"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center gap-3">
                                                {tab.icon} {tab.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Active Component Rendering Area */}
                                <motion.div
                                    ref={resultPanelRef}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative rounded-[4rem] border border-white/5 bg-gradient-to-b from-white/[0.015] to-transparent p-8 sm:p-14 backdrop-blur-3xl shadow-2xl min-h-[600px] overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-20 opacity-[0.01] pointer-events-none">
                                        <Cpu className="w-80 h-80" />
                                    </div>

                                    {!activeTab && (
                                        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01] p-12 text-center group/empty">
                                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 border border-white/10 group-hover/empty:scale-110 transition-transform duration-700">
                                                <Activity className="w-10 h-10 text-white/20" />
                                            </div>
                                            <h3 className="text-3xl font-black text-white/90 uppercase italic-none mb-4">Study Kit Ready</h3>
                                            <p className="max-w-md text-xl text-white/30 font-light leading-relaxed">
                                                The diagnostic kit is prepared. Select an interface module from the navigation matrix above to begin review.
                                            </p>
                                        </div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {activeTab === "oracle" && <ExamOracle key="oracle" questions={result.examOracle} />}
                                        {activeTab === "flashcards" && <Flashcards key="flashcards" flashcards={result.flashcards} />}
                                        {activeTab === "quiz" && <QuizSection key="quiz" questions={result.mcqQuestions} />}
                                        {activeTab === "summary" && (
                                            <Summary
                                                key="summary"
                                                summary={result.summary}
                                                keyTakeaways={result.keyTakeaways}
                                                mistakeTraps={result.mistakeTraps}
                                                mustMemorizeFacts={result.mustMemorizeFacts}
                                                summaryBlocks={result.summaryBlocks}
                                                rapidRevision={result.rapidRevision}
                                                difficultyRating={result.difficultyRating}
                                                topicName={result.topicName}
                                                totalQuestions={result.examOracle.length}
                                                totalFlashcards={result.flashcards.length}
                                                totalMCQs={result.mcqQuestions.length}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Relocated Neural Archive (Wider format for stability) */}
                        <div className="mt-20">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex-1 rounded-[3.5rem] border border-white/5 glass-panel-overdrive p-12 backdrop-blur-3xl shadow-2xl transition-all hover:bg-white/[0.02] group"
                                >
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-2xl font-black text-white/90 uppercase tracking-tight">Saved Modules</h3>
                                            <p className="text-sm text-white/30 font-light max-w-sm italic-none">Persistent local snapshots of your previous study sessions.</p>
                                        </div>
                                        <button 
                                            onClick={clearHistory}
                                            className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                        >
                                            <X className="h-3.5 w-3.5" /> Clear History
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <SessionHistory
                                            entries={history}
                                            onRestore={restoreSession}
                                            onClear={clearHistory}
                                        />
                                    </div>
                                </motion.div>

                                <div className="w-full lg:w-[320px] shrink-0 rounded-[3.5rem] border border-emerald-500/10 bg-emerald-500/[0.02] p-12 backdrop-blur-3xl shadow-xl relative overflow-hidden group/status">
                                     <div className="absolute top-0 left-0 w-1 p-8 opacity-[0.02] group-hover/status:opacity-[0.05] transition-all">
                                        <ShieldCheck className="w-48 h-48 text-emerald-400" />
                                     </div>
                                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50 mb-12 text-center italic-none">Security Matrix</h3>
                                     <div className="space-y-12">
                                        <div>
                                            <div className="flex justify-between text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
                                                <span>Matrix Load</span>
                                                <span className="text-emerald-400">Stable</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner scanline">
                                                <div className="h-full w-full bg-gradient-to-r from-emerald-500/40 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
                                                <span>Logic Flow</span>
                                                <span className="text-emerald-400">Verifed</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner scanline">
                                                <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500/40 to-emerald-400" />
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>



            {/* Footer / Legal Bottom Space */}
            <footer className="mt-20 py-12 border-t border-white/5 bg-[#03060c]">
                <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                        <Zap className="h-4 w-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Oracle Engine v2.0.4 r.01</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 cursor-default">
                        &copy; 2026 Neural Precision Academic Systems
                    </div>
                </div>
            </footer>
        </motion.div>
    );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setActive(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-700 ${active ? "border-white/[0.08] bg-white/[0.02]" : "border-transparent"}`}
        >
            <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all duration-1000 ${active ? "border-emerald-500/50 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "border-white/10"}`}
            >
                {active ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10 animate-pulse" />
                )}
            </div>
            <span
                className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${active ? "text-white/90" : "text-white/20"}`}
            >
                {label}
            </span>
        </div>
    );
}
