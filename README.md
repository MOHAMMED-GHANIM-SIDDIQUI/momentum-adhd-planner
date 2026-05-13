# Momentum ADHD Planner

Momentum is a calm personal productivity system for people who need realistic planning, not another guilt-driven task list. The repository contains the original Next.js build and a production-ready Streamlit implementation for fast deployment.

## Streamlit App

Primary deploy target:

```bash
streamlit run streamlit_app.py
```

The Streamlit app includes:

- Dashboard with overload guard, coach suggestions, Top 3 tasks, brain dump, habits, and rewards
- Daily planner with smart planning, emergency reset, focus logging, time blocks, and energy check-ins
- Task system with priorities, tags, categories, subtasks, recurrence, snoozing, search, filters, and Top 3 protection
- Weekly planning board with quick rescheduling
- Insights for completion, focus time, postponement, overdue tasks, and daily patterns
- Settings for capacity, focus length, breaks, backup export, and backup import

## ADHD-Friendly Product Principles

- Prevent overwhelm by protecting a realistic Top 3
- Reduce task-switching chaos with time blocks and focus logging
- Lower activation energy through micro-step breakdown
- Support chaotic days with emergency reset
- Track energy and mood so the plan adapts to the person, not the other way around
- Reward consistency without punishment or streak shame

## Project Structure

```text
momentum/
  streamlit_app.py              # Streamlit UI entrypoint
  momentum_streamlit/
    models.py                   # Data models
    productivity.py             # Scoring, overload, recurrence, suggestions
    services.py                 # App actions and state transitions
    storage.py                  # Local JSON persistence and backup helpers
  tests/                        # Functional QA tests
  run_tests.py                  # Standard-library test runner
  requirements.txt              # Streamlit Cloud dependencies
  .streamlit/config.toml        # Streamlit theme
  src/                          # Original Next.js app
```

## Testing

The core product behavior is tested without requiring Streamlit to be installed:

```bash
python run_tests.py
```

Current QA result:

```text
19/19 tests passed
```

Coverage includes task creation, filtering, Top 3 limits, micro-task breakdown, recurring task generation, smart planning, emergency reset, brain dump conversion, habit rewards, focus logging, overload detection, coach suggestions, and backup roundtrip.

## Deployment On Streamlit Community Cloud

1. Push this repository to GitHub.
2. Open Streamlit Community Cloud.
3. Create a new app from the GitHub repository.
4. Set the main file path to:

```text
streamlit_app.py
```

5. Deploy.

The app persists local data to `data/momentum_state.json` when run locally. On Streamlit Community Cloud, file persistence can reset when the app restarts, so use the built-in backup export/import for personal data portability. For long-term multi-device sync, add Supabase, Firebase, or Postgres behind the service layer.

## Original Next.js App

The original app remains available:

```bash
npm install
npm run dev
npm run build
```

The Streamlit implementation is the recommended deployment path for this request.
