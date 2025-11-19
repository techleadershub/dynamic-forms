from __future__ import annotations

import json
import os
from typing import Any, Dict, List

from openai import OpenAI

from .config import SurveyConfig


class AIService:
    def __init__(self, config: SurveyConfig) -> None:
        self.use_fake_ai = os.getenv("USE_FAKE_AI") == "1"
        self.config = config
        self._client: OpenAI | None = None

        if not self.use_fake_ai:
            api_key = os.getenv("OPENAI_API_KEY") or config.openai_api_key
            if not api_key:
                raise ValueError("OpenAI API key not provided in config or environment")
            self._client = OpenAI(api_key=api_key)

    SYSTEM_PROMPT = """You are conducting a discovery survey. Generate contextual questions that build on previous answers.

Guidelines:
- Never repeat questions already asked.
- Build naturally on previous answers.
- Prefer structured inputs (multiple_choice/checkbox) for ease (~60%), use free_text when depth is needed (~40%).
- Track coverage and explore gaps.
- If purpose satisfied AND min questions met, set is_complete to true.
- Keep questions conversational and engaging.

Question type rules:
- "multiple_choice": Single answer, clear categories (roles, sizes, yes/no, preferences).
- "checkbox": Multiple selections make sense (tools, pain points, features, challenges).
- "free_text": Needs explanation, context, or detailed narrative.

Return only valid JSON."""

    USER_PROMPT_TEMPLATE = """Purpose: {purpose}
Context: {context}

Examples of good question generation:

Example 1:
Purpose: "Understand customer needs for SaaS product"
Q1: "What's your role?" -> type: "multiple_choice", options: ["Product Manager", "Developer", "Designer", "Executive", "Other"]
A1: "Product Manager"
Q2: "How many people are on your team?" -> type: "multiple_choice", options: ["1-5", "6-20", "21-50", "50+"]
A2: "6-20"
Q3: "What are your main pain points?" -> type: "checkbox", options: ["Team collaboration", "Project tracking", "Budget management", "Reporting", "Other"]
A3: ["Team collaboration", "Project tracking"]
Q4: "Tell me more about your team collaboration challenges" -> type: "free_text"

Example 2:
Purpose: "Customer onboarding for SaaS"
Q1: "Which tools do you currently use?" -> type: "checkbox", options: ["Jira", "Asana", "Trello", "Monday.com", "None"]
A1: ["Jira", "Slack"]
Q2: "What's missing in your current setup?" -> type: "free_text"

Conversation History:
{conversation_history}

Questions asked: {questions_asked} / {max_questions} (min required: {min_questions})

Generate the next question following the examples. Consider:
- What's been covered vs what's missing
- Natural flow from the last answer
- Appropriate form type (prefer structured when possible)

Return JSON:
{{
  "question": "Your question here",
  "type": "multiple_choice" | "checkbox" | "free_text",
  "options": ["option1", "option2", ...] (required if type is not free_text),
  "is_complete": false,
  "reasoning": "Why this question now"
}}"""

    FAKE_FLOW = [
        {
            "question": "What's your role?",
            "type": "multiple_choice",
            "options": ["Product Manager", "Developer", "Designer", "Other"],
            "is_complete": False,
        },
        {
            "question": "Which tools do you use regularly?",
            "type": "checkbox",
            "options": ["Jira", "Slack", "Figma", "Asana"],
            "is_complete": False,
        },
        {
            "question": "Tell me about your biggest collaboration challenge.",
            "type": "free_text",
            "is_complete": False,
        },
        {
            "question": "Thanks for the details! Wrapping up.",
            "type": "free_text",
            "is_complete": True,
        },
    ]

    @staticmethod
    def _format_history(conversation: List[Dict[str, Any]]) -> str:
        if not conversation:
            return "No questions asked yet."
        lines: List[str] = []
        for idx, entry in enumerate(conversation, start=1):
            question = entry.get("question", "")
            answer = entry.get("answer", "")
            lines.append(f"Q{idx}: {question}")
            lines.append(f"A{idx}: {answer}")
        return "\n".join(lines)

    def generate_question(
        self,
        conversation: List[Dict[str, Any]],
        questions_asked: int,
    ) -> Dict[str, Any]:
        if self.use_fake_ai:
            return self._fake_question(questions_asked)

        prompt = self.USER_PROMPT_TEMPLATE.format(
            purpose=self.config.purpose,
            context=self.config.context or "No additional context provided.",
            conversation_history=self._format_history(conversation),
            questions_asked=questions_asked,
            min_questions=self.config.min_questions,
            max_questions=self.config.max_questions,
        )

        response = self._client.chat.completions.create(
            model=self.config.ai_model,
            temperature=self.config.temperature,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
        data = json.loads(content)

        # Basic validation defaults
        data.setdefault("type", "free_text")
        if data["type"] != "free_text" and not data.get("options"):
            data["type"] = "free_text"

        data.setdefault("is_complete", False)
        data.setdefault("reasoning", "Follow-up question generated.")
        return data

    def _fake_question(self, questions_asked: int) -> Dict[str, Any]:
        index = min(questions_asked, len(self.FAKE_FLOW) - 1)
        data = self.FAKE_FLOW[index].copy()

        if data.get("is_complete"):
            data.setdefault("reasoning", "Test mode completion")
        else:
            data.setdefault("reasoning", f"Test mode question #{index + 1}")

        return data

