"use client";

import { useEffect, useState } from "react";
import { fetchSessionDetail, fetchSessions } from "@/lib/api";
import type { SessionDetail, SessionSummary } from "@/lib/types";

export default function AdminPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSessions();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions.");
      }
    };
    void load();
  }, []);

  const handleSelect = async (sessionId: string) => {
    setError(null);
    setLoading(true);
    try {
      const detail = await fetchSessionDetail(sessionId);
      setSelectedSession(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session detail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Survey Sessions</h1>
        <p className="text-sm text-gray-500">Monitor discovery conversations captured by the chatbot.</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Sessions</h2>
          <div className="space-y-3">
            {sessions.length === 0 && <p className="text-sm text-gray-500">No sessions yet.</p>}
            {sessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => void handleSelect(session.session_id)}
                data-testid="session-card"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-left text-sm text-gray-800 transition hover:border-indigo-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Session {session.session_id.slice(0, 8)}</span>
                  <span className="text-xs text-gray-500">
                    {session.completed_at ? "Completed" : "In progress"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Questions asked: {session.questions_asked}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Conversation</h2>
          {loading && <p className="text-sm text-gray-500">Loading session...</p>}
          {!loading && !selectedSession && (
            <p className="text-sm text-gray-500">Select a session to inspect the conversation.</p>
          )}
          {selectedSession && (
            <div className="space-y-4">
              {selectedSession.conversation.map((entry, index) => (
                <div key={`${entry.timestamp}-${index}`} className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-800">
                  <p className="font-semibold text-gray-900">Q: {entry.question}</p>
                  <p className="text-gray-600">Type: {entry.type}</p>
                  <p className="mt-1 text-gray-900">A: {Array.isArray(entry.answer) ? entry.answer.join(", ") : entry.answer}</p>
                  <p className="text-xs text-gray-500">Captured: {new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

