"use client";

import { Flashcard } from "@/types";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Layers, LayoutGrid, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardsProps {
    flashcards: Flashcard[];
}

function getModeLabel(mode?: Flashcard["mode"]) {
    switch (mode) {
        case "comparison":
            return "Comparison";
        case "step-order":
            return "Step Order";
        case "fact-recall":
            return "Fact Recall";
        case "why-it-matters":
            return "Why It Matters";
        default:
            return "Definition";
    }
}

export default function Flashcards({ flashcards }: FlashcardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isGridView, setIsGridView] = useState(false);

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    const toggleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                <Layers className="w-10 h-10 text-white/20 mb-4" />
                <p className="text-white/40 font-light">No flashcards generated.</p>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const previewCards = flashcards.slice(0, 4);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" />
                        Smart Flashcards
                    </h2>
                    <p className="text-sm text-white/40 mt-1 font-light">Interactive recall cards extracted automatically from core concepts.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`p-2 rounded-lg transition-colors ${!isGridView ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
                        title="Single Card View"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`p-2 rounded-lg transition-colors ${isGridView ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {previewCards.map((card, index) => (
                    <button
                        key={`${card.front}-${index}`}
                        type="button"
                        onClick={() => {
                            setCurrentIndex(index);
                            setIsGridView(false);
                            setIsFlipped(false);
                        }}
                        className={`rounded-2xl border p-4 text-left transition-colors ${currentIndex === index && !isGridView ? "border-white/20 bg-white/[0.07]" : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"}`}
                    >
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Quick Card
                        </div>
                        <div className="mt-2 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-200/80">
                            {getModeLabel(card.mode)}
                        </div>
                        <div className="mt-2 text-sm font-semibold leading-relaxed text-white">
                            {card.front}
                        </div>
                    </button>
                ))}
            </div>

            {!isGridView ? (
                <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
                    {/* Mastery Bar */}
                    <div className="w-full max-w-sm mb-12">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Your Progress</span>
                            <span className="text-xs font-bold text-indigo-400">{Math.round(((currentIndex + 1) / flashcards.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 1 }}
                            />
                        </div>
                    </div>

                    <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-[16/10] perspective-2000 mb-12 cursor-pointer group">
                        {/* 3D Stack Effect (Cards behind) */}
                        <div className="absolute inset-0 translate-y-4 scale-[0.92] opacity-20 bg-[#03060c] rounded-[2.5rem] border border-white/10 blur-[2px]" />
                        <div className="absolute inset-0 translate-y-2 scale-[0.96] opacity-40 bg-[#03060c] rounded-[2.5rem] border border-white/10 blur-[1px]" />
                        
                        <motion.div
                            className={`relative w-full h-full transition-all duration-700 transform-style-3d shadow-2xl ${isFlipped ? "rotate-y-180" : ""}`}
                            animate={{ 
                                rotateY: isFlipped ? 180 : 0,
                                z: isFlipped ? 50 : 0
                            }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                            onClick={toggleFlip}
                        >
                            {/* Front Side */}
                            <div className="absolute w-full h-full backface-hidden rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/[0.15] flex flex-col items-center justify-center p-10 sm:p-14 text-center group-hover:border-white/30 transition-all duration-500 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
                                <div className="absolute top-8 left-10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/70">Flashcard</span>
                                </div>
                                <span className="absolute top-8 right-10 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-200">
                                    {getModeLabel(currentCard.mode)}
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 leading-tight select-none">
                                    {currentCard.front}
                                </h3>
                                <div className="absolute bottom-8 px-4 py-2 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-3 group/hint">
                                    <Maximize2 className="w-3 h-3 text-white/30 group-hover/hint:text-white transition-colors" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 group-hover/hint:text-white/60 transition-colors">Show Answer</span>
                                </div>
                            </div>

                            {/* Back Side */}
                            <div className="absolute w-full h-full backface-hidden rounded-[2.5rem] bg-[#070b14] border border-indigo-500/30 rotate-y-180 flex flex-col p-10 sm:p-14 justify-center shadow-[inset_0_0_100px_rgba(99,102,241,0.08)]">
                                <div className="absolute top-8 right-10 flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/70">Correct Answer</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                                <div className="overflow-y-auto w-full max-h-full no-scrollbar text-center">
                                    <p className="text-xl sm:text-2xl font-medium text-white/90 leading-relaxed tracking-tight select-none">
                                        {currentCard.back}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-center w-full max-w-md gap-4">
                        <button
                            onClick={prevCard}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-white/40" />
                        </button>
                        <button
                            onClick={toggleFlip}
                            className="flex-1 h-14 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.25em] hover:bg-cyan-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                        >
                            {isFlipped ? "Next Card" : "Flip Card"}
                        </button>
                        <button
                            onClick={nextCard}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-white/40" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {flashcards.map((card, index) => (
                            <FlashcardGridItem key={index} card={card} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function FlashcardGridItem({ card, index }: { card: Flashcard; index: number }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="aspect-square perspective-1000 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl"
                animate={{ rotateY: flipped ? 180 : 0 }}
            >
                <div className="absolute w-full h-full backface-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center p-6 text-center hover:bg-white/[0.04]">
                    <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest text-white/20">#{index + 1}</span>
                    <span className="absolute top-4 right-4 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-200/80">
                        {getModeLabel(card.mode)}
                    </span>
                    <h4 className="text-lg font-bold text-white leading-tight">{card.front}</h4>
                </div>

                <div className="absolute w-full h-full backface-hidden rounded-2xl bg-white/[0.05] border border-white/20 rotate-y-180 flex p-6 items-center justify-center text-center">
                    <p className="text-sm text-white/90 font-medium leading-relaxed overflow-hidden line-clamp-6">{card.back}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
