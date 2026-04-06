# CODEX.md

## Project Identity

- Product name: `ExamPrep AI`
- Tagline: `Paste your notes. Own your exam.`
- Product type: AI-powered student exam intelligence platform
- Core promise: turn messy lecture notes into a personalized exam prep kit in seconds
- Core differentiator: `Exam Oracle` predicts the most likely exam questions from notes and ranks them by probability

## One-Line Pitch

`Every other tool makes you study harder. ExamPrep AI makes you study smarter by telling you what is most likely to appear in your exam.`

## Target Users

- High school students with upcoming exams
- College students with dense lecture notes
- Students who do not know what to prioritize
- Students who want instant prep material without manual formatting

## Product Positioning

ExamPrep AI is not just:

- a flashcard generator
- a quiz generator
- a summarizer

It is a note-to-exam-intelligence system.

Primary market position:

- automatic from notes
- personalized to the student's exact material
- prediction-focused
- fast
- free for early users

## Core User Problem

Students usually have notes but do not know:

- what matters most
- what is likely to be tested
- how to convert notes into useful study assets quickly

The emotional trigger is:

`I have all these notes. I do not know what to study.`

## Hero Feature

### Exam Oracle

Exam Oracle is the main reason this product exists.

Input:
- raw lecture notes pasted by a student

System behavior:
- reads the full notes
- identifies recurring topics
- identifies concept complexity
- infers likely exam patterns
- returns ranked predictions

Output:
- predicted exam questions
- probability buckets: `high`, `medium`, `low`
- topic label
- question type
- difficulty

## Required Output Areas

The product should generate all of the following from a single note input:

- `examOracle`
- `flashcards`
- `mcqQuestions`
- `summary`
- `difficultyRating`
- `topicName`

## Current Repo State

This section is the execution baseline for any LLM working in this repository.

Implemented now:

- landing page at `app/page.tsx`
- prep workflow at `app/prep/page.tsx`
- API route at `app/api/generate/route.ts`
- Gemini client at `lib/gemini.ts`
- note input UI
- Exam Oracle UI
- flashcards UI
- quiz UI
- summary UI
- local in-memory recent session history on the prep page
- Prisma-backed anonymous community
- server-owned anonymous identity via cookie + hashed identifier
- post and comment voting
- post and comment reporting with auto-hide / auto-block rules

Planned but not actually implemented yet:

- Supabase
- authentication
- saved history across browser restarts for prep flow
- user dashboard
- returning-user account flows
- backup LLM provider

Do not assume roadmap items already exist.

## Current Stack

- frontend framework: `Next.js`
- language: `TypeScript`
- styling: `Tailwind CSS`
- components: local UI components / shadcn-style setup
- animation: `framer-motion`
- icons: `lucide-react`
- AI provider currently wired: `Google Gemini`
- persistence currently used: `localStorage`
- hosting target: `Vercel`

Note:
- the original product brief references `Next.js 14` and `Gemini 1.5 Flash`
- the current codebase uses newer package versions
- when changing infra references, prefer the codebase as source of truth unless the user explicitly wants the original plan restored

## Functional Flow

1. Student pastes lecture notes.
2. Frontend submits notes to `/api/generate`.
3. Backend calls Gemini with a strict JSON prompt.
4. Response is parsed into structured study assets.
5. UI presents:
   - Exam Oracle
   - Flashcards
   - Quiz
   - Summary
6. Latest result is saved in browser localStorage.

## Source of Truth for AI Output

The intended structured response shape is:

```ts
{
  examOracle: Array<{
    question: string;
    probability: "high" | "medium" | "low";
    topic: string;
    type: "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define";
    difficulty: "Easy" | "Medium" | "Hard";
  }>;
  flashcards: Array<{
    front: string;
    back: string;
  }>;
  mcqQuestions: Array<{
    question: string;
    options: [string, string, string, string];
    answer: string;
    explanation: string;
  }>;
  summary: string;
  difficultyRating: "Easy" | "Medium" | "Hard";
  topicName: string;
}
```

## Known Implementation Mismatch

There is at least one current mismatch that future agents should notice before extending the product:

- `types/index.ts` and `lib/gemini.ts` define MCQ answers as `answer`
- `components/QuizSection.tsx` currently reads `correctAnswer`

Any LLM modifying quiz logic should resolve this mismatch before building more quiz features.

## Product Rules

When building or editing features, preserve these product rules:

- zero-prompt user experience
- one input box, one obvious action
- output must feel instant and high-value
- Exam Oracle stays the hero feature
- design should feel premium, sharp, and focused
- avoid playful or childish education app patterns
- prioritize clarity over feature clutter

## Brand and UX Direction

The product should feel:

- intelligent
- predictive
- premium
- fast
- trustworthy
- student-focused

Avoid:

- generic chatbot styling
- cheesy school imagery
- overly colorful gamification
- bloated dashboards before core value is strong

## Competitor Framing

The product differentiates itself from tools like Quizlet, Knowt, ChatGPT, and Anki by combining:

1. automatic generation from notes
2. exam-question prediction
3. free and low-friction usage

This positioning should remain visible in copy, UI hierarchy, and launch decisions.

## Execution Guidance for Any LLM

If you are an LLM working in this repo:

1. Read this file first.
2. Treat `Exam Oracle` as the primary product surface.
3. Distinguish between `implemented` and `planned`.
4. Prefer small, shippable improvements over broad architecture rewrites.
5. Preserve the current fast MVP direction unless the user asks for a larger pivot.
6. When adding new features, check whether localStorage, types, API prompt, and UI all stay aligned.
7. If product decisions are ambiguous, optimize for student speed, clarity, and perceived intelligence.

## Priority Roadmap

Recommended execution order:

1. Stabilize current generation pipeline and type consistency.
2. Improve output quality and reliability of Exam Oracle.
3. Improve quiz and flashcard UX.
4. Add session history.
5. Add auth and database only after core value is stable.

## Definition of Success

A user should be able to:

- paste notes in under 10 seconds
- get high-quality predictions and study assets in under 60 seconds
- immediately know what to focus on for the exam
- feel that the product is smarter than generic study tools

## Short Summary

ExamPrep AI is an exam intelligence product for students. The MVP takes raw notes, generates study assets, and makes exam predictions through Exam Oracle. The current repo is a working front-end plus Gemini-backed generation flow with localStorage persistence. Future work should strengthen the prediction experience first, then add persistence and accounts later.
