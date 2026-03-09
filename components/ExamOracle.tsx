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
            label: "HIGH",
            colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            icon: <AlertCircle className="w-3 h-3" />,
        },
        medium: {
            label: "MEDIUM",
            colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            icon: <MoreHorizontal className="w-3 h-3" />,
        },
        low: {
            label: "LOW",
            colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <CheckCircle2 className="w-3 h-3" />,
        },
    };

    const { label, colorClass, icon } = config[probability as keyof typeof config] || config.low;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${colorClass}`}>
            {icon}
            <span>{label}</span>
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
                            <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-widest">Core Engine</span>
                        </h2>
                        <p className="text-white/50 text-sm mt-1 max-w-lg font-light">Questions mathematically analyzed and ranked by probability of appearing on the exam based on note density.</p>
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
                    <div key={`${item.question}-${index}`} className="rounded-2xl border border-white/[0.08] bg-black/25 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                            Focus {index + 1}
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-white/85">
                            {item.question}
                        </p>
                    </div>
                ))}
            </div>

            {topPrediction && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300/80">
                        Best Bet
                    </div>
                    <p className="mt-2 text-base font-semibold leading-relaxed text-white">
                        {topPrediction.question}
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                        This is the strongest exam candidate based on topic recurrence and the way the notes emphasize it.
                    </p>
                </div>
            )}

            <div className="grid gap-4">
                {sortedQuestions.map((q, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        key={index}
                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all relative overflow-hidden group"
                    >
                        {/* Subtle left border probability color */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${q.probability === 'high' ? 'bg-rose-500' : q.probability === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'} opacity-30 group-hover:opacity-100 transition-opacity`}></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">PREDICTION #{index + 1}</span>
                            <ProbabilityIndicator probability={q.probability} />
                        </div>

                        <p className="text-lg font-medium text-white leading-relaxed mb-6">{q.question}</p>

                        <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/60">
                                {q.topic}
                            </span>
                            <span className="px-2.5 py-1 rounded border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/60">
                                {q.type}
                            </span>
                            <span className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-widest ${q.difficulty === 'Hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : q.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                                {q.difficulty}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
