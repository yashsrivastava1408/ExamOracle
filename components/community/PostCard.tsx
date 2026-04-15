"use client";

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BookMarked,
  Flame,
  LibraryBig,
  MapPin,
  Megaphone,
  MessageCircleWarning,
  MessageSquare,
  NotebookPen,
  Pin,
  Siren,
  ShieldCheck,
  BarChart2,
  Medal,
  VenetianMask,
} from "lucide-react";
import { motion } from "framer-motion";

export interface Post {
  id: string;
  signalType:
    | "confession"
    | "warning"
    | "resource"
    | "doubt"
    | "hot_take"
    | "library_live"
    | "survival_thread"
    | "intel_drop"
    | "poll";
  title: string;
  content: string;
  subjectTag: string | null;
  locationHint: string | null;
  quietLevel: number | null;
  hotTakeScore: number | null;
  expiresAt: string | null;
  isPinned: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  alias: { name: string; hasGuruBadge?: boolean };
  _count: { comments: number };
  viewerVote: number;
  viewerReported: boolean;
  pollOptions?: { id: string; text: string; _count: { votes: number } }[];
  viewerPollVoteId?: string | null;
  whisperStats?: { total: number; true: number; cap: number; idk: number };
  viewerWhisperVote?: "TRUE" | "CAP" | "IDK" | null;
}

interface PostCardProps {
  post: Post;
  onVote: (id: string, action: "upvote" | "downvote") => void;
  onPollVote: (postId: string, pollOptionId: string) => void;
  onReport: (id: string) => void;
  onWhisperVote?: (postId: string, value: "TRUE" | "CAP" | "IDK") => void;
  onOpen: (post: Post) => void;
  isActive: boolean;
}

const signalMeta = {
  confession: {
    label: "Confession",
    Icon: NotebookPen,
    chip: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    chip: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  },
  resource: {
    label: "Resource",
    Icon: BookMarked,
    chip: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  },
  doubt: {
    label: "Doubt",
    Icon: MessageCircleWarning,
    chip: "border-indigo-500/20 bg-indigo-500/10 text-indigo-200",
  },
  hot_take: {
    label: "Hot Take",
    Icon: Flame,
    chip: "border-rose-500/20 bg-rose-500/10 text-rose-200",
  },
  library_live: {
    label: "Library Live",
    Icon: LibraryBig,
    chip: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  },
  survival_thread: {
    label: "Survival Thread",
    Icon: Megaphone,
    chip: "border-teal-500/20 bg-teal-500/10 text-teal-200",
  },
  intel_drop: {
    label: "Intel Drop",
    Icon: Siren,
    chip: "border-orange-500/20 bg-orange-500/10 text-orange-200",
  },
  poll: {
    label: "Poll",
    Icon: BarChart2,
    chip: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  },
} as const;

export default function PostCard({ post, onVote, onPollVote, onReport, onWhisperVote, onOpen, isActive }: PostCardProps) {
  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(post.id, "upvote");
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(post.id, "downvote");
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReport(post.id);
  };

  const handleWhisperVote = (e: React.MouseEvent, value: "TRUE" | "CAP" | "IDK") => {
    e.stopPropagation();
    onWhisperVote?.(post.id, value);
  };

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const meta = signalMeta[post.signalType];
  const SignalIcon = meta.Icon;

    const isGossip = post.signalType === "confession" || post.signalType === "hot_take" || post.signalType === "intel_drop";
    
    const isVerified = isGossip && post.whisperStats && post.whisperStats.total >= 5 && (post.whisperStats.true / post.whisperStats.total) > 0.8;
    const isCap = isGossip && post.whisperStats && post.whisperStats.total >= 5 && (post.whisperStats.cap / post.whisperStats.total) > 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      role="article"
      aria-label={`Post by ${post.alias.name}: ${post.title}`}
      className={`group relative cursor-pointer overflow-hidden rounded-[24px] border p-6 transition-all duration-300 backdrop-blur-md ${
        isActive
          ? isGossip 
            ? "border-fuchsia-500/40 bg-fuchsia-500/[0.06] shadow-[0_0_30px_rgba(255,0,122,0.1)]"
            : "border-indigo-500/30 bg-indigo-500/[0.04] shadow-[0_0_30px_rgba(99,102,241,0.05)]"
          : isGossip
            ? "border-white/[0.06] bg-white/[0.02] shadow-xl hover:border-fuchsia-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,0,122,0.05)]"
            : "border-white/[0.04] bg-white/[0.02] shadow-lg hover:border-white/[0.08] hover:bg-white/[0.03] hover:shadow-xl"
      }`}
      onClick={() => onOpen(post)}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-white/90 shadow-inner">
            {post.alias.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/90">{post.alias.name}</p>
              {post.alias.hasGuruBadge && (
                <div className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 shadow-lg ${
                  isGossip 
                  ? "border-fuchsia-500/30 bg-fuchsia-500/10 shadow-[0_0_10px_rgba(255,0,122,0.2)]" 
                  : "border-amber-500/30 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                }`}>
                  {isGossip ? (
                    <>
                      <VenetianMask className="h-3 w-3 text-fuchsia-400" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-300">Gossip King</span>
                    </>
                  ) : (
                    <>
                      <Medal className="h-3 w-3 text-amber-400" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">Exam Guru</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-white/40">{date}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${meta.chip}`}>
            <SignalIcon className="h-3 w-3" />
            {meta.label}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <ShieldCheck className="h-3 w-3" />
               Verified
            </span>
          )}
          {isCap && (
            <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-fuchsia-400 shadow-[0_0_15px_rgba(255,0,122,0.2)]">
               <VenetianMask className="h-3 w-3" />
               Cap Detected
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className={`mb-2.5 text-lg font-medium tracking-tight transition-colors ${
          isGossip ? "text-fuchsia-50 group-hover:text-fuchsia-200" : "text-white/95 group-hover:text-indigo-100"
        }`}>{post.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-white/50 font-light whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.signalType === "poll" && post.pollOptions && (
        <div className="mb-5 space-y-2" onClick={e => e.stopPropagation()}>
          {(() => {
            const totalVotes = post.pollOptions.reduce((acc, opt) => acc + opt._count.votes, 0);
            return post.pollOptions.map((opt) => {
              const hasVotedThis = post.viewerPollVoteId === opt.id;
              const hasVotedAny = post.viewerPollVoteId != null;
              const percentage = totalVotes === 0 ? 0 : Math.round((opt._count.votes / totalVotes) * 100);

              if (hasVotedAny) {
                return (
                  <div key={opt.id} className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 p-3">
                    <div 
                      className={`absolute inset-0 opacity-10 ${hasVotedThis ? "bg-blue-500" : "bg-white"}`} 
                      style={{ width: `${percentage}%` }} 
                    />
                    <div className="relative flex items-center justify-between z-10 text-sm">
                      <span className={`font-medium ${hasVotedThis ? "text-blue-300" : "text-white/70"}`}>
                        {opt.text}
                      </span>
                      <span className="text-xs text-white/50 font-semibold">{percentage}%</span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => onPollVote(post.id, opt.id)}
                  aria-label={`Vote for: ${opt.text}`}
                  className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.05] hover:text-white hover:border-white/10 active:scale-[0.98]"
                >
                  {opt.text}
                </button>
              );
            });
          })()}
          <div className="text-[10px] text-white/30 text-right mt-1 pt-1">
            {post.pollOptions.reduce((acc, opt) => acc + opt._count.votes, 0)} votes
          </div>
        </div>
      )}

      {isGossip && post.whisperStats && (
        <div className="mb-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Truth Meter</span>
             <span className="text-[10px] font-bold text-white/50">{post.whisperStats.total} Votes</span>
          </div>
          
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex mb-6">
             {post.whisperStats.total > 0 ? (
               <>
                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(post.whisperStats.true / post.whisperStats.total) * 100}%` }} />
                 <div className="h-full bg-fuchsia-500 transition-all duration-500" style={{ width: `${(post.whisperStats.cap / post.whisperStats.total) * 100}%` }} />
                 <div className="h-full bg-white/20 transition-all duration-500" style={{ width: `${(post.whisperStats.idk / post.whisperStats.total) * 100}%` }} />
               </>
             ) : (
               <div className="h-full w-full bg-white/5" />
             )}
          </div>

          <div className="grid grid-cols-3 gap-2">
             <button 
               onClick={(e) => handleWhisperVote(e, "TRUE")}
               aria-label="Mark as Real"
               title="Real: Community believes this is true"
               className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all ${
                 post.viewerWhisperVote === "TRUE" 
                 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                 : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:text-white/60"
               }`}
             >
                <span className="text-sm font-bold">Real</span>
                <span className="text-[9px] font-bold opacity-60">
                    {post.whisperStats.total ? Math.round((post.whisperStats.true / post.whisperStats.total) * 100) : 0}%
                </span>
             </button>
             <button 
               onClick={(e) => handleWhisperVote(e, "CAP")}
               aria-label="Mark as Cap"
               title="Cap: Community believes this is fake/gossip"
               className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all ${
                 post.viewerWhisperVote === "CAP" 
                 ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300" 
                 : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:text-white/60"
               }`}
             >
                <span className="text-sm font-bold">Cap</span>
                <span className="text-[9px] font-bold opacity-60">
                    {post.whisperStats.total ? Math.round((post.whisperStats.cap / post.whisperStats.total) * 100) : 0}%
                </span>
             </button>
             <button 
               onClick={(e) => handleWhisperVote(e, "IDK")}
               aria-label="Mark as I don't know"
               title="idk: Community is unsure"
               className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all ${
                 post.viewerWhisperVote === "IDK" 
                 ? "bg-white/10 border-white/20 text-white/80" 
                 : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:text-white/60"
               }`}
             >
                <span className="text-sm font-bold">idk</span>
                <span className="text-[9px] font-bold opacity-60">
                    {post.whisperStats.total ? Math.round((post.whisperStats.idk / post.whisperStats.total) * 100) : 0}%
                </span>
             </button>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {post.subjectTag && (
          <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/50">
            {post.subjectTag}
          </span>
        )}
        {post.locationHint && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/50">
            <MapPin className="h-3 w-3" />
            {post.locationHint}
          </span>
        )}
        {post.quietLevel != null && (
          <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/50">
            Quiet {post.quietLevel}/5
          </span>
        )}
        {post.hotTakeScore != null && (
          <span className="rounded-full border border-rose-500/10 bg-rose-500/5 px-2.5 py-1.5 text-[10px] font-medium text-rose-200/70">
            Heat {post.hotTakeScore}/10
          </span>
        )}
        {post.expiresAt && (
          <span className="rounded-full border border-orange-500/10 bg-orange-500/5 px-2.5 py-1.5 text-[10px] font-medium text-orange-200/70">
            Expires {new Date(post.expiresAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-5">
        {!isGossip && (
          <div className="flex items-center gap-3 rounded-full border border-white/[0.04] bg-white/[0.02] px-3 py-1.5">
            <button
              onClick={handleUpvote}
              aria-label="Upvote"
              className={`transition-all active:scale-90 ${post.viewerVote === 1 ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "text-white/40 hover:text-white/80"}`}
            >
              <ArrowUpCircle className="w-[18px] h-[18px]" />
            </button>
            <span className="min-w-[20px] text-center text-xs font-semibold text-white/80">
              {post.upvotes - post.downvotes}
            </span>
            <button
              onClick={handleDownvote}
              aria-label="Downvote"
              className={`transition-all active:scale-90 ${post.viewerVote === -1 ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" : "text-white/40 hover:text-white/80"}`}
            >
              <ArrowDownCircle className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleReport}
            aria-label={post.viewerReported ? "Unflag post" : "Flag post"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              post.viewerReported
                ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                : "border-transparent bg-transparent text-white/30 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            {post.viewerReported ? "Flagged" : "Flag"}
          </button>
          <div className="flex items-center gap-2 text-white/40 transition-colors group-hover:text-white/70">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-[18px] h-[18px]" />
              <span className="text-xs font-medium">{post._count.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
