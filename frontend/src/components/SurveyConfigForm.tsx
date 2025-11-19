"use client";

import { useState } from "react";

export interface SurveyConfigInputs {
  purpose: string;
  context: string;
  min_questions: number;
  max_questions: number;
}

interface SurveyConfigFormProps {
  onSubmit: (config: SurveyConfigInputs) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function SurveyConfigForm({ onSubmit, isSubmitting = false }: SurveyConfigFormProps) {
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [minQuestions, setMinQuestions] = useState(5);
  const [maxQuestions, setMaxQuestions] = useState(15);
  const [errors, setErrors] = useState<Partial<Record<keyof SurveyConfigInputs, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SurveyConfigInputs, string>> = {};

    if (!purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    if (!context.trim()) {
      newErrors.context = "Context is required";
    }

    if (minQuestions < 1) {
      newErrors.min_questions = "Minimum questions must be at least 1";
    }

    if (maxQuestions <= minQuestions) {
      newErrors.max_questions = "Maximum questions must be greater than minimum questions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      purpose: purpose.trim(),
      context: context.trim(),
      min_questions: minQuestions,
      max_questions: maxQuestions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
          Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          id="purpose"
          className={`w-full rounded-xl border ${
            errors.purpose ? "border-red-300" : "border-gray-200"
          } p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          rows={4}
          placeholder="Describe the purpose of this survey..."
          disabled={isSubmitting}
          value={purpose}
          onChange={(e) => {
            setPurpose(e.target.value);
            if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: undefined }));
          }}
        />
        {errors.purpose && <p className="text-sm text-red-600">{errors.purpose}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="context" className="block text-sm font-medium text-gray-700">
          Context <span className="text-red-500">*</span>
        </label>
        <textarea
          id="context"
          className={`w-full rounded-xl border ${
            errors.context ? "border-red-300" : "border-gray-200"
          } p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
          rows={4}
          placeholder="Provide context about the survey and respondents..."
          disabled={isSubmitting}
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
            if (errors.context) setErrors((prev) => ({ ...prev, context: undefined }));
          }}
        />
        {errors.context && <p className="text-sm text-red-600">{errors.context}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="min_questions" className="block text-sm font-medium text-gray-700">
            Minimum Questions <span className="text-red-500">*</span>
          </label>
          <input
            id="min_questions"
            type="number"
            min="1"
            className={`w-full rounded-xl border ${
              errors.min_questions ? "border-red-300" : "border-gray-200"
            } p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            disabled={isSubmitting}
            value={minQuestions}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setMinQuestions(isNaN(value) ? 1 : value);
              if (errors.min_questions) setErrors((prev) => ({ ...prev, min_questions: undefined }));
              if (errors.max_questions && maxQuestions <= value) {
                setErrors((prev) => ({ ...prev, max_questions: undefined }));
              }
            }}
          />
          {errors.min_questions && <p className="text-sm text-red-600">{errors.min_questions}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="max_questions" className="block text-sm font-medium text-gray-700">
            Maximum Questions <span className="text-red-500">*</span>
          </label>
          <input
            id="max_questions"
            type="number"
            min="2"
            className={`w-full rounded-xl border ${
              errors.max_questions ? "border-red-300" : "border-gray-200"
            } p-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            disabled={isSubmitting}
            value={maxQuestions}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setMaxQuestions(isNaN(value) ? 2 : value);
              if (errors.max_questions) setErrors((prev) => ({ ...prev, max_questions: undefined }));
            }}
          />
          {errors.max_questions && <p className="text-sm text-red-600">{errors.max_questions}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? "Starting Survey..." : "Start Survey"}
      </button>
    </form>
  );
}

