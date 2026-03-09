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

function buildPrompt(studentNotes: string): string {
    return `You are an expert exam preparation assistant and professor who has decades of experience creating university and school exams.

Your task: Analyze the student's lecture notes below and generate a COMPLETE exam preparation kit.

CRITICAL INSTRUCTIONS:
1. EXAM ORACLE: Predict the most likely exam questions. Assign probability (high/medium/low) based on:
   - Topic frequency in notes (more mentions = higher probability)
   - Concept complexity (complex concepts are tested more in exams)
   - Standard exam patterns (definitions, comparisons, applications are common)
   - Processes, mechanisms, stages, differences, causes, effects, classifications, and formulas are especially exam-relevant
   - Give 8 high-quality predictions with a mix of high, medium, and low probability
   - Questions must be specific, exam-style, and directly answerable from the notes
   - Avoid vague prompts like "Discuss the topic" or "Write short notes"
   - Prefer prompts like define, explain, compare, classify, differentiate, describe steps, state causes/effects, and apply concept

2. FLASHCARDS: Create 10-12 high-quality flashcards covering key concepts, definitions, and important facts.
   - Front side must be short and scannable
   - Back side must be concise, accurate, and easy to revise quickly

3. MCQ QUESTIONS: Generate 8-10 multiple choice questions with 4 options each. Include explanations for correct answers.
   - Only one option should be clearly correct
   - Wrong options must be plausible but incorrect
   - Explanation should be 1-2 concise sentences

4. SUMMARY: Write a concise but comprehensive summary (140-220 words) of all topics covered.
   - Optimize for fast revision, not long prose
   - Use short sentences and compact wording

5. DIFFICULTY RATING: Rate the overall topic difficulty as Easy, Medium, or Hard.

6. TOPIC NAME: Identify the main topic/subject from the notes.

OUTPUT QUALITY RULES:
- Be concrete, not generic
- Prefer clarity over cleverness
- Keep wording clean and student-friendly
- Stay tightly grounded in the notes
- Do not mention missing context, assumptions, or limitations
- Return revision-ready output that can be scanned quickly

You MUST respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "examOracle": [
    {
      "question": "Full exam question text",
      "probability": "high",
      "topic": "Specific topic name",
      "type": "Written",
      "difficulty": "Medium"
    }
  ],
  "flashcards": [
    {
      "front": "Question or concept",
      "back": "Answer or explanation"
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
                console.warn(
                    `Gemini quota exhausted${details.retryDelay ? `, retry after ${details.retryDelay}` : ""}. Falling back to local generator.`
                );
                return generateFallbackExamPrep(notes);
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

        return validateGeneratedContent(JSON.parse(cleaned));
    } catch (error) {
        console.error("Gemini pipeline failed, using local fallback:", error);
        return generateFallbackExamPrep(notes);
    }
}

function validateGeneratedContent(parsed: GeneratedContent): GeneratedContent {
    if (
        !parsed.examOracle ||
        !parsed.flashcards ||
        !parsed.mcqQuestions ||
        !parsed.summary ||
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

function generateFallbackExamPrep(notes: string): GeneratedContent {
    const cleanNotes = notes.replace(/\r/g, "").trim();
    const lines = cleanNotes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const sentences = cleanNotes
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 20);

    const topicCandidates = collectTopicCandidates(lines, sentences);
    const topicName = deriveTopicName(lines, topicCandidates);
    const difficultyRating = deriveDifficulty(cleanNotes, topicCandidates.length);

    return normalizeGeneratedContent({
        examOracle: buildExamOracle(topicName, topicCandidates, sentences, difficultyRating),
        flashcards: buildFlashcards(topicName, topicCandidates, sentences),
        mcqQuestions: buildMcqs(topicName, topicCandidates, sentences),
        summary: buildSummary(topicName, sentences),
        difficultyRating,
        topicName,
    });
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
        }))
        .filter((item) => item.question.length > 12)
        .filter(uniqueByKey((item) => item.question.toLowerCase()))
        .sort((left, right) => probabilityRank(left.probability) - probabilityRank(right.probability))
        .slice(0, 8);

    const flashcards = parsed.flashcards
        .map((item) => ({
            front: trimToWordBudget(cleanSentence(item.front), 10),
            back: trimToWordBudget(cleanSentence(item.back), 28),
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

function buildExamOracle(
    topicName: string,
    topicCandidates: string[],
    sentences: string[],
    difficulty: "Easy" | "Medium" | "Hard"
) {
    const conceptScores = scoreOracleConcepts(topicName, topicCandidates, sentences);
    const rankedConcepts =
        conceptScores.length > 0
            ? conceptScores
            : [{ concept: topicName, sentence: sentences[0] ?? "", score: 1 }];

    const compareBase = rankedConcepts.find((item) => item.concept !== rankedConcepts[0]?.concept);
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

    return rankedConcepts.slice(0, 8).map((item, index) => {
        const compareTarget = compareBase?.concept ?? topicName;
        const questionConfig = buildOracleQuestion(item.concept, compareTarget, item.sentence, topicName, index);

        return {
            question: questionConfig.question,
            probability: probabilities[index] ?? "low",
            topic: topicName,
            type: questionConfig.type,
            difficulty: item.score >= 7 ? "Hard" : item.score >= 4 ? "Medium" : difficulty,
        };
    });
}

function buildFlashcards(topicName: string, topicCandidates: string[], sentences: string[]) {
    const pool = [...topicCandidates, ...extractSentenceAnchors(sentences)];

    return Array.from({ length: Math.min(12, Math.max(10, pool.length)) }, (_, index) => {
        const concept = pool[index % Math.max(pool.length, 1)] ?? topicName;
        const sourceSentence =
            findSentenceForConcept(sentences, concept) ||
            `${concept} is a major concept within ${topicName}.`;

        return {
            front:
                index % 2 === 0
                    ? `What is ${concept}?`
                    : `Why is ${concept} important in ${topicName}?`,
            back: trimToSentenceBudget(cleanSentence(sourceSentence), 24),
        };
    });
}

function buildMcqs(topicName: string, topicCandidates: string[], sentences: string[]): MCQQuestion[] {
    const concepts = dedupe([
        ...topicCandidates.slice(0, 8),
        ...extractSentenceAnchors(sentences).slice(0, 8),
    ]).slice(0, 8);

    const distractorPool = dedupe(
        concepts.length >= 4 ? concepts : [...concepts, "Fundamental principle", "Secondary mechanism", "Supportive process", "Observed outcome"]
    );

    return Array.from({ length: 8 }, (_, index) => {
        const concept = concepts[index % Math.max(concepts.length, 1)] ?? topicName;
        const distractors = distractorPool.filter((item) => item !== concept).slice(0, 3);
        while (distractors.length < 3) {
            distractors.push(`Related idea ${distractors.length + 1}`);
        }

        const options = shuffle([concept, ...distractors]).slice(0, 4) as [
            string,
            string,
            string,
            string,
        ];

        return {
            question: `Which concept is most directly associated with ${topicName}?`,
            options,
            answer: concept,
            explanation:
                findSentenceForConcept(sentences, concept) ||
                `${concept} appears as a central concept in the provided notes.`,
        };
    });
}

function buildSummary(topicName: string, sentences: string[]) {
    const selected = dedupe(sentences).slice(0, 6);

    if (selected.length === 0) {
        return `${topicName} is the central topic in the provided notes. The material includes definitions, relationships, and exam-relevant concepts that can be reviewed through the generated predictions, flashcards, and quiz.`;
    }

    const joined = selected.join(" ");
    const summary = trimToWordBudget(joined, 170);

    return summary.endsWith(".") ? summary : `${summary}.`;
}

function scoreOracleConcepts(topicName: string, topicCandidates: string[], sentences: string[]) {
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
                    numericScore,
            };
        })
        .filter((item) => item.concept.length > 2)
        .sort((left, right) => right.score - left.score || right.concept.length - left.concept.length)
        .filter(uniqueByKey((item) => item.concept.toLowerCase()));
}

function buildOracleQuestion(
    concept: string,
    compareTarget: string,
    sourceSentence: string,
    topicName: string,
    index: number
): {
    question: string;
    type: "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define";
} {
    const loweredSentence = sourceSentence.toLowerCase();

    if (/(difference|compare|versus|vs|unlike|similar)/.test(loweredSentence) && compareTarget !== concept) {
        return {
            question: `Compare ${concept} and ${compareTarget} with reference to the differences highlighted in the notes.`,
            type: "Compare",
        };
    }

    if (/(process|steps|stage|cycle|mechanism|pathway|workflow)/.test(loweredSentence)) {
        return {
            question: `Explain the process or mechanism of ${concept} step by step as covered in the notes.`,
            type: "Explain",
        };
    }

    if (/(cause|effect|results in|leads to|because|due to)/.test(loweredSentence)) {
        return {
            question: `Explain the causes, effects, or consequences associated with ${concept}.`,
            type: "Explain",
        };
    }

    if (/(classification|types|categories|forms|kinds)/.test(loweredSentence)) {
        return {
            question: `Classify the major types or categories of ${concept} mentioned in the notes.`,
            type: "Short Answer",
        };
    }

    if (index === 0 || /(defined|refers to|means|called|known as)/.test(loweredSentence)) {
        return {
            question: `Define ${concept} and state why it is important in ${topicName}.`,
            type: "Define",
        };
    }

    if (/(function|role|importance|purpose|used for)/.test(loweredSentence)) {
        return {
            question: `State the role and importance of ${concept} in ${topicName}.`,
            type: "Short Answer",
        };
    }

    return {
        question: `Explain ${concept} with reference to the key points emphasized in the notes.`,
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

function findSentenceForConcept(sentences: string[], concept: string) {
    const lowered = concept.toLowerCase();
    return sentences.find((sentence) => sentence.toLowerCase().includes(lowered));
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

function shuffle<T>(items: T[]) {
    const cloned = [...items];
    for (let index = cloned.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor((index * 7 + 3) % (index + 1));
        [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
    }
    return cloned;
}
