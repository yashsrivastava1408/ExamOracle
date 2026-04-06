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
] as const;

type SignalType = (typeof signalTypes)[number]["key"];

export default function CreatePostForm({
  aliasName,
  isOpen,
  onClose,
  onPostCreated,
}: {
  aliasName: string;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}) {
  const [signalType, setSignalType] = useState<SignalType>("doubt");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectTag, setSubjectTag] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [quietLevel, setQuietLevel] = useState(3);
  const [hotTakeScore, setHotTakeScore] = useState(7);
  const [expiresInHours, setExpiresInHours] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSignal = signalTypes.find((item) => item.key === signalType)!;
  const CurrentSignalIcon = currentSignal.icon;

  const resetForm = () => {
    setSignalType("doubt");
    setTitle("");
    setContent("");
    setSubjectTag("");
    setLocationHint("");
    setQuietLevel(3);
    setHotTakeScore(7);
    setExpiresInHours(12);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#050914]/85 p-4 backdrop-blur-md"
        >
          <motion.form
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            onSubmit={handleSubmit}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(155deg,rgba(56,189,248,0.14),rgba(255,255,255,0.05)_35%,rgba(10,10,10,0.96)_100%)] p-6 shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <ShieldAlert className="h-4 w-4" />
                    Posting securely as <span className="font-bold">{aliasName}</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    Drop a campus signal
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-4">
                {signalTypes.map((item) => {
                  const Icon = item.icon;
                  const isActive = signalType === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSignalType(item.key)}
                      className={`rounded-[1.35rem] border p-4 text-left transition-all ${
                        isActive
                          ? `${item.accent} shadow-lg`
                          : "border-white/10 bg-black/20 text-white/70 hover:bg-black/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4.5 w-4.5" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed opacity-80">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${currentSignal.accent}`}>
                  <CurrentSignalIcon className="h-4 w-4" />
                  {currentSignal.label} mode
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="A sharp title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-[1.1rem] border border-white/10 bg-black/25 px-5 py-4 text-lg font-semibold text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/30"
                    maxLength={120}
                    disabled={isSubmitting}
                  />

                  <input
                    type="text"
                    placeholder="Subject or course tag, e.g. DBMS / Mechanics"
                    value={subjectTag}
                    onChange={(e) => setSubjectTag(e.target.value)}
                    className="w-full rounded-[1.1rem] border border-white/10 bg-black/25 px-5 py-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/30"
                    maxLength={40}
                    disabled={isSubmitting}
                  />
                </div>

                <textarea
                  placeholder="What happened, what is the issue, or what should people know?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-4 min-h-[180px] w-full resize-y rounded-[1.4rem] border border-white/10 bg-black/25 p-5 text-sm leading-relaxed text-white/90 outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/30"
                  maxLength={2000}
                  disabled={isSubmitting}
                />

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {(signalType === "library_live" || signalType === "intel_drop") && (
                    <input
                      type="text"
                      placeholder={signalType === "library_live" ? "Location hint, e.g. Central Library 3F" : "Where did this happen?"}
                      value={locationHint}
                      onChange={(e) => setLocationHint(e.target.value)}
                      className="rounded-[1.1rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/30 md:col-span-2"
                      maxLength={80}
                      disabled={isSubmitting}
                    />
                  )}

                  {signalType === "library_live" && (
                    <label className="rounded-[1.1rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        Quiet Meter
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={quietLevel}
                        onChange={(e) => setQuietLevel(Number(e.target.value))}
                        className="mt-3 w-full accent-cyan-300"
                        disabled={isSubmitting}
                      />
                      <div className="mt-2 text-sm font-semibold text-white">
                        {quietLevel} / 5
                      </div>
                    </label>
                  )}

                  {signalType === "hot_take" && (
                    <label className="rounded-[1.1rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        Hot Take Meter
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={hotTakeScore}
                        onChange={(e) => setHotTakeScore(Number(e.target.value))}
                        className="mt-3 w-full accent-rose-300"
                        disabled={isSubmitting}
                      />
                      <div className="mt-2 text-sm font-semibold text-white">
                        {hotTakeScore} / 10
                      </div>
                    </label>
                  )}

                  {signalType === "intel_drop" && (
                    <label className="rounded-[1.1rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        Expires In
                      </div>
                      <select
                        value={expiresInHours}
                        onChange={(e) => setExpiresInHours(Number(e.target.value))}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                        disabled={isSubmitting}
                      >
                        {[2, 6, 12, 24, 48, 72].map((hours) => (
                          <option key={hours} value={hours}>
                            {hours} hours
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-white/40">
                  <span>{content.length} / 2000</span>
                  <span>{title.length} / 120</span>
                </div>

                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Publish Signal
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
