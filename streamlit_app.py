from __future__ import annotations

from datetime import date, time

import streamlit as st

from momentum_streamlit.models import AppState, Task
from momentum_streamlit.productivity import (
    coach_suggestions,
    format_minutes,
    overload_report,
    today_key,
)
from momentum_streamlit.services import (
    add_brain_dump,
    add_habit,
    add_task,
    auto_plan_day,
    break_down_task,
    complete_task,
    convert_brain_dump_to_task,
    delete_task,
    emergency_reset,
    finish_focus_session,
    mark_top_three,
    reschedule_task,
    smart_plan_today,
    snooze_task,
    todays_tasks,
    toggle_habit,
    toggle_subtask,
    top_three,
)
from momentum_streamlit.storage import export_state, import_state, load_state, save_state

st.set_page_config(
    page_title="Momentum ADHD Planner",
    page_icon="M",
    layout="wide",
    initial_sidebar_state="expanded",
)


def init_state() -> AppState:
    if "momentum_state" not in st.session_state:
        st.session_state.momentum_state = load_state()
    return st.session_state.momentum_state


def persist(state: AppState) -> None:
    save_state(state)
    st.session_state.momentum_state = state


def persist_and_rerun(state: AppState) -> None:
    persist(state)
    st.rerun()


state = init_state()


st.markdown(
    """
    <style>
    :root {
      --ink: #0f172a;
      --muted: #64748b;
      --line: rgba(148, 163, 184, 0.22);
      --card: rgba(255, 255, 255, 0.78);
      --blue: #2563eb;
      --violet: #7c3aed;
      --green: #059669;
      --amber: #d97706;
      --rose: #e11d48;
    }
    .stApp {
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, .16), transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
      color: var(--ink);
    }
    section[data-testid="stSidebar"] {
      background: rgba(255,255,255,.72);
      border-right: 1px solid var(--line);
      backdrop-filter: blur(18px);
    }
    .hero {
      background: var(--card);
      border: 1px solid rgba(255,255,255,.74);
      box-shadow: 0 24px 70px rgba(15, 23, 42, .08);
      border-radius: 14px;
      padding: 28px;
      margin-bottom: 18px;
    }
    .eyebrow {
      color: var(--blue);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .16em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .hero h1 {
      font-size: clamp(30px, 4vw, 46px);
      line-height: 1.02;
      margin: 0 0 12px;
      letter-spacing: 0;
    }
    .muted { color: var(--muted); }
    .metric-card {
      border-radius: 12px;
      padding: 18px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.72);
      min-height: 120px;
    }
    .metric-card strong {
      display: block;
      font-size: 30px;
      margin: 10px 0 4px;
    }
    .metric-label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .task-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .pill {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      margin: 0 5px 6px 0;
      font-size: 12px;
      font-weight: 800;
      background: #eff6ff;
      color: #1d4ed8;
    }
    .pill-urgent { background:#fff1f2; color:#be123c; }
    .pill-high { background:#fffbeb; color:#b45309; }
    .pill-medium { background:#eff6ff; color:#1d4ed8; }
    .pill-low { background:#ecfdf5; color:#047857; }
    .soft-note {
      background: #eff6ff;
      color: #1e3a8a;
      border-radius: 12px;
      padding: 14px 16px;
      border: 1px solid #bfdbfe;
    }
    .danger-note {
      background: #fff1f2;
      color: #9f1239;
      border-radius: 12px;
      padding: 14px 16px;
      border: 1px solid #fecdd3;
    }
    .success-note {
      background: #ecfdf5;
      color: #065f46;
      border-radius: 12px;
      padding: 14px 16px;
      border: 1px solid #bbf7d0;
    }
    div[data-testid="stMetric"] {
      background: rgba(255,255,255,.72);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 14px;
    }
    .stButton button {
      border-radius: 10px;
      font-weight: 800;
      border: 1px solid rgba(15,23,42,.08);
    }
    </style>
    """,
    unsafe_allow_html=True,
)


def sidebar() -> str:
    with st.sidebar:
        st.markdown("## Momentum")
        st.caption("ADHD daily planner")
        page = st.radio(
            "Navigate",
            ["Dashboard", "Today", "Tasks", "Week", "Insights", "Settings"],
            label_visibility="collapsed",
        )
        st.divider()
        st.metric("Momentum points", state.reward_points)
        if st.button("Load sample day", use_container_width=True):
            load_sample_data(state)
            persist_and_rerun(state)
        return page


def hero(eyebrow: str, title: str, body: str) -> None:
    st.markdown(
        f"""
        <div class="hero">
          <div class="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p class="muted">{body}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def metric_card(label: str, value: str, detail: str = "") -> None:
    st.markdown(
        f"""
        <div class="metric-card">
          <div class="metric-label">{label}</div>
          <strong>{value}</strong>
          <div class="muted">{detail}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_task(task: Task, key_prefix: str, compact: bool = False) -> None:
    with st.container(border=True):
        st.markdown(f'<div class="task-title">{task.title}</div>', unsafe_allow_html=True)
        if task.description and not compact:
            st.caption(task.description)
        st.markdown(
            " ".join(
                [
                    f'<span class="pill pill-{task.priority}">{task.priority}</span>',
                    f'<span class="pill">{format_minutes(task.estimated_minutes)}</span>',
                    f'<span class="pill">{task.status.replace("_", " ")}</span>',
                    f'<span class="pill">friction {task.friction}/5</span>',
                ]
                + [f'<span class="pill">#{tag}</span>' for tag in task.tags[:3]]
            ),
            unsafe_allow_html=True,
        )

        if task.subtasks and not compact:
            st.progress(sum(1 for item in task.subtasks if item.completed) / len(task.subtasks))
            for subtask in task.subtasks:
                checked = st.checkbox(
                    subtask.title,
                    value=subtask.completed,
                    key=f"{key_prefix}_subtask_{subtask.id}",
                )
                if checked != subtask.completed:
                    toggle_subtask(state, task.id, subtask.id)
                    persist_and_rerun(state)

        cols = st.columns([1, 1, 1, 1, 1, 1])
        if cols[0].button("Done", key=f"{key_prefix}_done_{task.id}", use_container_width=True, disabled=task.status == "completed"):
            complete_task(state, task.id)
            persist_and_rerun(state)
        if cols[1].button("Focus", key=f"{key_prefix}_focus_{task.id}", use_container_width=True):
            finish_focus_session(state, task_id=task.id, duration=min(task.estimated_minutes, 45))
            persist_and_rerun(state)
        if cols[2].button("Break", key=f"{key_prefix}_break_{task.id}", use_container_width=True):
            break_down_task(state, task.id)
            persist_and_rerun(state)
        if cols[3].button("Snooze", key=f"{key_prefix}_snooze_{task.id}", use_container_width=True):
            snooze_task(state, task.id)
            persist_and_rerun(state)
        if cols[4].button("Top 3", key=f"{key_prefix}_top_{task.id}", use_container_width=True):
            mark_top_three(state, task.id)
            persist_and_rerun(state)
        if cols[5].button("Delete", key=f"{key_prefix}_delete_{task.id}", use_container_width=True):
            delete_task(state, task.id)
            persist_and_rerun(state)


def task_form(form_key: str = "task_form") -> None:
    with st.form(form_key, clear_on_submit=True):
        st.subheader("Add a realistic task")
        title = st.text_input("Task title", placeholder="What needs your attention?")
        description = st.text_area("Context", placeholder="Only add detail if future you needs it.")
        c1, c2, c3 = st.columns(3)
        priority = c1.selectbox("Priority", ["low", "medium", "high", "urgent"], index=1)
        estimate = c2.number_input("Estimate minutes", min_value=1, max_value=480, value=25, step=5)
        category = c3.text_input("Category", placeholder="Work, health, home")
        c4, c5 = st.columns(2)
        scheduled = c4.date_input("Scheduled date", value=date.today())
        due_enabled = c5.checkbox("Has deadline")
        due_date = c5.date_input("Due date", value=date.today()) if due_enabled else None
        c6, c7, c8 = st.columns(3)
        recurrence = c6.selectbox("Repeats", ["none", "daily", "weekdays", "weekly", "monthly"])
        energy = c7.slider("Energy needed", 1, 5, 3)
        friction = c8.slider("Friction", 1, 5, 3)
        tags_raw = st.text_input("Tags", placeholder="admin, quick-win, deep-work")
        top = st.checkbox("Mark as Top 3 candidate")
        generate_steps = st.checkbox("Generate micro-steps")
        submitted = st.form_submit_button("Add task", use_container_width=True)
        if submitted:
            steps = []
            if generate_steps:
                from momentum_streamlit.productivity import create_micro_steps

                steps = create_micro_steps(title)
            add_task(
                state,
                title=title,
                priority=priority,
                scheduled_date=scheduled.isoformat(),
                due_date=due_date.isoformat() if due_date else "",
                estimated_minutes=int(estimate),
                description=description,
                tags=[item.strip() for item in tags_raw.split(",") if item.strip()],
                category=category,
                recurrence=recurrence,
                energy_required=energy,
                friction=friction,
                is_top_three=top,
                subtasks=steps,
            )
            persist_and_rerun(state)


def dashboard() -> None:
    today_tasks = todays_tasks(state)
    completed_today = len([task for task in todays_tasks(state, include_completed=True) if task.status == "completed"])
    log = next((entry for entry in state.daily_logs if entry.date == today_key()), None)
    report = overload_report(today_tasks, state.preferences, log)
    hero(
        "Daily command center",
        "Build enough momentum for today.",
        "A realistic plan beats a perfect backlog. Protect the Top 3, catch loose thoughts, and recover without guilt.",
    )
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        metric_card("Done today", str(completed_today), "small wins count")
    with c2:
        metric_card("Planned", format_minutes(report["planned_minutes"]), f"capacity {format_minutes(report['capacity'])}")
    with c3:
        metric_card("Focus", format_minutes(sum(item.duration for item in state.focus_sessions if item.completed)), "all logged sessions")
    with c4:
        metric_card("Streak fuel", str(state.reward_points), "momentum points")

    note_class = "danger-note" if report["level"] == "high" else "soft-note" if report["level"] == "medium" else "success-note"
    st.markdown(f'<div class="{note_class}"><strong>Overwhelm guard:</strong> {report["message"]}</div>', unsafe_allow_html=True)
    st.write("")

    col_a, col_b = st.columns([1.2, 0.8])
    with col_a:
        st.subheader("Coach")
        for suggestion in coach_suggestions(today_tasks, state.preferences, log):
            st.info(suggestion)
        b1, b2 = st.columns(2)
        if b1.button("Build realistic plan", use_container_width=True):
            planned = smart_plan_today(state)
            auto_plan_day(state, planned)
            persist_and_rerun(state)
        if b2.button("Emergency reset", use_container_width=True):
            emergency_reset(state)
            persist_and_rerun(state)
    with col_b:
        st.subheader("Top 3")
        for task in top_three(state):
            render_task(task, "dash_top", compact=True)
        if not top_three(state):
            st.caption("No Top 3 yet. Add tasks or run Smart Plan.")

    col_c, col_d = st.columns(2)
    with col_c:
        brain_dump_widget()
    with col_d:
        habits_widget()


def today_page() -> None:
    hero("Daily planner", "Today should fit inside one real day.", "Plan, focus, reschedule, and recover from the same calm surface.")
    today_tasks = todays_tasks(state)
    action_cols = st.columns(3)
    if action_cols[0].button("Smart plan", use_container_width=True):
        planned = smart_plan_today(state)
        auto_plan_day(state, planned)
        persist_and_rerun(state)
    if action_cols[1].button("Emergency reset", use_container_width=True):
        emergency_reset(state)
        persist_and_rerun(state)
    if action_cols[2].button("Log 10-minute reset", use_container_width=True):
        finish_focus_session(state, duration=10, mood="calm")
        persist_and_rerun(state)

    col_a, col_b = st.columns([1.25, 0.75])
    with col_a:
        for task in today_tasks:
            render_task(task, "today")
        if not today_tasks:
            st.success("No active tasks today. That is allowed.")
    with col_b:
        energy_widget()
        time_blocks_widget()


def tasks_page() -> None:
    hero("Task system", "Everything visible. Only today is active.", "Use search and filters to keep commitments organized without staring at the whole backlog.")
    col_a, col_b = st.columns([0.85, 1.15])
    with col_a:
        task_form("tasks_form")
    with col_b:
        search = st.text_input("Search", placeholder="Search title, tags, category")
        f1, f2 = st.columns(2)
        status = f1.selectbox("Status", ["all", "backlog", "not_started", "in_progress", "rescheduled", "completed"])
        priority = f2.selectbox("Priority", ["all", "urgent", "high", "medium", "low"])
        filtered = []
        for task in state.tasks:
            haystack = " ".join([task.title, task.description, task.category, *task.tags]).lower()
            if search.lower() not in haystack:
                continue
            if status != "all" and task.status != status:
                continue
            if priority != "all" and task.priority != priority:
                continue
            filtered.append(task)
        for task in filtered:
            render_task(task, "tasks")
        if not filtered:
            st.caption("No tasks match these filters.")


def week_page() -> None:
    hero("Weekly planning", "Spread the load before it becomes a pile-up.", "Move tasks across the week and protect recovery buffers.")
    week_start = date.today()
    days = [week_start.fromordinal(week_start.toordinal() + offset).isoformat() for offset in range(7)]
    columns = st.columns(7)
    for day_key, column in zip(days, columns):
        with column:
            st.markdown(f"**{day_key[5:]}**")
            day_tasks = [task for task in state.tasks if task.scheduled_date == day_key and task.status != "completed"]
            for task in day_tasks:
                render_task(task, f"week_{day_key}", compact=True)
    st.divider()
    st.subheader("Quick reschedule")
    active = [task for task in state.tasks if task.status != "completed"]
    if active:
        c1, c2 = st.columns([2, 1])
        task_map = {task.title: task for task in active}
        selected = c1.selectbox("Task", list(task_map))
        target = c2.date_input("Move to", value=date.today())
        if st.button("Move task", use_container_width=True):
            reschedule_task(state, task_map[selected].id, target.isoformat())
            persist_and_rerun(state)
    else:
        st.caption("No active tasks to schedule.")


def insights_page() -> None:
    hero("Personal memory", "Patterns beat willpower.", "Momentum tracks energy, focus, postponement, and completion so planning gets smarter.")
    completed = len([task for task in state.tasks if task.status == "completed"])
    total = len(state.tasks)
    completion = int((completed / total) * 100) if total else 0
    focus_minutes = sum(item.duration for item in state.focus_sessions if item.completed)
    postponed = len([task for task in state.tasks if task.postponed_count > 0])
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Completion", f"{completion}%")
    c2.metric("Focus", format_minutes(focus_minutes))
    c3.metric("Postponed", postponed)
    c4.metric("Check-ins", len(state.daily_logs))

    by_day = {}
    for session in state.focus_sessions:
        if session.completed:
            day = session.started_at[:10]
            by_day[day] = by_day.get(day, 0) + session.duration
    if by_day:
        st.subheader("Focus by day")
        st.bar_chart(
            [{"day": day, "focus minutes": minutes} for day, minutes in sorted(by_day.items())],
            x="day",
            y="focus minutes",
        )
    else:
        st.info("Log a focus session to see trend charts.")

    risky = [task for task in state.tasks if task.due_date and task.due_date < today_key() and task.status != "completed"]
    st.subheader("Needs a decision")
    if risky:
        for task in risky:
            render_task(task, "risk", compact=True)
    else:
        st.success("No overdue tasks right now.")


def settings_page() -> None:
    hero("Settings", "Make the system fit your nervous system.", "Tune defaults, backup your data, and import a previous Momentum state.")
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("Planning defaults")
        state.preferences.work_start = st.time_input(
            "Work starts",
            value=time.fromisoformat(state.preferences.work_start),
        ).strftime("%H:%M")
        state.preferences.work_end = st.time_input(
            "Work ends",
            value=time.fromisoformat(state.preferences.work_end),
        ).strftime("%H:%M")
        state.preferences.daily_capacity_minutes = st.slider("Daily capacity", 45, 420, state.preferences.daily_capacity_minutes, step=15)
        state.preferences.focus_minutes = st.slider("Focus session", 5, 60, state.preferences.focus_minutes, step=5)
        state.preferences.break_minutes = st.slider("Break length", 3, 30, state.preferences.break_minutes, step=1)
        if st.button("Save preferences", use_container_width=True):
            persist_and_rerun(state)
    with c2:
        st.subheader("Backup")
        st.download_button(
            "Export backup",
            data=export_state(state),
            file_name=f"momentum-backup-{today_key()}.json",
            mime="application/json",
            use_container_width=True,
        )
        uploaded = st.file_uploader("Import backup", type=["json"])
        if uploaded and st.button("Import now", use_container_width=True):
            st.session_state.momentum_state = import_state(uploaded.read().decode("utf-8"))
            persist_and_rerun(st.session_state.momentum_state)


def energy_widget() -> None:
    st.subheader("Energy and mood")
    log = next((entry for entry in state.daily_logs if entry.date == today_key()), None)
    if not log:
        from momentum_streamlit.services import ensure_today_log

        log = ensure_today_log(state)
    log.energy_level = st.slider("Energy", 1, 5, log.energy_level)
    log.mood = st.selectbox("Mood", ["happy", "calm", "neutral", "stressed", "tired"], index=["happy", "calm", "neutral", "stressed", "tired"].index(log.mood))
    if st.button("Save check-in", use_container_width=True):
        persist_and_rerun(state)


def time_blocks_widget() -> None:
    st.subheader("Time blocks")
    blocks = [block for block in state.time_blocks if block.date == today_key()]
    for block in sorted(blocks, key=lambda item: item.start):
        st.write(f"**{block.start}-{block.end}** {block.title}")
    if not blocks:
        st.caption("No time blocks yet. Smart Plan can create them.")


def brain_dump_widget() -> None:
    st.subheader("Brain dump")
    text = st.text_input("Capture thought", placeholder="Capture it before it steals focus")
    if st.button("Add thought", use_container_width=True):
        add_brain_dump(state, text)
        persist_and_rerun(state)
    for item in [entry for entry in state.brain_dump if not entry.processed_at][:5]:
        with st.container(border=True):
            st.write(item.text)
            c1, c2 = st.columns(2)
            if c1.button("Convert", key=f"convert_{item.id}", use_container_width=True):
                convert_brain_dump_to_task(state, item.id)
                persist_and_rerun(state)
            if c2.button("Clear", key=f"clear_{item.id}", use_container_width=True):
                item.processed_at = today_key()
                persist_and_rerun(state)


def habits_widget() -> None:
    st.subheader("Tiny habits")
    today = today_key()
    for habit in state.habits:
        value = today in habit.completions
        checked = st.checkbox(habit.name, value=value, key=f"habit_{habit.id}")
        if checked != value:
            toggle_habit(state, habit.id, today)
            persist_and_rerun(state)
    new_habit = st.text_input("New habit", placeholder="Make it tiny")
    if st.button("Add habit", use_container_width=True):
        add_habit(state, new_habit)
        persist_and_rerun(state)


def load_sample_data(state: AppState) -> None:
    if state.tasks:
        return
    add_task(state, "Prepare project handoff notes", priority="high", estimated_minutes=35, friction=4, is_top_three=True, tags=["work"], subtasks=["Open notes", "Write outline", "Send draft"])
    add_task(state, "Pay electricity bill", priority="medium", estimated_minutes=10, friction=1, is_top_three=True, tags=["admin"])
    add_task(state, "Clean inbox for 15 minutes", priority="low", estimated_minutes=15, friction=2, tags=["reset"])
    add_brain_dump(state, "Ask about appointment timing")


page = sidebar()

if page == "Dashboard":
    dashboard()
elif page == "Today":
    today_page()
elif page == "Tasks":
    tasks_page()
elif page == "Week":
    week_page()
elif page == "Insights":
    insights_page()
else:
    settings_page()
