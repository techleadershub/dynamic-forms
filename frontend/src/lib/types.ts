export type QuestionType = "multiple_choice" | "checkbox" | "free_text";

export interface Progress {
  current: number;
  min: number;
  max: number;
}

export interface QuestionPayload {
  session_id: string;
  question: string | null;
  type: QuestionType;
  options?: string[];
  is_complete: boolean;
  reasoning?: string;
  progress: Progress;
}

export interface AnswerRequest {
  session_id: string;
  answer: string | string[];
}

export interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
}

export interface SessionSummary {
  session_id: string;
  started_at: string;
  completed_at: string | null;
  questions_asked: number;
}

export interface SessionDetail extends SessionSummary {
  conversation: Array<{
    question: string;
    type: QuestionType;
    options?: string[];
    answer: string | string[];
    timestamp: string;
  }>;
}

