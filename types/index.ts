// ExamPrep AI — Core TypeScript Types

export interface ExamOracleQuestion {
  question: string;
  probability: "high" | "medium" | "low";
  topic: string;
  type: "Written" | "MCQ" | "Short Answer" | "Compare" | "Explain" | "Define";
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Flashcard {
  front: string;
  back: string;
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
  difficultyRating: "Easy" | "Medium" | "Hard";
  topicName: string;
}

export interface GenerateRequest {
  notes: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: GeneratedContent;
  error?: string;
}
