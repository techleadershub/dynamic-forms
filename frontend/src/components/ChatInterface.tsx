"use client";

import { useMemo, useState, useEffect } from "react";
import { startSurvey, submitAnswer, fetchSessionDetail } from "@/lib/api";
import type { Message, QuestionPayload, SessionDetail } from "@/lib/types";
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
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
        // Fetch full session detail when complete
        if (sessionId) {
          try {
            const detail = await fetchSessionDetail(sessionId);
            setSessionDetail(detail);
          } catch (err) {
            console.error("Failed to fetch session detail:", err);
          }
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

  const handleDownloadJSON = () => {
    if (!sessionDetail || isDownloading) return;

    setIsDownloading(true);
    try {
      // Format the session data as JSON
      const jsonData = {
        session_id: sessionDetail.session_id,
        started_at: sessionDetail.started_at,
        completed_at: sessionDetail.completed_at,
        questions_asked: sessionDetail.questions_asked,
        conversation: sessionDetail.conversation,
      };

      // Create a blob and download
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `survey-session-${sessionDetail.session_id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download JSON.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch session detail when survey completes if not already fetched
  useEffect(() => {
    if (isComplete && sessionId && !sessionDetail) {
      fetchSessionDetail(sessionId)
        .then(setSessionDetail)
        .catch((err) => {
          console.error("Failed to fetch session detail:", err);
        });
    }
  }, [isComplete, sessionId, sessionDetail]);

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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
          <p className="text-center text-sm text-emerald-800">
            Thanks for sharing! Your responses have been recorded.
          </p>
          {sessionDetail && (
            <button
              onClick={handleDownloadJSON}
              disabled={isDownloading}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Preparing download...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download JSON
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <QuestionForm question={currentQuestion} isSubmitting={isLoading} onSubmit={handleAnswer} />
      )}
    </div>
  );
}

