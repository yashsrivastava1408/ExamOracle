"use client";

import { MCQQuestion } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, HelpCircle, XCircle, Trophy, RefreshCw, ArrowRight, ChevronRight, Star } from "lucide-react";

interface QuizSectionProps {
    questions: MCQQuestion[];
}

export default function QuizSection({ questions }: QuizSectionProps) {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <HelpCircle className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40 font-light tracking-wide uppercase text-[10px] font-black">No Questions Found</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === questions.length - 1;
    const isFirstQuestion = currentQuestionIdx === 0;
    const answeredCount = Object.keys(selectedAnswers).length;

    const handleSelectOption = (option: string) => {
        if (isSubmitted && !isReviewMode) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQuestionIdx]: option,
        }));
    };

    const handleNext = () => {
        if (!isLastQuestion) setCurrentQuestionIdx((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (!isFirstQuestion) setCurrentQuestionIdx((prev) => prev - 1);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        setCurrentQuestionIdx(0);
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setIsReviewMode(false);
        setCurrentQuestionIdx(0);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) {
                correct++;
            }
        });
        return correct;
    };

    if (isSubmitted && !isReviewMode) {
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);
        
        let rank = "Scholar";
        let rankDesc = "Your comprehension of the core logic is nearly perfect.";
        let rankColor = "text-emerald-400";
        
        if (percentage < 50) {
            rank = "Acolyte";
            rankDesc = "Further iterations required. Re-read the source notes.";
            rankColor = "text-rose-400";
        } else if (percentage < 85) {
            rank = "Initiate";
            rankDesc = "Solid foundation, but critical vectors were missed.";
            rankColor = "text-amber-400";
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-12 bg-white/[0.01] border border-white/[0.05] rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl hover:scale-105 transition-transform duration-500">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 mb-10">
                        <h2 className="text-4xl font-black tracking-tight text-white uppercase italic-none">Quiz Finished</h2>
                        <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${rankColor}`}>Grade: {rank}</div>
                    </div>

                    <div className="text-[8rem] font-black tracking-tighter leading-none mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none">
                        {percentage}%
                    </div>
                    
                    <p className="text-white/40 text-base mb-12 max-w-sm mx-auto font-light leading-relaxed italic-none">
                        Correct Predictions: <span className="text-white font-bold">{score}/{questions.length}</span>. {rankDesc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setIsReviewMode(true)}
                            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Review Matrix
                        </button>
                        <button
                            onClick={handleRetry}
                            className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset Simulation
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        {isReviewMode ? "Review Answers" : "Practice Quiz"}
                    </h2>
                    <p className="text-sm text-white/30 mt-2 font-light">
                        {isReviewMode ? "See why you got some questions wrong." : "Test your knowledge on the core concepts."}
                    </p>
                </div>
                {!isReviewMode && (
                    <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] px-6 py-4 backdrop-blur-xl">
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">
                            Load State
                        </div>
                        <div className="text-xl font-black text-white/90 tabular-nums">
                            {answeredCount} / {questions.length}
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-10">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 1 }}
                    />
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        Question {currentQuestionIdx + 1}
                    </span>
                    {isReviewMode && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                             Review Analysis Active
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: 20, scale: 0.99 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 1.01 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-white/[0.01] border border-white/[0.05] p-10 sm:p-14 rounded-[3rem] relative overflow-hidden group shadow-2xl backdrop-blur-md"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                        <HelpCircle className="w-48 h-48" />
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold mb-12 text-white leading-relaxed tracking-tight relative z-10 selection:bg-emerald-500/30">
                        {currentQuestion.question}
                    </h3>

                    <div className="grid gap-3 relative z-10">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedAnswers[currentQuestionIdx] === option;
                            const isCorrectAnswer = isReviewMode && option === currentQuestion.answer;

                            let optionClass = "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10";
                            let icon = <div className="w-5 h-5 rounded-full border-2 border-white/10 transition-colors group-hover/opt:border-white/20" />;

                            if (isReviewMode) {
                                if (isCorrectAnswer) {
                                    optionClass = "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.05)]";
                                    icon = <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
                                } else if (isSelected) {
                                    optionClass = "border-rose-500/30 bg-rose-500/10 opacity-50";
                                    icon = <XCircle className="w-6 h-6 text-rose-400" />;
                                } else {
                                    optionClass = "border-white/5 bg-transparent opacity-20 scale-95";
                                }
                            } else if (isSelected) {
                                optionClass = "border-white/30 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)] scale-[1.02]";
                                icon = <CheckCircle2 className="w-6 h-6 text-white" />;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(option)}
                                    disabled={isReviewMode}
                                    className={`group/opt w-full flex items-center gap-5 text-left p-6 rounded-[1.5rem] border transition-all duration-300 ${optionClass}`}
                                >
                                    <div className="shrink-0 flex items-center justify-center w-6 h-6">{icon}</div>
                                    <span className={`text-lg font-medium transition-colors ${isSelected || isCorrectAnswer ? 'text-white' : 'text-white/60 group-hover/opt:text-white/90'}`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {isReviewMode && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-10 overflow-hidden"
                            >
                                <div className={`p-6 rounded-2xl border ${selectedAnswers[currentQuestionIdx] === currentQuestion.answer ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-200/60' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-200/60'} text-base leading-relaxed font-light shadow-inner`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`h-1.5 w-1.5 rounded-full ${selectedAnswers[currentQuestionIdx] === currentQuestion.answer ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Explanation</span>
                                    </div>
                                    {currentQuestion.explanation}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={handlePrev}
                    disabled={isFirstQuestion}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.25em] text-white/30 disabled:opacity-0 transition-all hover:bg-white/5 hover:text-white/60"
                >
                    Previous
                </button>

                {!isReviewMode ? (
                    isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={Object.keys(selectedAnswers).length !== questions.length}
                            className="px-12 py-4 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.25em] hover:bg-cyan-50 disabled:opacity-20 disabled:hover:bg-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!selectedAnswers[currentQuestionIdx]}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white/10 disabled:opacity-20 transition-all"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )
                ) : (
                    isLastQuestion ? (
                        <button
                            onClick={handleRetry}
                            className="px-10 py-4 rounded-2xl bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all"
                        >
                            Terminate Review
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-cyan-50 transition-all"
                        >
                            Next Mistake <ChevronRight className="w-4 h-4" />
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
