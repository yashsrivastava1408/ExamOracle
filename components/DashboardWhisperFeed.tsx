"use client";

import { useEffect, useState, startTransition, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VenetianMask, Ghost, Flame, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Post } from "@/components/community/PostCard";

export default function DashboardWhisperFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const glowY1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const glowY2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

    const fetchGossips = async () => {
        try {
            const res = await fetch("/api/community?sort=latest&tab=whisper", {
                cache: "no-store",
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(data.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard whispers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        startTransition(() => {
            fetchGossips();
        });
    }, []);

    return (
        <motion.section
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-32 border-t border-white/5 bg-[#0a0118] relative overflow-hidden"
        >
            {/* Clandestine Background Glow (Scroll-Linked) */}
            <motion.div 
                style={{ y: glowY1, opacity: glowOpacity }}
                className="absolute -bottom-20 -right-20 h-[300px] md:h-[600px] w-[300px] md:w-[600px] rounded-full bg-fuchsia-600/5 blur-[80px] md:blur-[120px] pointer-events-none" 
            />
            <motion.div 
                style={{ y: glowY2, opacity: glowOpacity }}
                className="absolute -top-20 -left-20 h-[300px] md:h-[600px] w-[300px] md:w-[600px] rounded-full bg-violet-600/5 blur-[80px] md:blur-[120px] pointer-events-none" 
            />
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row gap-20">
                <div className="lg:w-[400px] shrink-0 sticky top-32 h-fit">
                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 md:px-4 py-1 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-fuchsia-400 mb-6 md:mb-8 italic-none shadow-[0_0_15px_rgba(255,0,122,0.3)]">
                        <VenetianMask className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Clandestine Access Requested
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none mb-6 md:mb-8 italic-none">
                        Whisper <br />
                        <span className="text-white/20">Underground</span>
                    </h2>
                    <p className="text-base md:text-lg text-white/30 leading-relaxed font-light italic-none max-w-sm mb-8 md:mb-12">
                        Where campus rumors, exam leaks, and anonymous confessions live. Truth or Cap? You decide.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 py-4 border-b border-white/[0.03] group/info">
                            <Ghost className="h-4 w-4 text-white/20 group-hover/info:text-fuchsia-400/50 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover/info:text-white/50 transition-colors">100% Anonymous by Alias</span>
                        </div>
                        <div className="flex items-center gap-4 py-4 border-b border-white/[0.03] group/info">
                            <Flame className="h-4 w-4 text-rose-500/30 group-hover/info:text-rose-500 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover/info:text-white/50 transition-colors">Live Intel Frequency: High</span>
                        </div>
                        <div className="flex items-center gap-4 py-4 border-b border-white/[0.03] group/info">
                            <ShieldAlert className="h-4 w-4 text-fuchsia-500/30 group-hover/info:text-fuchsia-400 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover/info:text-white/50 transition-colors">Clandestine Encryption: Active</span>
                        </div>
                    </div>

                    <Link
                        href="/whisper"
                        className="mt-16 group inline-flex items-center h-16 px-10 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 text-[11px] font-black uppercase tracking-[0.3em] text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-white transition-all shadow-[0_0_40px_rgba(255,0,122,0.1)]"
                    >
                        Enter The Network
                    </Link>
                </div>

                <div className="flex-1">
                    {loading ? (
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-56 rounded-[3rem] border border-white/5 bg-white/[0.01] animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="h-[400px] rounded-[4rem] border border-dashed border-white/5 bg-black/40 flex items-center justify-center text-white/10 uppercase tracking-widest text-[10px] font-black italic-none">
                            Silence in the network...
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.15 }}
                                    className="group relative rounded-[2rem] md:rounded-[3.5rem] border border-white/[0.03] bg-black/60 p-8 md:p-12 backdrop-blur-3xl hover:bg-fuchsia-500/[0.02] hover:border-fuchsia-500/20 transition-all duration-1000 overflow-hidden"
                                >
                                    <div className="absolute top-8 md:top-12 right-8 md:right-12 flex gap-4">
                                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] animate-pulse" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white/40 group-hover:text-white/90 transition-all duration-700 mb-6 md:mb-8 uppercase italic-none line-clamp-2 leading-[1.1]">
                                        {post.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-6 md:gap-8">
                                        <div className="inline-flex items-center gap-2 md:gap-3 rounded-xl bg-white/[0.02] px-4 md:px-5 py-2 md:py-2.5 border border-white/[0.05] group-hover:border-fuchsia-500/20 transition-colors">
                                            <span className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Heat</span>
                                            <span className="text-[10px] md:text-[11px] uppercase font-black text-fuchsia-400">{post.upvotes}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-2 md:gap-3 rounded-xl bg-white/[0.02] px-4 md:px-5 py-2 md:py-2.5 border border-white/[0.05] group-hover:border-fuchsia-500/20 transition-colors">
                                            <span className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Comments</span>
                                            <span className="text-[10px] md:text-[11px] uppercase font-black text-fuchsia-400">{post._count.comments}</span>
                                        </div>
                                        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/10 group-hover:text-fuchsia-500/40 transition-colors italic-none pt-1">
                                            Intercepted by Alias: {post.alias.name}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.section>
    );
}
