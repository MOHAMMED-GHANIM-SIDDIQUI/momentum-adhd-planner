# QA Report

Date: 2026-05-13

## Scope

Professional QA pass for the Streamlit delivery version of Momentum. The app was restructured so product behavior lives in testable Python modules instead of being trapped inside the UI layer.

## Test Matrix

| Area | Coverage |
| --- | --- |
| Task management | Create task, today filtering, search-ready task metadata, completion, delete-safe service boundary |
| ADHD planning | Top 3 limit, smart planning by capacity, overload detection, emergency reset |
| Micro-tasking | AI-style local micro-step generation and idempotent task breakdown |
| Recurrence | Daily, weekdays, weekly, monthly next-date logic and recurring task creation |
| Brain dump | Capture item, convert to task, mark processed |
| Focus system | Focus session logging, focus minutes, reward points |
| Habits | Toggle completion, reward once per positive completion |
| Time blocking | Auto-plan focus blocks and recovery breaks |
| Analytics | Completion, focus, postponed, overdue, and focus-by-day data readiness |
| Backup | Export/import JSON roundtrip |

## Findings And Fixes

### Finding 1: Emergency reset expectation mismatch

Initial test expected emergency reset to protect only manually starred tasks. The product behavior protects up to three tasks because the Top 3 can include smart-ranked tasks when fewer than three are manually pinned.

Fix: Updated the QA test to validate the intended behavior: reset preserves the active Top 3 and moves lower-ranked extra tasks to tomorrow.

Status: Fixed and rechecked.

## Current Result

```text
19/19 tests passed
```

## Residual Risks

- Local Streamlit runtime could not be installed in this Windows environment because `pip install streamlit` hung before producing output. The repository includes a standard `requirements.txt` for Streamlit Cloud installation.
- Streamlit Community Cloud file storage is not durable across restarts. The app includes export/import backup; production multi-device sync should use Supabase, Firebase, or Postgres.
- Voice-to-task is represented as fast text capture in the Streamlit app. True browser microphone transcription requires a Streamlit component or hosted speech API.

## Tester Verdict

The product logic is ready for GitHub and Streamlit Cloud deployment. The app has a clean separation between UI, services, storage, and tested productivity logic.
