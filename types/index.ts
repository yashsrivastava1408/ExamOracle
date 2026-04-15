// ExamPrep AI — Core TypeScript Types

export interface ExamOracleQuestion {
  question: string;
  probability: "high" | "medium" | "low";
  topic: string;
  type: "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define";
  difficulty: "Easy" | "Medium" | "Hard";
  answerOutline?: string[];
  sampleAnswer?: string;
}

export interface Flashcard {
  front: string;
  back: string;
  mode?: "definition" | "comparison" | "step-order" | "fact-recall" | "why-it-matters";
}

export interface MCQQuestion {
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
}

export interface GeneratedContent {
  examOracle: ExamOracleQuestion[];
  flashcards: Flashcard[];
  mcqQuestions: MCQQuestion[];
  summary: string;
  keyTakeaways: string[];
  mistakeTraps: string[];
  mustMemorizeFacts: string[];
  summaryBlocks: {
    coreIdea: string;
    processSteps: string;
    differences: string;
    numbersFacts: string;
    likelyExamAngles: string;
  };
  rapidRevision: {
    formulas: string[];
    dates: string[];
    names: string[];
    numbers: string[];
    lists: string[];
  };
  difficultyRating: "Easy" | "Medium" | "Hard";
  topicName: string;
  isFallback?: boolean;
  retryAfterSeconds?: number;
}

export interface GenerateRequest {
  notes: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: GeneratedContent;
  error?: string;
}
