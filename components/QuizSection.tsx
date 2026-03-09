"use client";

import { MCQQuestion } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, HelpCircle, XCircle, Trophy, RefreshCw, ArrowRight } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
                <HelpCircle className="w-10 h-10 text-white/20 mb-4" />
                <p className="text-white/40 font-light">No quiz generated.</p>
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

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] border border-white/[0.08] rounded-3xl"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(99,102,241,0.15)]">
                    <Trophy className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">Quiz Complete!</h2>
                <p className="text-white/50 text-lg mb-8">You answered {score} out of {questions.length} questions correctly.</p>

                <div className="text-[6rem] font-bold tracking-tighter leading-none mb-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                    {percentage}%
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsReviewMode(true)}
                        className="px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white hover:bg-white/[0.1] font-semibold transition-colors"
                    >
                        Review Answers
                    </button>
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 font-semibold transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    // Question / Review Mode
    return (
        <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        {isReviewMode ? "Quiz Review" : "Interactive Quiz"}
                    </h2>
                    <p className="text-sm text-white/40 mt-1 font-light">
                        {isReviewMode ? "Reviewing correct answers and explanations." : "Test your understanding with generated MCQs."}
                    </p>
                </div>
                {!isReviewMode && (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Completion
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                            {answeredCount} / {questions.length} answered
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    ></motion.div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Question {currentQuestionIdx + 1} of {questions.length}
                    </span>
                    {isReviewMode && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2 rounded">
                            REVIEW MODE
                        </span>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white/[0.02] border border-white/[0.08] p-8 rounded-3xl"
                >
                    <h3 className="text-xl sm:text-2xl font-semibold mb-8 text-white leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedAnswers[currentQuestionIdx] === option;
                            const isCorrectAnswer = isReviewMode && option === currentQuestion.answer;

                            let optionClass = "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]";
                            let icon = <Circle className="w-5 h-5 text-white/20" />;

                            if (isReviewMode) {
                                if (isCorrectAnswer) {
                                    optionClass = "border-emerald-500/30 bg-emerald-500/10";
                                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
                                } else if (isSelected) {
                                    optionClass = "border-rose-500/30 bg-rose-500/10 opacity-50";
                                    icon = <XCircle className="w-5 h-5 text-rose-400" />;
                                } else {
                                    optionClass = "border-white/[0.05] bg-transparent opacity-30";
                                }
                            } else if (isSelected) {
                                optionClass = "border-white bg-white/10";
                                icon = <CheckCircle2 className="w-5 h-5 text-white" />;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(option)}
                                    disabled={isReviewMode}
                                    className={`w-full flex items-center gap-4 text-left p-4 rounded-xl border transition-all duration-200 ${optionClass}`}
                                >
                                    <div className="shrink-0">{icon}</div>
                                    <span className={`text-base font-medium ${isSelected || isCorrectAnswer ? 'text-white' : 'text-white/70'}`}>
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {isReviewMode && selectedAnswers[currentQuestionIdx] !== currentQuestion.answer && (
                        <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm leading-relaxed">
                            <strong>Explanation: </strong>
                            {currentQuestion.explanation}
                        </div>
                    )}
                    {isReviewMode && selectedAnswers[currentQuestionIdx] === currentQuestion.answer && (
                        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm leading-relaxed">
                            <strong className="text-emerald-400">Correct! </strong>
                            {currentQuestion.explanation}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={handlePrev}
                    disabled={isFirstQuestion}
                    className="px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm font-semibold disabled:opacity-30 transition-colors"
                >
                    Previous
                </button>

                {!isReviewMode ? (
                    isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={Object.keys(selectedAnswers).length !== questions.length}
                            className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-lg"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    )
                ) : (
                    isLastQuestion ? (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 font-semibold transition-colors"
                        >
                            Exit Review
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                        >
                            Next Question
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
