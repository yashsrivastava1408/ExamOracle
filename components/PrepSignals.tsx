"use client";

import { useState } from "react";
import {
  Flame,
  Radar,
  ScanSearch,
  Share2,
  Sparkles,
  Trophy,
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
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-rose-300/10 bg-[linear-gradient(145deg,rgba(244,63,94,0.12),rgba(255,255,255,0.03)_35%,rgba(8,17,31,0.86)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-100">
          <Flame className="h-3.5 w-3.5" />
          Viral Layer
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              How Cooked Am I?
            </div>
            <div className="mt-3 text-4xl font-semibold text-white">{cooked.cookedScore}</div>
            <div className="mt-1 text-sm font-semibold text-rose-100">{cooked.label}</div>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{cooked.status}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              <Trophy className="h-3.5 w-3.5" />
              Rank My Notes
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">{notesRank.label}</div>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{notesRank.reason}</p>
          </div>

          <div className={`rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4`}>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              <Sparkles className="h-3.5 w-3.5" />
              Exam Aura
            </div>
            <div className={`mt-4 rounded-[1.25rem] bg-gradient-to-br ${aura.color} p-[1px]`}>
              <div className="rounded-[1.2rem] bg-[#08111f]/95 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  {result.topicName}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{aura.aura}</div>
                <div className="mt-2 text-sm text-white/55">
                  Readiness {aura.readiness}% · {result.difficultyRating}
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyAura}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Aura Copied" : "Copy Aura Card"}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-cyan-300/10 bg-[linear-gradient(145deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03)_35%,rgba(8,17,31,0.86)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100">
          <ScanSearch className="h-3.5 w-3.5" />
          Syllabus Gap Scan
        </div>

        <div className="space-y-3">
          {gaps.map((gap, index) => (
            <div
              key={`${gap}-${index}`}
              className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4"
            >
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                <Radar className="h-3.5 w-3.5" />
                Gap {index + 1}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{gap}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
