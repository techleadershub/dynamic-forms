import type { AnswerRequest, QuestionPayload, SessionDetail, SessionSummary } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.detail ?? "Unexpected server error";
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function startSurvey(): Promise<QuestionPayload> {
  const res = await fetch(`${API_BASE}/api/start`, {
    method: "POST",
  });
  return handleResponse<QuestionPayload>(res);
}

export async function submitAnswer(payload: AnswerRequest): Promise<QuestionPayload> {
  const res = await fetch(`${API_BASE}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<QuestionPayload>(res);
}

export async function fetchSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE}/api/admin/sessions`);
  return handleResponse<SessionSummary[]>(res);
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const res = await fetch(`${API_BASE}/api/admin/session/${sessionId}`);
  return handleResponse<SessionDetail>(res);
}

