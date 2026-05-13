'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPause, MdPlayArrow, MdReplay, MdStop } from 'react-icons/md';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useFocusStore } from '@/store/focusStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useTaskStore } from '@/store/taskStore';

export default function PomodoroWidget() {
  const {
    currentSession,
    isActive,
    isPaused,
    timeRemaining,
    startSession,
    pauseSession,
    resumeSession,
    tick,
    endSession,
    cancelSession,
  } = useFocusStore();
  const preferences = usePlannerStore((state) => state.preferences);
  const awardPoints = usePlannerStore((state) => state.awardPoints);
  const addFocusMinutes = useDailyLogStore((state) => state.addFocusMinutes);
  const tasks = useTaskStore((state) => state.getTodaysTasks());
  const activeTask = tasks.find((task) => task.id === currentSession?.taskId) ?? tasks[0];

  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = window.setInterval(() => {
      const finished = tick();
      if (finished?.completed) {
        addFocusMinutes(finished.duration);
        awardPoints(15);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus session complete', {
            body: 'Nice work. Take a real break before the next push.',
          });
        }
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [addFocusMinutes, awardPoints, isActive, isPaused, tick]);

  const totalSeconds = (currentSession?.duration ?? preferences.focusMinutes) * 60;
  const progress = currentSession ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const handleDone = () => {
    const finished = endSession('calm', true);
    if (finished) {
      addFocusMinutes(finished.duration);
      awardPoints(15);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
          Focus mode
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
          Gentle timer
        </h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative mb-5 h-44 w-44">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="78"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100 dark:text-slate-800"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="78"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="8"
              className="text-blue-600"
              strokeDasharray="490"
              animate={{ strokeDashoffset: 490 - 490 * (progress / 100) }}
              transition={{ duration: 0.4 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold tabular-nums text-slate-950 dark:text-white">
              {currentSession
                ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                : `${preferences.focusMinutes}:00`}
            </p>
            <p className="mt-1 max-w-[130px] truncate text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {currentSession ? currentSession.mode.replace('_', ' ') : 'ready when you are'}
            </p>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 min-h-[40px] text-center text-sm text-slate-600 dark:text-slate-300">
          {activeTask
            ? `Suggested focus: ${activeTask.title}`
            : 'No task required. A clean 10-minute reset counts too.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {!currentSession && (
            <>
              <button
                type="button"
                onClick={() => startSession(activeTask?.id, preferences.focusMinutes, 'focus')}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                <MdPlayArrow /> Start
              </button>
              <button
                type="button"
                onClick={() => startSession(activeTask?.id, 10, 'quick_win')}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
              >
                <MdReplay /> 10m win
              </button>
            </>
          )}

          {currentSession && (
            <>
              <button
                type="button"
                onClick={isPaused ? resumeSession : pauseSession}
                className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                {isPaused ? <MdPlayArrow /> : <MdPause />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
              >
                Done
              </button>
              <button
                type="button"
                onClick={cancelSession}
                className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
              >
                <MdStop /> Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
