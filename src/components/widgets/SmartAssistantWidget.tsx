'use client';

import { MdAutoAwesome, MdEmergency, MdLightbulb, MdSchedule } from 'react-icons/md';
import { addDays, addMinutesToClock, formatMinutes, toDateKey } from '@/lib/dates';
import { getCoachSuggestions, getOverloadReport } from '@/lib/productivity';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useTaskStore } from '@/store/taskStore';

export default function SmartAssistantWidget() {
  const todaysTasks = useTaskStore((state) => state.getTodaysTasks());
  const topThree = useTaskStore((state) => state.getTopThree());
  const smartPlanToday = useTaskStore((state) => state.smartPlanToday);
  const bulkReschedule = useTaskStore((state) => state.bulkReschedule);
  const breakDownTask = useTaskStore((state) => state.breakDownTask);
  const todayLog = useDailyLogStore((state) => state.getTodayLog());
  const preferences = usePlannerStore((state) => state.preferences);
  const autoPlanDay = usePlannerStore((state) => state.autoPlanDay);
  const addTimeBlock = usePlannerStore((state) => state.addTimeBlock);
  const awardPoints = usePlannerStore((state) => state.awardPoints);

  const overload = getOverloadReport(todaysTasks, preferences.dailyCapacityMinutes, todayLog);
  const suggestions = getCoachSuggestions(todaysTasks, todayLog, preferences.dailyCapacityMinutes);
  const hardTask = todaysTasks.find((task) => (task.friction ?? 3) >= 4 && task.subtasks.length === 0);

  const runSmartPlan = () => {
    const planned = smartPlanToday(preferences.dailyCapacityMinutes);
    autoPlanDay(toDateKey(), planned);
    awardPoints(5);
  };

  const emergencyReset = () => {
    const protectedIds = new Set(topThree.map((task) => task.id));
    const moveIds = todaysTasks
      .filter((task) => !protectedIds.has(task.id))
      .slice(0, Math.max(0, todaysTasks.length - 3))
      .map((task) => task.id);

    if (moveIds.length) bulkReschedule(moveIds, addDays(toDateKey(), 1));

    const now = new Date();
    const start = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    addTimeBlock({
      date: toDateKey(),
      title: 'Emergency reset',
      start,
      end: addMinutesToClock(start, 15),
      type: 'reset',
      color: 'rose',
    });
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
            Smart companion
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-950 dark:text-white">
            <MdAutoAwesome className="text-violet-500" /> Today feels {overload.level}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {overload.message}
          </p>
        </div>
        <div className="rounded-lg bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
            Planned
          </p>
          <p className="text-xl font-black">
            {formatMinutes(overload.plannedMinutes)} / {formatMinutes(overload.capacity)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            <MdLightbulb className="mb-2 text-lg text-amber-500" />
            {suggestion}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runSmartPlan}
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          <MdSchedule /> Build realistic plan
        </button>
        <button
          type="button"
          onClick={emergencyReset}
          className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <MdEmergency /> Emergency reset
        </button>
        {hardTask && (
          <button
            type="button"
            onClick={() => breakDownTask(hardTask.id)}
            className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-4 py-2 font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <MdAutoAwesome /> Break down hard task
          </button>
        )}
      </div>
    </div>
  );
}
