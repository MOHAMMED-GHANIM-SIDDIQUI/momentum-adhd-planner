'use client';

import { MdLocalFireDepartment } from 'react-icons/md';
import { getWeekDays, toDateKey } from '@/lib/dates';
import { FocusSession } from '@/store/focusStore';

export default function StreakWidget({ sessions }: { sessions: FocusSession[] }) {
  const streak = calculateStreak(sessions);
  const week = getWeekDays();

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
          Motivation loop
        </p>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
          <MdLocalFireDepartment className="text-rose-500" /> Focus streak
        </h2>
      </div>

      <div className="rounded-lg bg-rose-50 p-5 text-center text-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
        <p className="text-5xl font-black">{streak}</p>
        <p className="mt-1 text-sm font-semibold">day focus streak</p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {week.map((day) => {
          const dateKey = toDateKey(day);
          const hasSession = sessions.some(
            (session) => session.completed && session.startedAt.startsWith(dateKey)
          );
          return (
            <div
              key={dateKey}
              className={`rounded-md py-2 text-center text-xs font-bold ${
                hasSession
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
              title={dateKey}
            >
              {day.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calculateStreak(sessions: FocusSession[]): number {
  if (!sessions.length) return 0;

  let streak = 0;
  const today = new Date();

  for (let index = 0; index < 365; index += 1) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - index);
    const dateKey = toDateKey(checkDate);
    const hasSession = sessions.some(
      (session) => session.completed && session.startedAt.startsWith(dateKey)
    );

    if (hasSession) {
      streak += 1;
    } else if (index > 0) {
      break;
    }
  }

  return streak;
}
