"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Ghost, Lock } from "lucide-react";

export default function WhisperSplashScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const phrases = [
    { text: "Gossip things...", icon: Ghost },
    { text: "Secret things...", icon: Lock },
    { text: "Don't leak...", icon: Ghost },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev: number) => {
        if (prev >= phrases.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [onComplete, phrases.length]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0118] text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="p-4 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-[0_0_30px_rgba(255,0,122,0.1)]">
            {step === 0 && <Ghost className="w-12 h-12 text-fuchsia-400" />}
            {step === 1 && <Lock className="w-12 h-12 text-violet-400" />}
            {step === 2 && <Ghost className="w-12 h-12 text-rose-400" />}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-300 to-rose-400">
            {phrases[step].text}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-20 w-[200px] h-0.5 bg-fuchsia-500/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 4.5, ease: "linear" }}
          className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-[0_0_10px_rgba(255,0,122,0.5)]"
        />
      </div>
    </div>
  );
}
