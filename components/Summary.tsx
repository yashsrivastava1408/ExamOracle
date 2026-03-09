"use client";

import { BookOpen, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryProps {
    summary: string;
    difficultyRating: string;
    topicName: string;
    totalQuestions: number;
    totalFlashcards: number;
    totalMCQs: number;
}

export default function Summary({
    summary,
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
    const takeaways = paragraphs.slice(0, 3);

    const getDifficultyColor = (rating: string) => {
        switch (rating.toLowerCase()) {
            case "easy":
                return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
            case "medium":
                return "text-amber-400 border-amber-500/20 bg-amber-500/10";
            case "hard":
            case "advanced":
                return "text-rose-400 border-rose-500/20 bg-rose-500/10";
            default:
                return "text-white/60 border-white/10 bg-white/5";
        }
    };

    const difficultyColor = getDifficultyColor(difficultyRating);

    return (
        <div className="flex flex-col gap-10">
            <div className="grid gap-3 lg:grid-cols-3">
                {takeaways.map((item, index) => (
                    <div key={`${item}-${index}`} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Key Takeaway {index + 1}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/80">
                            {item}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-6">

                {/* Main Summary Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.08]"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-2xl font-bold tracking-tight text-white">Topic Synopsis</h2>
                    </div>

                    <div className="prose prose-invert prose-p:leading-relaxed prose-p:font-light prose-p:text-white/70 max-w-none">
                        {paragraphs.map((paragraph, idx) => (
                            <p key={idx} className="mb-4 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>

                {/* Sidebar Data */}
                <div className="flex flex-col gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08]"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-white/50" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Engine Analysis</h3>
                        </div>

                        <div className="mb-2">
                            <span className="text-xs text-white/40 block mb-1">Detected Domain:</span>
                            <span className="text-sm font-semibold text-white/90">{topicName}</span>
                        </div>

                        <div className="mt-6">
                            <span className="text-xs text-white/40 block mb-2">Complexity Rating:</span>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest ${difficultyColor}`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {difficultyRating}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08]"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-white/50" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Generated Assets</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <span className="text-xs text-white/60">Oracle Predictions</span>
                                <span className="text-sm font-bold text-white">{totalQuestions}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <span className="text-xs text-white/60">Smart Flashcards</span>
                                <span className="text-sm font-bold text-white">{totalFlashcards}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <span className="text-xs text-white/60">Quiz Questions</span>
                                <span className="text-sm font-bold text-white">{totalMCQs}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
