"use client";

import { useEffect, useState } from "react";
import type { QuestionPayload } from "@/lib/types";

interface QuestionFormProps {
  question: QuestionPayload | null;
  isSubmitting: boolean;
  onSubmit: (answer: string | string[]) => Promise<void> | void;
}

export function QuestionForm({ question, isSubmitting, onSubmit }: QuestionFormProps) {
  const [textAnswer, setTextAnswer] = useState("");
  const [singleChoice, setSingleChoice] = useState("");
  const [multiChoice, setMultiChoice] = useState<string[]>([]);

  useEffect(() => {
    setTextAnswer("");
    setSingleChoice("");
    setMultiChoice([]);
  }, [question?.question]);

  if (!question || question.is_complete) {
    return null;
  }

  const { type, options = [] } = question;

  const handleCheckbox = (option: string) => {
    setMultiChoice((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (type === "multiple_choice") {
      if (!singleChoice) return;
      await onSubmit(singleChoice);
      setSingleChoice("");
      return;
    }

    if (type === "checkbox") {
      if (!multiChoice.length) return;
      await onSubmit(multiChoice);
      setMultiChoice([]);
      return;
    }

    if (!textAnswer.trim()) return;
    await onSubmit(textAnswer.trim());
    setTextAnswer("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
      {type === "multiple_choice" && (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="radio"
                name="multiple-choice"
                value={option}
                disabled={isSubmitting}
                checked={singleChoice === option}
                onChange={() => setSingleChoice(option)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {type === "checkbox" && (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                value={option}
                disabled={isSubmitting}
                checked={multiChoice.includes(option)}
                onChange={() => handleCheckbox(option)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {type === "free_text" && (
        <textarea
          className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={3}
          placeholder="Type your response..."
          disabled={isSubmitting}
          value={textAnswer}
          onChange={(event) => setTextAnswer(event.target.value)}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

