"""Tests for FastAPI endpoints."""
import json
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.config import SurveyConfig
from backend.session_manager import SessionManager, SessionNotFoundError


@pytest.fixture
def client():
    """Test client for FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_ai_response():
    """Mock AI service response."""
    return {
        "question": "What's your role?",
        "type": "multiple_choice",
        "options": ["PM", "Dev", "Designer"],
        "is_complete": False,
        "reasoning": "Starting discovery",
    }


def test_start_survey(client, mock_ai_response):
    """Test starting a new survey."""
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        response = client.post("/api/start")
        
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["question"] == "What's your role?"
        assert data["type"] == "multiple_choice"
        assert data["progress"]["current"] == 1


def test_submit_answer(client, mock_ai_response):
    """Test submitting an answer."""
    # First start a survey
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        start_response = client.post("/api/start")
        session_id = start_response.json()["session_id"]
        
        # Now submit an answer
        next_question = {
            "question": "How many people?",
            "type": "checkbox",
            "options": ["1-5", "6-20", "21-50"],
            "is_complete": False,
        }
        mock_generate.return_value = next_question
        
        answer_response = client.post(
            "/api/answer",
            json={"session_id": session_id, "answer": "PM"},
        )
        
        assert answer_response.status_code == 200
        data = answer_response.json()
        assert data["question"] == "How many people?"
        assert data["progress"]["current"] == 2


def test_submit_checkbox_answer(client, mock_ai_response):
    """Test submitting checkbox answer (array)."""
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        start_response = client.post("/api/start")
        session_id = start_response.json()["session_id"]
        
        # Update current question to checkbox type
        from backend.app import session_manager
        session = session_manager.load_session(session_id)
        session["current_question"] = {
            "question": "Which tools?",
            "type": "checkbox",
            "options": ["Jira", "Slack"],
        }
        session_manager.save_session(session_id, session)
        
        next_question = {"question": "Next?", "type": "free_text", "is_complete": False}
        mock_generate.return_value = next_question
        
        answer_response = client.post(
            "/api/answer",
            json={"session_id": session_id, "answer": ["Jira", "Slack"]},
        )
        
        assert answer_response.status_code == 200


def test_submit_answer_invalid_session(client):
    """Test submitting answer with invalid session ID."""
    response = client.post(
        "/api/answer",
        json={"session_id": "nonexistent", "answer": "test"},
    )
    
    assert response.status_code == 404


def test_max_questions_reached(client, mock_ai_response):
    """Test that max questions triggers completion."""
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        start_response = client.post("/api/start")
        session_id = start_response.json()["session_id"]
        
        # Load session and set questions_asked to max
        from backend.app import session_manager, survey_config
        session = session_manager.load_session(session_id)
        session["conversation"] = [{}] * (survey_config.max_questions - 1)
        session["current_question"] = mock_ai_response
        session_manager.save_session(session_id, session)
        
        # Submit answer - should trigger completion
        response = client.post(
            "/api/answer",
            json={"session_id": session_id, "answer": "test"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_complete"] is True


def test_admin_list_sessions(client, mock_ai_response):
    """Test admin endpoint to list sessions."""
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        # Create a session
        client.post("/api/start")
        
        # List sessions
        response = client.get("/api/admin/sessions")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "session_id" in data[0]
        assert "started_at" in data[0]


def test_admin_get_session(client, mock_ai_response):
    """Test admin endpoint to get session details."""
    with patch("backend.app.ai_service.generate_question") as mock_generate:
        mock_generate.return_value = mock_ai_response
        
        # Create a session
        start_response = client.post("/api/start")
        session_id = start_response.json()["session_id"]
        
        # Get session details
        response = client.get(f"/api/admin/session/{session_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert "conversation" in data
        assert "started_at" in data


def test_admin_get_session_not_found(client):
    """Test admin endpoint with invalid session ID."""
    response = client.get("/api/admin/session/nonexistent")
    
    assert response.status_code == 404

