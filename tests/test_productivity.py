from momentum_streamlit.models import DailyLog, Preferences, Task
from momentum_streamlit.productivity import (
    add_days,
    coach_suggestions,
    create_micro_steps,
    next_recurring_date,
    overload_report,
    sort_tasks_for_focus,
)


def test_micro_steps_are_small_and_actionable():
    steps = create_micro_steps("Finish tax paperwork")
    assert len(steps) == 5
    assert "5-minute" in " ".join(steps)


def test_sort_prioritizes_top_three_and_urgency():
    low = Task(title="Low", priority="low")
    urgent = Task(title="Urgent", priority="urgent")
    pinned = Task(title="Pinned", priority="medium", is_top_three=True)
    ordered = sort_tasks_for_focus([low, urgent, pinned])
    assert ordered[0].title in {"Urgent", "Pinned"}
    assert ordered[-1].title == "Low"


def test_overload_detects_high_load_with_low_energy():
    tasks = [Task(title=f"Task {index}", estimated_minutes=90) for index in range(4)]
    log = DailyLog(date="2026-05-13", energy_level=1, mood="tired")
    report = overload_report(tasks, Preferences(daily_capacity_minutes=180), log)
    assert report["level"] == "high"
    assert report["planned_minutes"] == 360


def test_overload_allows_calm_capacity():
    tasks = [Task(title="Small", estimated_minutes=20)]
    report = overload_report(tasks, Preferences(daily_capacity_minutes=180))
    assert report["level"] == "calm"


def test_recurring_dates_cover_supported_modes():
    assert next_recurring_date("2026-05-13", "daily") == "2026-05-14"
    assert next_recurring_date("2026-05-13", "weekly") == "2026-05-20"
    assert next_recurring_date("2026-05-15", "weekdays") == "2026-05-18"
    assert next_recurring_date("2026-01-31", "monthly") == "2026-02-28"


def test_coach_suggestions_identify_postponed_work():
    task = Task(title="Hard report", postponed_count=3, friction=5)
    suggestions = coach_suggestions([task], Preferences())
    assert any("postponed" in suggestion for suggestion in suggestions)


def test_add_days_handles_boundaries():
    assert add_days("2026-12-31", 1) == "2027-01-01"
