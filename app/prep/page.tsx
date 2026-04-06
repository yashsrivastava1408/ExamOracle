"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedContent | null>(null);
    const [lastNotes, setLastNotes] = useState("");
    const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
    const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
    const noteInputRef = useRef<HTMLDivElement | null>(null);
    const resultPanelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Disabled auto-hydration of cached results to prevent data leaking
        // on shared college laptops during Pilot Phase
        /*
        try {
            const savedResult = localStorage.getItem(LAST_RESULT_KEY);
            if (savedResult) {
                setResult(JSON.parse(savedResult));
            }
        } catch {
            // Ignore invalid cached result
        }

        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch {
            // Ignore invalid history
        }
        */
    }, []);

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
        // Disabled auto-persistence for Pilot Phase security
        // localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(data));

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
            // Disabled complete history array save for Pilot Phase security 
            // localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleClearResults = () => {
        setResult(null);
        setLastNotes("");
        localStorage.removeItem(LAST_RESULT_KEY);
    };

    const restoreSession = (entry: SessionHistoryEntry) => {
        setResult(entry.data);
        setLastNotes("");
        setActiveTab(null);
        localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(entry.data));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    const scrollToNoteInput = () => {
        noteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const openResultTab = (tab: ActiveTab) => {
        setActiveTab(tab);
        requestAnimationFrame(() => {
            resultPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { key: "oracle", label: "Exam Oracle", icon: <Target className="w-4 h-4" /> },
        { key: "flashcards", label: "Flashcards", icon: <Layers className="w-4 h-4" /> },
        { key: "quiz", label: "Quiz", icon: <CheckCircle2 className="w-4 h-4" /> },
        { key: "summary", label: "Summary", icon: <BookOpen className="w-4 h-4" /> },
    ];

    const preGenerationFeatures: FeatureOverviewItem[] = [
        {
            key: "oracle",
            title: "Exam Oracle",
            description: "Probability-ranked predictions for the exact questions most likely to appear.",
            value: "8-12 ranked picks",
            eyebrow: "Hero Feature",
            icon: Radar,
            accentClass: "text-rose-300",
            onClick: scrollToNoteInput,
        },
        {
            key: "flashcards",
            title: "Flashcards",
            description: "Auto-built recall cards from the concepts, definitions, and distinctions inside your notes.",
            value: "10-15 cards",
            eyebrow: "Recall Layer",
            icon: Layers,
            accentClass: "text-indigo-300",
            onClick: scrollToNoteInput,
        },
        {
            key: "quiz",
            title: "MCQ Quiz",
            description: "Generated multiple-choice questions with explanations so the notes turn into practice instantly.",
            value: "8-10 questions",
            eyebrow: "Assessment",
            icon: CheckCircle2,
            accentClass: "text-emerald-300",
            onClick: scrollToNoteInput,
        },
        {
            key: "summary",
            title: "Summary",
            description: "A condensed brief of the full note set so the topic becomes easy to scan before revision.",
            value: "150-300 words",
            eyebrow: "Compression",
            icon: FileText,
            accentClass: "text-amber-300",
            onClick: scrollToNoteInput,
        },
        {
            key: "topic",
            title: "Topic Detection",
            description: "The engine identifies the main subject automatically so the output stays organized.",
            value: "Auto-labeled",
            eyebrow: "Context",
            icon: BrainCircuit,
            accentClass: "text-cyan-300",
            onClick: scrollToNoteInput,
        },
        {
            key: "difficulty",
            title: "Difficulty Rating",
            description: "Each run includes an overall complexity signal to help the student judge revision depth.",
            value: "Easy / Medium / Hard",
            eyebrow: "Calibration",
            icon: Gauge,
            accentClass: "text-fuchsia-300",
            onClick: scrollToNoteInput,
        },
    ];

    const leftPanelFeatures: FeatureOverviewItem[] = result
        ? [
            {
                key: "oracle",
                title: "Exam Oracle",
                description: "Open the ranked exam predictions and focus on the highest-probability prompts first.",
                value: `${result.examOracle.length} predictions`,
                eyebrow: "Prediction Layer",
                icon: Radar,
                accentClass: "text-rose-300",
                onClick: () => openResultTab("oracle"),
            },
            {
                key: "flashcards",
                title: "Flashcards",
                description: "Review the generated recall deck for definitions, mechanisms, and key concepts.",
                value: `${result.flashcards.length} flashcards`,
                eyebrow: "Recall Layer",
                icon: Layers,
                accentClass: "text-indigo-300",
                onClick: () => openResultTab("flashcards"),
            },
            {
                key: "quiz",
                title: "MCQ Quiz",
                description: "Open the multiple-choice practice set with explanations.",
                value: `${result.mcqQuestions.length} questions`,
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
        : preGenerationFeatures;

    const resultFeatures: FeatureOverviewItem[] = result
        ? [
            {
                key: "oracle",
                title: "Exam Oracle",
                description: "Open the ranked exam predictions and focus on the highest-probability prompts first.",
                value: `${result.examOracle.length} predictions`,
                eyebrow: "Prediction Layer",
                icon: Radar,
                accentClass: "text-rose-300",
                onClick: () => openResultTab("oracle"),
            },
            {
                key: "flashcards",
                title: "Flashcards",
                description: "Switch to the card deck to review definitions, mechanisms, and concept links.",
                value: `${result.flashcards.length} flashcards`,
                eyebrow: "Recall Layer",
                icon: Layers,
                accentClass: "text-indigo-300",
                onClick: () => openResultTab("flashcards"),
            },
            {
                key: "quiz",
                title: "MCQ Quiz",
                description: "Open the quiz to practice generated multiple-choice questions with explanations.",
                value: `${result.mcqQuestions.length} questions`,
                eyebrow: "Assessment",
                icon: CheckCircle2,
                accentClass: "text-emerald-300",
                onClick: () => openResultTab("quiz"),
            },
            {
                key: "summary",
                title: "Summary",
                description: "Read the compressed topic brief and asset totals in the summary panel.",
                value: `${result.summary.split(/\s+/).filter(Boolean).length} words`,
                eyebrow: "Compression",
                icon: FileText,
                accentClass: "text-amber-300",
                onClick: () => openResultTab("summary"),
            },
            {
                key: "topic",
                title: "Topic Name",
                description: "The detected topic anchors the entire run and keeps the output tightly scoped.",
                value: result.topicName,
                eyebrow: "Context",
                icon: BrainCircuit,
                accentClass: "text-cyan-300",
                onClick: () => openResultTab("summary"),
            },
            {
                key: "difficulty",
                title: "Difficulty Rating",
                description: "This overall complexity signal helps decide whether to skim, drill, or deep-review.",
                value: result.difficultyRating,
                eyebrow: "Calibration",
                icon: Gauge,
                accentClass: "text-fuchsia-300",
                onClick: () => openResultTab("summary"),
            },
        ]
        : [];

    return (
        <div className="relative flex min-h-screen flex-col bg-[#08111f] pt-16 text-white selection:bg-cyan-200/20">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_28%),linear-gradient(180deg,#09111f_0%,#050814_100%)]" />
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "88px 88px" }} />
            </div>

            <nav className="fixed top-0 z-50 h-16 w-full border-b border-white/[0.08] bg-[#07111d]/70 backdrop-blur-xl">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-black pt-0.5 shadow-inner">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">ExamOracle</span>
                    </Link>
                    {result && (
                        <button
                            onClick={handleClearResults}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium transition-colors hover:bg-cyan-400/10"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            New Session
                        </button>
                    )}
                </div>
            </nav>

            <main className="relative z-10 flex w-full flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040812]/80 p-6 backdrop-blur-xl"
                        >
                            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-300/10 bg-[#08111f]/80 p-8 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-emerald-400/5 to-amber-300/10 opacity-70" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/10 bg-white/[0.05] shadow-inner">
                                        <Cpu className="h-8 w-8 animate-pulse text-white" />
                                        <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-50 animate-ping" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold tracking-tight text-white">
                                        Analyzing Material
                                    </h3>
                                    <p className="text-center text-sm text-white/40">
                                        Processing notes, detecting patterns, and predicting exam structure.
                                    </p>

                                    <div className="mt-8 w-full space-y-3">
                                        <LoadingStep label="Parsing raw data" delay={0} />
                                        <LoadingStep label="Mapping concept tree" delay={1500} />
                                        <LoadingStep label="Calculating probability weights" delay={3000} />
                                        <LoadingStep label="Synthesizing oracle predictions" delay={4500} />
                                        <LoadingStep label="Generating interactive models" delay={6000} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-start gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.08] p-5"
                    >
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                        <div className="flex-1">
                            <h4 className="mb-1 text-sm font-bold uppercase tracking-widest text-rose-300">
                                Error Processing
                            </h4>
                            <p className="text-sm leading-relaxed text-rose-200/70">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-rose-400 hover:text-rose-300"
                        >
                            x
                        </button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex w-full flex-col gap-12"
                >
                    <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)] xl:items-start">
                        <section className="rounded-[2rem] border border-cyan-300/10 bg-[linear-gradient(145deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03)_35%,rgba(14,23,42,0.7)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] xl:sticky xl:top-24 xl:self-start">
                            <div className="max-w-xl">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                                    <BrainCircuit className="h-3.5 w-3.5" />
                                    Choose What You Need
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-[3.4rem]">
                                    Pick the output.
                                    <span className="mt-1 block text-white/55">
                                        Paste once on the right.
                                    </span>
                                </h1>
                                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
                                    The engine generates the full study kit in one run. Use the left side to understand what you are about to get, then drop your notes on the right and start.
                                </p>
                            </div>

                            <div className="mt-8">
                                <FeatureOverview
                                    heading={result ? "Open a generated feature" : "Included features"}
                                    subheading={
                                        result
                                            ? "Your study kit is ready. Click any feature below to load only that feature in the viewer."
                                            : "Every feature below is generated together, with Exam Oracle leading the experience."
                                    }
                                    items={leftPanelFeatures}
                                />
                            </div>
                        </section>

                        <div ref={noteInputRef} className="w-full min-w-0">
                            <div className="mb-5 rounded-[1.75rem] border border-amber-300/10 bg-[linear-gradient(145deg,rgba(251,191,36,0.08),rgba(255,255,255,0.03)_30%,rgba(15,23,42,0.8)_100%)] p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                                            Input Workspace
                                        </div>
                                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                                            Paste notes and generate everything here
                                        </h2>
                                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                                            Lecture notes, rough class points, copied textbook paragraphs, or revision dumps all work. One paste powers all features.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.06] px-4 py-3 text-right">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                            Output Stack
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-white">
                                            Oracle, cards, quiz, summary
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <NoteInput onSubmit={handleSubmit} isLoading={isLoading} />
                        </div>
                    </div>

                    <SessionHistory
                        entries={history}
                        onRestore={restoreSession}
                        onClear={clearHistory}
                    />

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex w-full flex-col gap-8"
                        >
                            <div className="grid gap-5 rounded-[2rem] border border-cyan-300/10 bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.03)_30%,rgba(8,17,31,0.88)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] md:grid-cols-[1.3fr_0.7fr] md:p-8">
                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                                        <Radar className="h-3.5 w-3.5" />
                                        Full Study Kit Ready
                                    </div>
                                    <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Everything you need is on one page.
                                    </h1>
                                    <p className="max-w-2xl text-lg text-white/55">
                                        Start with the highest-probability exam predictions, then move straight into flashcards, quiz, and summary without switching views.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-2">
                                            Topic: {result.topicName}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-2">
                                            Difficulty: {result.difficultyRating}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                                    <div className="rounded-[1.5rem] border border-rose-300/10 bg-rose-400/[0.06] p-4">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                                            Focus First
                                        </div>
                                        <div className="mt-3 text-2xl font-semibold text-white">
                                            {result.examOracle.filter((item) => item.probability === "high").length} high-probability questions
                                        </div>
                                        <p className="mt-2 text-sm text-white/50">
                                            The oracle section is the lead surface. It is shown first below.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Bro check this out, it literally predicted my midterms from my PDF notes 😭 -> https://examprep.ai")}`, "_blank")}
                                            className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
                                        </button>
                                        <button
                                            onClick={handleClearResults}
                                            className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-xs font-semibold uppercase tracking-widest text-white/55 transition-colors hover:bg-cyan-400/10 hover:text-white"
                                        >
                                            <ChevronLeft className="h-3 w-3" /> Input New Notes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <section className="rounded-[1.6rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(15,23,42,0.8),rgba(34,211,238,0.05))] p-3">
                                <div className="mb-3 flex items-center justify-between gap-3 px-2">
                                    <div>
                                        <h2 className="text-sm font-semibold tracking-tight text-white">
                                            Quick Access
                                        </h2>
                                        <p className="text-xs text-white/45">
                                            Jump anywhere. The full study flow continues below.
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                        One-page workspace
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                    {resultFeatures.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={item.onClick}
                                                className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-left transition-colors hover:bg-cyan-400/[0.08]"
                                            >
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${item.accentClass}`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                                                        {item.eyebrow}
                                                    </div>
                                                    <div className="truncate text-sm font-semibold text-white">
                                                        {item.title}
                                                    </div>
                                                    <div className="truncate text-xs text-white/45">
                                                        {item.value}
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <PrepSignals notes={lastNotes} result={result} />

                            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#07111d]/80 p-2 backdrop-blur-xl">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => openResultTab(tab.key)}
                                        className={`relative flex min-w-[150px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "text-white" : "text-white/45 hover:text-white/80"}`}
                                    >
                                        <motion.div
                                            className={`absolute inset-0 rounded-xl border transition-colors ${activeTab === tab.key ? "border-white/10 bg-white/[0.08]" : "border-transparent bg-transparent"}`}
                                            transition={{ duration: 0.2 }}
                                        />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {tab.icon} {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <motion.div
                                ref={resultPanelRef}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(15,23,42,0.82),rgba(14,165,233,0.06)_45%,rgba(251,191,36,0.04))] p-6 backdrop-blur-md sm:p-8"
                            >
                                {!activeTab && (
                                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                                            Feature Viewer
                                        </div>
                                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                            Choose one feature to open
                                        </h3>
                                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
                                            After generating, click Exam Oracle, Flashcards, Quiz, or Summary above. Only that selected feature will appear here.
                                        </p>
                                    </div>
                                )}

                                {activeTab === "oracle" && <ExamOracle questions={result.examOracle} />}
                                {activeTab === "flashcards" && (
                                    <Flashcards flashcards={result.flashcards} />
                                )}
                                {activeTab === "quiz" && (
                                    <QuizSection questions={result.mcqQuestions} />
                                )}
                                {activeTab === "summary" && (
                                    <Summary
                                        summary={result.summary}
                                        difficultyRating={result.difficultyRating}
                                        topicName={result.topicName}
                                        totalQuestions={result.examOracle.length}
                                        totalFlashcards={result.flashcards.length}
                                        totalMCQs={result.mcqQuestions.length}
                                    />
                                )}
                            </motion.div>

                            <div className="rounded-[1.75rem] border border-white/[0.06] bg-[linear-gradient(145deg,rgba(16,185,129,0.07),rgba(255,255,255,0.02))] p-5">
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                                    <History className="h-3.5 w-3.5" />
                                    Local Session Memory
                                </div>
                                <p className="mt-2 text-sm text-white/50">
                                    This study kit has been saved to local history and can be restored from the prep entry screen.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
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
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-all ${active ? "border-white/[0.08] bg-white/[0.04]" : "border-transparent"}`}
        >
            <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-white bg-white text-black" : "border-white/20"}`}
            >
                {active ? (
                    <CheckCircle2 className="h-3 w-3" />
                ) : (
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                )}
            </div>
            <span
                className={`text-xs font-semibold uppercase tracking-widest ${active ? "text-white/90" : "text-white/30"}`}
            >
                {label}
            </span>
        </div>
    );
}
