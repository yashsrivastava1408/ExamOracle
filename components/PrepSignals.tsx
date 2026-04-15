"use client";

import { useState } from "react";
import {
  Flame,
  Radar,
  ScanSearch,
  Share2,
  Sparkles,
  Trophy,
  Activity,
  Cpu,
  Layers,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { GeneratedContent } from "@/types";
import {
  getAuraProfile,
  getCookedSignal,
  getCoverageGapScan,
  getNotesRank,
  getShareText,
} from "@/lib/prepSignals.mjs";

export default function PrepSignals({
  notes,
  result,
}: {
  notes: string;
  result: GeneratedContent;
}) {
  const [copied, setCopied] = useState(false);

  const cooked = getCookedSignal(notes, result);
  const notesRank = getNotesRank(notes);
  const gaps = getCoverageGapScan(notes, result);
  const aura = getAuraProfile(notes, result);

  const handleCopyAura = async () => {
    try {
      await navigator.clipboard.writeText(getShareText(notes, result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      {/* Neural Aura & Viral Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-10 sm:p-14 shadow-2xl backdrop-blur-3xl overflow-hidden group"
      >
        {/* Background Energy Pulse */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full group-hover:bg-rose-500/15 transition-colors duration-1000" />
        
        <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-rose-300">
                <Flame className="h-4 w-4 animate-pulse" />
                How Ready Are You?
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Cooked Meter */}
                <div className="relative flex flex-col justify-between rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 shadow-inner hover:bg-white/[0.03] transition-all min-w-[200px]">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Note Analysis
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-5xl font-black text-rose-400 tracking-tighter break-all">{cooked.cookedScore}</div>
                        <div className="text-[11px] font-black text-rose-300 uppercase tracking-widest break-words">{cooked.label}</div>
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-white/30 font-light italic-none pr-2">{cooked.status}</p>
                </div>

                {/* Rank */}
                <div className="relative flex flex-col justify-between rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 shadow-inner hover:bg-white/[0.03] transition-all min-w-[200px]">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 flex items-center gap-2">
                        <Trophy className="w-3 h-3" />
                        Study Score
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-3xl font-black text-white uppercase tracking-tight break-words">{notesRank.label}</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                            <div className="h-full bg-white/40 w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        </div>
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-white/30 font-light italic-none pr-2">{notesRank.reason}</p>
                </div>

                {/* Exam Aura - High Fidelity Card */}
                <div className="relative flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-8 shadow-2xl group/aura min-w-[200px] sm:col-span-2 lg:col-span-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Your Study Aura
                    </div>
                    
                    <div className={`rounded-[2rem] bg-gradient-to-br ${aura.color} p-[1px] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-transform cursor-pointer overflow-hidden`}>
                        <div className="rounded-[1.95rem] bg-[#03060c]/98 p-6 backdrop-blur-xl">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 truncate">
                                {result.topicName}
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight leading-none mb-3 break-words">{aura.aura}</div>
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/60" style={{ width: `${aura.readiness}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-white/40">{aura.readiness}% READY</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCopyAura}
                        className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] py-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 transition-all hover:bg-white/15 hover:text-white"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        {copied ? "Link Copied" : "Share Progress"}
                    </button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Coverage Gaps */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-[3rem] border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent p-10 sm:p-14 backdrop-blur-3xl overflow-hidden group shadow-xl"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300">
                <ScanSearch className="h-4 w-4" />
                Missing Topics
            </div>

            <div className="space-y-4">
                {gaps.map((gap, index) => (
                    <div
                        key={`${gap}-${index}`}
                        className="group/gap relative rounded-[2rem] border border-white/[0.03] bg-white/[0.01] p-6 hover:bg-white/[0.03] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 group-hover/gap:bg-cyan-400 transition-colors" />
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 group-hover/gap:text-white/30 transition-colors">
                                Topic Gap {index + 1}
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-white/40 font-light group-hover:text-white/60 transition-colors italic-none">{gap}</p>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>
    </section>
  );
}
