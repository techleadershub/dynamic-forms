from __future__ import annotations

import uuid
from typing import Any, Dict, List, Union

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ai_service import AIService
from .config import SurveyConfig, load_config
from .session_manager import SessionManager, SessionNotFoundError


class Progress(BaseModel):
    current: int
    min: int
    max: int


class QuestionResponse(BaseModel):
    session_id: str
    question: str | None
    type: str
    options: List[str] | None = None
    is_complete: bool = False
    reasoning: str | None = None
    progress: Progress


class StartResponse(QuestionResponse):
    pass


class AnswerRequest(BaseModel):
    session_id: str = Field(..., description="ID of the active survey session")
    answer: Union[str, List[str]] = Field(
        ...,
        description="Answer payload. Use string for multiple choice/free text, list of strings for checkbox responses.",
    )


class SessionSummary(BaseModel):
    session_id: str
    started_at: str
    completed_at: str | None = None
    questions_asked: int


class SessionDetail(BaseModel):
    session_id: str
    started_at: str
    completed_at: str | None
    questions_asked: int
    conversation: List[Dict[str, Any]]


load_dotenv()

app = FastAPI(title="Dynamic Discovery Chatbot API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

survey_config: SurveyConfig = load_config()
session_manager = SessionManager()
ai_service = AIService(survey_config)


def get_config() -> SurveyConfig:
    """Get current config, reloading from file if needed."""
    from .config import reload_config
    return reload_config()


def get_ai_service() -> AIService:
    """Get AI service with fresh config."""
    return AIService(get_config())


@app.get("/healthz")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


def _build_progress(session: Dict[str, Any]) -> Progress:
    current_config = get_config()
    current = session.get("questions_asked", len(session["conversation"]))
    return Progress(
        current=current,
        min=current_config.min_questions,
        max=current_config.max_questions,
    )


def _completion_payload(session_id: str, session: Dict[str, Any], reason: str) -> QuestionResponse:
    session_manager.mark_completed(session)
    session["current_question"] = None
    session["questions_asked"] = len(session["conversation"])
    session_manager.save_session(session_id, session)
    return QuestionResponse(
        session_id=session_id,
        question="Thanks! We've collected enough insights for now.",
        type="free_text",
        options=None,
        is_complete=True,
        reasoning=reason,
        progress=_build_progress(session),
    )


@app.post("/api/start", response_model=StartResponse)
async def start_survey() -> StartResponse:
    current_config = get_config()
    session_id = str(uuid.uuid4())
    session = session_manager.create_session(session_id, current_config.model_dump())

    current_ai_service = get_ai_service()
    question = current_ai_service.generate_question(conversation=[], questions_asked=0)
    session["current_question"] = question
    session["questions_asked"] = 1
    session_manager.save_session(session_id, session)

    return QuestionResponse(
        session_id=session_id,
        question=question.get("question"),
        type=question.get("type", "free_text"),
        options=question.get("options"),
        is_complete=question.get("is_complete", False),
        reasoning=question.get("reasoning"),
        progress=_build_progress(session),
    )


@app.post("/api/answer", response_model=QuestionResponse)
async def submit_answer(payload: AnswerRequest) -> QuestionResponse:
    try:
        session = session_manager.load_session(payload.session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    current_question = session.get("current_question")
    if not current_question:
        raise HTTPException(status_code=400, detail="No active question for this session. Start over.")

    answer: Union[str, List[str]] = payload.answer

    # Normalize checkbox answers to list of strings
    if current_question.get("type") == "checkbox":
        if not isinstance(answer, list):
            raise HTTPException(status_code=400, detail="Checkbox questions require an array of answers.")
    else:
        if isinstance(answer, list):
            raise HTTPException(status_code=400, detail="Provide a single answer for this question type.")

    session_manager.append_conversation_entry(session, current_question, answer)
    session["current_question"] = None
    session["questions_asked"] = len(session["conversation"])

    # Reload config to get latest settings
    current_config = get_config()
    
    # Check max question limit
    if len(session["conversation"]) >= current_config.max_questions:
        return _completion_payload(payload.session_id, session, "Reached maximum number of questions.")

    # Ask AI for next question with fresh config
    current_ai_service = get_ai_service()
    next_question = current_ai_service.generate_question(
        conversation=session["conversation"],
        questions_asked=len(session["conversation"]),
    )

    if next_question.get("is_complete") and len(session["conversation"]) >= current_config.min_questions:
        return _completion_payload(payload.session_id, session, "AI determined the discovery is complete.")

    session["current_question"] = next_question
    session["questions_asked"] = len(session["conversation"]) + 1
    session_manager.save_session(payload.session_id, session)

    return QuestionResponse(
        session_id=payload.session_id,
        question=next_question.get("question"),
        type=next_question.get("type", "free_text"),
        options=next_question.get("options"),
        is_complete=next_question.get("is_complete", False),
        reasoning=next_question.get("reasoning"),
        progress=_build_progress(session),
    )


@app.get("/api/admin/sessions", response_model=List[SessionSummary])
async def list_sessions() -> List[SessionSummary]:
    sessions = session_manager.list_sessions()
    summaries = [
        SessionSummary(
            session_id=s["session_id"],
            started_at=s["started_at"],
            completed_at=s.get("completed_at"),
            questions_asked=s.get("questions_asked", len(s.get("conversation", []))),
        )
        for s in sessions
    ]
    return summaries


@app.get("/api/admin/session/{session_id}", response_model=SessionDetail)
async def get_session(session_id: str) -> SessionDetail:
    try:
        session = session_manager.load_session(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return SessionDetail(
        session_id=session["session_id"],
        started_at=session["started_at"],
        completed_at=session.get("completed_at"),
        questions_asked=session.get("questions_asked", len(session.get("conversation", []))),
        conversation=session.get("conversation", []),
    )

