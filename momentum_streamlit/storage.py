from __future__ import annotations

import json
from pathlib import Path

from .models import AppState, default_habits, state_from_dict, state_to_dict

DEFAULT_DATA_PATH = Path("data/momentum_state.json")


def new_state() -> AppState:
    state = AppState()
    state.habits = default_habits()
    return state


def load_state(path: Path = DEFAULT_DATA_PATH) -> AppState:
    if not path.exists():
        return new_state()
    try:
        return state_from_dict(json.loads(path.read_text(encoding="utf-8")))
    except (json.JSONDecodeError, TypeError, ValueError):
        return new_state()


def save_state(state: AppState, path: Path = DEFAULT_DATA_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state_to_dict(state), indent=2), encoding="utf-8")


def export_state(state: AppState) -> str:
    return json.dumps(state_to_dict(state), indent=2)


def import_state(raw_json: str) -> AppState:
    return state_from_dict(json.loads(raw_json))
