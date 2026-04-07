"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Flame,
  LibraryBig,
  Loader2,
  Megaphone,
  MessageCircleWarning,
  NotebookPen,
  Send,
  ShieldAlert,
  BarChart2,
  Siren,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const signalTypes = [
  {
    key: "confession",
    label: "Confession",
    icon: NotebookPen,
    accent: "text-fuchsia-200 border-fuchsia-300/20 bg-fuchsia-400/10",
    description: "Admit the thing everyone else is pretending did not happen.",
  },
  {
    key: "warning",
    label: "Warning",
    icon: AlertTriangle,
    accent: "text-amber-200 border-amber-300/20 bg-amber-400/10",
    description: "Flag traps, professor patterns, or bad surprises before they spread.",
  },
  {
    key: "resource",
    label: "Resource",
    icon: BookMarked,
    accent: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    description: "Drop links, notes, cheat mnemonics, or useful prep shortcuts.",
  },
  {
    key: "doubt",
    label: "Doubt",
    icon: MessageCircleWarning,
    accent: "text-cyan-200 border-cyan-300/20 bg-cyan-400/10",
    description: "Ask the question the class group still has not answered properly.",
  },
  {
    key: "hot_take",
    label: "Hot Take",
    icon: Flame,
    accent: "text-rose-200 border-rose-300/20 bg-rose-400/10",
    description: "Rate how spicy your opinion is on a course, exam, or assignment.",
  },
  {
    key: "library_live",
    label: "Library Live",
    icon: LibraryBig,
    accent: "text-indigo-200 border-indigo-300/20 bg-indigo-400/10",
    description: "Real-time seat and silence intel during crunch hours.",
  },
  {
    key: "survival_thread",
    label: "Survival Thread",
    icon: Megaphone,
    accent: "text-teal-200 border-teal-300/20 bg-teal-400/10",
    description: "Pinned subject thread for traps, likely questions, and memory hacks.",
  },
  {
    key: "intel_drop",
    label: "Intel Drop",
    icon: Siren,
    accent: "text-orange-200 border-orange-300/20 bg-orange-400/10",
    description: "Time-sensitive campus signal like quiz whispers or lab-file checks.",
  },
  {
    key: "poll",
    label: "Poll",
    icon: BarChart2,
    accent: "text-blue-200 border-blue-300/20 bg-blue-400/10",
    description: "Get anonymous consensus on a course, exam, or topic.",
  },
] as const;

type SignalType = (typeof signalTypes)[number]["key"];

export default function CreatePostForm({
  aliasName,
  isOpen,
  mode = "oracle", // "oracle" or "whisper"
  onClose,
  onPostCreated,
}: {
  aliasName: string;
  isOpen: boolean;
  mode?: "oracle" | "whisper";
  onClose: () => void;
  onPostCreated: () => void;
}) {
  const oracleSignals = [
    "warning",
    "resource",
    "doubt",
    "library_live",
    "survival_thread",
    "poll",
  ];
  const whisperSignals = ["confession", "hot_take", "intel_drop"];

  const filteredSignalTypes = signalTypes.filter((s) =>
    mode === "whisper"
      ? whisperSignals.includes(s.key)
      : oracleSignals.includes(s.key)
  );

  const [signalType, setSignalType] = useState<SignalType>(
    mode === "whisper" ? "confession" : "doubt"
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectTag, setSubjectTag] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [quietLevel, setQuietLevel] = useState(3);
  const [hotTakeScore, setHotTakeScore] = useState(7);
  const [expiresInHours, setExpiresInHours] = useState(12);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSignal = signalTypes.find((item) => item.key === signalType)!;
  const CurrentSignalIcon = currentSignal.icon;

  const resetForm = () => {
    setSignalType(mode === "whisper" ? "confession" : "doubt");
    setTitle("");
    setContent("");
    setSubjectTag("");
    setLocationHint("");
    setQuietLevel(3);
    setHotTakeScore(7);
    setExpiresInHours(12);
    setPollOptions(["", ""]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (signalType === "poll") {
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        setError("Polls require at least 2 valid options");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalType,
          title,
          content,
          subjectTag,
          locationHint,
          quietLevel,
          hotTakeScore,
          expiresInHours,
          pollOptions: signalType === "poll" ? pollOptions : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      resetForm();
      onPostCreated();
      onClose();
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error ? submitError.message : "Failed to create post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <motion.form
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onSubmit={handleSubmit}
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[24px] border border-white/10 p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] ${
              mode === "whisper"
                ? "bg-[#0b0416] border-fuchsia-500/20 shadow-fuchsia-500/10"
                : "bg-[#050914] border-white/10"
            }`}
          >
            {mode === "whisper" && (
              <>
                <div className="absolute right-[-10%] top-[-10%] h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
              </>
            )}
            {mode !== "whisper" && (
              <>
                <div className="absolute right-[-10%] top-[-10%] h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
              </>
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    mode === "whisper"
                      ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
                      : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                  }`}>
                    <ShieldAlert className="h-4 w-4" />
                    Posting securely as <span className={`font-bold text-white`}>{aliasName}</span>
                  </div>
                  <h2 className={`mt-5 text-3xl font-semibold tracking-tight ${
                    mode === "whisper"
                      ? "bg-gradient-to-r from-fuchsia-400 to-violet-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(192,38,211,0.4)]"
                      : "text-white/90"
                  }`}>
                    {mode === "whisper" ? "Spill the Tea" : "Start a discussion"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/50 font-light">
                    Pick the shape of the signal first, then make it useful. The board
                    is strongest when each thread has a clear purpose.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
                {filteredSignalTypes.map((item) => {
                  const Icon = item.icon;
                  const isActive = signalType === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSignalType(item.key)}
                      className={`relative overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-300 ${
                        isActive
                          ? mode === "whisper"
                            ? "border-fuchsia-500 shadow-[0_0_30px_rgba(192,38,211,0.2)] bg-fuchsia-500/10 scale-105"
                            : "border-indigo-500/40 bg-indigo-500/[0.08] shadow-[0_0_20px_rgba(99,102,241,0.1)] scale-105"
                          : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.04] hover:text-white/80 hover:border-white/10"
                      }`}
                    >
                      <div className={`flex items-center gap-2 ${isActive ? (mode === "whisper" ? "text-fuchsia-300" : "text-indigo-300") : ""}`}>
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed opacity-70 font-light">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/5 bg-white/[0.015] p-6 shadow-inner">
                <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70`}>
                  <CurrentSignalIcon className="h-3 w-3" />
                  {currentSignal.label} mode
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="A sharp title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-4 text-lg font-medium text-white outline-none transition-all placeholder:text-white/20 ${
                      mode === "whisper"
                        ? "focus:border-fuchsia-400/40 focus:bg-fuchsia-500/[0.02] focus:shadow-[0_0_20px_rgba(192,38,211,0.1)]"
                        : "focus:border-indigo-500/40 focus:bg-indigo-500/[0.02]"
                    }`}
                    maxLength={120}
                    disabled={isSubmitting}
                  />

                  <input
                    type="text"
                    placeholder="Subject or course tag, e.g. DBMS / Mechanics"
                    value={subjectTag}
                    onChange={(e) => setSubjectTag(e.target.value)}
                    className={`w-full rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-4 text-[14px] text-white outline-none transition-all placeholder:text-white/20 ${
                      mode === "whisper"
                        ? "focus:border-fuchsia-400/40 focus:bg-fuchsia-500/[0.02] focus:shadow-[0_0_20px_rgba(192,38,211,0.1)]"
                        : "focus:border-indigo-500/40 focus:bg-indigo-500/[0.02]"
                    }`}
                    maxLength={40}
                    disabled={isSubmitting}
                  />
                </div>

                <textarea
                  placeholder="What happened, what is the issue, or what should people know?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`mt-5 min-h-[160px] w-full resize-y rounded-[16px] border border-white/[0.06] bg-black/40 p-5 text-[14px] leading-relaxed text-white/90 outline-none transition-all placeholder:text-white/20 ${
                    mode === "whisper"
                      ? "focus:border-fuchsia-400/40 focus:bg-fuchsia-500/[0.02] focus:shadow-[0_0_20px_rgba(192,38,211,0.1)]"
                      : "focus:border-indigo-500/40 focus:bg-indigo-500/[0.02]"
                  }`}
                  maxLength={2000}
                  disabled={isSubmitting}
                />

                {signalType === "poll" && (
                  <div className="mt-5 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-2">Poll Options</div>
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...pollOptions];
                            newOpts[i] = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          className="w-full rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-3.5 text-[14px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-blue-500/40 focus:bg-blue-500/[0.02]"
                          maxLength={50}
                          disabled={isSubmitting}
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                            className="text-white/30 hover:text-rose-400 transition-colors"
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ""])}
                        className="text-[12px] font-semibold text-blue-400 hover:text-blue-300 px-2 transition-colors"
                        disabled={isSubmitting}
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {(signalType === "library_live" || signalType === "intel_drop") && (
                    <input
                      type="text"
                      placeholder={signalType === "library_live" ? "Location hint, e.g. Central Library 3F" : "Where did this happen?"}
                      value={locationHint}
                      onChange={(e) => setLocationHint(e.target.value)}
                    className={`rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-3.5 text-[14px] text-white outline-none transition-all placeholder:text-white/20 md:col-span-2 ${
                        mode === "whisper"
                          ? "focus:border-fuchsia-500/40 focus:bg-fuchsia-500/[0.02] focus:shadow-[0_0_15px_rgba(192,38,211,0.1)]"
                          : "focus:border-indigo-500/40 focus:bg-indigo-500/[0.02]"
                      }`}                      maxLength={80}
                      disabled={isSubmitting}
                    />
                  )}

                  {signalType === "library_live" && (
                    <label className="rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-3.5 text-[14px] text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        Quiet Meter
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={quietLevel}
                        onChange={(e) => setQuietLevel(Number(e.target.value))}
                        className="mt-3 w-full accent-indigo-400"
                        disabled={isSubmitting}
                      />
                      <div className="mt-2 text-xs font-semibold text-white/90">
                        {quietLevel} / 5
                      </div>
                    </label>
                  )}

                  {signalType === "hot_take" && (
                    <label className="rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-3.5 text-[14px] text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        Hot Take Meter
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={hotTakeScore}
                        onChange={(e) => setHotTakeScore(Number(e.target.value))}
                        className="mt-3 w-full accent-rose-400"
                        disabled={isSubmitting}
                      />
                      <div className="mt-2 text-xs font-semibold text-white/90">
                        {hotTakeScore} / 10
                      </div>
                    </label>
                  )}

                  {signalType === "intel_drop" && (
                    <label className="rounded-[16px] border border-white/[0.06] bg-black/40 px-5 py-3.5 text-[14px] text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        Expires In
                      </div>
                      <select
                        value={expiresInHours}
                        onChange={(e) => setExpiresInHours(Number(e.target.value))}
                        className="mt-3 w-full rounded-lg border border-transparent bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-indigo-500/40"
                        disabled={isSubmitting}
                      >
                        {[2, 6, 12, 24, 48, 72].map((hours) => (
                          <option key={hours} value={hours} className="bg-[#050914]">
                            {hours} hours
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 text-[11px] font-medium text-white/30 px-2">
                  <span>{content.length} / 2000 chars</span>
                  <span>{title.length} / 120 chars</span>
                </div>

                {error && <p className="mt-4 text-[13px] font-medium text-rose-400 px-2">{error}</p>}

                <div className="mt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-[14px] font-bold transition-all disabled:opacity-30 disabled:active:scale-100 ${
                      mode === "whisper"
                        ? "bg-gradient-to-r from-fuchsia-500 via-fuchsia-600 to-violet-600 text-white shadow-[0_0_30px_rgba(192,38,211,0.4)] hover:shadow-[0_0_45px_rgba(192,38,211,0.6)] animate-pulse"
                        : "bg-white text-[#03060c] hover:bg-indigo-50"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    ) : (
                      <Send className="h-[18px] w-[18px]" />
                    )}
                    {mode === "whisper" ? "Spill Confession" : "Publish Discussion"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
