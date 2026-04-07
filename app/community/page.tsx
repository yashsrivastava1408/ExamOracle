"use client";

import { startTransition, useEffect, useState } from "react";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostCard, { Post } from "@/components/community/PostCard";
import CommentThread, { CommunityComment } from "@/components/community/CommentThread";
import {
  Activity,
  ArrowLeft,
  Loader2,
  MessageSquareText,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  VenetianMask,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      const res = await fetch(`/api/community?sort=${sort}&tab=oracle`, {
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

  const handlePollVote = async (postId: string, pollOptionId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollOptionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Poll vote failed");

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, pollOptions: data.pollOptions, viewerPollVoteId: data.viewerPollVoteId }
            : post
        )
      );
      setSelectedPost((current) =>
        current?.id === postId
          ? { ...current, pollOptions: data.pollOptions, viewerPollVoteId: data.viewerPollVoteId }
          : current
      );
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Poll vote failed");
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
    <div className="relative min-h-screen bg-[#03060c] pb-20 font-sans text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.04)_0%,transparent_70%)] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {alias && (
        <CreatePostForm
          mode="oracle"
          aliasName={alias}
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onPostCreated={() => fetchPosts(sortMode, true)}
        />
      )}

      <div className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.08] bg-[#07111d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/40 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/whisper"
              className="flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-300 transition-colors hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
            >
              <VenetianMask className="w-3.5 h-3.5" />
              The Whisper Network
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
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1800px] px-4 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-white/5 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_70%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)] px-6 py-12 lg:py-24 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl text-center"
        >
          <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              <Sparkles className="h-3 w-3" />
              ExamOracle Community
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl text-white/95 text-balance">
              Anonymous by alias. <br />
              <span className="text-white/50">Local-first forum.</span>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-white/60 text-balance">
              A safe space to discuss courses, ask questions, share resources, and connect with your peers anonymously.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-indigo-300/40 text-balance max-w-2xl">
              Your identity is protected. Feel free to ask questions you might be too shy to ask in class.
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/20 p-8 backdrop-blur-md transition-colors hover:bg-white/[0.04]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/30">Active Alias</span>
              <span className="mt-3 text-2xl font-semibold text-indigo-200">
                {alias ?? "---"}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/20 p-8 backdrop-blur-md transition-colors hover:bg-white/[0.04]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/30">Feed Size</span>
              <span className="mt-3 text-4xl font-semibold text-white/90">{posts.length}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/20 p-8 backdrop-blur-md transition-colors hover:bg-white/[0.04]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/30">Replies</span>
              <span className="mt-3 text-4xl font-semibold text-white/90">{totalConversations}</span>
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

        <div className="mt-10 mx-auto max-w-[1920px] w-full grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] 2xl:grid-cols-[340px_1fr_340px] gap-12 px-4 sm:px-6 lg:px-12 items-start">
          
          {/* Left space utilization: "Crazy" Campus Radar Sidebar */}
          <aside className="hidden xl:block sticky top-28 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pb-10">
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.015] p-8 backdrop-blur-xl shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Activity className="h-32 w-32 text-indigo-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Popular Topics</h3>
                </div>
                
                <div className="mt-8 relative h-64 w-full overflow-hidden rounded-[20px] border border-white/5 bg-[#03060c] shadow-inner">
                  {/* Radar sweep animation */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className="absolute h-48 w-48 rounded-full border border-indigo-500/20" />
                    <div className="absolute h-32 w-32 rounded-full border border-indigo-500/30" />
                    <div className="absolute h-16 w-16 rounded-full border border-indigo-500/40 bg-indigo-500/10" />
                    <div className="origin-center h-24 w-0.5 bg-gradient-to-t from-transparent to-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] absolute top-1/2 left-1/2 animate-[spin_3s_linear_infinite]" />
                  </div>
                  {/* Floating tags on radar */}
                  <div className="absolute top-8 left-6 text-[10px] font-semibold tracking-wider text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10 shadow-lg backdrop-blur-md">#DBMS</div>
                  <div className="absolute bottom-8 right-6 text-[10px] font-semibold tracking-wider text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-lg backdrop-blur-md">Maths 3</div>
                  <div className="absolute top-24 right-6 text-[10px] font-semibold tracking-wider text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 shadow-lg backdrop-blur-md">Viva Alert</div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-[0.15em] mb-5">Active Categories</div>
                  {[
                    { name: "Computer Science", level: 3 },
                    { name: "Electronics", level: 1 },
                    { name: "Mechanical", level: 2 },
                    { name: "Campus Life", level: 3 }
                  ].map((t) => (
                    <div key={t.name} className="flex items-center justify-between group cursor-default">
                      <span className="text-[12px] text-white/50 group-hover:text-white/90 transition-colors font-medium tracking-wide">{t.name}</span>
                      <div className="flex gap-1.5 h-4 items-end">
                        <div className={`w-1.5 bg-indigo-500/30 rounded-t-sm group-hover:bg-indigo-400 transition-all ${t.level >= 1 ? 'h-full bg-indigo-500/60' : 'h-1/3'}`} />
                        <div className={`w-1.5 bg-indigo-500/30 rounded-t-sm group-hover:bg-indigo-400 transition-all ${t.level >= 2 ? 'h-full bg-indigo-500/60' : 'h-2/3'}`} />
                        <div className={`w-1.5 bg-indigo-500/30 rounded-t-sm group-hover:bg-indigo-400 transition-all ${t.level >= 3 ? 'h-full bg-indigo-500/60' : 'h-1/3'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Central Feed Area */}
          <div className="flex flex-col items-center w-full">
            <section className="w-full max-w-5xl px-2">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortMode(option.key)}
                      className={`rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all backdrop-blur-md ${
                        sortMode === option.key
                          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                          : "border border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {loading ? (
                  <div className="flex justify-center py-20 text-indigo-300/50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] py-24 text-center text-sm text-white/40 backdrop-blur-sm">
                    No visible posts right now. Start a new anonymous thread to seed the board.
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onVote={handleVote}
                      onPollVote={handlePollVote}
                      onReport={handleReportPost}
                      onOpen={setSelectedPost}
                      isActive={selectedPost?.id === post.id}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right space utilization: Live Intel & System Nodes */}
          <aside className="hidden xl:block sticky top-28 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pb-10">
            <div className="flex flex-col gap-6">
              
              <div className="rounded-[24px] border border-white/5 bg-white/[0.015] p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Top Discussions</h3>
                  <Radio className="h-3 w-3 text-rose-400 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {posts.slice(0, 3).map(p => (
                    <div key={p.id} onClick={() => setSelectedPost(p)} className="group cursor-pointer">
                      <div className="text-[13px] font-medium text-white/70 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
                        {p.title}
                      </div>
                      <div className="mt-2 text-[10px] text-white/30 flex justify-between uppercase tracking-wider font-semibold">
                        <span className="text-indigo-300/50">{p.subjectTag || "General"}</span>
                        <span>{p._count?.comments || 0} replies</span>
                      </div>
                      <div className="mt-3 h-px w-full bg-white/5 group-last:hidden" />
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <div className="text-[11px] text-white/30 italic">No posts yet...</div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-500/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.03),transparent)] p-6 backdrop-blur-xl shadow-xl overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500/70 mb-6">Community Status</h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-emerald-200/50 uppercase tracking-[0.1em] mb-2">
                      <span>Privacy Protection</span>
                      <span className="text-emerald-400">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-full bg-gradient-to-r from-emerald-500/40 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-emerald-200/50 uppercase tracking-[0.1em] mb-2">
                      <span>Secure Connection</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500/40 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] bg-[#050914] shadow-2xl border-l border-white/5 flex flex-col"
            >
              <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#050914]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                      Thread Activity
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium tracking-tight text-white/90">
                      {selectedPost.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60 font-light">
                      {selectedPost.content}
                    </p>
                  </div>

                  <div className="mb-8 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-2.5 py-1">
                       <span className="text-xs font-medium text-white/60">By {selectedPost.alias.name}</span>
                    </div>
                    <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">
                      {selectedPost.signalType.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">
                      Score {selectedPost.upvotes - selectedPost.downvotes}
                    </span>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
