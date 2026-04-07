"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  MessageSquareText,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

export interface CommunityComment {
  id: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  alias: { name: string };
  viewerVote: number;
  viewerReported: boolean;
}

interface CommentThreadProps {
  aliasName: string;
  comments: CommunityComment[];
  isLoading: boolean;
  isBlocked?: boolean;
  onSubmitComment: (content: string) => Promise<void>;
  onVoteComment: (commentId: string, action: "upvote" | "downvote") => Promise<void>;
  onReportComment: (commentId: string) => Promise<void>;
}

export default function CommentThread({
  aliasName,
  comments,
  isLoading,
  isBlocked = false,
  onSubmitComment,
  onVoteComment,
  onReportComment,
}: CommentThreadProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitComment(content);
      setContent("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
        <h3 className="text-sm font-semibold tracking-tight text-white/90">
          Discussion
        </h3>
        <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold text-indigo-300">
          Replying as {aliasName}
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-6 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-indigo-300/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-[20px] border border-dashed border-white/5 bg-white/[0.02] px-6 text-center">
            <MessageSquareText className="h-6 w-6 text-white/20" />
            <p className="mt-3 text-[13px] font-medium text-white/50">No replies yet</p>
            <p className="mt-1 text-[11px] text-white/30">
              Start the discussion completely anonymously.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="group relative rounded-[20px] border border-white/[0.04] bg-white/[0.015] p-5 transition-all hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-bold text-white/80">
                      {comment.alias.name.charAt(0)}
                    </div>
                    <div className="text-[13px] font-semibold text-white/80">
                      {comment.alias.name}
                    </div>
                  </div>
                  <div className="text-[11px] text-white/30">
                    {formatTimestamp(comment.createdAt)}
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-white/60 font-light pl-8">
                  {comment.content}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 pt-1 pl-8">
                  <div className="flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-1">
                    <button
                      onClick={() => onVoteComment(comment.id, "upvote")}
                      className={`transition-all active:scale-90 ${comment.viewerVote === 1 ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "text-white/30 hover:text-white/70"}`}
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                    </button>
                    <span className="min-w-[16px] text-center text-[11px] font-semibold text-white/70">
                      {comment.upvotes - comment.downvotes}
                    </span>
                    <button
                      onClick={() => onVoteComment(comment.id, "downvote")}
                      className={`transition-all active:scale-90 ${comment.viewerVote === -1 ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" : "text-white/30 hover:text-white/70"}`}
                    >
                      <ArrowDownCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => onReportComment(comment.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      comment.viewerReported
                        ? "text-amber-300/80 bg-amber-500/10"
                        : "text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 shrink-0 rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-md focus-within:border-indigo-500/30 focus-within:bg-indigo-500/[0.02] transition-colors">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add your anonymous take..."
          className="min-h-[80px] w-full resize-none bg-transparent text-[13px] leading-relaxed text-white/90 outline-none placeholder:text-white/20"
          maxLength={800}
          disabled={isSubmitting || isBlocked}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-[10px] text-white/30">{content.length} / 800</div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || isBlocked}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-indigo-50 hover:text-indigo-900 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black disabled:active:scale-100"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Reply
          </button>
        </div>
        {isBlocked && (
          <p className="mt-3 text-[11px] text-amber-300/80">
            Identity blocked from interactions.
          </p>
        )}
        {error && <p className="mt-3 text-[11px] text-rose-400">{error}</p>}
      </form>
    </div>
  );
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
