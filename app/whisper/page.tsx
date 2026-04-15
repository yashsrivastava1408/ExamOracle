"use client";

import { PostCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useToaster } from "@/components/ui/Toaster";
import { useEffect, useState, useCallback } from "react";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostCard, { Post } from "@/components/community/PostCard";
import CommentThread, { CommunityComment } from "@/components/community/CommentThread";
import WhisperSplashScreen from "@/components/community/WhisperSplashScreen";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  X,
  VenetianMask,
  Crown,
  Ghost,
  Flame,
  TriangleAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type CommunitySort = "latest" | "top" | "active";

export default function WhisperPage() {
  const [showSplash, setShowSplash] = useState(true);
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
  const { toast } = useToaster();

  const fetchPosts = useCallback(async (sort: CommunitySort, silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setFeedError(null);

    try {
      const res = await fetch(`/api/community?sort=${sort}&tab=whisper`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load whispers");
      }

      setPosts(data);
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Failed to load whispers");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
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
  }, []);

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
          error instanceof Error ? error.message : "Failed to initialize whispers"
        );
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!showSplash) {
      fetchPosts(sortMode, false);
    }
  }, [showSplash, sortMode, fetchPosts]);

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      return;
    }

    fetchComments(selectedPost.id);
  }, [selectedPost, fetchComments]);

  const handleVote = async (id: string, action: "upvote" | "downvote") => {
    const originalPosts = [...posts];
    const originalSelectedPost = selectedPost;

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== id) return post;

        const newVote = action === "upvote" ? 1 : -1;
        const currentVote = post.viewerVote;

        let upvotes = post.upvotes;
        let downvotes = post.downvotes;

        if (currentVote === 1) upvotes--;
        if (currentVote === -1) downvotes--;

        if (currentVote !== newVote) {
          if (newVote === 1) upvotes++;
          if (newVote === -1) downvotes++;
        }

        return {
          ...post,
          upvotes,
          downvotes,
          viewerVote: currentVote === newVote ? 0 : newVote,
        };
      })
    );

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
      toast(`Whisper vote cast!`, "success");
    } catch (error) {
      setPosts(originalPosts);
      setSelectedPost(originalSelectedPost);
      setFeedError(error instanceof Error ? error.message : "Vote failed");
      toast(error instanceof Error ? error.message : "Vote failed", "error");
    }
  };

  const handlePollVote = () => {
  };

  const handleWhisperVote = async (postId: string, value: "TRUE" | "CAP" | "IDK") => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/whisper-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Whisper vote failed");
      setPosts((current) => current.map((post) => (post.id === postId ? data : post)));
      setSelectedPost((current) => (current?.id === postId ? data : current));
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "Whisper vote failed");
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
    if (!selectedPost) throw new Error("Missing post context");

    const res = await fetch(`/api/community/posts/${selectedPost.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to create comment");

    setComments((current) => [...current, data]);
    setPosts((current) =>
      current.map((post) =>
        post.id === selectedPost.id
          ? { ...post, _count: { comments: post._count.comments + 1 } }
          : post
      )
    );
    setSelectedPost((current) =>
      current ? { ...current, _count: { comments: current._count.comments + 1 } } : current
    );
  };

  const handleCommentVote = async (commentId: string, action: "upvote" | "downvote") => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Comment vote failed");
      setComments((current) => current.map((comment) => (comment.id === commentId ? data : comment)));
    } catch (error) {
      setThreadError(error instanceof Error ? error.message : "Comment vote failed");
    }
  };

  const handleCommentReport = async (commentId: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}/report`, {
          method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not flag comment");
      if (data?.isHidden) {
          setComments((current) => current.filter((comment) => comment.id !== commentId));
          return;
      }
      setComments((current) => current.map((comment) => (comment.id === commentId ? data : comment)));
    } catch (error) {
        setThreadError(error instanceof Error ? error.message : "Could not flag comment");
    }
  };

  const sortOptions: { key: CommunitySort; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "top", label: "Top" },
    { key: "active", label: "Active" },
  ];

  if (showSplash) {
    return <WhisperSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0a0118] pb-20 font-sans text-white selection:bg-fuchsia-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(255,0,122,0.08)_0%,transparent_70%)] blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(125,0,255,0.06)_0%,transparent_70%)] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {alias && (
        <CreatePostForm
          mode="whisper"
          aliasName={alias}
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onPostCreated={() => fetchPosts(sortMode, true)}
        />
      )}

      <div className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.05] bg-[#0d0221]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/community" className="flex items-center gap-2 text-white/50 transition-colors hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">The Oracle</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
               onClick={() => fetchPosts(sortMode, true)}
               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsComposerOpen(true)}
              disabled={isBlocked}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,0,122,0.3)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Spill
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1920px] px-4 pt-24 sm:px-6 lg:px-8">
        {(feedError || threadError || isBlocked) && (
          <div className="mb-8 grid gap-3 max-w-4xl mx-auto">
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
                  Access to the Whisper Network is restricted for this alias.
                </span>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_300px] gap-8 items-start">
          
          <aside className="hidden xl:flex flex-col gap-6 sticky top-28 h-[calc(100vh-120px)]">
            <div className="rounded-[32px] border border-fuchsia-500/10 bg-[#0d0221]/40 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[40px]" />
               <div className="flex items-center gap-3 mb-6">
                 <Crown className="w-5 h-5 text-amber-400" />
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Gossip King</h3>
               </div>
               <div className="flex flex-col items-center py-4 bg-fuchsia-500/5 rounded-2xl border border-fuchsia-500/10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 border border-white/20 flex items-center justify-center mb-4 shadow-lg">
                      <VenetianMask className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white mb-1">{alias || "Searching..."}</span>
                  <span className="text-[10px] uppercase font-bold text-fuchsia-400/70 tracking-widest">Internal Insider</span>
               </div>
               <div className="mt-8">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-4">Secret Stats</div>
                  <div className="space-y-4">
                     <div className="flex justify-between text-xs">
                        <span className="text-white/40">Confessions</span>
                        <span className="font-bold text-fuchsia-400">12</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-white/40">Reputation</span>
                        <span className="font-bold text-fuchsia-400">540 XP</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="rounded-[32px] border border-violet-500/10 bg-[#0d0221]/40 p-8 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
               <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400/70 mb-6">Top Secrets</h3>
               <div className="space-y-4">
                  {posts.slice(0, 3).map((p) => (
                    <div key={p.id} className="group cursor-pointer">
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{p.title}</p>
                      <div className="mt-2 text-[9px] text-fuchsia-500/50 uppercase font-bold tracking-widest">{p.upvotes} Heat</div>
                      <div className="mt-4 h-px w-full bg-white/5 group-last:hidden" />
                    </div>
                  ))}
               </div>
            </div>
          </aside>

          <main className="flex flex-col items-center w-full max-w-4xl mx-auto">
            <section className="w-full text-center mb-12">
               <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300 mb-6"
               >
                 <VenetianMask className="h-3.5 w-3.5" />
                 Whisper Network
               </motion.div>
               <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Internal Chitchat.</h1>
               <p className="text-white/40 text-sm max-w-md mx-auto">Where university secrets breathe. Confess, debate, and rumor anonymously.</p>

               <div className="mt-10 flex justify-center gap-3">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortMode(option.key)}
                      className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        sortMode === option.key
                          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          : "border border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
               </div>
            </section>

            <div className="w-full space-y-6">
              {loading ? (
                <div className="flex flex-col gap-6">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] py-24 text-center text-sm text-white/20">
                  Total silence. Be the first to break it.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                    onPollVote={handlePollVote}
                    onReport={handleReportPost}
                    onWhisperVote={handleWhisperVote}
                    onOpen={setSelectedPost}
                    isActive={selectedPost?.id === post.id}
                  />
                ))
              )}
            </div>
          </main>

          {/* Sidebar Right: Rules & Live Activity */}
          <aside className="hidden xl:flex flex-col gap-6 sticky top-28 h-[calc(100vh-120px)]">
             <div className="rounded-[32px] border border-white/5 bg-white/[0.015] p-8 backdrop-blur-2xl shadow-xl">
               <div className="flex items-center gap-2 mb-6">
                 <Ghost className="w-4 h-4 text-white/40" />
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">Clandestine Rules</h3>
               </div>
               <ul className="space-y-4">
                 {[
                   "No real names, only aliases.",
                   "Keep internal rumors credible.",
                   "No harmful bullying.",
                   "Secrets die when the dean finds out."
                 ].map((rule, i) => (
                   <li key={i} className="flex gap-3 text-[11px] leading-relaxed text-white/50 font-light">
                     <span className="text-fuchsia-500">•</span>
                     {rule}
                   </li>
                 ))}
               </ul>
             </div>

             <div className="rounded-[32px] border border-rose-500/10 bg-rose-500/5 p-8 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-300/70">Flame Status</h3>
                  <Flame className="w-4 h-4 text-rose-500 animate-[pulse_2s_infinite]" />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">The board is heated right now. Multiple intel drops detected in the last 15 minutes.</p>
             </div>
          </aside>
        </div>
      </div>

      {/* Thread Drawer */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedPost(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[500px] bg-[#0a0118] border-l border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
            >
              <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
                <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0a0118]/80 p-6 backdrop-blur-2xl border-b border-white/5">
                   <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Secret Thread</div>
                   <button onClick={() => setSelectedPost(null)} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-8">
                   <div className="mb-10">
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-4">{selectedPost.title}</h2>
                      <p className="text-sm leading-relaxed text-white/60 font-light whitespace-pre-wrap">{selectedPost.content}</p>
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
