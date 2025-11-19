"use client";

import clsx from "clsx";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.role === "bot";
  return (
    <div
      className={clsx(
        "flex w-full",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        data-testid={isBot ? "bot-message" : "user-message"}
        className={clsx(
          "rounded-2xl px-4 py-2 text-sm shadow",
          isBot
            ? "bg-white/80 text-gray-800 border border-gray-100"
            : "bg-indigo-600 text-white"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

