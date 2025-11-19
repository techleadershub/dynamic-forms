"use client";

import { useMemo, useState } from "react";
import { startSurvey, submitAnswer } from "@/lib/api";
import type { Message, QuestionPayload } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { ProgressBar } from "./ProgressBar";
import { QuestionForm } from "./QuestionForm";
import { SurveyConfigForm, type SurveyConfigInputs } from "./SurveyConfigForm";

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
  const [configSubmitted, setConfigSubmitted] = useState(false);
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);

  const handleConfigSubmit = async (config: SurveyConfigInputs) => {
    // Prevent multiple submissions
    if (isSubmittingConfig || configSubmitted) {
      return;
    }
    
    setIsSubmittingConfig(true);
    setIsLoading(true);
    setError(null);
    try {
      const response = await startSurvey(config);
      setSessionId(response.session_id);
      setCurrentQuestion(response);
      setProgress(response.progress);
      setConfigSubmitted(true);
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
      setIsSubmittingConfig(false); // Reset on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!configSubmitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
          <p className="font-medium mb-1">Configure your survey</p>
          <p className="text-indigo-700">Please provide the following information to start the survey.</p>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <SurveyConfigForm onSubmit={handleConfigSubmit} isSubmitting={isLoading || isSubmittingConfig} />
      </div>
    );
  }

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

