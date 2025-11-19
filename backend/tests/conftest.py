"""Pytest fixtures for backend tests."""
import json
import tempfile
from pathlib import Path
from typing import Dict, Any
from unittest.mock import Mock, patch

import pytest

from backend.config import SurveyConfig
from backend.session_manager import SessionManager


@pytest.fixture
def test_config() -> SurveyConfig:
    """Test survey configuration."""
    return SurveyConfig(
        purpose="Test survey purpose",
        context="Test context",
        min_questions=3,
        max_questions=10,
        ai_model="gpt-4o-mini",
        temperature=0.7,
    )


@pytest.fixture
def temp_sessions_dir():
    """Create temporary directory for test sessions."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def session_manager(temp_sessions_dir):
    """Session manager with temporary directory."""
    return SessionManager(base_dir=temp_sessions_dir)


@pytest.fixture
def sample_session() -> Dict[str, Any]:
    """Sample session data."""
    return {
        "session_id": "test123",
        "started_at": "2024-01-01T10:00:00+00:00",
        "completed_at": None,
        "questions_asked": 2,
        "conversation": [
            {
                "question": "What's your role?",
                "answer": "Product Manager",
                "type": "multiple_choice",
                "options": ["PM", "Dev", "Designer"],
                "timestamp": "2024-01-01T10:00:05+00:00",
            },
            {
                "question": "How many people?",
                "answer": "6-20",
                "type": "multiple_choice",
                "options": ["1-5", "6-20", "21-50"],
                "timestamp": "2024-01-01T10:00:15+00:00",
            },
        ],
        "current_question": None,
        "config": {
            "purpose": "Test survey",
            "min_questions": 3,
            "max_questions": 10,
        },
    }


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response."""
    return {
        "question": "What's your role?",
        "type": "multiple_choice",
        "options": ["PM", "Dev", "Designer"],
        "is_complete": False,
        "reasoning": "Starting with role identification",
    }


@pytest.fixture
def mock_openai_client(mock_openai_response):
    """Mock OpenAI client."""
    mock_response = Mock()
    mock_message = Mock()
    mock_message.content = json.dumps(mock_openai_response)
    mock_choice = Mock()
    mock_choice.message = mock_message
    mock_response.choices = [mock_choice]
    
    mock_client = Mock()
    mock_client.chat.completions.create.return_value = mock_response
    
    return mock_client

