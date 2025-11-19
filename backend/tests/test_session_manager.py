"""Tests for SessionManager."""
import pytest

from backend.session_manager import SessionManager, SessionNotFoundError


def test_create_session(session_manager, test_config):
    """Test creating a new session."""
    session_id = "test123"
    config_dict = test_config.model_dump()
    
    session = session_manager.create_session(session_id, config_dict)
    
    assert session["session_id"] == session_id
    assert session["started_at"] is not None
    assert session["completed_at"] is None
    assert session["questions_asked"] == 0
    assert session["conversation"] == []
    assert session["config"] == config_dict


def test_load_session(session_manager, sample_session):
    """Test loading an existing session."""
    session_id = sample_session["session_id"]
    session_manager._write_session(session_id, sample_session)
    
    loaded = session_manager.load_session(session_id)
    
    assert loaded["session_id"] == session_id
    assert loaded["questions_asked"] == 2
    assert len(loaded["conversation"]) == 2


def test_load_session_not_found(session_manager):
    """Test loading non-existent session raises error."""
    with pytest.raises(SessionNotFoundError):
        session_manager.load_session("nonexistent")


def test_save_session(session_manager, sample_session):
    """Test saving session updates file."""
    session_id = sample_session["session_id"]
    session_manager._write_session(session_id, sample_session)
    
    sample_session["questions_asked"] = 5
    session_manager.save_session(session_id, sample_session)
    
    loaded = session_manager.load_session(session_id)
    assert loaded["questions_asked"] == 5


def test_append_conversation_entry(session_manager, sample_session):
    """Test appending conversation entry."""
    question = {
        "question": "New question?",
        "type": "free_text",
        "options": None,
    }
    answer = "Test answer"
    
    initial_count = len(sample_session["conversation"])
    session_manager.append_conversation_entry(sample_session, question, answer)
    
    assert len(sample_session["conversation"]) == initial_count + 1
    last_entry = sample_session["conversation"][-1]
    assert last_entry["question"] == "New question?"
    assert last_entry["answer"] == answer
    assert last_entry["type"] == "free_text"


def test_list_sessions(session_manager, sample_session):
    """Test listing all sessions."""
    session1 = {**sample_session, "session_id": "session1"}
    session2 = {**sample_session, "session_id": "session2"}
    session_manager._write_session("session1", session1)
    session_manager._write_session("session2", session2)
    
    sessions = session_manager.list_sessions()
    assert len(sessions) == 2
    assert all(s["session_id"] in ["session1", "session2"] for s in sessions)


def test_mark_completed(session_manager, sample_session):
    """Test marking session as completed."""
    assert sample_session["completed_at"] is None
    
    session_manager.mark_completed(sample_session)
    
    assert sample_session["completed_at"] is not None

