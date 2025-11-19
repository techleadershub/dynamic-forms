"use client";

import type { Progress } from "@/lib/types";

interface ProgressBarProps {
  progress: Progress | null;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  if (!progress) return null;

  const percentage = Math.min(
    100,
    Math.round((progress.current / progress.max) * 100)
  );

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          Question {progress.current} / {progress.max}
        </span>
        <span>Min required: {progress.min}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

