from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

SESSIONS_DIR = Path(__file__).resolve().parent.parent / "data" / "sessions"
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)


class SessionNotFoundError(Exception):
    """Raised when a requested session file does not exist."""


class SessionManager:
    def __init__(self, base_dir: Path = SESSIONS_DIR) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _session_path(self, session_id: str) -> Path:
        return self.base_dir / f"{session_id}.json"

    def create_session(self, session_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        session = {
            "session_id": session_id,
            "started_at": self._now_iso(),
            "completed_at": None,
            "questions_asked": 0,
            "conversation": [],
            "current_question": None,
            "config": config,
        }
        self._write_session(session_id, session)
        return session

    def load_session(self, session_id: str) -> Dict[str, Any]:
        path = self._session_path(session_id)
        if not path.exists():
            raise SessionNotFoundError(f"Session {session_id} not found")
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def save_session(self, session_id: str, session_data: Dict[str, Any]) -> None:
        self._write_session(session_id, session_data)

    def list_sessions(self) -> List[Dict[str, Any]]:
        sessions: List[Dict[str, Any]] = []
        for path in sorted(self.base_dir.glob("*.json")):
            with path.open("r", encoding="utf-8") as f:
                sessions.append(json.load(f))
        return sessions

    def append_conversation_entry(
        self,
        session: Dict[str, Any],
        question: Dict[str, Any],
        answer: Any,
    ) -> None:
        entry = {
            "question": question.get("question"),
            "type": question.get("type"),
            "options": question.get("options"),
            "answer": answer,
            "timestamp": self._now_iso(),
        }
        session["conversation"].append(entry)
        session["questions_asked"] = len(session["conversation"])

    def mark_completed(self, session: Dict[str, Any]) -> None:
        session["completed_at"] = session["completed_at"] or self._now_iso()

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def _write_session(self, session_id: str, session: Dict[str, Any]) -> None:
        path = self._session_path(session_id)
        with path.open("w", encoding="utf-8") as f:
            json.dump(session, f, indent=2)

