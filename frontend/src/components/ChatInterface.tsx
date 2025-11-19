"use client";

import { useEffect, useMemo, useState } from "react";
import { startSurvey, submitAnswer } from "@/lib/api";
import type { Message, QuestionPayload } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ProgressBar } from "./ProgressBar";
import { QuestionForm } from "./QuestionForm";

const formatAnswer = (answer: string | string[]): string =>
  Array.isArray(answer) ? answer.join(", ") : answer;

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function ChatInterface() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [progress, setProgress] = useState<QuestionPayload["progress"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const response = await startSurvey();
        setSessionId(response.session_id);
        setCurrentQuestion(response);
        setProgress(response.progress);
        if (response.question) {
          setMessages([
            {
              id: makeId(),
              role: "bot",
              content: response.question,
            },
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start survey.");
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const handleAnswer = async (answer: string | string[]) => {
    if (!sessionId || !currentQuestion) return;
    setError(null);
    const userMessage: Message = {
      id: makeId(),
      role: "user",
      content: formatAnswer(answer),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload = await submitAnswer({
        session_id: sessionId,
        answer,
      });

      setProgress(payload.progress);

      if (payload.is_complete) {
        setCurrentQuestion({ ...payload, is_complete: true });
        if (payload.question) {
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: "bot",
              content: payload.question,
            },
          ]);
        }
        return;
      }

      setCurrentQuestion(payload);
      if (payload.question) {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "bot",
            content: payload.question,
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = useMemo(() => currentQuestion?.is_complete ?? false, [currentQuestion]);

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar progress={progress} />

      <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-gradient-to-b from-indigo-50 via-white to-white p-4 shadow-inner">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-500">Loading first question...</p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isComplete ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
          Thanks for sharing! Your responses have been recorded.
        </div>
      ) : (
        <QuestionForm question={currentQuestion} isSubmitting={isLoading} onSubmit={handleAnswer} />
      )}
    </div>
  );
}

