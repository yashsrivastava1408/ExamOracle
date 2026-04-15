"use client";

import { ExamOracleQuestion } from "@/types";
import { Target, AlertCircle, CheckCircle2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ExamOracleProps {
    questions: ExamOracleQuestion[];
}

function ProbabilityIndicator({ probability }: { probability: string }) {
    const config = {
        high: {
            label: "CRITICAL",
            colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            icon: <AlertCircle className="w-3 h-3" />,
            glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
            intensity: "w-full"
        },
        medium: {
            label: "ELEVATED",
            colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            icon: <MoreHorizontal className="w-3 h-3" />,
            glow: "shadow-[0_0_10px_rgba(251,191,36,0.2)]",
            intensity: "w-2/3"
        },
        low: {
            label: "NOTABLE",
            colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <CheckCircle2 className="w-3 h-3" />,
            glow: "shadow-[0_0_8px_rgba(52,211,153,0.15)]",
            intensity: "w-1/3"
        },
    };

    const { label, colorClass, icon, glow, intensity } = config[probability as keyof typeof config] || config.low;

    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.14em] ${colorClass} ${glow}`}>
                {icon}
                <span>{label}</span>
            </div>
            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-current ${colorClass} ${intensity} rounded-full transition-all duration-1000`} />
            </div>
        </div>
    );
}

export default function ExamOracle({ questions }: ExamOracleProps) {
    const sortedQuestions = [...questions].sort((left, right) => {
        const rank = { high: 0, medium: 1, low: 2 };
        return rank[left.probability] - rank[right.probability];
    });
    const highCount = sortedQuestions.filter((q) => q.probability === "high").length;
    const mediumCount = sortedQuestions.filter((q) => q.probability === "medium").length;
    const lowCount = sortedQuestions.filter((q) => q.probability === "low").length;
    const topFocus = sortedQuestions.slice(0, 3);
    const topPrediction = sortedQuestions[0];

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                        <Target className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            Exam Oracle
                            <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-widest">Smart Logic</span>
                        </h2>
                        <p className="text-white/50 text-sm mt-1 max-w-lg font-light">Questions analyzed and ranked by how likely they are to appear on your exam based on your notes.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {[{ l: "High", c: highCount, cls: "text-rose-400 bg-rose-500/[0.05] border-rose-500/20" },
                    { l: "Med", c: mediumCount, cls: "text-amber-400 bg-amber-500/[0.05] border-amber-500/20" },
                    { l: "Low", c: lowCount, cls: "text-emerald-400 bg-emerald-500/[0.05] border-emerald-500/20" }
                    ].map(stat => (
                        <div key={stat.l} className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-3 rounded-xl border ${stat.cls}`}>
                            <span className="text-xl font-bold leading-none">{stat.c}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">{stat.l}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                {topFocus.map((item, index) => (
                    <div key={`${item.question}-${index}`} className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 transition-all hover:bg-black/40">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            Key Pick {index + 1}
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-white/80">
                            {item.question}
                        </p>
                    </div>
                ))}
            </div>

            {topPrediction && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group cursor-default"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-rose-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                    <div className="relative rounded-[24px] border border-rose-500/20 bg-[#03060c] p-7 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                <Target className="w-5 h-5 text-rose-400" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">
                                Most Likely Question
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold leading-relaxed text-white group-hover:text-rose-50 transition-colors">
                            {topPrediction.question}
                        </h3>
                        <p className="mt-4 text-base leading-relaxed text-white/40 font-light max-w-4xl">
                            High recurrence detected across multiple note clusters. This concept is identified as the strategic anchor of your study material and maintains the highest logical probability weight for examination.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-6">
                {sortedQuestions.map((q, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        key={index}
                        className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.05] hover:bg-white/[0.02] transition-all relative overflow-hidden group"
                    >
                        {/* Holographic side-indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${q.probability === 'high' ? 'bg-gradient-to-b from-rose-500 via-rose-400 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : q.probability === 'medium' ? 'bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.3)]'} opacity-20 group-hover:opacity-100 transition-all duration-500`} />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                             <div className="flex items-center gap-4">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-[11px] font-black text-white/40 group-hover:text-white group-hover:border-white/10 transition-colors">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Question {index + 1}</span>
                                    <span className="text-[11px] font-bold text-white/40 uppercase">Oracle Prediction</span>
                                </div>
                             </div>
                            <ProbabilityIndicator probability={q.probability} />
                        </div>

                        <p className="text-2xl font-bold text-white/95 leading-relaxed mb-10 group-hover:translate-x-1 transition-transform">{q.question}</p>

                        {q.answerOutline && q.answerOutline.length > 0 && (
                            <div className="mb-8 rounded-[24px] border border-sky-400/10 bg-sky-400/[0.02] p-6 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <Target className="w-24 h-24 text-sky-400" />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400/60">
                                        How to Answer
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    {q.answerOutline.map((point, outlineIndex) => (
                                        <div key={`${point}-${outlineIndex}`} className="flex gap-5 text-base text-white/60 group/point">
                                            <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-[10px] font-black text-white/20 uppercase tracking-tighter group-hover/point:text-sky-300 group-hover/point:border-sky-500/20 transition-colors">
                                                {outlineIndex + 1}
                                            </span>
                                            <p className="leading-relaxed font-light">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {q.sampleAnswer && (
                            <div className="mb-8 rounded-[24px] border border-emerald-400/10 bg-emerald-400/[0.02] p-6 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/60">
                                        Sample Solution
                                    </div>
                                </div>
                                <p className="mt-3 text-base leading-relaxed text-white/50 font-light">
                                    {q.sampleAnswer}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-4">
                            {[
                                { val: q.topic, label: "DOMAIN" },
                                { val: q.type, label: "WEIGHT" },
                                { val: q.difficulty, label: "COMPLEXITY", active: true }
                            ].map((tag, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tag.active ? (q.difficulty === 'Hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : q.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300') : 'border-white/5 bg-white/5 text-white/40'}`}>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{tag.label}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{tag.val}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
