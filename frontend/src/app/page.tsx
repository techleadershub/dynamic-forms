'use client';

import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            SmartForms
          </p>
          <h1 className="text-4xl font-semibold text-gray-900">
            Intelligent Forms That Adapt in Real-Time
          </h1>
          <p className="text-sm text-gray-500">
            Powered by AI to make every question count. Adapts in real-time, asks smart follow-ups, and uncovers insights static forms miss.
          </p>
        </header>
        <ChatInterface />
      </div>
    </main>
  );
}
