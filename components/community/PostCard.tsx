"use client";

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BookMarked,
  ChevronRight,
  Flame,
  LibraryBig,
  MapPin,
  Megaphone,
  MessageCircleWarning,
  MessageSquare,
  NotebookPen,
  Pin,
  Siren,
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
    | "intel_drop";
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
  alias: { name: string };
  _count: { comments: number };
  viewerVote: number;
  viewerReported: boolean;
}

interface PostCardProps {
  post: Post;
  onVote: (id: string, action: "upvote" | "downvote") => void;
  onReport: (id: string) => void;
  onOpen: (post: Post) => void;
  isActive: boolean;
}

const signalMeta = {
  confession: {
    label: "Confession",
    Icon: NotebookPen,
    chip: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    chip: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  },
  resource: {
    label: "Resource",
    Icon: BookMarked,
    chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  },
  doubt: {
    label: "Doubt",
    Icon: MessageCircleWarning,
    chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  },
  hot_take: {
    label: "Hot Take",
    Icon: Flame,
    chip: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  },
  library_live: {
    label: "Library Live",
    Icon: LibraryBig,
    chip: "border-indigo-300/20 bg-indigo-400/10 text-indigo-100",
  },
  survival_thread: {
    label: "Survival Thread",
    Icon: Megaphone,
    chip: "border-teal-300/20 bg-teal-400/10 text-teal-100",
  },
  intel_drop: {
    label: "Intel Drop",
    Icon: Siren,
    chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  },
} as const;

export default function PostCard({ post, onVote, onReport, onOpen, isActive }: PostCardProps) {
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

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const meta = signalMeta[post.signalType];
  const SignalIcon = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cursor-pointer rounded-[1.75rem] border p-5 shadow-lg transition-all backdrop-blur-md ${
        isActive
          ? "border-cyan-300/30 bg-cyan-400/[0.08]"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
      onClick={() => onOpen(post)}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-500 to-teal-400 text-sm font-bold text-white shadow-inner">
            {post.alias.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">{post.alias.name}</p>
            <p className="text-xs text-white/50">{date}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${meta.chip}`}>
            <SignalIcon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-bold text-white">{post.title}</h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-white/70">{post.content}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {post.subjectTag && (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            {post.subjectTag}
          </span>
        )}
        {post.locationHint && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            <MapPin className="h-3.5 w-3.5" />
            {post.locationHint}
          </span>
        )}
        {post.quietLevel != null && (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white/70">
            Quiet {post.quietLevel}/5
          </span>
        )}
        {post.hotTakeScore != null && (
          <span className="rounded-full border border-rose-300/15 bg-rose-400/10 px-3 py-1.5 text-[11px] font-semibold text-rose-100">
            Heat {post.hotTakeScore}/10
          </span>
        )}
        {post.expiresAt && (
          <span className="rounded-full border border-orange-300/15 bg-orange-400/10 px-3 py-1.5 text-[11px] font-semibold text-orange-100">
            Expires {new Date(post.expiresAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 rounded-full border border-white/5 bg-black/20 px-3 py-1.5">
          <button
            onClick={handleUpvote}
            className={`transition-colors hover:text-emerald-400 ${post.viewerVote === 1 ? "text-emerald-400" : "text-white/60"}`}
          >
            <ArrowUpCircle className="w-5 h-5" />
          </button>
          <span className="min-w-[20px] text-center text-sm font-bold text-white/90">
            {post.upvotes - post.downvotes}
          </span>
          <button
            onClick={handleDownvote}
            className={`transition-colors hover:text-red-400 ${post.viewerVote === -1 ? "text-red-400" : "text-white/60"}`}
          >
            <ArrowDownCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReport}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              post.viewerReported
                ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
                : "border-white/10 bg-black/20 text-white/55 hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {post.viewerReported ? "Flagged" : "Flag"}
          </button>
          <div className="flex items-center gap-3 text-white/60 transition-colors hover:text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">{post._count.comments}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
