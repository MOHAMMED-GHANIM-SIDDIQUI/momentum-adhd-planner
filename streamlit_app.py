from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta
from html import escape
from math import ceil

import plotly.graph_objects as go
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


# ---------------------------------------------------------------------------
# State bootstrap
# ---------------------------------------------------------------------------


def init_state() -> AppState:
    if "momentum_state" not in st.session_state:
        st.session_state.momentum_state = load_state()
    if "active_page" not in st.session_state:
        st.session_state.active_page = "Dashboard"
    if "minimal_mode" not in st.session_state:
        st.session_state.minimal_mode = False
    if "calm_mode" not in st.session_state:
        st.session_state.calm_mode = True
    if "dark_mode" not in st.session_state:
        st.session_state.dark_mode = False
    if "focus_mode" not in st.session_state:
        st.session_state.focus_mode = False
    if "focus_task_id" not in st.session_state:
        st.session_state.focus_task_id = ""
    return st.session_state.momentum_state


def persist(state: AppState) -> None:
    save_state(state)
    st.session_state.momentum_state = state


def persist_and_rerun(state: AppState) -> None:
    persist(state)
    st.rerun()


state = init_state()


# ---------------------------------------------------------------------------
# Premium CSS system
# ---------------------------------------------------------------------------


st.markdown(
    """
    <style>
    :root {
      --ink: #0f172a;
      --ink-soft: #334155;
      --muted: #64748b;
      --faint: #94a3b8;
      --line: rgba(148, 163, 184, 0.20);
      --line-strong: rgba(148, 163, 184, 0.34);
      --surface: rgba(255, 255, 255, 0.74);
      --surface-strong: rgba(255, 255, 255, 0.92);
      --glass: rgba(255, 255, 255, 0.62);
      --indigo: #4f46e5;
      --blue: #2563eb;
      --violet: #7c3aed;
      --cyan: #0891b2;
      --green: #059669;
      --amber: #d97706;
      --rose: #e11d48;
      --shadow: 0 24px 80px rgba(15, 23, 42, 0.10);
      --shadow-soft: 0 16px 45px rgba(15, 23, 42, 0.07);
      --radius-xl: 28px;
      --radius-lg: 22px;
      --radius-md: 16px;
    }

    html { scroll-behavior: smooth; }

    .stApp {
      background:
        radial-gradient(circle at 8% 4%, rgba(79, 70, 229, .16), transparent 30%),
        radial-gradient(circle at 92% 10%, rgba(8, 145, 178, .14), transparent 28%),
        radial-gradient(circle at 50% 105%, rgba(124, 58, 237, .10), transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #edf2f8 52%, #f8fafc 100%);
      color: var(--ink);
    }

    .stApp::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(15, 23, 42, .025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 23, 42, .025) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,.8), transparent 75%);
      z-index: 0;
    }

    .main .block-container {
      max-width: 1360px;
      padding-top: 1.25rem;
      padding-bottom: 4rem;
      position: relative;
      z-index: 1;
    }

    section[data-testid="stSidebar"] {
      background: transparent !important;
      border-right: 0 !important;
    }

    section[data-testid="stSidebar"] > div {
      background: rgba(255, 255, 255, .64);
      border: 1px solid rgba(255, 255, 255, .72);
      box-shadow: 0 22px 70px rgba(15, 23, 42, .09);
      backdrop-filter: blur(26px);
      border-radius: 0 30px 30px 0;
      margin: 12px 0 12px 12px;
      height: calc(100vh - 24px);
    }

    [data-testid="stSidebar"] .stButton button,
    [data-testid="stSidebar"] .stDownloadButton button {
      width: 100%;
      justify-content: flex-start;
    }

    h1, h2, h3, h4, p { letter-spacing: 0; }

    div[data-testid="stVerticalBlockBorderWrapper"] {
      border-color: transparent !important;
      box-shadow: none !important;
    }

    div[data-testid="stAlert"],
    div[data-testid="stMetric"],
    div[data-testid="stExpander"] {
      border-radius: var(--radius-md) !important;
      border: 1px solid var(--line) !important;
      background: rgba(255,255,255,.72) !important;
      box-shadow: var(--shadow-soft);
    }

    .stButton button,
    .stDownloadButton button,
    .stFormSubmitButton button {
      border-radius: 999px !important;
      border: 1px solid rgba(15, 23, 42, .08) !important;
      background: rgba(255, 255, 255, .78) !important;
      color: var(--ink) !important;
      font-weight: 800 !important;
      min-height: 42px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, .06);
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    }

    .stButton button:hover,
    .stDownloadButton button:hover,
    .stFormSubmitButton button:hover {
      transform: translateY(-1px);
      border-color: rgba(79, 70, 229, .24) !important;
      box-shadow: 0 16px 32px rgba(79, 70, 229, .12);
      background: rgba(255, 255, 255, .96) !important;
    }

    .stTextInput input,
    .stTextArea textarea,
    .stNumberInput input,
    .stSelectbox div[data-baseweb="select"],
    .stDateInput input,
    .stTimeInput input {
      border-radius: 18px !important;
      border: 1px solid rgba(148, 163, 184, .28) !important;
      background: rgba(255,255,255,.76) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
    }

    .stSlider [data-testid="stTickBar"] { display: none; }
    .stCheckbox label { color: var(--ink-soft) !important; }
    .stMarkdown a { color: var(--indigo); }

    .app-topbar {
      position: sticky;
      top: .75rem;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      margin-bottom: 18px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.72);
      background: rgba(255,255,255,.62);
      box-shadow: 0 18px 48px rgba(15, 23, 42, .08);
      backdrop-filter: blur(24px);
    }

    .topbar-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--ink-soft);
      font-size: 13px;
      font-weight: 800;
    }

    .orb {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--blue), var(--violet));
      box-shadow: 0 0 22px rgba(79, 70, 229, .34);
    }

    .topbar-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }

    .mini-chip,
    .nav-chip,
    .mode-chip,
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border-radius: 999px;
      padding: 7px 11px;
      border: 1px solid rgba(148,163,184,.24);
      background: rgba(255,255,255,.62);
      color: var(--ink-soft);
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
    }

    .mode-chip {
      background: rgba(239,246,255,.82);
      color: #1d4ed8;
    }

    .hero {
      position: relative;
      overflow: hidden;
      padding: clamp(26px, 4vw, 44px);
      margin-bottom: 22px;
      border-radius: var(--radius-xl);
      border: 1px solid rgba(255, 255, 255, .78);
      background:
        linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.52)),
        radial-gradient(circle at 78% 14%, rgba(79, 70, 229, .18), transparent 34%),
        radial-gradient(circle at 16% 92%, rgba(8, 145, 178, .16), transparent 32%);
      box-shadow: var(--shadow);
      backdrop-filter: blur(28px);
      animation: reveal .45s ease both;
    }

    .hero::after {
      content: "";
      position: absolute;
      right: 34px;
      top: 34px;
      width: 160px;
      height: 160px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(37,99,235,.18), rgba(124,58,237,.12));
      filter: blur(18px);
      opacity: .75;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 820px;
    }

    .eyebrow {
      color: var(--indigo);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .18em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .hero h1 {
      font-size: clamp(34px, 5vw, 64px);
      line-height: 1.02;
      letter-spacing: 0;
      margin: 0 0 14px;
      color: var(--ink);
      max-width: 900px;
    }

    .hero p {
      margin: 0;
      color: var(--ink-soft);
      font-size: clamp(15px, 1.5vw, 18px);
      line-height: 1.75;
      max-width: 780px;
    }

    .section-title {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 14px;
      margin: 8px 0 14px;
    }

    .section-title h2 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0;
    }

    .section-title p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .glass-card,
    .coach-card,
    .empty-state,
    .task-card,
    .habit-card,
    .day-card,
    .focus-stage,
    .mental-inbox,
    .metric-card {
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255,255,255,.72);
      background: rgba(255,255,255,.70);
      box-shadow: var(--shadow-soft);
      backdrop-filter: blur(22px);
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
      animation: reveal .45s ease both;
    }

    .glass-card:hover,
    .task-card:hover,
    .habit-card:hover,
    .day-card:hover,
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 28px 70px rgba(15, 23, 42, .11);
      border-color: rgba(79, 70, 229, .22);
    }

    .glass-card { padding: 22px; }
    .coach-card { padding: 18px; }

    .metric-card {
      padding: 20px;
      min-height: 142px;
      position: relative;
      overflow: hidden;
    }

    .metric-card::after {
      content: "";
      position: absolute;
      inset: auto -30px -44px auto;
      width: 120px;
      height: 120px;
      border-radius: 999px;
      background: var(--glow);
      filter: blur(6px);
      opacity: .55;
    }

    .metric-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      background: rgba(255,255,255,.78);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
      font-size: 20px;
    }

    .metric-value {
      margin-top: 16px;
      font-size: clamp(28px, 3vw, 40px);
      font-weight: 950;
      letter-spacing: 0;
      color: var(--ink);
    }

    .metric-label {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }

    .metric-context {
      margin-top: 8px;
      color: var(--ink-soft);
      font-size: 13px;
      line-height: 1.55;
      max-width: 240px;
    }

    .progress-track {
      width: 100%;
      height: 9px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(148, 163, 184, .18);
      margin-top: 14px;
    }

    .progress-fill {
      height: 100%;
      width: var(--progress);
      border-radius: inherit;
      background: linear-gradient(90deg, var(--blue), var(--violet));
      box-shadow: 0 0 18px rgba(79, 70, 229, .28);
      transition: width .35s ease;
    }

    .task-card {
      position: relative;
      padding: 20px;
      margin-bottom: 14px;
      overflow: hidden;
      border-left: 0;
    }

    .task-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 5px;
      background: var(--priority);
      box-shadow: 0 0 32px var(--priority);
      opacity: .88;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
    }

    .task-title {
      margin: 0 0 8px;
      color: var(--ink);
      font-size: 19px;
      font-weight: 920;
      line-height: 1.25;
    }

    .task-description {
      margin: 0 0 14px;
      color: var(--muted);
      line-height: 1.65;
      font-size: 14px;
    }

    .task-top {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 6px 10px;
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fde68a;
      font-size: 12px;
      font-weight: 900;
    }

    .task-visuals {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 14px;
    }

    .micro-meter {
      padding: 11px 12px;
      border-radius: 16px;
      background: rgba(248,250,252,.72);
      border: 1px solid rgba(148,163,184,.16);
    }

    .micro-meter span {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .1em;
      margin-bottom: 8px;
    }

    .subtask-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 14px;
      background: rgba(255,255,255,.56);
      margin: 7px 0;
      color: var(--ink-soft);
      font-size: 14px;
    }

    .subtask-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--green);
      box-shadow: 0 0 12px rgba(5,150,105,.35);
    }

    .coach-card {
      min-height: 142px;
      background:
        linear-gradient(135deg, rgba(255,255,255,.82), rgba(255,255,255,.58)),
        radial-gradient(circle at 95% 10%, rgba(124, 58, 237, .12), transparent 42%);
    }

    .coach-kicker {
      color: var(--violet);
      font-size: 11px;
      font-weight: 950;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    .coach-title {
      color: var(--ink);
      font-size: 18px;
      font-weight: 920;
      margin: 8px 0;
    }

    .coach-body {
      color: var(--ink-soft);
      font-size: 14px;
      line-height: 1.65;
    }

    .empty-state {
      padding: 30px;
      text-align: center;
      color: var(--ink-soft);
      border-style: dashed;
      background:
        linear-gradient(135deg, rgba(255,255,255,.74), rgba(255,255,255,.48)),
        radial-gradient(circle at 50% 0%, rgba(8,145,178,.14), transparent 40%);
    }

    .empty-state strong {
      display: block;
      margin-bottom: 8px;
      color: var(--ink);
      font-size: 20px;
    }

    .focus-stage {
      position: relative;
      overflow: hidden;
      padding: clamp(26px, 5vw, 52px);
      min-height: 360px;
      background:
        radial-gradient(circle at 28% 28%, rgba(37, 99, 235, .24), transparent 32%),
        radial-gradient(circle at 78% 24%, rgba(124, 58, 237, .18), transparent 36%),
        linear-gradient(135deg, rgba(255,255,255,.86), rgba(255,255,255,.54));
    }

    .focus-ring {
      width: clamp(180px, 22vw, 280px);
      aspect-ratio: 1;
      margin: 0 auto 24px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background:
        conic-gradient(from 180deg, var(--blue), var(--violet), var(--cyan), var(--blue)),
        radial-gradient(circle, #fff 58%, transparent 59%);
      box-shadow: 0 32px 90px rgba(79, 70, 229, .22);
    }

    .focus-ring-inner {
      width: 78%;
      aspect-ratio: 1;
      border-radius: 999px;
      background: rgba(255,255,255,.88);
      display: grid;
      place-items: center;
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
    }

    .focus-time {
      font-size: clamp(34px, 5vw, 58px);
      font-weight: 950;
      color: var(--ink);
      line-height: 1;
    }

    .mental-inbox {
      padding: 20px;
      background:
        linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.54)),
        radial-gradient(circle at 8% 8%, rgba(236,72,153,.10), transparent 38%);
    }

    .habit-card {
      padding: 16px;
      margin-bottom: 10px;
    }

    .habit-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .habit-name {
      color: var(--ink);
      font-weight: 880;
    }

    .day-card {
      min-height: 260px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .day-card.overload-high { box-shadow: 0 22px 60px rgba(225, 29, 72, .13); border-color: rgba(225, 29, 72, .24); }
    .day-card.overload-medium { box-shadow: 0 22px 60px rgba(217, 119, 6, .12); border-color: rgba(217, 119, 6, .24); }

    .plot-shell {
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255,255,255,.72);
      background: rgba(255,255,255,.68);
      box-shadow: var(--shadow-soft);
      padding: 10px 10px 0;
      backdrop-filter: blur(20px);
    }

    .sidebar-brand {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 10px 4px 16px;
    }

    .brand-mark {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      color: white;
      font-size: 20px;
      font-weight: 950;
      background: linear-gradient(135deg, #111827, #4f46e5);
      box-shadow: 0 20px 42px rgba(79,70,229,.22);
    }

    .brand-name {
      color: var(--ink);
      font-weight: 950;
      font-size: 20px;
      line-height: 1.05;
    }

    .brand-sub {
      color: var(--muted);
      font-weight: 700;
      font-size: 12px;
      margin-top: 3px;
    }

    .sidebar-panel {
      padding: 14px;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,.74);
      background: rgba(255,255,255,.54);
      box-shadow: 0 14px 34px rgba(15,23,42,.06);
      margin: 12px 0;
    }

    .ring {
      width: 108px;
      height: 108px;
      margin: 4px auto 12px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background:
        conic-gradient(var(--blue) var(--ring), rgba(148,163,184,.16) 0),
        radial-gradient(circle, rgba(255,255,255,.95) 58%, transparent 59%);
    }

    .ring span {
      font-size: 24px;
      font-weight: 950;
      color: var(--ink);
    }

    .hide-streamlit .stDeployButton,
    .hide-streamlit footer,
    .hide-streamlit header { visibility: hidden; height: 0; }

    @keyframes reveal {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 900px) {
      .main .block-container { padding-left: 1rem; padding-right: 1rem; }
      .app-topbar { align-items: flex-start; border-radius: 24px; flex-direction: column; }
      .task-visuals { grid-template-columns: 1fr; }
      .hero { border-radius: 24px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        transition-duration: 0.001ms !important;
      }
    }
    </style>
    <div class="hide-streamlit"></div>
    """,
    unsafe_allow_html=True,
)

if st.session_state.dark_mode:
    st.markdown(
        """
        <style>
        :root {
          --ink: #f8fafc;
          --ink-soft: #dbeafe;
          --muted: #94a3b8;
          --faint: #64748b;
          --line: rgba(148, 163, 184, 0.20);
          --line-strong: rgba(226, 232, 240, 0.22);
          --surface: rgba(15, 23, 42, 0.74);
          --surface-strong: rgba(15, 23, 42, 0.92);
          --glass: rgba(15, 23, 42, 0.62);
          --shadow: 0 24px 80px rgba(2, 6, 23, 0.38);
          --shadow-soft: 0 16px 45px rgba(2, 6, 23, 0.28);
        }

        .stApp {
          background:
            radial-gradient(circle at 8% 4%, rgba(79, 70, 229, .22), transparent 30%),
            radial-gradient(circle at 92% 10%, rgba(8, 145, 178, .16), transparent 28%),
            radial-gradient(circle at 50% 105%, rgba(124, 58, 237, .14), transparent 34%),
            linear-gradient(180deg, #020617 0%, #0f172a 54%, #111827 100%);
          color: var(--ink);
        }

        .stApp::before {
          background-image:
            linear-gradient(rgba(226, 232, 240, .035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226, 232, 240, .035) 1px, transparent 1px);
        }

        section[data-testid="stSidebar"] > div,
        .app-topbar,
        .hero,
        .glass-card,
        .coach-card,
        .empty-state,
        .task-card,
        .habit-card,
        .day-card,
        .focus-stage,
        .mental-inbox,
        .metric-card,
        .plot-shell,
        .sidebar-panel {
          background: rgba(15, 23, 42, .70) !important;
          border-color: rgba(226, 232, 240, .12) !important;
          box-shadow: var(--shadow-soft);
        }

        .hero {
          background:
            linear-gradient(135deg, rgba(15,23,42,.88), rgba(30,41,59,.56)),
            radial-gradient(circle at 78% 14%, rgba(79, 70, 229, .22), transparent 34%),
            radial-gradient(circle at 16% 92%, rgba(8, 145, 178, .16), transparent 32%) !important;
        }

        .metric-icon,
        .mini-chip,
        .nav-chip,
        .mode-chip,
        .pill,
        .micro-meter,
        .subtask-row,
        .stButton button,
        .stDownloadButton button,
        .stFormSubmitButton button,
        div[data-testid="stAlert"],
        div[data-testid="stMetric"],
        div[data-testid="stExpander"] {
          background: rgba(30, 41, 59, .72) !important;
          border-color: rgba(226, 232, 240, .12) !important;
          color: var(--ink-soft) !important;
        }

        .stButton button:hover,
        .stDownloadButton button:hover,
        .stFormSubmitButton button:hover {
          background: rgba(51, 65, 85, .88) !important;
          border-color: rgba(129, 140, 248, .34) !important;
        }

        .stTextInput input,
        .stTextArea textarea,
        .stNumberInput input,
        .stSelectbox div[data-baseweb="select"],
        .stDateInput input,
        .stTimeInput input {
          background: rgba(15, 23, 42, .74) !important;
          border-color: rgba(226, 232, 240, .14) !important;
          color: var(--ink) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }

        .hero h1,
        .task-title,
        .metric-value,
        .coach-title,
        .brand-name,
        .habit-name,
        .ring span,
        .focus-time,
        .empty-state strong,
        .section-title h2 {
          color: var(--ink) !important;
        }

        .hero p,
        .muted,
        .metric-context,
        .coach-body,
        .task-description,
        .section-title p,
        .brand-sub {
          color: var(--muted) !important;
        }

        .task-top {
          background: rgba(120, 53, 15, .48);
          border-color: rgba(251, 191, 36, .22);
          color: #fde68a;
        }

        .progress-track {
          background: rgba(148, 163, 184, .16);
        }

        .focus-ring-inner {
          background: rgba(15, 23, 42, .88);
        }

        .ring {
          background:
            conic-gradient(var(--blue) var(--ring), rgba(148,163,184,.18) 0),
            radial-gradient(circle, rgba(15,23,42,.96) 58%, transparent 59%);
        }

        .stCheckbox label,
        label,
        [data-testid="stWidgetLabel"] {
          color: var(--ink-soft) !important;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# Reusable UI helpers
# ---------------------------------------------------------------------------


PAGE_COPY = {
    "Dashboard": (
        "Daily command center",
        "Build enough momentum for today.",
        "A calm operating system for choosing less, starting smaller, and ending the day without shame.",
    ),
    "Today": (
        "One day, gently held",
        "One realistic day at a time.",
        "Keep the plan honest, protect your focus, and move anything extra without guilt.",
    ),
    "Tasks": (
        "Task sanctuary",
        "Everything visible. Only today is active.",
        "A quiet place for all commitments, with the daily load kept intentionally small.",
    ),
    "Week": (
        "Weekly rhythm",
        "Spread the load before it becomes a pile-up.",
        "See the week as a breathable schedule, not a wall of obligations.",
    ),
    "Insights": (
        "Personal intelligence",
        "Patterns beat willpower.",
        "Your system learns from energy, friction, focus, and follow-through.",
    ),
    "Settings": (
        "Nervous system controls",
        "Make the system fit you.",
        "Tune capacity, backup data, and keep the app gentle by default.",
    ),
}

NAV_ITEMS = {
    "Dashboard": "⌘",
    "Today": "◐",
    "Tasks": "□",
    "Week": "▦",
    "Insights": "◇",
    "Settings": "⚙",
}

PRIORITY_COLOR = {
    "urgent": "#e11d48",
    "high": "#d97706",
    "medium": "#2563eb",
    "low": "#059669",
}

MOOD_COLOR = {
    "happy": "#059669",
    "calm": "#0891b2",
    "neutral": "#64748b",
    "stressed": "#d97706",
    "tired": "#7c3aed",
}


def html(text: object) -> str:
    return escape(str(text))


def pct(value: float, maximum: float) -> int:
    if maximum <= 0:
        return 0
    return max(0, min(100, round((value / maximum) * 100)))


def active_today_tasks() -> list[Task]:
    return todays_tasks(state)


def completed_today_count() -> int:
    return len([task for task in todays_tasks(state, include_completed=True) if task.status == "completed"])


def total_focus_minutes() -> int:
    return sum(session.duration for session in state.focus_sessions if session.completed)


def current_log():
    return next((entry for entry in state.daily_logs if entry.date == today_key()), None)


def current_overload(tasks: list[Task] | None = None) -> dict:
    return overload_report(tasks or active_today_tasks(), state.preferences, current_log())


def topbar() -> None:
    tasks = active_today_tasks()
    report = current_overload(tasks)
    completed = completed_today_count()
    total_today = len(todays_tasks(state, include_completed=True))
    completion = pct(completed, total_today)
    mode_label = "Calm mode" if st.session_state.calm_mode else "Standard mode"
    minimal_label = "Minimal view" if st.session_state.minimal_mode else "Full view"
    theme_label = "Dark" if st.session_state.dark_mode else "Light"
    st.markdown(
        f"""
        <div class="app-topbar">
          <div class="topbar-title">
            <span class="orb"></span>
            <span>{html(theme_label)} · {html(mode_label)} · {html(minimal_label)}</span>
          </div>
          <div class="topbar-meta">
            <span class="mini-chip">{completion}% complete</span>
            <span class="mini-chip">{format_minutes(report["planned_minutes"])} planned</span>
            <span class="mini-chip">{report["level"]} load</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def hero(page: str) -> None:
    eyebrow, title, body = PAGE_COPY[page]
    st.markdown(
        f"""
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow">{html(eyebrow)}</div>
            <h1>{html(title)}</h1>
            <p>{html(body)}</p>
          </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def section_title(title: str, body: str = "", meta: str = "") -> None:
    st.markdown(
        f"""
        <div class="section-title">
          <div>
            <h2>{html(title)}</h2>
            {f'<p>{html(body)}</p>' if body else ''}
          </div>
          {f'<span class="mini-chip">{html(meta)}</span>' if meta else ''}
        </div>
        """,
        unsafe_allow_html=True,
    )


def metric_card(icon: str, label: str, value: str, context: str, progress: int = 0, tone: str = "blue") -> None:
    color_map = {
        "blue": "linear-gradient(135deg, rgba(37,99,235,.22), rgba(124,58,237,.12))",
        "cyan": "linear-gradient(135deg, rgba(8,145,178,.20), rgba(37,99,235,.10))",
        "green": "linear-gradient(135deg, rgba(5,150,105,.20), rgba(8,145,178,.10))",
        "amber": "linear-gradient(135deg, rgba(217,119,6,.22), rgba(251,191,36,.12))",
        "rose": "linear-gradient(135deg, rgba(225,29,72,.22), rgba(124,58,237,.10))",
        "violet": "linear-gradient(135deg, rgba(124,58,237,.22), rgba(37,99,235,.10))",
    }
    st.markdown(
        f"""
        <div class="metric-card" style="--glow:{color_map.get(tone, color_map["blue"])}">
          <div class="metric-icon">{html(icon)}</div>
          <div class="metric-value">{html(value)}</div>
          <div class="metric-label">{html(label)}</div>
          <div class="metric-context">{html(context)}</div>
          <div class="progress-track"><div class="progress-fill" style="--progress:{progress}%"></div></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def coach_card(kicker: str, title: str, body: str, tone: str = "violet") -> None:
    st.markdown(
        f"""
        <div class="coach-card">
          <div class="coach-kicker">{html(kicker)}</div>
          <div class="coach-title">{html(title)}</div>
          <div class="coach-body">{html(body)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def empty_state(title: str, body: str) -> None:
    st.markdown(
        f"""
        <div class="empty-state">
          <strong>{html(title)}</strong>
          <span>{html(body)}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def glass_note(body: str, level: str = "calm") -> None:
    icon = {"calm": "✦", "medium": "◒", "high": "!"}.get(level, "✦")
    title = {"calm": "Plan feels spacious", "medium": "Plan is near capacity", "high": "Today may be overloaded"}.get(level, "Guidance")
    st.markdown(
        f"""
        <div class="coach-card">
          <div class="coach-kicker">{html(icon)} OVERWHELM GUARD</div>
          <div class="coach-title">{html(title)}</div>
          <div class="coach-body">{html(body)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def sidebar() -> str:
    tasks = todays_tasks(state, include_completed=True)
    completion = pct(completed_today_count(), len(tasks))
    streak = focus_streak()
    with st.sidebar:
        st.markdown(
            f"""
            <div class="sidebar-brand">
              <div class="brand-mark">M</div>
              <div>
                <div class="brand-name">Momentum</div>
                <div class="brand-sub">ADHD planner OS</div>
              </div>
            </div>
            <div class="sidebar-panel">
              <div class="ring" style="--ring:{completion}%"><span>{completion}%</span></div>
              <div class="metric-label" style="text-align:center;">Daily progress</div>
            </div>
            <div class="sidebar-panel">
              <span class="mini-chip">Momentum {state.reward_points}</span>
              <span class="mini-chip">{streak} day focus</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        for page, icon in NAV_ITEMS.items():
            if st.button(f"{icon}  {page}", key=f"nav_{page}", use_container_width=True):
                st.session_state.active_page = page
                st.session_state.focus_mode = False
                st.rerun()

        st.markdown('<div class="sidebar-panel">', unsafe_allow_html=True)
        st.session_state.calm_mode = st.toggle("Calm mode", value=st.session_state.calm_mode)
        st.session_state.dark_mode = st.toggle("Dark mode", value=st.session_state.dark_mode)
        st.session_state.minimal_mode = st.toggle("Minimal mode", value=st.session_state.minimal_mode)
        if st.button("✦ Load sample day", use_container_width=True):
            load_sample_data(state)
            persist_and_rerun(state)
        if st.button("◉ Enter focus mode", use_container_width=True):
            st.session_state.focus_mode = True
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

    return st.session_state.active_page


def focus_streak() -> int:
    completed_dates = {
        session.started_at[:10]
        for session in state.focus_sessions
        if session.completed and session.started_at
    }
    if not completed_dates:
        return 0
    today = date.today()
    streak = 0
    for offset in range(365):
        key = (today - timedelta(days=offset)).isoformat()
        if key in completed_dates:
            streak += 1
        elif offset > 0:
            break
    return streak


def task_progress(task: Task) -> int:
    if not task.subtasks:
        return 0
    return pct(len([item for item in task.subtasks if item.completed]), len(task.subtasks))


def render_task(task: Task, key_prefix: str, compact: bool = False) -> None:
    priority_color = PRIORITY_COLOR[task.priority]
    subtask_done = len([item for item in task.subtasks if item.completed])
    subtask_total = len(task.subtasks)
    progress = task_progress(task)
    energy_progress = pct(task.energy_required, 5)
    friction_progress = pct(task.friction, 5)
    top_badge = '<span class="task-top">Top 3</span>' if task.is_top_three else ""
    tags = "".join(f'<span class="pill">#{html(tag)}</span>' for tag in task.tags[:3])
    status = task.status.replace("_", " ")
    st.markdown(
        f"""
        <article class="task-card" style="--priority:{priority_color}">
          <div class="task-header">
            <div>
              <h3 class="task-title">{html(task.title)}</h3>
              {f'<p class="task-description">{html(task.description)}</p>' if task.description and not compact else ''}
            </div>
            {top_badge}
          </div>
          <div>
            <span class="pill" style="color:{priority_color};background:rgba(255,255,255,.72);border-color:{priority_color}33">{html(task.priority)}</span>
            <span class="pill">{format_minutes(task.estimated_minutes)}</span>
            <span class="pill">{html(status)}</span>
            {f'<span class="pill">{html(task.category)}</span>' if task.category else ''}
            {tags}
          </div>
          <div class="task-visuals">
            <div class="micro-meter">
              <span>Energy <b>{task.energy_required}/5</b></span>
              <div class="progress-track"><div class="progress-fill" style="--progress:{energy_progress}%"></div></div>
            </div>
            <div class="micro-meter">
              <span>Friction <b>{task.friction}/5</b></span>
              <div class="progress-track"><div class="progress-fill" style="--progress:{friction_progress}%"></div></div>
            </div>
          </div>
          {f'<div class="micro-meter" style="margin-top:12px"><span>Subtasks <b>{subtask_done}/{subtask_total}</b></span><div class="progress-track"><div class="progress-fill" style="--progress:{progress}%"></div></div></div>' if subtask_total else ''}
        </article>
        """,
        unsafe_allow_html=True,
    )

    if task.subtasks and not compact and not st.session_state.minimal_mode:
        with st.expander("Micro-steps", expanded=False):
            for subtask in task.subtasks:
                cols = st.columns([0.08, 0.92])
                checked = cols[0].checkbox(
                    " ",
                    value=subtask.completed,
                    key=f"{key_prefix}_subtask_{subtask.id}",
                    label_visibility="collapsed",
                )
                cols[1].markdown(
                    f'<div class="subtask-row"><span class="subtask-dot"></span>{html(subtask.title)}</div>',
                    unsafe_allow_html=True,
                )
                if checked != subtask.completed:
                    toggle_subtask(state, task.id, subtask.id)
                    persist_and_rerun(state)

    primary_cols = st.columns([1, 1, 2])
    if primary_cols[0].button("Done", key=f"{key_prefix}_done_{task.id}", use_container_width=True, disabled=task.status == "completed"):
        complete_task(state, task.id)
        persist_and_rerun(state)
    if primary_cols[1].button("Focus", key=f"{key_prefix}_focus_{task.id}", use_container_width=True):
        st.session_state.focus_mode = True
        st.session_state.focus_task_id = task.id
        st.rerun()
    with primary_cols[2].expander("More", expanded=False):
        c1, c2, c3, c4 = st.columns(4)
        if c1.button("Break down", key=f"{key_prefix}_break_{task.id}", use_container_width=True):
            break_down_task(state, task.id)
            persist_and_rerun(state)
        if c2.button("Snooze", key=f"{key_prefix}_snooze_{task.id}", use_container_width=True):
            snooze_task(state, task.id)
            persist_and_rerun(state)
        if c3.button("Top 3", key=f"{key_prefix}_top_{task.id}", use_container_width=True):
            mark_top_three(state, task.id)
            persist_and_rerun(state)
        if c4.button("Delete", key=f"{key_prefix}_delete_{task.id}", use_container_width=True):
            delete_task(state, task.id)
            persist_and_rerun(state)


def task_form(form_key: str = "task_form") -> None:
    with st.form(form_key, clear_on_submit=True):
        section_title("Add a realistic task", "Capture enough context to start, not enough to overthink.")
        title = st.text_input("Task title", placeholder="What needs your attention?")
        description = st.text_area("Context", placeholder="Only add detail if future you needs it.", height=92)
        c1, c2, c3 = st.columns(3)
        priority = c1.selectbox("Priority", ["low", "medium", "high", "urgent"], index=1)
        estimate = c2.number_input("Estimate minutes", min_value=1, max_value=480, value=25, step=5)
        category = c3.text_input("Category", placeholder="Work, health, home")
        c4, c5 = st.columns(2)
        scheduled = c4.date_input("Scheduled date", value=date.today())
        due_enabled = c5.checkbox("Add deadline")
        due_date = c5.date_input("Due date", value=date.today()) if due_enabled else None
        c6, c7, c8 = st.columns(3)
        recurrence = c6.selectbox("Repeats", ["none", "daily", "weekdays", "weekly", "monthly"])
        energy = c7.slider("Energy needed", 1, 5, 3)
        friction = c8.slider("Friction", 1, 5, 3)
        tags_raw = st.text_input("Tags", placeholder="admin, quick-win, deep-work")
        top = st.checkbox("Protect as Top 3 candidate")
        generate_steps = st.checkbox("Generate gentle micro-steps")
        submitted = st.form_submit_button("Add task", use_container_width=True)
        if submitted:
            steps: list[str] = []
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


def build_insights(tasks: list[Task]) -> list[tuple[str, str, str]]:
    report = current_overload(tasks)
    focus_minutes = total_focus_minutes()
    completed = len([task for task in state.tasks if task.status == "completed"])
    postponed = len([task for task in state.tasks if task.postponed_count > 0 and task.status != "completed"])
    low_friction_done = len(
        [task for task in state.tasks if task.status == "completed" and task.friction <= 2]
    )
    insights = []
    if report["planned_minutes"] > 180:
        insights.append(("Load signal", "Today may be overloaded.", "Reduce one commitment before starting. A smaller trusted plan will feel easier to enter."))
    else:
        insights.append(("Load signal", "Your plan is inside a humane range.", "You tend to do better when the planned load stays under about 3 hours."))
    if low_friction_done:
        insights.append(("Activation pattern", "Low-friction wins are working.", "Your system shows momentum after quick completions. Start there when the day feels foggy."))
    else:
        insights.append(("Activation pattern", "You may need a starter win.", "Choose one task under 10 minutes before opening heavier work."))
    if focus_minutes >= 60:
        insights.append(("Focus pattern", "Your focus bank is building.", "Protect the next recovery break so the streak stays sustainable."))
    else:
        insights.append(("Focus pattern", "A short session is enough.", "A single 10-minute reset still counts as a real focus rep."))
    if postponed:
        insights.append(("Friction pattern", "Repeatedly postponed tasks need translation.", "Break one postponed task into micro-steps instead of trying harder."))
    elif completed:
        insights.append(("Follow-through", "Your task system is staying light.", "Keep archiving or snoozing stale work before it becomes background noise."))
    return insights[:4]


def plot_config() -> dict:
    return {"displayModeBar": False, "responsive": True}


def plotly_layout(fig: go.Figure, height: int = 320) -> go.Figure:
    font_color = "#dbeafe" if st.session_state.dark_mode else "#334155"
    grid_color = "rgba(226,232,240,.11)" if st.session_state.dark_mode else "rgba(148,163,184,.18)"
    fig.update_layout(
        height=height,
        margin=dict(l=22, r=22, t=34, b=30),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(255,255,255,0)",
        font=dict(family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", color=font_color),
        showlegend=False,
    )
    fig.update_xaxes(showgrid=False, zeroline=False)
    fig.update_yaxes(gridcolor=grid_color, zeroline=False)
    return fig


def focus_trend_chart() -> go.Figure:
    days = [(date.today() - timedelta(days=6 - index)).isoformat() for index in range(7)]
    minutes = []
    for day in days:
        minutes.append(sum(session.duration for session in state.focus_sessions if session.completed and session.started_at[:10] == day))
    fig = go.Figure(
        data=[
            go.Scatter(
                x=[day[5:] for day in days],
                y=minutes,
                mode="lines+markers",
                line=dict(color="#4f46e5", width=4, shape="spline"),
                marker=dict(size=10, color="#0891b2", line=dict(width=3, color="white")),
                fill="tozeroy",
                fillcolor="rgba(79,70,229,.10)",
            )
        ]
    )
    return plotly_layout(fig, 310)


def completion_heatmap() -> go.Figure:
    days = [(date.today() - timedelta(days=20 - index)).isoformat() for index in range(21)]
    completed_by_day = Counter(task.completed_at[:10] for task in state.tasks if task.completed_at)
    z = [[completed_by_day[day] for day in days[index : index + 7]] for index in range(0, 21, 7)]
    labels = [[day[5:] for day in days[index : index + 7]] for index in range(0, 21, 7)]
    fig = go.Figure(
        data=go.Heatmap(
            z=z,
            text=labels,
            texttemplate="%{text}",
            colorscale=[[0, "#eef2ff"], [0.5, "#93c5fd"], [1, "#4f46e5"]],
            hovertemplate="%{text}<br>%{z} completed<extra></extra>",
            showscale=False,
            xgap=8,
            ygap=8,
        )
    )
    return plotly_layout(fig, 250)


def energy_focus_chart() -> go.Figure:
    focus_by_day = defaultdict(int)
    for session in state.focus_sessions:
        if session.completed:
            focus_by_day[session.started_at[:10]] += session.duration
    x = []
    energy = []
    focus = []
    for log in sorted(state.daily_logs, key=lambda item: item.date)[-10:]:
        x.append(log.date[5:])
        energy.append(log.energy_level)
        focus.append(focus_by_day[log.date])
    fig = go.Figure()
    fig.add_bar(x=x, y=focus, marker_color="rgba(37,99,235,.55)", name="Focus minutes")
    fig.add_scatter(x=x, y=energy, mode="lines+markers", marker=dict(color="#059669", size=9), line=dict(color="#059669", width=3), name="Energy")
    fig.update_layout(showlegend=True, legend=dict(orientation="h", y=1.08, x=0))
    return plotly_layout(fig, 310)


def burnout_gauge() -> go.Figure:
    active = len([task for task in state.tasks if task.status != "completed"])
    postponed = len([task for task in state.tasks if task.postponed_count > 0 and task.status != "completed"])
    report = current_overload()
    score = min(100, round(report["ratio"] * 45 + postponed * 8 + max(0, active - 12) * 3))
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=score,
            number={"suffix": "/100", "font": {"size": 34}},
            gauge={
                "axis": {"range": [0, 100], "visible": False},
                "bar": {"color": "#7c3aed"},
                "bgcolor": "rgba(148,163,184,.12)",
                "borderwidth": 0,
                "steps": [
                    {"range": [0, 35], "color": "rgba(5,150,105,.18)"},
                    {"range": [35, 70], "color": "rgba(217,119,6,.18)"},
                    {"range": [70, 100], "color": "rgba(225,29,72,.18)"},
                ],
            },
        )
    )
    return plotly_layout(fig, 260)


# ---------------------------------------------------------------------------
# Product experiences
# ---------------------------------------------------------------------------


def focus_mode_page() -> None:
    task = next((item for item in state.tasks if item.id == st.session_state.focus_task_id), None)
    fallback = top_three(state)[0] if top_three(state) else None
    active_task = task or fallback
    duration = min(active_task.estimated_minutes, 45) if active_task else state.preferences.focus_minutes
    title = active_task.title if active_task else "A gentle reset"
    st.markdown(
        f"""
        <section class="focus-stage">
          <div class="focus-ring">
            <div class="focus-ring-inner">
              <div>
                <div class="focus-time">{duration}:00</div>
                <div class="metric-label">focus window</div>
              </div>
            </div>
          </div>
          <div style="text-align:center;max-width:720px;margin:0 auto;">
            <div class="eyebrow">Deep focus state</div>
            <h1 style="font-size:clamp(32px,4vw,54px);margin:0 0 12px;">{html(title)}</h1>
            <p class="muted">One thing. One small entry point. You do not need to finish everything to create momentum.</p>
          </div>
        </section>
        """,
        unsafe_allow_html=True,
    )
    c1, c2, c3 = st.columns([1, 1, 1])
    if c1.button("Complete focus session", use_container_width=True):
        finish_focus_session(state, task_id=active_task.id if active_task else "", duration=duration, mood="calm")
        st.session_state.focus_mode = False
        persist_and_rerun(state)
    if c2.button("Log 10-minute start", use_container_width=True):
        finish_focus_session(state, task_id=active_task.id if active_task else "", duration=10, mood="calm")
        st.session_state.focus_mode = False
        persist_and_rerun(state)
    if c3.button("Return to planner", use_container_width=True):
        st.session_state.focus_mode = False
        st.rerun()


def dashboard() -> None:
    hero("Dashboard")
    today_tasks = active_today_tasks()
    all_today = todays_tasks(state, include_completed=True)
    report = current_overload(today_tasks)
    completion = pct(completed_today_count(), len(all_today))
    focus_minutes = total_focus_minutes()
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        metric_card("✓", "Momentum", str(state.reward_points), "Tiny completions, focus reps, and habits.", pct(state.reward_points % 100, 100), "violet")
    with c2:
        metric_card("◐", "Today", f"{completion}%", "Progress without pressure.", completion, "green")
    with c3:
        metric_card("⌁", "Planned load", format_minutes(report["planned_minutes"]), f"Capacity is {format_minutes(report['capacity'])}.", pct(report["planned_minutes"], report["capacity"]), "blue")
    with c4:
        metric_card("◉", "Focus bank", format_minutes(focus_minutes), f"{len(state.focus_sessions)} sessions logged.", pct(focus_minutes % 180, 180), "cyan")

    st.write("")
    glass_note(report["message"], report["level"])
    st.write("")

    if not st.session_state.minimal_mode:
        section_title("Insight engine", "Calm recommendations from your current patterns.", "AI-style guidance")
        insight_cols = st.columns(4)
        for col, (kicker, title, body) in zip(insight_cols, build_insights(today_tasks)):
            with col:
                coach_card(kicker, title, body)

    st.write("")
    col_a, col_b = st.columns([1.15, 0.85])
    with col_a:
        section_title("Today’s protected work", "Keep this list intentionally small.", f"{len(top_three(state))}/3")
        if top_three(state):
            for task in top_three(state):
                render_task(task, "dash_top", compact=st.session_state.minimal_mode)
        else:
            empty_state("Your Top 3 is open.", "Choose one gentle priority or let Smart Plan suggest it.")
        action_cols = st.columns(2)
        if action_cols[0].button("Build realistic plan", use_container_width=True):
            planned = smart_plan_today(state)
            auto_plan_day(state, planned)
            persist_and_rerun(state)
        if action_cols[1].button("Emergency reset", use_container_width=True):
            emergency_reset(state)
            persist_and_rerun(state)
    with col_b:
        brain_dump_widget()
        st.write("")
        habits_widget()

    if not st.session_state.minimal_mode:
        st.write("")
        section_title("Focus atmosphere", "A dedicated state for one next action.")
        focus_panel()


def today_page() -> None:
    hero("Today")
    today_tasks = active_today_tasks()
    report = current_overload(today_tasks)
    action_cols = st.columns(4)
    if action_cols[0].button("Smart plan", use_container_width=True):
        planned = smart_plan_today(state)
        auto_plan_day(state, planned)
        persist_and_rerun(state)
    if action_cols[1].button("Emergency reset", use_container_width=True):
        emergency_reset(state)
        persist_and_rerun(state)
    if action_cols[2].button("10-minute reset", use_container_width=True):
        finish_focus_session(state, duration=10, mood="calm")
        persist_and_rerun(state)
    if action_cols[3].button("Focus mode", use_container_width=True):
        st.session_state.focus_mode = True
        st.rerun()
    st.write("")

    col_a, col_b = st.columns([1.2, 0.8])
    with col_a:
        section_title("Today’s active plan", "Only what belongs in this day.", f"{format_minutes(report['planned_minutes'])}")
        if today_tasks:
            for task in today_tasks:
                render_task(task, "today", compact=st.session_state.minimal_mode)
        else:
            empty_state("Your system is clear today.", "Protect the space. A quiet day is productive too.")
    with col_b:
        glass_note(report["message"], report["level"])
        st.write("")
        energy_widget()
        st.write("")
        time_blocks_widget()


def tasks_page() -> None:
    hero("Tasks")
    col_a, col_b = st.columns([0.86, 1.14])
    with col_a:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        task_form("tasks_form")
        st.markdown("</div>", unsafe_allow_html=True)
    with col_b:
        section_title("Commitment library", "Search gently. Promote only what matters today.", f"{len(state.tasks)} tasks")
        search = st.text_input("Search", placeholder="Search title, tags, category", label_visibility="collapsed")
        f1, f2 = st.columns(2)
        status = f1.selectbox("Status", ["all", "backlog", "not_started", "in_progress", "rescheduled", "completed"])
        priority = f2.selectbox("Priority", ["all", "urgent", "high", "medium", "low"])
        filtered: list[Task] = []
        for task in state.tasks:
            haystack = " ".join([task.title, task.description, task.category, *task.tags]).lower()
            if search.lower() not in haystack:
                continue
            if status != "all" and task.status != status:
                continue
            if priority != "all" and task.priority != priority:
                continue
            filtered.append(task)
        if filtered:
            for task in filtered:
                render_task(task, "tasks", compact=st.session_state.minimal_mode)
        else:
            empty_state("Nothing is asking for attention here.", "Your filters are quiet. Broaden them only if you need to.")


def week_page() -> None:
    hero("Week")
    week_start = date.today()
    days = [(week_start + timedelta(days=offset)).isoformat() for offset in range(7)]
    columns = st.columns(7)
    for day_key, column in zip(days, columns):
        day_tasks = [task for task in state.tasks if task.scheduled_date == day_key and task.status != "completed"]
        minutes = sum(task.estimated_minutes for task in day_tasks)
        level = "overload-high" if minutes > state.preferences.daily_capacity_minutes else "overload-medium" if minutes > state.preferences.daily_capacity_minutes * .8 else ""
        with column:
            st.markdown(
                f"""
                <div class="day-card {level}">
                  <div class="metric-label">{datetime.fromisoformat(day_key).strftime("%a")}</div>
                  <h3 style="margin:6px 0 10px;">{day_key[5:]}</h3>
                  <span class="mini-chip">{format_minutes(minutes)}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if day_tasks:
                for task in day_tasks[:3]:
                    render_task(task, f"week_{day_key}", compact=True)
                if len(day_tasks) > 3:
                    st.caption(f"+ {len(day_tasks) - 3} more")
            else:
                empty_state("Open space", "Leave room for life.")

    st.write("")
    section_title("Quick reschedule", "Move one commitment without reworking the whole week.")
    active = [task for task in state.tasks if task.status != "completed"]
    if active:
        c1, c2, c3 = st.columns([2, 1, 1])
        task_map = {task.title: task for task in active}
        selected = c1.selectbox("Task", list(task_map))
        target = c2.date_input("Move to", value=date.today())
        if c3.button("Move", use_container_width=True):
            reschedule_task(state, task_map[selected].id, target.isoformat())
            persist_and_rerun(state)
    else:
        empty_state("No active tasks to schedule.", "The week has breathing room.")


def insights_page() -> None:
    hero("Insights")
    completed = len([task for task in state.tasks if task.status == "completed"])
    total = len(state.tasks)
    completion = pct(completed, total)
    focus_minutes = total_focus_minutes()
    postponed = len([task for task in state.tasks if task.postponed_count > 0 and task.status != "completed"])
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        metric_card("◇", "Completion", f"{completion}%", f"{completed} of {total} commitments closed.", completion, "green")
    with c2:
        metric_card("◉", "Focus time", format_minutes(focus_minutes), f"{len(state.focus_sessions)} focus sessions.", pct(focus_minutes % 180, 180), "blue")
    with c3:
        metric_card("↻", "Postponed", str(postponed), "Signals friction, not failure.", pct(postponed, max(1, len(state.tasks))), "amber")
    with c4:
        metric_card("⌁", "Check-ins", str(len(state.daily_logs)), "Energy memory points.", pct(len(state.daily_logs), 14), "cyan")

    st.write("")
    section_title("Personal intelligence", "Recommendations that reduce load instead of adding pressure.")
    insight_cols = st.columns(4)
    for col, (kicker, title, body) in zip(insight_cols, build_insights(active_today_tasks())):
        with col:
            coach_card(kicker, title, body)

    st.write("")
    chart_a, chart_b = st.columns(2)
    with chart_a:
        section_title("Focus trend", "Soft view of your recent focus rhythm.")
        st.markdown('<div class="plot-shell">', unsafe_allow_html=True)
        st.plotly_chart(focus_trend_chart(), use_container_width=True, config=plot_config())
        st.markdown("</div>", unsafe_allow_html=True)
    with chart_b:
        section_title("Completion heatmap", "Small wins across the last three weeks.")
        st.markdown('<div class="plot-shell">', unsafe_allow_html=True)
        st.plotly_chart(completion_heatmap(), use_container_width=True, config=plot_config())
        st.markdown("</div>", unsafe_allow_html=True)

    chart_c, chart_d = st.columns([1.2, .8])
    with chart_c:
        section_title("Energy correlation", "Energy check-ins beside focus minutes.")
        st.markdown('<div class="plot-shell">', unsafe_allow_html=True)
        st.plotly_chart(energy_focus_chart(), use_container_width=True, config=plot_config())
        st.markdown("</div>", unsafe_allow_html=True)
    with chart_d:
        section_title("Burnout indicator", "A gentle signal from load, backlog, and postponement.")
        st.markdown('<div class="plot-shell">', unsafe_allow_html=True)
        st.plotly_chart(burnout_gauge(), use_container_width=True, config=plot_config())
        st.markdown("</div>", unsafe_allow_html=True)

    risky = [task for task in state.tasks if task.due_date and task.due_date < today_key() and task.status != "completed"]
    st.write("")
    section_title("Needs a decision", "Overdue work is a decision queue, not a shame queue.")
    if risky:
        for task in risky:
            render_task(task, "risk", compact=True)
    else:
        empty_state("No overdue tasks right now.", "Your system is not carrying hidden pressure here.")


def settings_page() -> None:
    hero("Settings")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        section_title("Planning defaults", "Tune the container before filling it.")
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
        st.markdown("</div>", unsafe_allow_html=True)
    with c2:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        section_title("Backup", "Keep your personal system portable.")
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
        st.markdown("</div>", unsafe_allow_html=True)


def focus_panel() -> None:
    candidate = top_three(state)[0] if top_three(state) else None
    copy = candidate.title if candidate else "A 10-minute reset"
    st.markdown(
        f"""
        <div class="focus-stage" style="min-height:260px;">
          <div style="max-width:760px;">
            <div class="eyebrow">Focus mode</div>
            <h2 style="font-size:34px;margin:0 0 8px;">{html(copy)}</h2>
            <p class="muted">The only goal is to begin cleanly. Finishing is welcome, but starting is the win.</p>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    c1, c2 = st.columns(2)
    if c1.button("Enter focus mode", use_container_width=True):
        st.session_state.focus_mode = True
        st.session_state.focus_task_id = candidate.id if candidate else ""
        st.rerun()
    if c2.button("Log quick win", use_container_width=True):
        finish_focus_session(state, task_id=candidate.id if candidate else "", duration=10, mood="calm")
        persist_and_rerun(state)


def energy_widget() -> None:
    section_title("Energy and mood", "Let the plan respond to your body.")
    log = current_log()
    if not log:
        from momentum_streamlit.services import ensure_today_log

        log = ensure_today_log(state)
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    log.energy_level = st.slider("Energy", 1, 5, log.energy_level)
    log.mood = st.selectbox(
        "Mood",
        ["happy", "calm", "neutral", "stressed", "tired"],
        index=["happy", "calm", "neutral", "stressed", "tired"].index(log.mood),
    )
    mood_color = MOOD_COLOR.get(log.mood, "#64748b")
    st.markdown(
        f'<span class="pill" style="color:{mood_color};border-color:{mood_color}44;background:white;">{html(log.mood)} · {log.energy_level}/5 energy</span>',
        unsafe_allow_html=True,
    )
    if st.button("Save check-in", use_container_width=True):
        persist_and_rerun(state)
    st.markdown("</div>", unsafe_allow_html=True)


def time_blocks_widget() -> None:
    section_title("Time blocks", "A visual container for attention.")
    blocks = [block for block in state.time_blocks if block.date == today_key()]
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    if blocks:
        for block in sorted(blocks, key=lambda item: item.start):
            st.markdown(
                f"""
                <div class="subtask-row">
                  <span class="subtask-dot"></span>
                  <strong>{html(block.start)}-{html(block.end)}</strong>
                  <span>{html(block.title)}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
    else:
        empty_state("No blocks yet.", "Smart Plan can turn your Top 3 into a gentle schedule.")
    st.markdown("</div>", unsafe_allow_html=True)


def brain_dump_widget() -> None:
    section_title("Mental inbox", "Capture thoughts before they steal focus.")
    st.markdown('<div class="mental-inbox">', unsafe_allow_html=True)
    text = st.text_input("Quick capture", placeholder="Drop the thought here", label_visibility="collapsed")
    c1, c2 = st.columns([1, 1])
    if c1.button("Capture", use_container_width=True):
        add_brain_dump(state, text)
        persist_and_rerun(state)
    if c2.button("Capture as task", use_container_width=True):
        item = add_brain_dump(state, text)
        convert_brain_dump_to_task(state, item.id)
        persist_and_rerun(state)
    active = [entry for entry in state.brain_dump if not entry.processed_at][:5]
    if active:
        for item in active:
            st.markdown(
                f'<div class="subtask-row"><span class="subtask-dot"></span>{html(item.text)}</div>',
                unsafe_allow_html=True,
            )
            cc1, cc2 = st.columns(2)
            if cc1.button("Convert", key=f"convert_{item.id}", use_container_width=True):
                convert_brain_dump_to_task(state, item.id)
                persist_and_rerun(state)
            if cc2.button("Clear", key=f"clear_{item.id}", use_container_width=True):
                item.processed_at = today_key()
                persist_and_rerun(state)
    else:
        empty_state("Mental inbox is clear.", "Your attention has one less thing to hold.")
    st.markdown("</div>", unsafe_allow_html=True)


def habits_widget() -> None:
    section_title("Tiny habits", "Consistency without performance pressure.")
    today = today_key()
    for habit in state.habits:
        value = today in habit.completions
        streak = habit_streak(habit.completions)
        st.markdown(
            f"""
            <div class="habit-card">
              <div class="habit-line">
                <div>
                  <div class="habit-name">{html(habit.name)}</div>
                  <div class="muted">{streak} day rhythm</div>
                </div>
                <span class="mini-chip">{'complete' if value else 'open'}</span>
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        checked = st.checkbox("Complete", value=value, key=f"habit_{habit.id}_{today}", label_visibility="collapsed")
        if checked != value:
            toggle_habit(state, habit.id, today)
            persist_and_rerun(state)
    new_habit = st.text_input("New habit", placeholder="Make it tiny")
    if st.button("Add habit", use_container_width=True):
        add_habit(state, new_habit)
        persist_and_rerun(state)


def habit_streak(completions: list[str]) -> int:
    dates = set(completions)
    streak = 0
    for offset in range(365):
        key = (date.today() - timedelta(days=offset)).isoformat()
        if key in dates:
            streak += 1
        elif offset > 0:
            break
    return streak


def load_sample_data(state: AppState) -> None:
    if state.tasks:
        return
    add_task(
        state,
        "Prepare project handoff notes",
        priority="high",
        estimated_minutes=35,
        friction=4,
        is_top_three=True,
        tags=["work"],
        subtasks=["Open notes", "Write outline", "Send draft"],
    )
    add_task(state, "Pay electricity bill", priority="medium", estimated_minutes=10, friction=1, is_top_three=True, tags=["admin"])
    add_task(state, "Clean inbox for 15 minutes", priority="low", estimated_minutes=15, friction=2, tags=["reset"])
    add_brain_dump(state, "Ask about appointment timing")


# ---------------------------------------------------------------------------
# App router
# ---------------------------------------------------------------------------


page = sidebar()
topbar()

if st.session_state.focus_mode:
    focus_mode_page()
elif page == "Dashboard":
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
