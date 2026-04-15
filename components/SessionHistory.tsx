"use client";

import { GeneratedContent } from "@/types";
import { motion } from "framer-motion";
import { Clock3, RotateCcw, ChevronRight } from "lucide-react";

export interface SessionHistoryEntry {
    id: string;
    createdAt: string;
    data: GeneratedContent;
}

interface SessionHistoryProps {
    entries: SessionHistoryEntry[];
    onRestore: (entry: SessionHistoryEntry) => void;
    onClear: () => void;
}

export default function SessionHistory({
    entries,
    onRestore,
}: SessionHistoryProps) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <>
            {entries.map((entry, index) => (
                <motion.button
                    key={entry.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => onRestore(entry)}
                    className="group relative rounded-[2.5rem] border border-white/[0.05] bg-white/[0.02] p-8 text-left transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-xl overflow-hidden flex flex-col h-full"
                >
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 group-hover:border-white/20 transition-all">
                            <Clock3 className="h-4 w-4 text-white/20 group-hover:text-white" />
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/10">Saved Kit</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                                {formatTimestamp(entry.createdAt)}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold tracking-tight text-white mb-2 group-hover:text-indigo-200 transition-colors break-words">
                            {entry.data.topicName}
                        </h3>
                        <p className="text-xs leading-relaxed text-white/20 font-light italic-none line-clamp-2">
                            {entry.data.examOracle[0]?.question ?? "Concept analysis complete."}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {[
                            { val: entry.data.examOracle.length, label: "Top Topics" },
                            { val: entry.data.flashcards.length, label: "Cards" },
                            { val: entry.data.mcqQuestions.length, label: "Questions" }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[50px] p-2 rounded-lg border border-white/[0.03] bg-white/[0.01]">
                                <span className="text-[10px] font-black text-white/40 tabular-nums">{stat.val}</span>
                                <span className="text-[7px] font-black uppercase tracking-tighter text-white/10">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.03] pt-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/10 group-hover:text-white/40 transition-all">
                            <RotateCcw className="h-3 w-3" />
                            Open Saved Kit
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/5 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                    </div>
                </motion.button>
            ))}
        </>
    );
}

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}
