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

// Default values from config.json for AI agent design use case
const DEFAULT_PURPOSE = "Extract essential information from developers, product managers, or technical stakeholders to design a complete AI agent architecture. The goal is to gather raw, unstructured input through 7-10 precise questions that will be structured into: (1) domain - the problem domain and target users/personas, (2) tasks - what the agent should do and its capabilities, (3) objectives - expected outputs, deliverables, and success criteria, (4) scope - boundaries of what's included/excluded, (5) constraints - limitations, risks, and safety requirements, (6) purpose - the core problem being solved, (7) type - what kind of agent (e.g., assistant, autonomous, tool-using, multi-agent), (8) intelligence level - complexity and reasoning requirements, and (9) autonomy level - how independently it should operate. These structured fields will be used to generate a complete Agentic AI Architecture Document with patterns, sub-agents, tools, memory, orchestration, interfaces, and deployment.";

const DEFAULT_CONTEXT = "Respondents will give messy, vague, or incomplete answers—this is expected and desirable. They don't need to understand agentic design patterns, tool schemas, memory systems, or orchestration models. Ask simple, conversational questions one at a time. Provide concrete examples in your questions to guide them (e.g., 'Examples: Help users reset passwords, Automate lead qualification, Fix bugs'). Your questions must extract: domain (problem area + who uses it), tasks (what actions the agent performs), objectives (what it produces/achieves), scope (what's in/out of bounds), constraints (what it must avoid/limits), purpose (core problem), type (agent category), intelligence level (reasoning complexity needed), and autonomy level (independence). Each answer should be recorded verbatim—external interpretation will structure these into domain/tasks/objectives/scope/constraints/purpose/type/intelligence_level/autonomy_level. Keep questions short, intuitive, and focused on one concept at a time.";

export function SurveyConfigForm({ onSubmit, isSubmitting = false }: SurveyConfigFormProps) {
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE);
  const [context, setContext] = useState(DEFAULT_CONTEXT);
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

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

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

