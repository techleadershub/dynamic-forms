from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

from pydantic import BaseModel, Field

# Try multiple paths for config.json (supports Railway deployment)
def _find_config_path() -> Path:
    # 1. Check environment variable
    if env_path := os.getenv("CONFIG_PATH"):
        path = Path(env_path)
        if path.exists():
            return path
    
    # 2. Check parent directory (repo root when running from backend/)
    parent_path = Path(__file__).resolve().parent.parent / "config.json"
    if parent_path.exists():
        return parent_path
    
    # 3. Check current directory (fallback)
    current_path = Path(__file__).resolve().parent / "config.json"
    if current_path.exists():
        return current_path
    
    # Return the expected path for error message
    return parent_path

CONFIG_PATH = _find_config_path()


class SurveyConfig(BaseModel):
    purpose: str
    context: str | None = None
    min_questions: int = Field(ge=1, default=5)
    max_questions: int = Field(gt=1, default=15)
    ai_model: str = "gpt-4o-mini"
    temperature: float = Field(ge=0.0, le=1.0, default=0.7)
    openai_api_key: str | None = None


@lru_cache(maxsize=1)
def load_config(path: Path | None = None) -> SurveyConfig:
    config_path = path or CONFIG_PATH
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")

    with config_path.open("r", encoding="utf-8") as f:
        data: Dict[str, Any] = json.load(f)

    return SurveyConfig(**data)


def reload_config() -> SurveyConfig:
    """Reload config from file, clearing cache."""
    load_config.cache_clear()
    return load_config()

