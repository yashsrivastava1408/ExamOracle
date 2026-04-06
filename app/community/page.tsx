"use client";

import { startTransition, useEffect, useState } from "react";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostCard, { Post } from "@/components/community/PostCard";
import CommentThread, { CommunityComment } from "@/components/community/CommentThread";
import {
  ArrowLeft,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type CommunitySort = "latest" | "top" | "active";

export default function CommunityPage() {
  const [alias, setAlias] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sortMode, setSortMode] = useState<CommunitySort>("latest");
  const [feedError, setFeedError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);

  const fetchPosts = async (sort: CommunitySort, silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setFeedError(null);

    try {
      const res = await fetch(`/api/community?sort=${sort}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load feed");
      }

      setPosts(data);
      setSelectedPost((current) =>
        current ? data.find((post: Post) => post.id === current.id) ?? data[0] ?? null : data[0] ?? null
      );
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Failed to load feed");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchComments = async (postId: string) => {
    setCommentsLoading(true);
    setThreadError(null);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load thread");
      }

      setComments(data);
    } catch (error) {
      setThreadError(error instanceof Error ? error.message : "Failed to load thread");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const identityRes = await fetch("/api/community/identity", {
          cache: "no-store",
        });
        const identityData = await identityRes.json();

        if (!identityRes.ok) {
          throw new Error(identityData.error || "Failed to initialize identity");
        }

        setAlias(identityData.alias);
        setIsBlocked(Boolean(identityData.isBlocked));
      } catch (error) {
        setFeedError(
          error instanceof Error ? error.message : "Failed to initialize community"
        );
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchPosts(sortMode, true);
    });
  }, [sortMode]);

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      return;
    }

    fetchComments(selectedPost.id);
  }, [selectedPost]);

  const handleVote = async (id: string, action: "upvote" | "downvote") => {
    try {
      const res = await fetch(`/api/community/posts/${id}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Vote failed");
      }

      setPosts((current) => current.map((post) => (post.id === id ? data : post)));
      setSelectedPost((current) => (current?.id === id ? data : current));
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Vote failed");
    }
  };

  const handleReportPost = async (id: string) => {
    try {
      const res = await fetch(`/api/community/posts/${id}/report`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not flag post");
      }

      if (data?.isHidden) {
        await fetchPosts(sortMode, true);
        setSelectedPost((current) => (current?.id === id ? null : current));
        return;
      }

      setPosts((current) => current.map((post) => (post.id === id ? data : post)));
      setSelectedPost((current) => (current?.id === id ? data : current));
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Could not flag post");
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!selectedPost) {
      throw new Error("Missing post context");
    }

    const res = await fetch(`/api/community/posts/${selectedPost.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create comment");
    }

    setComments((current) => [...current, data]);
    setPosts((current) =>
      current.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              _count: { comments: post._count.comments + 1 },
            }
          : post
      )
    );
    setSelectedPost((current) =>
      current
        ? {
            ...current,
            _count: { comments: current._count.comments + 1 },
          }
        : current
    );
  };

  const handleCommentVote = async (
    commentId: string,
    action: "upvote" | "downvote"
  ) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Comment vote failed");
      }

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? data : comment))
      );
    } catch (error) {
      setThreadError(
        error instanceof Error ? error.message : "Comment vote failed"
      );
    }
  };

  const handleCommentReport = async (commentId: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/report`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not flag comment");
      }

      if (data?.isHidden) {
        setComments((current) => current.filter((comment) => comment.id !== commentId));
        setPosts((current) =>
          current.map((post) =>
            post.id === selectedPost?.id
              ? {
                  ...post,
                  _count: { comments: Math.max(post._count.comments - 1, 0) },
                }
              : post
          )
        );
        setSelectedPost((current) =>
          current
            ? {
                ...current,
                _count: { comments: Math.max(current._count.comments - 1, 0) },
              }
            : current
        );
        return;
      }

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? data : comment))
      );
    } catch (error) {
      setThreadError(
        error instanceof Error ? error.message : "Could not flag comment"
      );
    }
  };

  const totalConversations = posts.reduce((count, post) => count + post._count.comments, 0);

  const sortOptions: { key: CommunitySort; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "top", label: "Top" },
    { key: "active", label: "Active" },
  ];

  return (
    <div className="relative min-h-screen bg-[#08111f] pb-20 font-sans text-white selection:bg-cyan-300/20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.1),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_26%),linear-gradient(180deg,#08111f_0%,#040814_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
          }}
        />
      </div>

      {alias && (
        <CreatePostForm
          aliasName={alias}
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onPostCreated={() => fetchPosts(sortMode, true)}
        />
      )}

      <div className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.08] bg-[#07111d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to ExamOracle</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPosts(sortMode, true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsComposerOpen(true)}
              disabled={isBlocked}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              New Signal
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[linear-gradient(145deg,rgba(56,189,248,0.12),rgba(255,255,255,0.04)_35%,rgba(8,17,31,0.88)_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Campus Signal Board
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Anonymous by alias.
                <span className="mt-2 block text-white/55">
                  Structured enough for a real local-first forum.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                This build now covers pseudonymous identity, protected one-vote behavior
                on posts and replies, reporting, auto-hiding, abuse throttling, and a
                cleaner feed workflow.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/40">
                Clearing cookies creates a new alias. The browser holds an anonymous
                session cookie, while the server stores only a hashed identifier and the
                generated alias.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Active Alias
                </div>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  {alias ?? "Generating..."}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Feed Size
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">{posts.length}</div>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Total Replies
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">{totalConversations}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {(feedError || threadError || isBlocked) && (
          <div className="mt-6 grid gap-3">
            {feedError && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                <span>{feedError}</span>
              </div>
            )}
            {threadError && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                <span>{threadError}</span>
              </div>
            )}
            {isBlocked && (
              <div className="flex items-start gap-3 rounded-[1.4rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <TriangleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                <span>
                  This anonymous identity has been blocked after repeated community
                  violations. You can still read the feed, but posting, voting, and
                  reporting are disabled.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Global Feed
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  What students are saying
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortMode(option.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      sortMode === option.key
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/20 text-white/65 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex justify-center py-20 text-cyan-200/70">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-black/10 py-20 text-center text-white/40">
                  No visible posts right now. Start a new anonymous thread to seed the board.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    onReport={handleReportPost}
                    onOpen={setSelectedPost}
                    isActive={selectedPost?.id === post.id}
                  />
                ))
              )}
            </div>
          </section>

          <section className="xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)]">
            {selectedPost ? (
              <div className="grid h-full gap-5">
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(217,70,239,0.12),rgba(255,255,255,0.03)_30%,rgba(0,0,0,0.25)_100%)] p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                        Selected Thread
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {selectedPost.title}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55">
                      {selectedPost.alias.name}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {selectedPost.content}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/55">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                      Type {selectedPost.signalType.replaceAll("_", " ")}
                    </span>
                    {selectedPost.subjectTag && (
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                        {selectedPost.subjectTag}
                      </span>
                    )}
                    {selectedPost.locationHint && (
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                        {selectedPost.locationHint}
                      </span>
                    )}
                    {selectedPost.quietLevel != null && (
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                        Quiet {selectedPost.quietLevel}/5
                      </span>
                    )}
                    {selectedPost.hotTakeScore != null && (
                      <span className="rounded-full border border-rose-300/15 bg-rose-400/10 px-3 py-1.5 text-rose-100">
                        Heat {selectedPost.hotTakeScore}/10
                      </span>
                    )}
                    {selectedPost.expiresAt && (
                      <span className="rounded-full border border-orange-300/15 bg-orange-400/10 px-3 py-1.5 text-orange-100">
                        Ends {new Date(selectedPost.expiresAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/55">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                      Score {selectedPost.upvotes - selectedPost.downvotes}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                      Replies {selectedPost._count.comments}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                      Sort {sortMode}
                    </span>
                  </div>
                </div>

                {alias && (
                  <CommentThread
                    aliasName={alias}
                    comments={comments}
                    isLoading={commentsLoading}
                    isBlocked={isBlocked}
                    onSubmitComment={handleCommentSubmit}
                    onVoteComment={handleCommentVote}
                    onReportComment={handleCommentReport}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-8 text-center backdrop-blur-xl">
                <MessageSquareText className="h-10 w-10 text-white/30" />
                <h3 className="mt-4 text-xl font-semibold text-white">Pick a thread</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
                  Open any post from the feed to read the full message, vote on replies,
                  and continue the thread anonymously.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
