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
    <div className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
            Thread
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Replies
          </h3>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
          Replying as {aliasName}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Add a reply
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add context, a follow-up, or what other students should know."
          className="mt-3 min-h-28 w-full resize-none rounded-[1.1rem] border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/90 outline-none transition-colors placeholder:text-white/25 focus:border-cyan-300/30"
          maxLength={800}
          disabled={isSubmitting || isBlocked}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-white/40">{content.length} / 800</div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || isBlocked}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Reply
          </button>
        </div>
        {isBlocked && (
          <p className="mt-3 text-sm text-amber-200">
            This anonymous identity is blocked from new community actions.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </form>

      <div className="mt-5 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-cyan-200/70">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-black/10 px-6 text-center">
            <MessageSquareText className="h-8 w-8 text-white/30" />
            <p className="mt-3 text-sm font-medium text-white/70">No replies yet</p>
            <p className="mt-1 text-sm text-white/40">
              Start the thread without exposing your real identity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/85">
                    {comment.alias.name}
                  </div>
                  <div className="text-xs text-white/35">
                    {formatTimestamp(comment.createdAt)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {comment.content}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-3 rounded-full border border-white/5 bg-black/20 px-3 py-1.5">
                    <button
                      onClick={() => onVoteComment(comment.id, "upvote")}
                      className={`transition-colors hover:text-emerald-400 ${comment.viewerVote === 1 ? "text-emerald-400" : "text-white/60"}`}
                    >
                      <ArrowUpCircle className="h-4.5 w-4.5" />
                    </button>
                    <span className="min-w-[20px] text-center text-xs font-bold text-white/85">
                      {comment.upvotes - comment.downvotes}
                    </span>
                    <button
                      onClick={() => onVoteComment(comment.id, "downvote")}
                      className={`transition-colors hover:text-red-400 ${comment.viewerVote === -1 ? "text-red-400" : "text-white/60"}`}
                    >
                      <ArrowDownCircle className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onReportComment(comment.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      comment.viewerReported
                        ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-black/20 text-white/55 hover:text-white"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {comment.viewerReported ? "Flagged" : "Flag"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
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
