"use client";

import { BookOpen, BarChart3, TrendingUp, AlertTriangle, Zap, Target, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryProps {
    summary: string;
    keyTakeaways: string[];
    mistakeTraps: string[];
    summaryBlocks: {
        coreIdea: string;
        processSteps: string;
        differences: string;
        numbersFacts: string;
        likelyExamAngles: string;
    };
    rapidRevision: {
        formulas: string[];
        dates: string[];
        names: string[];
        numbers: string[];
        lists: string[];
    };
    difficultyRating: string;
    topicName: string;
    totalQuestions: number;
    totalFlashcards: number;
    totalMCQs: number;
}

export default function Summary({
    summary,
    keyTakeaways,
    mistakeTraps,
    summaryBlocks,
    rapidRevision,
    difficultyRating,
    topicName,
    totalQuestions,
    totalFlashcards,
    totalMCQs,
}: SummaryProps) {
    const paragraphs = summary
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    const takeaways = keyTakeaways.length > 0 ? keyTakeaways : paragraphs.slice(0, 3);

    const getDifficultyConfig = (rating: string) => {
        switch (rating.toLowerCase()) {
            case "easy":
                return { 
                    cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
                    label: "OPTIMIZED",
                    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                };
            case "medium":
                return { 
                    cls: "text-amber-400 border-amber-500/20 bg-amber-500/5",
                    label: "ELEVATED",
                    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                };
            case "hard":
            case "advanced":
                return { 
                    cls: "text-rose-400 border-rose-500/20 bg-rose-500/5",
                    label: "CRITICAL",
                    glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                };
            default:
                return { 
                    cls: "text-white/40 border-white/10 bg-white/5",
                    label: "UNKNOWN",
                    glow: ""
                };
        }
    };

    const diff = getDifficultyConfig(difficultyRating);

    return (
        <div className="flex flex-col gap-12">
            {/* Top Insight Matrix */}
            <div className="grid gap-4 lg:grid-cols-3">
                {takeaways.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index} 
                        className="relative group p-6 rounded-[2rem] border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                    >
                        <div className="absolute top-6 right-6 text-[10px] font-black text-white/10 group-hover:text-white/20 transition-colors">
                            CORE.V{index + 1}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <Target className="w-4 h-4 text-white/40" />
                        </div>
                        <p className="text-sm leading-relaxed text-white/70 font-light group-hover:text-white/90 transition-colors italic-none">
                            {item}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Neural Compression Blocks */}
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {[
                    { label: "Essential Logic", value: summaryBlocks.coreIdea, icon: <Cpu className="w-4 h-4" /> },
                    { label: "How it Works", value: summaryBlocks.processSteps, icon: <Zap className="w-4 h-4" /> },
                    { label: "Key Differences", value: summaryBlocks.differences, icon: <AlertTriangle className="w-4 h-4" /> },
                    { label: "Facts & Numbers", value: summaryBlocks.numbersFacts, icon: <TrendingUp className="w-4 h-4" /> },
                    { label: "Likely Exam Questions", value: summaryBlocks.likelyExamAngles, icon: <Target className="w-4 h-4" /> },
                    { label: "Common Mistakes", value: mistakeTraps[0] || "No critical traps detected.", icon: <ShieldAlert className="w-4 h-4" /> },
                ].map((block, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        key={block.label} 
                        className="rounded-[2.5rem] border border-white/[0.03] bg-white/[0.01] p-7 hover:border-white/10 transition-all flex flex-col group"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white/60 transition-colors">
                                {block.icon}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-colors">
                                {block.label}
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-white/40 font-light group-hover:text-white/70 transition-colors">
                            {block.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Rapid Revision Hub */}
            <div className="rounded-[3rem] border border-cyan-400/10 bg-cyan-400/[0.01] p-10 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <Zap className="w-64 h-64 text-cyan-400" />
                </div>
                
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic-none">Quick Review</h2>
                        <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400/50">High-Value Info at a Glance</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-5 relative z-10">
                    {[
                        { label: "FORMULAS", items: rapidRevision.formulas, color: "text-indigo-400" },
                        { label: "DATES", items: rapidRevision.dates, color: "text-emerald-400" },
                        { label: "NAMES", items: rapidRevision.names, color: "text-amber-400" },
                        { label: "KEY NUMBERS", items: rapidRevision.numbers, color: "text-sky-400" },
                        { label: "LISTS", items: rapidRevision.lists, color: "text-rose-400" },
                    ].map((group) => (
                        <div key={group.label} className="flex flex-col gap-4">
                            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 pb-2 border-b border-white/5">
                                {group.label}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {group.items.length > 0 ? group.items.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-[11px] font-medium ${group.color} transition-all hover:bg-white/5 cursor-default`}
                                    >
                                        {item}
                                    </div>
                                )) : (
                                    <span className="text-[10px] uppercase text-white/10 font-bold">Inert</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                {/* Main Summary Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 sm:p-14 rounded-[3rem] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-md"
                >
                    <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-indigo-500 to-transparent opacity-30" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic-none">Smart Summary</h2>
                    </div>

                    <div className="space-y-6">
                        {paragraphs.map((paragraph, idx) => (
                            <p key={idx} className="text-xl font-light leading-relaxed text-white/40 selection:bg-indigo-500/30 first-letter:text-3xl first-letter:font-black first-letter:text-white first-letter:mr-1 italic-none">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>

                {/* Sidebar Data - Operational Metrics */}
                <div className="flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" />
                        
                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="p-2 rounded-lg bg-white/5">
                                <TrendingUp className="w-4 h-4 text-white/40" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Smart Insights</h3>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">Subject Domain</span>
                                <span className="text-xl font-bold text-white/80 tracking-tight">{topicName}</span>
                            </div>

                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 block mb-3">Topic Difficulty</span>
                                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-[0.2em] ${diff.cls} ${diff.glow}`}>
                                    <ShieldAlert className="w-4 h-4" />
                                    {diff.label}: {difficultyRating}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-white/5">
                                <BarChart3 className="w-4 h-4 text-white/40" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Study Items</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: "Key Topics", val: totalQuestions },
                                { label: "Flashcards", val: totalFlashcards },
                                { label: "Quiz Questions", val: totalMCQs }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.06] transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50">{stat.label}</span>
                                    <span className="text-lg font-black text-white/80 tabular-nums">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2.5rem] bg-rose-500/[0.02] border border-rose-500/10 shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-4 h-4 text-rose-400/40" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400/40">Critical Traps</h3>
                        </div>
                        <div className="space-y-3">
                            {mistakeTraps.map((item, index) => (
                                <div key={index} className="relative pl-4 py-1 text-[13px] leading-relaxed text-rose-200/50 font-light">
                                    <div className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full bg-rose-500/30" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
