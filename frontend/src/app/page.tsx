'use client';

import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Discovery Chatbot
          </p>
          <h1 className="text-4xl font-semibold text-gray-900">
            Guided conversations that adapt to every response.
          </h1>
          <p className="text-sm text-gray-500">
            Powered by GPT-4o-mini and your survey purpose. Short, sharp, and contextual.
          </p>
        </header>
        <ChatInterface />
      </div>
    </main>
  );
}
