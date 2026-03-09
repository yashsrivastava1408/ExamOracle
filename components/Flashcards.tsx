"use client";

import { Flashcard } from "@/types";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Layers, LayoutGrid, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardsProps {
    flashcards: Flashcard[];
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
                        <div className="mt-2 text-sm font-semibold leading-relaxed text-white">
                            {card.front}
                        </div>
                    </button>
                ))}
            </div>

            {!isGridView ? (
                <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
                        Card {currentIndex + 1} of {flashcards.length}
                    </div>

                    <div
                        className="w-full aspect-[4/3] sm:aspect-[16/9] perspective-1000 mb-8 cursor-pointer group"
                        onClick={toggleFlip}
                    >
                        <motion.div
                            className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-2xl ${isFlipped ? "rotate-y-180" : ""}`}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <div className="absolute w-full h-full backface-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.1] flex flex-col items-center justify-center p-8 sm:p-12 text-center group-hover:border-white/20 transition-colors">
                                <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-indigo-400/50">FRONT</span>
                                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-tight">{currentCard.front}</h3>
                                <span className="absolute bottom-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 p-2 border border-white/10 rounded-lg">Click to reveal</span>
                            </div>

                            <div className="absolute w-full h-full backface-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.02] border border-indigo-500/20 rotate-y-180 flex flex-col p-8 sm:p-12 justify-center shadow-[inset_0_0_80px_rgba(99,102,241,0.05)]">
                                <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest text-emerald-400/50">BACK</span>
                                <div className="overflow-y-auto w-full max-h-full scrollbar-hide text-center sm:text-left">
                                    <p className="text-lg sm:text-xl font-medium text-white/90 leading-relaxed">
                                        {currentCard.back}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between w-full max-w-sm gap-4">
                        <button
                            onClick={prevCard}
                            className="flex-1 flex items-center justify-center py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleFlip}
                            className="flex-[2] py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Flip Card
                        </button>
                        <button
                            onClick={nextCard}
                            className="flex-1 flex items-center justify-center py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
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
                    <h4 className="text-lg font-bold text-white leading-tight">{card.front}</h4>
                </div>

                <div className="absolute w-full h-full backface-hidden rounded-2xl bg-white/[0.05] border border-white/20 rotate-y-180 flex p-6 items-center justify-center text-center">
                    <p className="text-sm text-white/90 font-medium leading-relaxed overflow-hidden line-clamp-6">{card.back}</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
