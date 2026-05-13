from momentum_streamlit.models import AppState
from momentum_streamlit.services import (
    add_brain_dump,
    add_task,
    auto_plan_day,
    break_down_task,
    complete_task,
    convert_brain_dump_to_task,
    emergency_reset,
    finish_focus_session,
    mark_top_three,
    smart_plan_today,
    todays_tasks,
    toggle_habit,
)
from momentum_streamlit.storage import export_state, import_state, new_state


def test_add_task_and_today_filter():
    state = AppState()
    add_task(state, "Write proposal", scheduled_date="2026-05-13")
    add_task(state, "Tomorrow", scheduled_date="2026-05-14")
    assert [task.title for task in todays_tasks(state, date_key="2026-05-13")] == ["Write proposal"]


def test_top_three_limit_is_enforced():
    state = AppState()
    tasks = [add_task(state, f"Task {index}", is_top_three=True) for index in range(4)]
    assert sum(task.is_top_three for task in tasks) == 3


def test_break_down_task_is_idempotent():
    state = AppState()
    task = add_task(state, "Prepare launch checklist")
    break_down_task(state, task.id)
    first_count = len(task.subtasks)
    break_down_task(state, task.id)
    assert first_count == 5
    assert len(task.subtasks) == first_count


def test_complete_task_awards_points_and_daily_log():
    state = AppState()
    task = add_task(state, "Pay bill")
    complete_task(state, task.id, date_key="2026-05-13")
    assert task.status == "completed"
    assert state.reward_points == task.reward_points
    assert state.daily_logs[0].tasks_completed == 1


def test_recurring_completion_creates_next_instance():
    state = AppState()
    task = add_task(state, "Standup", scheduled_date="2026-05-13", recurrence="daily")
    complete_task(state, task.id, date_key="2026-05-13")
    active = [item for item in state.tasks if item.status != "completed"]
    assert len(active) == 1
    assert active[0].scheduled_date == "2026-05-14"


def test_smart_plan_respects_capacity_and_marks_top_three():
    state = AppState()
    for index in range(6):
        add_task(state, f"Task {index}", estimated_minutes=45, priority="high")
    planned = smart_plan_today(state, capacity_minutes=100, date_key="2026-05-13")
    assert len(planned) <= 3
    assert all(task.scheduled_date == "2026-05-13" for task in planned)
    assert sum(task.is_top_three for task in planned) <= 3


def test_auto_plan_creates_focus_blocks_and_breaks():
    state = AppState()
    tasks = [add_task(state, "One", estimated_minutes=25), add_task(state, "Two", estimated_minutes=25)]
    blocks = auto_plan_day(state, tasks, date_key="2026-05-13")
    assert len(blocks) == 3
    assert blocks[1].type == "break"


def test_emergency_reset_moves_non_top_three():
    state = AppState()
    protected = add_task(state, "Protected", scheduled_date="2026-05-13", is_top_three=True)
    add_task(state, "Also protected 1", scheduled_date="2026-05-13", priority="high")
    add_task(state, "Also protected 2", scheduled_date="2026-05-13", priority="medium")
    extra = add_task(state, "Extra", scheduled_date="2026-05-13", priority="low")
    moved = emergency_reset(state, date_key="2026-05-13")
    assert protected.scheduled_date == "2026-05-13"
    assert extra.scheduled_date == "2026-05-14"
    assert [task.id for task in moved] == [extra.id]


def test_brain_dump_conversion_marks_processed_and_adds_task():
    state = AppState()
    item = add_brain_dump(state, "Call dentist")
    task = convert_brain_dump_to_task(state, item.id)
    assert item.processed_at
    assert task.title == "Call dentist"


def test_habit_toggle_awards_points_once_per_completion():
    state = new_state()
    habit = state.habits[0]
    toggle_habit(state, habit.id, "2026-05-13")
    assert state.reward_points == 3
    toggle_habit(state, habit.id, "2026-05-13")
    assert state.reward_points == 3
    assert "2026-05-13" not in habit.completions


def test_focus_session_updates_log_and_points():
    state = AppState()
    finish_focus_session(state, duration=25, date_key="2026-05-13")
    assert state.focus_sessions[0].completed
    assert state.daily_logs[0].focus_minutes == 25
    assert state.reward_points == 15


def test_state_export_import_roundtrip():
    state = new_state()
    add_task(state, "Roundtrip")
    restored = import_state(export_state(state))
    assert restored.tasks[0].title == "Roundtrip"
    assert restored.habits
