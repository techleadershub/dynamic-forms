"""Tests for AIService with mocked OpenAI."""
import json
from unittest.mock import Mock, patch

import pytest

from backend.ai_service import AIService
from backend.config import SurveyConfig


def test_generate_first_question(test_config, mock_openai_response):
    """Test generating first question with no history."""
    with patch("backend.ai_service.OpenAI") as mock_openai_class:
        mock_client = Mock()
        mock_message = Mock()
        mock_message.content = json.dumps(mock_openai_response)
        mock_choice = Mock()
        mock_choice.message = mock_message
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        ai_service = AIService(test_config)
        result = ai_service.generate_question(conversation=[], questions_asked=0)
        
        assert result["type"] == "multiple_choice"
        assert len(result["options"]) == 3
        assert result["question"] == "What's your role?"
        assert result["is_complete"] is False


def test_generate_followup_question(test_config, mock_openai_response):
    """Test generating question with conversation history."""
    conversation = [
        {"question": "Q1", "answer": "A1", "type": "multiple_choice"},
    ]
    
    with patch("backend.ai_service.OpenAI") as mock_openai_class:
        mock_client = Mock()
        mock_message = Mock()
        mock_message.content = json.dumps(mock_openai_response)
        mock_choice = Mock()
        mock_choice.message = mock_message
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        ai_service = AIService(test_config)
        result = ai_service.generate_question(conversation=conversation, questions_asked=1)
        
        # Verify OpenAI was called with history
        call_args = mock_client.chat.completions.create.call_args
        assert call_args is not None
        messages = call_args.kwargs["messages"]
        assert len(messages) == 2  # system + user
        assert "Q1" in messages[1]["content"]  # History should be in prompt


def test_parse_valid_response(test_config, mock_openai_response):
    """Test parsing valid JSON response."""
    with patch("backend.ai_service.OpenAI") as mock_openai_class:
        mock_client = Mock()
        mock_message = Mock()
        mock_message.content = json.dumps(mock_openai_response)
        mock_choice = Mock()
        mock_choice.message = mock_message
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        ai_service = AIService(test_config)
        result = ai_service.generate_question(conversation=[], questions_asked=0)
        
        assert "question" in result
        assert "type" in result
        assert "is_complete" in result


def test_handle_missing_options_defaults_to_free_text(test_config):
    """Test that missing options defaults to free_text."""
    response_without_options = {
        "question": "Tell me more",
        "type": "multiple_choice",  # Type says multiple_choice but no options
        "is_complete": False,
    }
    
    with patch("backend.ai_service.OpenAI") as mock_openai_class:
        mock_client = Mock()
        mock_message = Mock()
        mock_message.content = json.dumps(response_without_options)
        mock_choice = Mock()
        mock_choice.message = mock_message
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        ai_service = AIService(test_config)
        result = ai_service.generate_question(conversation=[], questions_asked=0)
        
        # Should default to free_text when options missing
        assert result["type"] == "free_text"


def test_completion_detection(test_config):
    """Test that is_complete flag is preserved."""
    complete_response = {
        "question": "Final question",
        "type": "free_text",
        "is_complete": True,
        "reasoning": "Purpose satisfied",
    }
    
    with patch("backend.ai_service.OpenAI") as mock_openai_class:
        mock_client = Mock()
        mock_message = Mock()
        mock_message.content = json.dumps(complete_response)
        mock_choice = Mock()
        mock_choice.message = mock_message
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client
        
        ai_service = AIService(test_config)
        result = ai_service.generate_question(conversation=[], questions_asked=5)
        
        assert result["is_complete"] is True

