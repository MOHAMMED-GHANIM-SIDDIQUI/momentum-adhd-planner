from __future__ import annotations

from datetime import date, datetime, timedelta

from .models import DailyLog, Preferences, Recurrence, Task

PRIORITY_SCORE = {"urgent": 6, "high": 4, "medium": 2, "low": 1}


def today_key() -> str:
    return date.today().isoformat()


def add_days(date_key: str, days: int) -> str:
    return (date.fromisoformat(date_key) + timedelta(days=days)).isoformat()


def minutes_between(start: str, end: str) -> int:
    start_hour, start_minute = [int(part) for part in start.split(":")]
    end_hour, end_minute = [int(part) for part in end.split(":")]
    return max(0, end_hour * 60 + end_minute - (start_hour * 60 + start_minute))


def add_minutes(clock: str, minutes: int) -> str:
    hours, mins = [int(part) for part in clock.split(":")]
    total = hours * 60 + mins + minutes
    return f"{(total // 60) % 24:02d}:{total % 60:02d}"


def format_minutes(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes}m"
    hours, remainder = divmod(minutes, 60)
    return f"{hours}h {remainder}m" if remainder else f"{hours}h"


def task_score(task: Task, today: str | None = None) -> int:
    today = today or today_key()
    score = PRIORITY_SCORE[task.priority]
    if task.due_date:
        days_left = (date.fromisoformat(task.due_date) - date.fromisoformat(today)).days
        score += max(0, 5 - days_left)
    if task.is_top_three:
        score += 5
    score += min(task.postponed_count, 4)
    score += max(0, task.friction - 2)
    return score


def sort_tasks_for_focus(tasks: list[Task]) -> list[Task]:
    return sorted(tasks, key=lambda task: (-task_score(task), task.order, task.created_at))


def create_micro_steps(title: str) -> list[str]:
    subject = " ".join(title.strip().split()) or "the task"
    return [
        f"Open what is needed for {subject}",
        "Write the smallest next action",
        "Do a 5-minute first pass",
        "Check what is unclear",
        "Finish or park the next step",
    ]


def next_recurring_date(current_date: str, recurrence: Recurrence) -> str:
    if recurrence == "daily":
        return add_days(current_date, 1)
    if recurrence == "weekly":
        return add_days(current_date, 7)
    if recurrence == "monthly":
        current = date.fromisoformat(current_date)
        month = current.month + 1
        year = current.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        day = min(current.day, _days_in_month(year, month))
        return date(year, month, day).isoformat()
    if recurrence == "weekdays":
        next_day = date.fromisoformat(current_date) + timedelta(days=1)
        while next_day.weekday() >= 5:
            next_day += timedelta(days=1)
        return next_day.isoformat()
    return ""


def overload_report(tasks: list[Task], preferences: Preferences, log: DailyLog | None = None) -> dict:
    active = [task for task in tasks if task.status != "completed"]
    planned_minutes = sum(max(5, task.estimated_minutes) for task in active)
    energy_adjustment = ((log.energy_level - 3) * 30) if log else 0
    mood_adjustment = 0
    if log and log.mood in {"stressed", "tired"}:
        mood_adjustment = -35
    elif log and log.mood == "happy":
        mood_adjustment = 20
    capacity = max(45, preferences.daily_capacity_minutes + energy_adjustment + mood_adjustment)
    ratio = planned_minutes / capacity if capacity else 0
    level = "high" if ratio >= 1.35 else "medium" if ratio >= 1 else "calm"
    message = {
        "high": "This plan is too heavy for a real human day. Move tasks and protect the Top 3.",
        "medium": "This is close to capacity. Keep breaks visible and make one task optional.",
        "calm": "This plan has breathing room. Nice conditions for steady momentum.",
    }[level]
    return {
        "active_tasks": len(active),
        "planned_minutes": planned_minutes,
        "capacity": capacity,
        "ratio": ratio,
        "level": level,
        "message": message,
    }


def coach_suggestions(tasks: list[Task], preferences: Preferences, log: DailyLog | None = None) -> list[str]:
    active = sort_tasks_for_focus([task for task in tasks if task.status != "completed"])
    overdue = [task for task in active if task.due_date and task.due_date < today_key()]
    repeated = [task for task in active if task.postponed_count >= 2]
    hard = next((task for task in active if task.friction >= 4), None)
    report = overload_report(active, preferences, log)
    first = (
        "Reduce the day before starting. A lighter plan usually gets more done."
        if report["level"] == "high"
        else "Keep the next action visible and avoid opening the whole backlog."
    )
    second = (
        f"{len(overdue)} overdue item{'s' if len(overdue) != 1 else ''} need a decision."
        if overdue
        else "No overdue pressure detected."
    )
    if repeated:
        third = f"Break down '{repeated[0].title}' because it has been postponed repeatedly."
    elif hard:
        third = f"Start small with '{hard.title}' to lower activation energy."
    else:
        third = "Pick one tiny task that takes less than 5 minutes."
    return [first, second, third]


def _days_in_month(year: int, month: int) -> int:
    if month == 12:
        return 31
    return (date(year, month + 1, 1) - timedelta(days=1)).day


def timestamp_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
