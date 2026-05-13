'use client';

import { getWeekDays, toDateKey } from '@/lib/dates';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useFocusStore } from '@/store/focusStore';
import { useTaskStore } from '@/store/taskStore';

export default function WeeklyProgressWidget() {
  const logs = useDailyLogStore((state) => state.getLastWeekLogs());
  const sessions = useFocusStore((state) => state.sessions);
  const tasks = useTaskStore((state) => state.tasks);
  const week = getWeekDays();

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
          Pattern memory
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
          Weekly progress
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {week.map((day) => {
          const dateKey = toDateKey(day);
          const log = logs.find((entry) => entry.date === dateKey);
          const completedTasks = tasks.filter((task) => task.completedAt?.startsWith(dateKey)).length;
          const focusMinutes = sessions
            .filter((session) => session.completed && session.startedAt.startsWith(dateKey))
            .reduce((total, session) => total + session.duration, 0);
          const height = Math.min(100, 18 + completedTasks * 18 + focusMinutes / 2);

          return (
            <div key={dateKey} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-md bg-slate-100 p-1 dark:bg-slate-800">
                <div
                  className="w-full rounded bg-indigo-500 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${completedTasks} tasks, ${focusMinutes} focus minutes`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {day.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}
              </span>
              <span className="text-[11px] text-slate-400">{log?.energyLevel ?? '-'}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Bars combine finished tasks and focus minutes. The number below each day is your
        energy rating, so patterns become visible over time.
      </p>
    </div>
  );
}
