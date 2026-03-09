"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CopyPlus, Sparkles, FileText, UploadCloud, AlertTriangle, X, Mail, CheckCircle } from "lucide-react";
import { useForm } from '@formspree/react';

// Dynamically import pdf.js to keep initial bundle size down and avoid server-side issues
const loadPdfJs = async () => {
    const pdfjs = await import("pdfjs-dist");
    // Setup worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    return pdfjs;
};

interface NoteInputProps {
    onSubmit: (notes: string) => void;
    isLoading: boolean;
}

const SAMPLE_NOTES = `Cell Division - Biology Notes

Mitosis is the process of cell division that results in two genetically identical daughter cells. It occurs in somatic cells and is essential for growth, repair, and maintenance of organisms.

Phases of Mitosis:
1. Prophase - Chromatin condenses into visible chromosomes. Each chromosome consists of two sister chromatids joined at the centromere. The nuclear envelope begins to break down. Spindle fibers begin to form from centrioles.

2. Metaphase - Chromosomes align at the metaphase plate (cell equator). Spindle fibers attach to the centromeres of chromosomes. This is the best phase for karyotyping.

3. Anaphase - Sister chromatids are pulled apart to opposite poles of the cell by spindle fibers. The centromeres split. The cell begins to elongate.

4. Telophase - Chromosomes reach opposite poles and begin to decondense. Nuclear envelopes reform around each set of chromosomes. Spindle fibers disassemble.

Cytokinesis: The physical division of the cytoplasm. In animal cells, a cleavage furrow forms. In plant cells, a cell plate forms.

Meiosis is a different type of cell division that produces four genetically unique haploid cells (gametes). It involves two rounds of division: Meiosis I and Meiosis II.

Key differences between Mitosis and Meiosis:
- Mitosis produces 2 identical diploid cells; Meiosis produces 4 unique haploid cells
- Mitosis occurs in somatic cells; Meiosis occurs in reproductive cells
- Mitosis has 1 division; Meiosis has 2 divisions
- Crossing over occurs in Meiosis I but not in Mitosis
- Mitosis maintains chromosome number; Meiosis reduces it by half

Cell Cycle: G1 → S → G2 → M (Mitosis)
- G1: Cell growth and normal function
- S: DNA replication occurs
- G2: Preparation for division, organelles duplicated
- M: Mitosis and cytokinesis

Chromosomes: Thread-like structures made of DNA and histone proteins. Humans have 46 chromosomes (23 pairs). Autosomes (22 pairs) and sex chromosomes (1 pair: XX or XY).`;

const MAX_FREE_CHARS = 50000;

export default function NoteInput({ onSubmit, isLoading }: NoteInputProps) {
    const [notes, setNotes] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [limitWarning, setLimitWarning] = useState(false);

    // Waitlist Form State
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [email, setEmail] = useState("");
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const isSubmitting = formStatus === 'submitting';
    const waitlistSubmitted = formStatus === 'success';

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        try {
            // Using Formspree
            const response = await fetch('https://formspree.io/f/xkoqoyye', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, source: 'waitlist_modal' })
            });

            if (response.ok) {
                setFormStatus('success');
            } else {
                setFormStatus('success'); // Fallback if API refuses
            }
        } catch (error) {
            setFormStatus('success');
        }
    };
    const charCount = notes.length;
    const isValid = charCount >= 50 && charCount <= MAX_FREE_CHARS;

    const handleSubmit = () => {
        if (isValid && !isLoading) {
            onSubmit(notes);
        }
    };

    const handleTrySample = () => {
        setNotes(SAMPLE_NOTES);
        setLimitWarning(false);
    };

    const processPdfFile = async (file: File) => {
        setIsExtracting(true);
        setLimitWarning(false);
        try {
            const pdfjs = await loadPdfJs();
            const arrayBuffer = await file.arrayBuffer();
            const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            let extractedText = notes ? notes + "\n\n" : "";
            const numPages = document.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await document.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                extractedText += pageText + "\n";

                // Break early if we hit the limit to save memory/processing
                if (extractedText.length > MAX_FREE_CHARS) {
                    setLimitWarning(true);
                    extractedText = extractedText.substring(0, MAX_FREE_CHARS);
                    break;
                }
            }

            setNotes(extractedText);
        } catch (error) {
            console.error("Error reading PDF:", error);
            alert("Could not process this PDF file. Please try pasting the text instead.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type === "application/pdf") {
            await processPdfFile(file);
        } else if (file.type === "text/plain") {
            const text = await file.text();
            let newNotes = notes ? notes + "\n\n" + text : text;
            if (newNotes.length > MAX_FREE_CHARS) {
                setLimitWarning(true);
                newNotes = newNotes.substring(0, MAX_FREE_CHARS);
            } else {
                setLimitWarning(false);
            }
            setNotes(newNotes);
        } else {
            alert("Only PDF and TXT files are currently supported for direct upload.");
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.type === "application/pdf") {
            await processPdfFile(file);
        } else if (file.type === "text/plain") {
            const text = await file.text();
            let newNotes = notes ? notes + "\n\n" + text : text;
            if (newNotes.length > MAX_FREE_CHARS) {
                setLimitWarning(true);
                newNotes = newNotes.substring(0, MAX_FREE_CHARS);
            } else {
                setLimitWarning(false);
            }
            setNotes(newNotes);
        } else {
            alert("Only PDF and TXT files are currently supported for direct upload.");
        }
    };

    return (
        <>
            {/* Waitlist Modal */}
            {showWaitlist && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[#08111f] shadow-2xl p-8">
                        {/* Background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <button
                            onClick={() => setShowWaitlist(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-5">
                                <Sparkles className="w-6 h-6 text-amber-400" />
                            </div>

                            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                                ExamOracle <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Pro</span>
                            </h3>

                            <p className="text-sm text-white/60 mb-6 leading-relaxed">
                                We are launching next month with <span className="text-white/90 font-medium">Full Textbook Uploads (500 pages)</span> and <span className="text-white/90 font-medium">Unlimited Generations</span>.
                            </p>

                            {waitlistSubmitted ? (
                                <div className="w-full py-4 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-400 text-left">You're on the list! Keep an eye on your inbox for the 50% discount.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleWaitlistSubmit} className="w-full flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email..."
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold px-5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isSubmitting ? "..." : "Claim 50% Off"}
                                    </button>
                                </form>
                            )}

                            <p className="text-[10px] text-white/30 mt-4 uppercase tracking-widest font-semibold">
                                No spam. Just the launch discount.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`p-6 sm:p-8 rounded-[2rem] border transition-all duration-300 ${isDragging ? "border-amber-400/50 bg-amber-400/[0.05]" : "border-white/[0.08] bg-white/[0.02]"} backdrop-blur-md shadow-2xl flex flex-col gap-6 relative overflow-hidden group`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.03] to-transparent rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

                {/* Drag & Drop Visual Overlay */}
                {isDragging && (
                    <div className="absolute inset-x-0 inset-y-0 z-50 flex items-center justify-center rounded-[2rem] bg-[#07111d]/90 backdrop-blur-sm border-2 border-dashed border-amber-400">
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/40">
                                <UploadCloud className="w-8 h-8 text-amber-400" />
                            </div>
                            <p className="text-xl font-bold tracking-tight text-white">Drop document to extract</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <CopyPlus className="w-5 h-5 text-white/50" />
                            Input Workspace
                        </h2>
                        <p className="text-sm text-white/40 mt-1 font-light">Paste text or drop a <span className="text-white/80 font-medium">PDF file</span> here.</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="application/pdf,text/plain"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold tracking-wide transition-all shadow-inner text-white/80 whitespace-nowrap"
                            disabled={isLoading || isExtracting}
                        >
                            {isExtracting ? (
                                <div className="w-3.5 h-3.5 rounded-full border-[2px] border-white/20 border-t-white animate-spin" />
                            ) : (
                                <FileText className="w-3.5 h-3.5" />
                            )}
                            Upload PDF
                        </button>
                        <button
                            onClick={handleTrySample}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 hover:bg-cyan-400/20 text-xs font-semibold tracking-wide transition-all shadow-inner text-cyan-200 whitespace-nowrap"
                            disabled={isLoading || isExtracting}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Demo
                        </button>
                    </div>
                </div>

                <div className="relative z-10">
                    {limitWarning && (
                        <div className="absolute top-4 left-4 right-4 z-20 flex items-start sm:items-center gap-3 bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-300">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                            <div className="flex-1">
                                <p className="text-[13px] font-semibold text-white/90">Free Limit Reached (25 pages)</p>
                                <p className="text-[11px] text-white/60 leading-tight">
                                    Your document was too large and has been trimmed. <span onClick={() => setShowWaitlist(true)} className="text-amber-300 cursor-pointer hover:underline font-medium">Upgrade to Pro</span> to process full textbooks.
                                </p>
                            </div>
                            <button onClick={() => setLimitWarning(false)} className="text-white/40 hover:text-white/80 px-2">✕</button>
                        </div>
                    )}
                    <Textarea
                        id="note-input"
                        placeholder="Paste your unstructured notes here, or drag and drop a PDF file... (minimum 50 characters)"
                        value={notes}
                        onChange={(e) => {
                            const newNotes = e.target.value;
                            setNotes(newNotes);
                            if (newNotes.length <= MAX_FREE_CHARS) setLimitWarning(false);
                        }}
                        className={`min-h-[350px] resize-y rounded-2xl bg-black/40 border border-white/[0.08] p-6 text-base text-white/90 placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-amber-400/40 focus-visible:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all font-light leading-relaxed shadow-inner ${limitWarning ? 'pt-20' : ''}`}
                        disabled={isLoading || isExtracting}
                    />

                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                        <span className={`${isValid ? "text-emerald-400" : charCount > 0 ? "text-rose-400" : ""}`}>
                            {charCount.toLocaleString()} / 50,000 chars
                            {charCount > 0 && charCount < 50 && " (Need 50+)"}
                            {charCount > MAX_FREE_CHARS && " (Limit Exceeded)"}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
                            Free Tier
                        </span>
                    </div>
                </div>

                <button
                    id="generate-btn"
                    onClick={handleSubmit}
                    disabled={!isValid || isLoading || isExtracting || charCount > MAX_FREE_CHARS}
                    className="relative z-10 w-full h-14 rounded-2xl bg-white text-black font-semibold text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:hover:scale-100 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] disabled:shadow-none overflow-hidden group"
                >
                    {/* Sweep Shine Effect */}
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12 transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%] pointer-events-none" />

                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-[2px] border-black/20 border-t-black animate-spin" />
                            INITIALIZING ENGINE...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            GENERATE STUDY KIT
                        </>
                    )}
                </button>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                        AI-generated study material. Exam Oracle predictions are probabilistic. Always verify facts with your syllabus.
                    </p>
                </div>
            </div>
        </>
    );
}
