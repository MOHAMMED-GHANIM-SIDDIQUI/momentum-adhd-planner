from __future__ import annotations

from copy import deepcopy

from .models import (
    AppState,
    BrainDumpItem,
    DailyLog,
    FocusSession,
    Habit,
    Subtask,
    Task,
    TimeBlock,
    now_iso,
)
from .productivity import add_days, add_minutes, create_micro_steps, next_recurring_date, sort_tasks_for_focus, today_key


def ensure_today_log(state: AppState, date_key: str | None = None) -> DailyLog:
    date_key = date_key or today_key()
    existing = next((log for log in state.daily_logs if log.date == date_key), None)
    if existing:
        return existing
    log = DailyLog(date=date_key)
    state.daily_logs.append(log)
    return log


def add_task(
    state: AppState,
    title: str,
    priority: str = "medium",
    scheduled_date: str = "",
    due_date: str = "",
    estimated_minutes: int = 25,
    description: str = "",
    tags: list[str] | None = None,
    category: str = "",
    recurrence: str = "none",
    energy_required: int = 3,
    friction: int = 3,
    is_top_three: bool = False,
    subtasks: list[str] | None = None,
) -> Task:
    if not title.strip():
        raise ValueError("Task title is required.")
    task = Task(
        title=title.strip(),
        priority=priority,  # type: ignore[arg-type]
        scheduled_date=scheduled_date,
        due_date=due_date,
        estimated_minutes=max(1, int(estimated_minutes)),
        description=description.strip(),
        tags=tags or [],
        category=category.strip(),
        recurrence=recurrence,  # type: ignore[arg-type]
        energy_required=int(energy_required),
        friction=int(friction),
        is_top_three=is_top_three,
        reward_points=25 if priority == "urgent" else 18 if priority == "high" else 10,
        subtasks=[Subtask(title=item.strip()) for item in subtasks or [] if item.strip()],
        order=len(state.tasks),
    )
    if task.is_top_three and sum(1 for item in state.tasks if item.is_top_three and item.status != "completed") >= 3:
        task.is_top_three = False
    state.tasks.append(task)
    return task


def update_task(state: AppState, task_id: str, **updates) -> Task:
    task = get_task(state, task_id)
    for key, value in updates.items():
        if hasattr(task, key):
            setattr(task, key, value)
    task.updated_at = now_iso()
    return task


def get_task(state: AppState, task_id: str) -> Task:
    task = next((item for item in state.tasks if item.id == task_id), None)
    if not task:
        raise KeyError(f"Task not found: {task_id}")
    return task


def delete_task(state: AppState, task_id: str) -> None:
    state.tasks = [task for task in state.tasks if task.id != task_id]


def complete_task(state: AppState, task_id: str, date_key: str | None = None) -> Task:
    task = get_task(state, task_id)
    task.status = "completed"
    task.completed_at = now_iso()
    task.updated_at = task.completed_at
    for subtask in task.subtasks:
        subtask.completed = True
    state.reward_points += task.reward_points
    ensure_today_log(state, date_key).tasks_completed += 1

    if task.recurrence != "none":
        next_date = next_recurring_date(task.scheduled_date or date_key or today_key(), task.recurrence)
        if next_date:
            recurring = deepcopy(task)
            recurring.id = ""
            recurring = Task(
                title=task.title,
                priority=task.priority,
                status="not_started",
                description=task.description,
                scheduled_date=next_date,
                due_date=next_date if task.due_date else "",
                tags=list(task.tags),
                category=task.category,
                estimated_minutes=task.estimated_minutes,
                energy_required=task.energy_required,
                friction=task.friction,
                recurrence=task.recurrence,
                reward_points=task.reward_points,
                subtasks=[Subtask(title=subtask.title, estimated_minutes=subtask.estimated_minutes) for subtask in task.subtasks],
                order=len(state.tasks),
            )
            state.tasks.append(recurring)
    return task


def reschedule_task(state: AppState, task_id: str, date_key: str) -> Task:
    task = get_task(state, task_id)
    task.scheduled_date = date_key
    task.status = "rescheduled"
    task.postponed_count += 1
    task.updated_at = now_iso()
    return task


def snooze_task(state: AppState, task_id: str, days: int = 1) -> Task:
    return reschedule_task(state, task_id, add_days(today_key(), days))


def break_down_task(state: AppState, task_id: str) -> Task:
    task = get_task(state, task_id)
    if not task.subtasks:
        task.subtasks = [Subtask(title=step) for step in create_micro_steps(task.title)]
        task.updated_at = now_iso()
    return task


def toggle_subtask(state: AppState, task_id: str, subtask_id: str) -> Subtask:
    task = get_task(state, task_id)
    subtask = next((item for item in task.subtasks if item.id == subtask_id), None)
    if not subtask:
        raise KeyError(f"Subtask not found: {subtask_id}")
    subtask.completed = not subtask.completed
    task.updated_at = now_iso()
    return subtask


def mark_top_three(state: AppState, task_id: str, value: bool | None = None) -> Task:
    task = get_task(state, task_id)
    next_value = (not task.is_top_three) if value is None else value
    if next_value and sum(1 for item in state.tasks if item.is_top_three and item.id != task_id and item.status != "completed") >= 3:
        next_value = False
    task.is_top_three = next_value
    task.updated_at = now_iso()
    return task


def todays_tasks(state: AppState, include_completed: bool = False, date_key: str | None = None) -> list[Task]:
    date_key = date_key or today_key()
    tasks = [
        task
        for task in state.tasks
        if (not task.scheduled_date or task.scheduled_date == date_key)
        and (include_completed or task.status != "completed")
    ]
    return sort_tasks_for_focus(tasks)


def top_three(state: AppState, date_key: str | None = None) -> list[Task]:
    today_tasks = todays_tasks(state, date_key=date_key)
    pinned = [task for task in today_tasks if task.is_top_three][:3]
    rest = [task for task in today_tasks if task not in pinned]
    return (pinned + rest)[:3]


def smart_plan_today(state: AppState, capacity_minutes: int | None = None, date_key: str | None = None) -> list[Task]:
    date_key = date_key or today_key()
    capacity_minutes = capacity_minutes or state.preferences.daily_capacity_minutes
    used = 0
    selected: list[Task] = []
    candidates = sort_tasks_for_focus([task for task in state.tasks if task.status != "completed"])
    for task in candidates:
        estimate = max(5, task.estimated_minutes)
        if selected and used + estimate > capacity_minutes:
            continue
        selected.append(task)
        used += estimate
        if used >= capacity_minutes:
            break
    for index, task in enumerate(selected):
        task.scheduled_date = date_key
        task.is_top_three = index < 3
        task.updated_at = now_iso()
    return selected


def auto_plan_day(state: AppState, tasks: list[Task], date_key: str | None = None) -> list[TimeBlock]:
    date_key = date_key or today_key()
    state.time_blocks = [block for block in state.time_blocks if block.date != date_key]
    cursor = state.preferences.work_start
    blocks: list[TimeBlock] = []
    for index, task in enumerate(tasks[:6]):
        duration = min(max(task.estimated_minutes, 10), 90)
        end = add_minutes(cursor, duration)
        block = TimeBlock(date=date_key, title=task.title, start=cursor, end=end, task_id=task.id, color=_priority_color(task.priority))
        blocks.append(block)
        if index < len(tasks[:6]) - 1:
            break_end = add_minutes(end, state.preferences.break_minutes)
            blocks.append(TimeBlock(date=date_key, title="Recovery break", start=end, end=break_end, type="break", color="slate"))
            cursor = break_end
    state.time_blocks.extend(blocks)
    return blocks


def emergency_reset(state: AppState, date_key: str | None = None) -> list[Task]:
    date_key = date_key or today_key()
    protected = {task.id for task in top_three(state, date_key)}
    moved: list[Task] = []
    for task in todays_tasks(state, date_key=date_key):
        if task.id not in protected:
            moved.append(reschedule_task(state, task.id, add_days(date_key, 1)))
    state.time_blocks.append(TimeBlock(date=date_key, title="Emergency reset", start="14:00", end="14:15", type="reset", color="rose"))
    return moved


def add_brain_dump(state: AppState, text: str) -> BrainDumpItem:
    if not text.strip():
        raise ValueError("Brain dump text is required.")
    item = BrainDumpItem(text=text.strip())
    state.brain_dump.insert(0, item)
    return item


def convert_brain_dump_to_task(state: AppState, item_id: str) -> Task:
    item = next((entry for entry in state.brain_dump if entry.id == item_id), None)
    if not item:
        raise KeyError(f"Brain dump item not found: {item_id}")
    item.processed_at = now_iso()
    return add_task(state, item.text, priority="medium", estimated_minutes=15, tags=["brain-dump"])


def toggle_habit(state: AppState, habit_id: str, date_key: str | None = None) -> Habit:
    date_key = date_key or today_key()
    habit = next((item for item in state.habits if item.id == habit_id), None)
    if not habit:
        raise KeyError(f"Habit not found: {habit_id}")
    if date_key in habit.completions:
        habit.completions.remove(date_key)
    else:
        habit.completions.append(date_key)
        state.reward_points += 3
    return habit


def add_habit(state: AppState, name: str) -> Habit:
    if not name.strip():
        raise ValueError("Habit name is required.")
    habit = Habit(name=name.strip())
    state.habits.append(habit)
    return habit


def finish_focus_session(state: AppState, task_id: str = "", duration: int = 25, mood: str = "calm", date_key: str | None = None) -> FocusSession:
    date_key = date_key or today_key()
    session = FocusSession(started_at=now_iso(), ended_at=now_iso(), task_id=task_id, duration=duration, mood=mood, completed=True)  # type: ignore[arg-type]
    state.focus_sessions.append(session)
    state.reward_points += 15
    ensure_today_log(state, date_key).focus_minutes += duration
    return session


def _priority_color(priority: str) -> str:
    return {"urgent": "rose", "high": "amber", "medium": "blue", "low": "emerald"}.get(priority, "blue")
