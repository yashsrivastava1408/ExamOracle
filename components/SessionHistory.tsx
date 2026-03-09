"use client";

import { GeneratedContent } from "@/types";
import { motion } from "framer-motion";
import { Clock3, RotateCcw, Trash2 } from "lucide-react";

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
    onClear,
}: SessionHistoryProps) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        Recent Sessions
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                        Your last generated study kits stay available locally on this device.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear History
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {entries.map((entry, index) => (
                    <motion.button
                        key={entry.id}
                        type="button"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        onClick={() => onRestore(entry)}
                        className="group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                                <Clock3 className="h-4.5 w-4.5 text-white/75" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                                {formatTimestamp(entry.createdAt)}
                            </span>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold tracking-tight text-white">
                                {entry.data.topicName}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/50">
                                {entry.data.examOracle[0]?.question ?? "Generated study kit"}
                            </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                                {entry.data.examOracle.length} predictions
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                                {entry.data.flashcards.length} cards
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                                {entry.data.mcqQuestions.length} quiz
                            </span>
                        </div>

                        <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors group-hover:text-white">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore Session
                        </div>
                    </motion.button>
                ))}
            </div>
        </section>
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
