// ExamPrep AI — Gemini AI Client

import { GeneratedContent, MCQQuestion } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const STOP_WORDS = new Set([
    "the",
    "and",
    "for",
    "that",
    "with",
    "this",
    "from",
    "into",
    "their",
    "there",
    "about",
    "have",
    "will",
    "your",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "because",
    "through",
    "these",
    "those",
    "they",
    "them",
    "then",
    "than",
    "also",
    "only",
    "being",
    "been",
    "each",
    "such",
    "more",
    "most",
    "many",
    "some",
    "used",
    "using",
    "under",
    "over",
    "after",
    "before",
    "between",
    "during",
    "across",
    "is",
    "are",
    "was",
    "were",
    "be",
    "can",
    "may",
    "not",
    "but",
    "you",
    "our",
    "out",
    "its",
    "has",
    "had",
    "how",
    "why",
    "who",
    "all",
    "any",
    "per",
    "via",
]);

const GENERIC_TOPIC_PHRASES = new Set([
    "hero feature",
    "current repo state",
    "product rules",
    "functional flow",
    "required output areas",
    "source of truth",
    "known implementation mismatch",
    "execution guidance",
    "priority roadmap",
    "definition of success",
    "short summary",
    "target users",
    "product positioning",
    "project identity",
    "brand and ux direction",
    "competitor framing",
    "implemented now",
    "planned but not actually implemented yet",
    "core user problem",
    "one-line pitch",
    "note",
    "summary",
    "assessment",
    "context",
    "calibration",
    "prediction layer",
    "recall layer",
]);

type SignalKind =
    | "definition"
    | "process"
    | "comparison"
    | "causeEffect"
    | "classification"
    | "function"
    | "fact";

interface ConceptScore {
    concept: string;
    sentence: string;
    score: number;
}

interface StudySignal {
    concept: string;
    sentence: string;
    kind: SignalKind;
    score: number;
    compareTarget?: string;
}

interface FallbackContext {
    cleanNotes: string;
    lines: string[];
    sentences: string[];
    topicCandidates: string[];
    topicName: string;
    difficultyRating: "Easy" | "Medium" | "Hard";
    conceptScores: ConceptScore[];
    signals: StudySignal[];
}

interface SummaryBlocks {
    coreIdea: string;
    processSteps: string;
    differences: string;
    numbersFacts: string;
    likelyExamAngles: string;
}

interface RapidRevisionBlock {
    formulas: string[];
    dates: string[];
    names: string[];
    numbers: string[];
    lists: string[];
}

function buildPrompt(studentNotes: string): string {
    return `You are an expert exam preparation assistant and professor who has decades of experience creating university and school exams.

Your task: Analyze the student's lecture notes below and generate a COMPLETE exam preparation kit that is precise, revision-friendly, and tightly grounded in the notes.

CRITICAL INSTRUCTIONS:
1. EXAM ORACLE: Predict the most likely exam questions. Assign probability (high/medium/low) based on:
   - Topic frequency in notes (more mentions = higher probability)
   - Concept complexity (complex concepts are tested more in exams)
   - Standard exam patterns (definitions, comparisons, applications are common)
   - Processes, mechanisms, stages, differences, causes, effects, classifications, formulas, diagrams, and numeric facts are especially exam-relevant
   - Give exactly 8 high-quality predictions with a mix of high, medium, and low probability
   - Questions must be specific, exam-style, and directly answerable from the notes
   - Avoid vague prompts like "Discuss the topic" or "Write short notes"
   - Prefer prompts like define, explain, compare, classify, differentiate, describe steps, state causes/effects, justify, interpret, and apply concept
   - Prioritize items a student would actually be asked to write in an exam answer booklet

2. FLASHCARDS: Create 10-12 high-quality flashcards covering key concepts, definitions, important facts, comparisons, mechanisms, and high-yield details.
   - Front side must be short and scannable
   - Back side must be concise, accurate, and easy to revise quickly
   - Mix card types: definition, role/function, process/steps, comparison, and factual recall
   - Prefer cards that help a student actively remember what they might forget in an exam
   - If notes contain numbers, stages, formulas, classifications, or examples, include them where relevant

3. MCQ QUESTIONS: Generate 8 multiple choice questions with 4 options each. Include explanations for correct answers.
   - Only one option should be clearly correct
   - Wrong options must be plausible but incorrect
   - Explanation should be 1-2 concise sentences
   - Questions must test understanding of the notes, not generic trivia
   - Use a mix of definition, process, comparison, function, and fact-based stems
   - Avoid giveaway wording where the correct option is obviously longer or more specific than the distractors

4. SUMMARY: Write a concise but comprehensive summary (160-230 words) of all topics covered.
   - Optimize for fast revision, not long prose
   - Use short sentences and compact wording
   - Preserve the most important definitions, mechanisms, relationships, and exam-critical distinctions
   - Make it feel like the student can revise from it directly before an exam

5. DIFFICULTY RATING: Rate the overall topic difficulty as Easy, Medium, or Hard.

6. TOPIC NAME: Identify the main topic/subject from the notes.

OUTPUT QUALITY RULES:
- Be concrete, not generic
- Prefer clarity over cleverness
- Keep wording clean and student-friendly
- Stay tightly grounded in the notes
- Do not mention missing context, assumptions, or limitations
- Do not invent facts that are not supported by the notes
- Preserve important terminology exactly when it appears in the notes
- Return revision-ready output that can be scanned quickly

You MUST respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "examOracle": [
    {
      "question": "Full exam question text",
      "probability": "high",
      "topic": "Specific topic name",
      "type": "Written",
      "difficulty": "Medium",
      "answerOutline": ["Point 1", "Point 2", "Point 3"],
      "sampleAnswer": "A short model answer grounded in the notes."
    }
  ],
  "flashcards": [
    {
      "front": "Question or concept",
      "back": "Answer or explanation",
      "mode": "definition"
    }
  ],
  "mcqQuestions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Why this is correct"
    }
  ],
  "summary": "Comprehensive topic summary...",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "mistakeTraps": ["Common confusion 1", "Common confusion 2", "Common confusion 3"],
  "mustMemorizeFacts": ["Fact 1", "Fact 2", "Fact 3"],
  "summaryBlocks": {
    "coreIdea": "Core idea in 1-2 sentences",
    "processSteps": "Important process, stages, or sequence if present",
    "differences": "Key differences, comparisons, or contrasts if present",
    "numbersFacts": "Important numbers, formulas, dates, names, or factual anchors if present",
    "likelyExamAngles": "Most testable angles from the notes"
  },
  "rapidRevision": {
    "formulas": ["Formula or equation if present"],
    "dates": ["Important date if present"],
    "names": ["Important name or term if present"],
    "numbers": ["Critical number or statistic if present"],
    "lists": ["List, stages, or categories to memorize"]
  },
  "difficultyRating": "Medium",
  "topicName": "Main Topic Name"
}

Valid "type" values: "Written", "MCQ", "Short Answer", "Compare", "Explain", "Define"
Valid "probability" values: "high", "medium", "low"
Valid "difficulty" values: "Easy", "Medium", "Hard"
Valid "difficultyRating" values: "Easy", "Medium", "Hard"

STUDENT NOTES:
${studentNotes}`;
}

export async function generateExamPrep(notes: string): Promise<GeneratedContent> {
    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not configured. Using local fallback generator.");
        return generateFallbackExamPrep(notes);
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: buildPrompt(notes),
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            const details = parseGeminiError(errorText);

            console.error("Gemini API Error:", errorText);

            if (response.status === 429) {
                const retrySeconds = parseRetrySeconds(details.retryDelay);
                console.warn(
                    `Gemini quota exhausted${details.retryDelay ? `, retry after ${details.retryDelay}` : ""}. Falling back to local generator.`
                );
                return generateFallbackExamPrep(notes, retrySeconds);
            }

            throw new Error(
                details.message || `Gemini API request failed: ${response.status}`
            );
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error("No content received from Gemini API");
        }

        const cleaned = textContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        return validateGeneratedContent({ ...JSON.parse(cleaned), isFallback: false });
    } catch (error) {
        console.error("Gemini pipeline failed, using local fallback:", error);
        return generateFallbackExamPrep(notes);
    }
}

function parseRetrySeconds(delay?: string): number | undefined {
    if (!delay) return undefined;
    const match = delay.match(/^(\d+)s$/);
    return match ? parseInt(match[1], 10) : undefined;
}

function validateGeneratedContent(parsed: GeneratedContent): GeneratedContent {
    if (
        !parsed.examOracle ||
        !parsed.flashcards ||
        !parsed.mcqQuestions ||
        !parsed.summary ||
        !parsed.keyTakeaways ||
        !parsed.mistakeTraps ||
        !parsed.mustMemorizeFacts ||
        !parsed.summaryBlocks ||
        !parsed.rapidRevision ||
        !parsed.difficultyRating ||
        !parsed.topicName
    ) {
        throw new Error("Invalid response structure from AI");
    }

    return normalizeGeneratedContent(parsed);
}

function parseGeminiError(errorText: string): {
    message?: string;
    retryDelay?: string;
} {
    try {
        const parsed = JSON.parse(errorText);
        const retryInfo = parsed?.error?.details?.find(
            (detail: { "@type"?: string; retryDelay?: string }) =>
                detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        );

        return {
            message: parsed?.error?.message,
            retryDelay: retryInfo?.retryDelay,
        };
    } catch {
        return {};
    }
}

function generateFallbackExamPrep(notes: string, retryAfterSeconds?: number): GeneratedContent {
    const context = buildFallbackContext(notes);

    return normalizeGeneratedContent({
        examOracle: buildExamOracle(context),
        flashcards: buildFlashcards(context),
        mcqQuestions: buildMcqs(context),
        summary: buildSummary(context),
        keyTakeaways: buildKeyTakeaways(context),
        mistakeTraps: buildMistakeTraps(context),
        mustMemorizeFacts: buildMustMemorizeFacts(context),
        summaryBlocks: buildSummaryBlocks(context),
        rapidRevision: buildRapidRevision(context),
        difficultyRating: context.difficultyRating,
        topicName: context.topicName,
        isFallback: true,
        retryAfterSeconds,
    });
}

function buildFallbackContext(notes: string): FallbackContext {
    const cleanNotes = notes.replace(/\r/g, "").trim();
    const lines = cleanNotes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const sentences = splitIntoStudySentences(cleanNotes);
    const topicCandidates = collectTopicCandidates(lines, sentences);
    const topicName = deriveTopicName(lines, topicCandidates);
    const difficultyRating = deriveDifficulty(cleanNotes, topicCandidates.length);
    const conceptScores = scoreOracleConcepts(topicName, topicCandidates, sentences);
    const signals = extractStudySignals(topicName, sentences, conceptScores);

    return {
        cleanNotes,
        lines,
        sentences,
        topicCandidates,
        topicName,
        difficultyRating,
        conceptScores,
        signals,
    };
}

function normalizeGeneratedContent(parsed: GeneratedContent): GeneratedContent {
    const examOracle = parsed.examOracle
        .map((item) => ({
            ...item,
            question: cleanSentence(item.question),
            topic: cleanLabel(item.topic || parsed.topicName),
            type: normalizeType(item.type),
            probability: normalizeProbability(item.probability),
            difficulty: normalizeDifficulty(item.difficulty),
            answerOutline: normalizeAnswerOutline(item.answerOutline),
            sampleAnswer: trimToWordBudget(cleanSentence(String(item.sampleAnswer ?? "")), 55),
        }))
        .filter((item) => item.question.length > 12)
        .filter(uniqueByKey((item) => item.question.toLowerCase()))
        .sort((left, right) => probabilityRank(left.probability) - probabilityRank(right.probability))
        .slice(0, 8);

    const flashcards = parsed.flashcards
        .map((item) => ({
            front: trimToWordBudget(cleanSentence(item.front), 10),
            back: trimToWordBudget(cleanSentence(item.back), 28),
            mode: normalizeFlashcardMode(item.mode),
        }))
        .filter((item) => item.front.length > 3 && item.back.length > 10)
        .filter(uniqueByKey((item) => item.front.toLowerCase()))
        .slice(0, 12);

    const mcqQuestions = parsed.mcqQuestions
        .map((item) => normalizeMcq(item))
        .filter((item): item is MCQQuestion => Boolean(item))
        .filter(uniqueByKey((item) => item.question.toLowerCase()))
        .slice(0, 8);

    return {
        examOracle: examOracle.length > 0 ? examOracle : parsed.examOracle.slice(0, 8),
        flashcards: flashcards.length > 0 ? flashcards : parsed.flashcards.slice(0, 12),
        mcqQuestions: mcqQuestions.length > 0 ? mcqQuestions : parsed.mcqQuestions.slice(0, 8),
        summary: formatSummary(parsed.summary),
        keyTakeaways: normalizeShortList(parsed.keyTakeaways, 4),
        mistakeTraps: normalizeShortList(parsed.mistakeTraps, 4),
        mustMemorizeFacts: normalizeShortList(parsed.mustMemorizeFacts, 5),
        summaryBlocks: normalizeSummaryBlocks(parsed.summaryBlocks, parsed.summary, parsed.topicName),
        rapidRevision: normalizeRapidRevision(parsed.rapidRevision),
        difficultyRating: normalizeDifficulty(parsed.difficultyRating),
        topicName: cleanLabel(parsed.topicName),
    };
}

function collectTopicCandidates(lines: string[], sentences: string[]) {
    const phraseMap = new Map<string, number>();
    const text = `${lines.join(" ")} ${sentences.join(" ")}`;

    for (const match of text.matchAll(/\b[A-Za-z][A-Za-z0-9/-]{2,}(?:\s+[A-Za-z][A-Za-z0-9/-]{2,}){0,2}\b/g)) {
        const phrase = normalizePhrase(match[0]);
        if (
            !phrase ||
            STOP_WORDS.has(phrase.toLowerCase()) ||
            isGenericTopicPhrase(phrase)
        ) {
            continue;
        }

        const words = phrase.toLowerCase().split(" ");
        if (words.every((word) => STOP_WORDS.has(word))) {
            continue;
        }

        phraseMap.set(phrase, (phraseMap.get(phrase) ?? 0) + 1);
    }

    return [...phraseMap.entries()]
        .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
        .map(([phrase]) => phrase)
        .filter(uniquePhrases)
        .slice(0, 12);
}

function deriveTopicName(lines: string[], topicCandidates: string[]) {
    const cleanedHeadings = lines
        .map((line) => line.replace(/^#+\s*/, "").trim())
        .filter((line) => /^[A-Za-z0-9 ,:/()-]{4,80}$/.test(line))
        .map((line) => line.replace(/[-:]\s*.+$/, "").trim())
        .filter((line) => !isGenericTopicPhrase(line));

    const examPrepHeading = cleanedHeadings.find((line) =>
        /\bexam\s*oracle\b/i.test(line)
    );
    if (examPrepHeading) {
        return toTitleCase(examPrepHeading);
    }

    const heading = cleanedHeadings.find((line) => line.split(/\s+/).length <= 5);
    if (heading) {
        return toTitleCase(heading);
    }

    const preferredCandidate = topicCandidates.find((candidate) => {
        const normalized = candidate.toLowerCase();
        if (isGenericTopicPhrase(candidate)) {
            return false;
        }

        return (
            normalized.split(" ").length <= 4 &&
            !normalized.includes("feature") &&
            !normalized.includes("section")
        );
    });
    if (preferredCandidate) {
        return toTitleCase(preferredCandidate);
    }

    return "Study Material";
}

function deriveDifficulty(notes: string, topicCount: number): "Easy" | "Medium" | "Hard" {
    const longSentenceCount = notes.split(/[.!?]/).filter((s) => s.trim().split(/\s+/).length > 20).length;
    const numericDensity = (notes.match(/\d+/g) ?? []).length;

    if (topicCount >= 8 || longSentenceCount >= 5 || numericDensity >= 10) {
        return "Hard";
    }

    if (topicCount >= 5 || longSentenceCount >= 3 || numericDensity >= 4) {
        return "Medium";
    }

    return "Easy";
}

function splitIntoStudySentences(cleanNotes: string) {
    const normalized = cleanNotes
        .replace(/\u2022/g, "\n- ")
        .replace(/\t/g, " ")
        .replace(/\s{2,}/g, " ")
        .replace(/\n(?=\d+[.)]\s)/g, ". ")
        .replace(/\n(?=[-•]\s)/g, ". ");

    return normalized
        .split(/(?<=[.!?])\s+|;\s+|\n+/)
        .map((sentence) =>
            sentence
                .replace(/^[-*]\s*/, "")
                .replace(/^\d+[.)]\s*/, "")
                .trim()
        )
        .map(cleanSentence)
        .filter((sentence) => sentence.length > 18);
}

function buildExamOracle(context: FallbackContext) {
    const rankedSignals =
        context.signals.length > 0
            ? context.signals
            : [
                  {
                      concept: context.topicName,
                      sentence: context.sentences[0] ?? "",
                      kind: "definition" as SignalKind,
                      score: 1,
                  },
              ];

    const compareBase =
        context.conceptScores.find((item) => item.concept !== rankedSignals[0]?.concept)?.concept ??
        context.topicName;
    const probabilities: Array<"high" | "medium" | "low"> = [
        "high",
        "high",
        "high",
        "medium",
        "medium",
        "medium",
        "low",
        "low",
    ];

    return rankedSignals.slice(0, 8).map((signal, index) => {
        const compareTarget =
            signal.compareTarget ??
            findRelatedConcept(signal.sentence, signal.concept, context.conceptScores) ??
            compareBase;
        const questionConfig = buildOracleQuestion(signal, compareTarget, context.topicName, index);

        return {
            question: questionConfig.question,
            probability: probabilities[index] ?? "low",
            topic: context.topicName,
            type: questionConfig.type,
            answerOutline: buildAnswerOutline(signal, compareTarget, context),
            sampleAnswer: buildSampleAnswer(signal, compareTarget, context),
            difficulty:
                signal.score >= 8
                    ? "Hard"
                    : signal.score >= 5
                      ? "Medium"
                      : context.difficultyRating,
        };
    }).filter(uniqueByKey((item) => item.question.toLowerCase()));
}

function buildFlashcards(context: FallbackContext) {
    const signalPool =
        context.signals.length > 0
            ? context.signals
            : [
                  {
                      concept: context.topicName,
                      sentence:
                          findSentenceForConcept(context.sentences, context.topicName) ||
                          `${context.topicName} is the main topic in the notes.`,
                      kind: "definition" as SignalKind,
                      score: 1,
                  },
              ];

    return signalPool.slice(0, 12).map((signal, index) => {
        const compareTarget =
            signal.compareTarget ??
            findRelatedConcept(signal.sentence, signal.concept, context.conceptScores);

        if (signal.kind === "process") {
            return {
                front: trimToWordBudget(`Steps in ${signal.concept}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "step-order" as const,
            };
        }

        if (signal.kind === "comparison" && compareTarget) {
            return {
                front: trimToWordBudget(`${signal.concept} vs ${compareTarget}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "comparison" as const,
            };
        }

        if (signal.kind === "causeEffect") {
            return {
                front: trimToWordBudget(`Cause or effect of ${signal.concept}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "why-it-matters" as const,
            };
        }

        if (signal.kind === "classification") {
            return {
                front: trimToWordBudget(`Types of ${signal.concept}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "fact-recall" as const,
            };
        }

        if (signal.kind === "function") {
            return {
                front: trimToWordBudget(`Role of ${signal.concept}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "why-it-matters" as const,
            };
        }

        if (signal.kind === "fact" && /\d/.test(signal.sentence)) {
            return {
                front: trimToWordBudget(`Key fact: ${signal.concept}`, 10),
                back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
                mode: "fact-recall" as const,
            };
        }

        return {
            front:
                index % 2 === 0
                    ? trimToWordBudget(`Define ${signal.concept}`, 10)
                    : trimToWordBudget(`Why is ${signal.concept} important?`, 10),
            back: trimToSentenceBudget(compactEvidence(signal.sentence), 28),
            mode: index % 2 === 0 ? ("definition" as const) : ("why-it-matters" as const),
        };
    });
}

function buildMcqs(context: FallbackContext): MCQQuestion[] {
    const concepts = dedupe([
        ...context.conceptScores.map((item) => item.concept),
        ...context.topicCandidates,
        ...extractSentenceAnchors(context.sentences),
    ]).slice(0, 12);
    const signalPool =
        context.signals.length > 0
            ? context.signals
            : [
                  {
                      concept: context.topicName,
                      sentence:
                          findSentenceForConcept(context.sentences, context.topicName) ||
                          `${context.topicName} is the main concept in the notes.`,
                      kind: "definition" as SignalKind,
                      score: 1,
                  },
              ];

    return signalPool.slice(0, 8).map((signal) => {
        const options = buildMcqOptions(signal, context, concepts);
        const optionTexts = ensureUniqueMcqOptions(options.map((option) => option.text), signal, context);
        const shuffledOptions = shuffle(optionTexts).slice(0, 4) as [
            string,
            string,
            string,
            string,
        ];
        const clue = trimToSentenceBudget(toStudyClue(signal.sentence, signal.concept), 24);
        const question = buildMcqQuestionStem(signal, clue);
        const correctOption = options[0]?.text ?? signal.concept;

        return {
            question,
            options: shuffledOptions,
            answer: shuffledOptions.find((option) => option === correctOption) ?? shuffledOptions[0],
            explanation: trimToWordBudget(
                `${signal.concept} is correct because the notes state that ${compactEvidence(signal.sentence)}`,
                30
            ),
        };
    });
}

function buildSummary(context: FallbackContext) {
    if (context.signals.length === 0) {
        return `${context.topicName} is the central topic in the provided notes. The material includes definitions, relationships, mechanisms, and exam-relevant facts that should be revised carefully before the exam.`;
    }

    const blocks = buildSummaryBlocks(context);
    const paragraphs = Object.values(blocks).filter(Boolean);

    const summary = trimToWordBudget(paragraphs.join("\n\n"), 210);
    return summary.endsWith(".") ? summary : `${summary}.`;
}

function buildSummaryBlocks(context: FallbackContext): SummaryBlocks {
    const coreIdeaSignals = selectSignalsByKinds(context.signals, ["definition", "function"], 2);
    const processSignals = selectSignalsByKinds(context.signals, ["process", "classification"], 2);
    const differenceSignals = selectSignalsByKinds(context.signals, ["comparison"], 2);
    const numbersSignals = context.signals.filter((signal) => /\d/.test(signal.sentence)).slice(0, 2);
    const angleSignals = context.signals.slice(0, 3);

    return {
        coreIdea: joinSignalSentences(
            coreIdeaSignals,
            `${context.topicName} is the main topic in the notes and should be revised through its central definitions and functions.`
        ),
        processSteps: joinSignalSentences(
            processSignals,
            `The notes should be revised by focusing on the main sequence, stages, or grouped categories within ${context.topicName}.`
        ),
        differences: joinSignalSentences(
            differenceSignals,
            `The notes contain important distinctions and contrasts inside ${context.topicName} that are likely to be tested directly.`
        ),
        numbersFacts: joinSignalSentences(
            numbersSignals,
            `Key factual anchors, terms, names, or exact details from the notes should be memorized for rapid recall.`
        ),
        likelyExamAngles: angleSignals.length > 0
            ? angleSignals
                  .map((signal) => buildExamAngle(signal))
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(" ")
            : `Likely exam angles include definition, explanation, comparison, and direct factual recall.`,
    };
}

function buildKeyTakeaways(context: FallbackContext) {
    return context.signals
        .slice(0, 4)
        .map((signal) => trimToWordBudget(compactEvidence(signal.sentence), 22));
}

function buildMistakeTraps(context: FallbackContext) {
    const comparisonTraps = context.signals
        .filter((signal) => signal.kind === "comparison")
        .slice(0, 2)
        .map((signal) =>
            trimToWordBudget(
                `Do not confuse ${signal.concept} with ${signal.compareTarget ?? "related concepts"}; the notes distinguish them clearly.`,
                22
            )
        );
    const numericTraps = context.signals
        .filter((signal) => /\d/.test(signal.sentence))
        .slice(0, 1)
        .map((signal) =>
            trimToWordBudget(
                `Memorize the exact number or factual detail linked to ${signal.concept}; approximate recall may lose marks.`,
                22
            )
        );
    const processTrap = context.signals
        .filter((signal) => signal.kind === "process")
        .slice(0, 1)
        .map((signal) =>
            trimToWordBudget(
                `Do not skip or reorder the stages of ${signal.concept}; sequence-based questions are likely.`,
                22
            )
        );

    return dedupe([...comparisonTraps, ...numericTraps, ...processTrap]).slice(0, 4);
}

function buildMustMemorizeFacts(context: FallbackContext) {
    const numericFacts = context.signals
        .filter((signal) => /\d/.test(signal.sentence))
        .map((signal) => trimToWordBudget(compactEvidence(signal.sentence), 20));
    const namedFacts = context.signals
        .filter((signal) => signal.kind === "classification" || signal.kind === "definition")
        .map((signal) => trimToWordBudget(compactEvidence(signal.sentence), 20));

    return dedupe([...numericFacts, ...namedFacts]).slice(0, 5);
}

function scoreOracleConcepts(topicName: string, topicCandidates: string[], sentences: string[]): ConceptScore[] {
    const concepts = dedupe([
        ...topicCandidates,
        ...extractSentenceAnchors(sentences),
        topicName,
    ]).slice(0, 14);

    return concepts
        .map((concept) => {
            const relatedSentences = sentences.filter((sentence) =>
                sentence.toLowerCase().includes(concept.toLowerCase())
            );
            const joined = relatedSentences.join(" ").toLowerCase();
            const mentionScore = Math.min(4, relatedSentences.length);
            const processScore = /(process|steps|stage|cycle|mechanism|pathway|workflow)/.test(joined) ? 2 : 0;
            const compareScore = /(difference|compare|versus|vs|similar|unlike)/.test(joined) ? 2 : 0;
            const definitionScore = /(is defined as|refers to|means|called|known as|defined)/.test(joined) ? 1 : 0;
            const causeEffectScore = /(cause|effect|results in|leads to|therefore|because|due to)/.test(joined) ? 1 : 0;
            const functionScore = /(function|role|importance|purpose|used for|helps|allows|enables)/.test(joined) ? 1 : 0;
            const listScore = /(types|categories|forms|includes|consists of|classified)/.test(joined) ? 1 : 0;
            const numericScore = /\d/.test(joined) ? 1 : 0;

            return {
                concept,
                sentence: relatedSentences[0] ?? "",
                score:
                    mentionScore +
                    processScore +
                    compareScore +
                    definitionScore +
                    causeEffectScore +
                    functionScore +
                    listScore +
                    numericScore,
            };
        })
        .filter((item) => item.concept.length > 2)
        .sort((left, right) => right.score - left.score || right.concept.length - left.concept.length)
        .filter(uniqueByKey((item) => item.concept.toLowerCase()));
}

function extractStudySignals(
    topicName: string,
    sentences: string[],
    conceptScores: ConceptScore[]
): StudySignal[] {
    const fallbackConcepts = conceptScores.map((item) => item.concept);

    return sentences
        .map((sentence) => {
            const concept =
                conceptScores.find((item) =>
                    sentence.toLowerCase().includes(item.concept.toLowerCase())
                )?.concept ??
                extractPrimaryConcept(sentence, fallbackConcepts) ??
                topicName;
            const kind = detectSignalKind(sentence);
            const compareTarget = findRelatedConcept(sentence, concept, conceptScores);
            const conceptBoost =
                conceptScores.find((item) => item.concept.toLowerCase() === concept.toLowerCase())?.score ?? 1;
            const score =
                conceptBoost +
                (kind === "process" || kind === "comparison" ? 3 : 2) +
                (/\d/.test(sentence) ? 1 : 0) +
                (sentence.split(/\s+/).length > 14 ? 1 : 0);

            return {
                concept,
                sentence,
                kind,
                score,
                compareTarget,
            };
        })
        .filter((item) => item.concept.length > 2 && !isGenericTopicPhrase(item.concept))
        .sort((left, right) => right.score - left.score || right.sentence.length - left.sentence.length)
        .filter(uniqueByKey((item) => `${item.kind}:${item.concept.toLowerCase()}:${item.sentence.toLowerCase()}`));
}

function buildOracleQuestion(
    signal: StudySignal,
    compareTarget: string,
    topicName: string,
    index: number
): {
    question: string;
    type: "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define";
} {
    if (signal.kind === "comparison" && compareTarget !== signal.concept) {
        return {
            question: `Compare ${signal.concept} and ${compareTarget} with reference to the distinctions highlighted in the notes.`,
            type: "Compare",
        };
    }

    if (signal.kind === "process") {
        return {
            question: `Explain the process, stages, or mechanism of ${signal.concept} step by step as covered in the notes.`,
            type: "Explain",
        };
    }

    if (signal.kind === "causeEffect") {
        return {
            question: `Explain the causes, effects, or consequences associated with ${signal.concept} as described in the notes.`,
            type: "Explain",
        };
    }

    if (signal.kind === "classification") {
        return {
            question: `Classify the major types, categories, or forms of ${signal.concept} mentioned in the notes.`,
            type: "Short Answer",
        };
    }

    if (signal.kind === "function") {
        return {
            question: `State the role, function, and importance of ${signal.concept} in ${topicName}.`,
            type: "Short Answer",
        };
    }

    if (index === 0 || signal.kind === "definition") {
        return {
            question: `Define ${signal.concept} and state why it is important in ${topicName}.`,
            type: "Define",
        };
    }

    return {
        question: /\d/.test(signal.sentence)
            ? `Explain ${signal.concept} with reference to the key facts, figures, or details emphasized in the notes.`
            : `Explain ${signal.concept} with reference to the key points emphasized in the notes.`,
        type: "Written",
    };
}

function normalizeMcq(item: MCQQuestion): MCQQuestion | null {
    const question = cleanSentence(item.question);
    const options = item.options.map((option) => cleanSentence(option));
    const uniqueOptions = dedupe(options);
    const answer = cleanSentence(item.answer);
    const matchingAnswer =
        uniqueOptions.find((option) => option.toLowerCase() === answer.toLowerCase()) ??
        uniqueOptions[0];

    if (question.length < 12 || uniqueOptions.length < 4 || !matchingAnswer) {
        return null;
    }

    return {
        question,
        options: uniqueOptions.slice(0, 4) as [string, string, string, string],
        answer: matchingAnswer,
        explanation: trimToWordBudget(cleanSentence(item.explanation), 30),
    };
}

function normalizeAnswerOutline(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => cleanSentence(String(item)))
        .filter((item) => item.length > 6)
        .slice(0, 4);
}

function normalizeFlashcardMode(value: unknown): "definition" | "comparison" | "step-order" | "fact-recall" | "why-it-matters" {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized.includes("comparison")) return "comparison";
    if (normalized.includes("step")) return "step-order";
    if (normalized.includes("fact")) return "fact-recall";
    if (normalized.includes("why") || normalized.includes("role")) return "why-it-matters";
    return "definition";
}

function normalizeShortList(value: unknown, limit: number) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => trimToWordBudget(cleanSentence(String(item)), 20))
        .filter((item) => item.length > 6)
        .filter(uniquePhrases)
        .slice(0, limit);
}

function normalizeSummaryBlocks(value: unknown, summary: string, topicName: string): SummaryBlocks {
    const candidate = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};

    return {
        coreIdea: cleanSummaryBlock(candidate.coreIdea, summary, `${topicName} is the main topic in the notes.`),
        processSteps: cleanSummaryBlock(candidate.processSteps, summary, `Revise the main process, stages, or grouped ideas from the notes.`),
        differences: cleanSummaryBlock(candidate.differences, summary, `Revise the major differences and comparisons highlighted in the notes.`),
        numbersFacts: cleanSummaryBlock(candidate.numbersFacts, summary, `Memorize the important factual anchors, figures, names, and exact details from the notes.`),
        likelyExamAngles: cleanSummaryBlock(candidate.likelyExamAngles, summary, `Likely exam angles include definitions, processes, comparisons, and direct factual recall.`),
    };
}

function normalizeRapidRevision(value: unknown): RapidRevisionBlock {
    const candidate = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};

    return {
        formulas: normalizeShortList(candidate.formulas, 4),
        dates: normalizeShortList(candidate.dates, 4),
        names: normalizeShortList(candidate.names, 5),
        numbers: normalizeShortList(candidate.numbers, 5),
        lists: normalizeShortList(candidate.lists, 5),
    };
}

function cleanSummaryBlock(value: unknown, summary: string, fallback: string) {
    const cleaned = cleanSentence(typeof value === "string" ? value : "");
    if (cleaned.length > 12) {
        return trimToWordBudget(cleaned, 35);
    }

    if (summary) {
        const sentence = summary.split(/(?<=[.!?])\s+/).find(Boolean);
        if (sentence) {
            return trimToWordBudget(cleanSentence(sentence), 35);
        }
    }

    return fallback;
}

function extractSentenceAnchors(sentences: string[]) {
    return sentences
        .map((sentence) => {
            const match = sentence.match(/\b[A-Za-z][A-Za-z0-9/-]{2,}(?:\s+[A-Za-z][A-Za-z0-9/-]{2,}){0,2}\b/g);
            return normalizePhrase(match?.[0] ?? "");
        })
        .filter(Boolean)
        .filter(uniquePhrases)
        .slice(0, 10);
}

function buildAnswerOutline(signal: StudySignal, compareTarget: string, context: FallbackContext) {
    const outline = [
        signal.kind === "definition"
            ? `Start with a precise definition of ${signal.concept}.`
            : `Start with the core idea behind ${signal.concept}.`,
        signal.kind === "comparison"
            ? `Contrast ${signal.concept} with ${compareTarget} using the distinctions from the notes.`
            : signal.kind === "process"
              ? `Write the stages, steps, or mechanism in the correct order.`
              : `State the key points, functions, or facts emphasized in the notes.`,
        /\d/.test(signal.sentence)
            ? `Include the exact figures, factual details, or named points mentioned in the notes.`
            : `Support the answer with the most exam-relevant details from the notes.`,
        `End by linking ${signal.concept} back to ${context.topicName}.`,
    ];

    return outline.slice(0, 4);
}

function buildSampleAnswer(signal: StudySignal, compareTarget: string, context: FallbackContext) {
    const opening =
        signal.kind === "definition"
            ? `${signal.concept} can be defined as described in the notes.`
            : signal.kind === "comparison"
              ? `${signal.concept} should be explained in contrast with ${compareTarget}.`
              : `${signal.concept} should be explained using the key points from the notes.`;
    const body = compactEvidence(signal.sentence);
    const close =
        /\d/.test(signal.sentence)
            ? `A strong answer should include the exact figures, named parts, or factual details given in the notes.`
            : `A strong answer should end by stating why ${signal.concept} matters within ${context.topicName}.`;

    return trimToWordBudget(`${opening} ${body} ${close}`, 55);
}

function buildMcqOptions(signal: StudySignal, context: FallbackContext, concepts: string[]) {
    const correct = buildMcqOptionText(signal, signal.concept, true, context);
    const distractorConcepts = concepts.filter((item) => item !== signal.concept).slice(0, 3);
    const distractors = distractorConcepts.map((concept) => ({
        text: buildNearMissDistractor(signal, concept, context),
    }));

    while (distractors.length < 3) {
        distractors.push({
            text: buildGenericDistractor(signal, distractors.length),
        });
    }

    return [{ text: correct }, ...distractors];
}

function buildMcqOptionText(
    signal: StudySignal,
    concept: string,
    isCorrect: boolean,
    context: FallbackContext
) {
    const conceptSentence =
        findSentenceForConcept(context.sentences, concept) ||
        `${concept} is a concept related to ${context.topicName}.`;

    if (signal.kind === "process") {
        return isCorrect
            ? trimToWordBudget(`It describes ${compactEvidence(signal.sentence).replace(/\.$/, "")}`, 16)
            : trimToWordBudget(`It describes ${compactEvidence(conceptSentence).replace(/\.$/, "")}`, 16);
    }

    if (signal.kind === "comparison") {
        return isCorrect
            ? trimToWordBudget(`It is the concept being contrasted in the notes: ${concept}.`, 16)
            : trimToWordBudget(`It is a related but different concept: ${concept}.`, 16);
    }

    if (signal.kind === "function") {
        return isCorrect
            ? trimToWordBudget(`It performs this role in the notes: ${concept}.`, 14)
            : trimToWordBudget(`It refers instead to ${concept}, not the stated role.`, 14);
    }

    if (signal.kind === "fact" || /\d/.test(signal.sentence)) {
        return isCorrect
            ? trimToWordBudget(`It matches the exact fact stated in the notes for ${concept}.`, 14)
            : trimToWordBudget(`It refers to ${concept}, but not the exact fact asked here.`, 15);
    }

    return isCorrect
        ? trimToWordBudget(`It best fits the statement given in the notes: ${concept}.`, 14)
        : trimToWordBudget(`It is related to ${context.topicName}, but does not fit the clue: ${concept}.`, 16);
}

function buildNearMissDistractor(
    signal: StudySignal,
    concept: string,
    context: FallbackContext
) {
    const sourceSentence =
        findSentenceForConcept(context.sentences, concept) ||
        `${concept} is discussed in relation to ${context.topicName}.`;
    const transformed = makeSentenceNearMiss(compactEvidence(sourceSentence), signal, concept);

    if (transformed && transformed.toLowerCase() !== compactEvidence(signal.sentence).toLowerCase()) {
        return trimToWordBudget(transformed, 18);
    }

    return trimToWordBudget(
        `It refers to ${concept}, which is related to ${context.topicName} but does not fully match the clue.`,
        18
    );
}

function makeSentenceNearMiss(sentence: string, signal: StudySignal, concept: string) {
    let result = sentence;

    const numberMatch = sentence.match(/\b\d+(?:\.\d+)?\b/);
    if (numberMatch) {
        const value = Number(numberMatch[0]);
        if (!Number.isNaN(value)) {
            result = result.replace(numberMatch[0], String(value + 1));
        }
    }

    if (signal.compareTarget) {
        result = replaceFirstInsensitive(result, signal.compareTarget, concept);
    }

    if (signal.kind === "comparison") {
        result = result
            .replace(/\b(compare|difference|distinction|contrast)\b/gi, "connection")
            .replace(/\bwhereas\b/gi, "and");
    }

    if (signal.kind === "process") {
        result = result
            .replace(/\b(first|initially)\b/gi, "later")
            .replace(/\b(then|next|after)\b/gi, "before");
    }

    if (signal.kind === "causeEffect") {
        result = result
            .replace(/\b(cause|causes|leads to|results in)\b/gi, "is associated with")
            .replace(/\b(effect|consequence)\b/gi, "detail");
    }

    if (signal.kind === "function") {
        result = result
            .replace(/\b(function|role|purpose)\b/gi, "feature")
            .replace(/\b(helps|allows|enables)\b/gi, "mentions");
    }

    return result;
}

function buildGenericDistractor(signal: StudySignal, index: number) {
    const genericByKind = {
        definition: [
            "A broader term with a different meaning.",
            "A related idea, but not the stated definition.",
            "An outcome of the concept, not the concept itself.",
        ],
        process: [
            "A later effect rather than the process itself.",
            "A related stage, but not the mechanism asked.",
            "A supporting idea rather than the full sequence.",
        ],
        comparison: [
            "A similar concept, but not the contrasted one.",
            "A nearby term without the required distinction.",
            "A partial example instead of the compared concept.",
        ],
        causeEffect: [
            "A consequence rather than the original cause.",
            "A related condition, but not the stated link.",
            "A supporting detail rather than the main factor.",
        ],
        classification: [
            "A related group, but not the required category.",
            "A specific example rather than the full class.",
            "A similar label with a different scope.",
        ],
        function: [
            "A related concept with a different role.",
            "A nearby term, but not the required function.",
            "An effect of the role rather than the role itself.",
        ],
        fact: [
            "A related statement, but not the exact fact.",
            "A concept from the notes, but not this detail.",
            "A plausible idea that is not the stated answer.",
        ],
    } satisfies Record<SignalKind, string[]>;

    return genericByKind[signal.kind][index % 3];
}

function joinSignalSentences(signals: StudySignal[], fallback: string) {
    if (signals.length === 0) {
        return fallback;
    }

    return signals.map((signal) => compactEvidence(signal.sentence)).join(" ");
}

function buildRapidRevision(context: FallbackContext): RapidRevisionBlock {
    const formulas = context.lines
        .filter((line) => /=|formula|equation/i.test(line))
        .map((line) => trimToWordBudget(compactEvidence(line), 18))
        .slice(0, 4);
    const dates = context.sentences
        .filter((sentence) => /\b\d{4}\b/.test(sentence))
        .map((sentence) => trimToWordBudget(compactEvidence(sentence), 18))
        .slice(0, 4);
    const names = context.topicCandidates
        .filter((candidate) => /[A-Z]/.test(candidate))
        .map((candidate) => cleanLabel(candidate))
        .slice(0, 5);
    const numbers = context.sentences
        .filter((sentence) => /\b\d+(?:\.\d+)?\b/.test(sentence))
        .map((sentence) => trimToWordBudget(compactEvidence(sentence), 18))
        .slice(0, 5);
    const lists = context.lines
        .filter((line) => /[:,]\s*[A-Za-z0-9].*,/.test(line) || /\b(types|stages|steps|includes|consists of|categories)\b/i.test(line))
        .map((line) => trimToWordBudget(compactEvidence(line), 18))
        .slice(0, 5);

    return {
        formulas,
        dates,
        names,
        numbers,
        lists,
    };
}

function ensureUniqueMcqOptions(options: string[], signal: StudySignal, context: FallbackContext) {
    const uniqueOptions = options.filter(uniquePhrases);
    const fallbackPool = [
        `It refers to ${signal.concept}, but only partially matches the clue.`,
        `It is linked to ${context.topicName}, but the wording does not fully fit.`,
        `It sounds plausible, but it changes a key detail from the notes.`,
        `It is a related option, not the best match for the statement.`,
    ];

    for (const fallback of fallbackPool) {
        if (uniqueOptions.length >= 4) {
            break;
        }
        if (!uniqueOptions.some((option) => option.toLowerCase() === fallback.toLowerCase())) {
            uniqueOptions.push(fallback);
        }
    }

    return uniqueOptions.slice(0, 4);
}

function buildExamAngle(signal: StudySignal) {
    if (signal.kind === "comparison" && signal.compareTarget) {
        return `Be ready to compare ${signal.concept} and ${signal.compareTarget}.`;
    }

    if (signal.kind === "process") {
        return `Be ready to explain the steps or mechanism of ${signal.concept}.`;
    }

    if (signal.kind === "causeEffect") {
        return `Be ready to explain the causes and effects linked to ${signal.concept}.`;
    }

    if (signal.kind === "classification") {
        return `Be ready to list the types or categories of ${signal.concept}.`;
    }

    return `Be ready to define and explain ${signal.concept}.`;
}

function replaceFirstInsensitive(value: string, search: string, replacement: string) {
    const escaped = escapeRegExp(search);
    return value.replace(new RegExp(escaped, "i"), replacement);
}

function findSentenceForConcept(sentences: string[], concept: string) {
    const lowered = concept.toLowerCase();
    return sentences.find((sentence) => sentence.toLowerCase().includes(lowered));
}

function detectSignalKind(sentence: string): SignalKind {
    const lowered = sentence.toLowerCase();

    if (/(difference|compare|compared|versus|vs|whereas|unlike|similar)/.test(lowered)) {
        return "comparison";
    }

    if (/(process|steps|stage|stages|phase|phases|cycle|mechanism|pathway|sequence)/.test(lowered)) {
        return "process";
    }

    if (/(cause|effect|results in|leads to|therefore|because|due to|consequence)/.test(lowered)) {
        return "causeEffect";
    }

    if (/(classification|types|categories|forms|kinds|classified|includes|consists of)/.test(lowered)) {
        return "classification";
    }

    if (/(function|role|importance|purpose|used for|helps|allows|enables)/.test(lowered)) {
        return "function";
    }

    if (/(is|are|refers to|defined as|means|known as|called)/.test(lowered)) {
        return "definition";
    }

    return "fact";
}

function extractPrimaryConcept(sentence: string, fallbackConcepts: string[]) {
    const rankedMatch = fallbackConcepts.find((concept) =>
        sentence.toLowerCase().includes(concept.toLowerCase())
    );
    if (rankedMatch) {
        return rankedMatch;
    }

    const matches =
        sentence.match(/\b[A-Za-z][A-Za-z0-9/-]{2,}(?:\s+[A-Za-z][A-Za-z0-9/-]{2,}){0,2}\b/g) ?? [];

    return matches
        .map(normalizePhrase)
        .filter(Boolean)
        .filter((value) => !isGenericTopicPhrase(value))
        .filter((value) => !STOP_WORDS.has(value.toLowerCase()))
        .sort((left, right) => right.length - left.length)[0];
}

function findRelatedConcept(sentence: string, concept: string, conceptScores: ConceptScore[]) {
    return conceptScores.find(
        (item) =>
            item.concept.toLowerCase() !== concept.toLowerCase() &&
            sentence.toLowerCase().includes(item.concept.toLowerCase())
    )?.concept;
}

function selectSignalsByKinds(signals: StudySignal[], kinds: SignalKind[], limit: number) {
    return signals
        .filter((signal) => kinds.includes(signal.kind))
        .slice(0, limit);
}

function buildMcqQuestionStem(signal: StudySignal, clue: string) {
    if (signal.kind === "process") {
        return `Which process or mechanism is best described by this statement: ${clue}?`;
    }

    if (signal.kind === "comparison") {
        return `Which concept from the notes is being highlighted in this comparison clue: ${clue}?`;
    }

    if (signal.kind === "causeEffect") {
        return `Which concept is linked to this cause-and-effect statement: ${clue}?`;
    }

    if (signal.kind === "function") {
        return `Which concept is associated with this role or function: ${clue}?`;
    }

    return `Which concept best matches this statement from the notes: ${clue}?`;
}

function toStudyClue(sentence: string, concept: string) {
    const escapedConcept = escapeRegExp(concept);
    const scrubbed = cleanSentence(sentence)
        .replace(new RegExp(escapedConcept, "ig"), "this concept")
        .replace(/\s+/g, " ")
        .trim();

    return scrubbed.length > 20 ? scrubbed : cleanSentence(sentence);
}

function compactEvidence(sentence: string) {
    const compacted = cleanSentence(sentence)
        .replace(/\s*-\s*/g, ": ")
        .replace(/\s{2,}/g, " ")
        .trim();

    return compacted.endsWith(".") ? compacted : `${compacted}.`;
}

function normalizePhrase(value: string) {
    return value
        .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanSentence(value: string) {
    return value.replace(/\s+/g, " ").replace(/\s([,.;!?])/g, "$1").trim();
}

function cleanLabel(value: string) {
    return cleanSentence(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSummary(summary: string) {
    const cleaned = cleanSentence(summary);
    const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .slice(0, 5);

    return sentences.join("\n\n");
}

function normalizeProbability(value: string): "high" | "medium" | "low" {
    const lowered = value.toLowerCase();
    if (lowered.includes("high")) return "high";
    if (lowered.includes("low")) return "low";
    return "medium";
}

function normalizeDifficulty(value: string): "Easy" | "Medium" | "Hard" {
    const lowered = value.toLowerCase();
    if (lowered.includes("easy")) return "Easy";
    if (lowered.includes("hard") || lowered.includes("advanced")) return "Hard";
    return "Medium";
}

function normalizeType(value: string): "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define" {
    const normalized = value.toLowerCase();
    if (normalized.includes("mcq")) return "MCQ";
    if (normalized.includes("short")) return "Short Answer";
    if (normalized.includes("compare")) return "Compare";
    if (normalized.includes("define")) return "Define";
    if (normalized.includes("explain")) return "Explain";
    return "Written";
}

function probabilityRank(value: "high" | "medium" | "low") {
    if (value === "high") return 0;
    if (value === "medium") return 1;
    return 2;
}

function isGenericTopicPhrase(value: string) {
    const normalized = normalizePhrase(value).toLowerCase();
    if (!normalized) {
        return true;
    }

    return GENERIC_TOPIC_PHRASES.has(normalized);
}

function trimToSentenceBudget(sentence: string, maxWords: number) {
    return trimToWordBudget(sentence, maxWords);
}

function trimToWordBudget(text: string, maxWords: number) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
        return text.trim();
    }

    return `${words.slice(0, maxWords).join(" ")}...`;
}

function toTitleCase(value: string) {
    return value.replace(/\w\S*/g, (part) => part[0].toUpperCase() + part.slice(1).toLowerCase());
}

function dedupe(values: string[]) {
    return values.filter(uniquePhrases);
}

function uniqueByKey<T>(getKey: (value: T) => string) {
    return (value: T, index: number, array: T[]) =>
        array.findIndex((entry) => getKey(entry) === getKey(value)) === index;
}

function uniquePhrases(value: string, index: number, array: string[]) {
    return array.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index;
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shuffle<T>(items: T[]) {
    const cloned = [...items];
    for (let index = cloned.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor((index * 7 + 3) % (index + 1));
        [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
    }
    return cloned;
}
