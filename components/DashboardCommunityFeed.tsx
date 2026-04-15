"use client";

import { useEffect, useState, startTransition, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, MessageSquareText, Radio } from "lucide-react";
import Link from "next/link";
import { Post } from "@/components/community/PostCard";

export default function DashboardCommunityFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    const fetchSignals = async () => {
        try {
            const res = await fetch("/api/community?sort=top&tab=oracle", {
                cache: "no-store",
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(data.slice(0, 4));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard signals", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        startTransition(() => {
            fetchSignals();
        });
    }, []);

    return (
        <motion.section
            ref={containerRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-32 border-t border-white/5 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent relative overflow-hidden"
        >
            {/* Background Radar Animation (Scroll-Linked) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 scale-75 md:scale-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] md:h-[800px] w-[600px] md:w-[800px] rounded-full border border-indigo-500/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] md:h-[500px] w-[400px] md:w-[500px] rounded-full border border-indigo-500/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 rounded-full bg-indigo-500 blur-sm animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                <motion.div 
                    style={{ rotate }}
                    className="origin-[center_0] bg-gradient-to-t from-transparent to-indigo-500/40 w-0.5 md:w-1 h-[300px] md:h-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full" 
                />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 italic-none">
                            <Radio className="h-3.5 w-3.5 animate-pulse" />
                            Live Neural Radar
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white/95 uppercase leading-[0.9] pb-4">
                            The Oracle Hub
                        </h2>
                        <p className="mt-6 text-lg text-white/30 font-light italic-none max-w-md leading-relaxed">
                            Global signals from students currently predicting exams. Open any kit to verify with your syllabus.
                        </p>
                    </div>

                    <Link
                        href="/community"
                        className="group inline-flex items-center gap-4 h-14 px-8 rounded-2xl border border-indigo-500/20 bg-black text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    >
                        Enter Community Hub
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[280px] rounded-[2.5rem] border border-white/5 bg-white/[0.01] animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="h-[300px] rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center text-white/20 uppercase tracking-[0.2em] font-black text-xs">
                        Radar Silent. No active signals.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative rounded-[2.5rem] border border-white/[0.05] bg-black/40 p-10 backdrop-blur-xl hover:bg-indigo-500/[0.04] hover:border-indigo-500/30 transition-all duration-700 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-40 transition-opacity">
                                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                                </div>
                                <div className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-indigo-500/60 mb-4 md:mb-6 inline-block py-1 px-2.5 md:px-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                    {post.signalType.replace("_", " ")}
                                </div>
                                <h3 className="text-lg md:text-xl font-black tracking-tight text-white/70 group-hover:text-white transition-colors mb-6 md:mb-8 leading-tight uppercase line-clamp-3 min-h-[3.5rem] md:min-h-[4.5rem]">
                                    {post.title}
                                </h3>
                                <div className="flex items-center justify-between mt-auto pt-6 md:pt-8 border-t border-white/[0.05]">
                                    <div className="flex items-center gap-2 md:gap-2.5">
                                        <MessageSquareText className="h-3 w-3 md:h-3.5 md:w-3.5 text-white/20" />
                                        <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white/30 uppercase">
                                            {post._count.comments} Intel Drops
                                        </span>
                                    </div>
                                    <div className="text-[8px] md:text-[9px] font-black tracking-widest text-indigo-400/50 uppercase group-hover:text-indigo-400 transition-colors">
                                        @{post.alias.name}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.section>
    );
}
