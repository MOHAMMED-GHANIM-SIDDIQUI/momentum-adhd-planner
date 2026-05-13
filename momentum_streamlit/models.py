from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Literal
from uuid import uuid4

Priority = Literal["low", "medium", "high", "urgent"]
TaskStatus = Literal["backlog", "not_started", "in_progress", "completed", "rescheduled"]
Recurrence = Literal["none", "daily", "weekdays", "weekly", "monthly"]
Mood = Literal["happy", "calm", "neutral", "stressed", "tired"]


def new_id() -> str:
    return uuid4().hex


def now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


@dataclass
class Subtask:
    title: str
    completed: bool = False
    estimated_minutes: int = 5
    id: str = field(default_factory=new_id)


@dataclass
class Task:
    title: str
    priority: Priority = "medium"
    status: TaskStatus = "not_started"
    description: str = ""
    scheduled_date: str = ""
    due_date: str = ""
    scheduled_start: str = ""
    scheduled_end: str = ""
    tags: list[str] = field(default_factory=list)
    category: str = ""
    estimated_minutes: int = 25
    energy_required: int = 3
    friction: int = 3
    recurrence: Recurrence = "none"
    is_top_three: bool = False
    reward_points: int = 10
    subtasks: list[Subtask] = field(default_factory=list)
    postponed_count: int = 0
    order: int = 0
    created_at: str = field(default_factory=now_iso)
    updated_at: str = field(default_factory=now_iso)
    completed_at: str = ""
    id: str = field(default_factory=new_id)


@dataclass
class BrainDumpItem:
    text: str
    created_at: str = field(default_factory=now_iso)
    processed_at: str = ""
    id: str = field(default_factory=new_id)


@dataclass
class Habit:
    name: str
    color: str = "blue"
    completions: list[str] = field(default_factory=list)
    id: str = field(default_factory=new_id)


@dataclass
class TimeBlock:
    date: str
    title: str
    start: str
    end: str
    type: Literal["focus", "break", "admin", "reset"] = "focus"
    color: str = "blue"
    task_id: str = ""
    id: str = field(default_factory=new_id)


@dataclass
class FocusSession:
    started_at: str
    duration: int
    task_id: str = ""
    ended_at: str = ""
    mood: Mood = "neutral"
    mode: Literal["focus", "quick_win", "deep_work", "recovery"] = "focus"
    completed: bool = False
    id: str = field(default_factory=new_id)


@dataclass
class DailyLog:
    date: str
    energy_level: int = 3
    mood: Mood = "neutral"
    tasks_completed: int = 0
    focus_minutes: int = 0
    notes: str = ""
    wins: list[str] = field(default_factory=list)
    id: str = field(default_factory=new_id)


@dataclass
class Preferences:
    work_start: str = "09:00"
    work_end: str = "17:00"
    daily_capacity_minutes: int = 180
    focus_minutes: int = 25
    break_minutes: int = 5
    gentle_mode: bool = True
    notifications_enabled: bool = False


@dataclass
class AppState:
    tasks: list[Task] = field(default_factory=list)
    brain_dump: list[BrainDumpItem] = field(default_factory=list)
    habits: list[Habit] = field(default_factory=list)
    time_blocks: list[TimeBlock] = field(default_factory=list)
    focus_sessions: list[FocusSession] = field(default_factory=list)
    daily_logs: list[DailyLog] = field(default_factory=list)
    preferences: Preferences = field(default_factory=Preferences)
    reward_points: int = 0


def state_to_dict(state: AppState) -> dict:
    return asdict(state)


def state_from_dict(payload: dict | None) -> AppState:
    payload = payload or {}
    state = AppState()
    state.tasks = [_task_from_dict(item) for item in payload.get("tasks", [])]
    state.brain_dump = [BrainDumpItem(**item) for item in payload.get("brain_dump", [])]
    state.habits = [Habit(**item) for item in payload.get("habits", [])] or default_habits()
    state.time_blocks = [TimeBlock(**item) for item in payload.get("time_blocks", [])]
    state.focus_sessions = [FocusSession(**item) for item in payload.get("focus_sessions", [])]
    state.daily_logs = [DailyLog(**item) for item in payload.get("daily_logs", [])]
    state.preferences = Preferences(**payload.get("preferences", {}))
    state.reward_points = int(payload.get("reward_points", 0))
    return state


def _task_from_dict(item: dict) -> Task:
    item = dict(item)
    item["subtasks"] = [Subtask(**subtask) for subtask in item.get("subtasks", [])]
    return Task(**item)


def default_habits() -> list[Habit]:
    return [
        Habit(id="habit-water", name="Drink water", color="cyan"),
        Habit(id="habit-reset", name="10-minute reset", color="emerald"),
        Habit(id="habit-plan", name="Plan tomorrow", color="violet"),
    ]
