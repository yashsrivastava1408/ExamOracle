"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

export default function SplashScreen() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        if (sessionStorage.getItem("splash_seen")) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShow(false);
            setTimeout(() => {
                window.dispatchEvent(new Event("splashComplete"));
            }, 50);
            return;
        }

        // Hide splash screen after minimum delay to let animations complete
        const timer = setTimeout(() => {
            setShow(false);
            sessionStorage.setItem("splash_seen", "true");
            window.dispatchEvent(new Event("splashComplete"));
        }, 2800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
                >
                    {/* Abstract cosmic background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

                        <motion.div
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"
                        />
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"
                        />
                    </div>

                    {/* Logo container */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 flex flex-col items-center gap-6"
                    >
                        {/* Logo Icon */}
                        <motion.div
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 15,
                                delay: 0.6
                            }}
                            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)] relative overflow-hidden"
                        >
                            {/* Internal glow */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent"
                            />

                            <Zap className="w-12 h-12 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />

                            {/* Diagonal Shimmer effect */}
                            <motion.div
                                initial={{ x: "-150%" }}
                                animate={{ x: "250%" }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-[200%] -top-[50%] skew-x-12"
                            />
                        </motion.div>

                        {/* Typography */}
                        <motion.div className="flex flex-col items-center gap-3">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
                                className="text-4xl font-bold tracking-tight text-white drop-shadow-lg"
                            >
                                Exam<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">Oracle</span>
                            </motion.h1>

                            {/* Progress Line */}
                            <div className="w-48 h-[2px] rounded-full bg-white/10 relative overflow-hidden mt-2">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
