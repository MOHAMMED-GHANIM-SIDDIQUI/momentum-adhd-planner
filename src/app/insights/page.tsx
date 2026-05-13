'use client';

import { MdBolt, MdInsights, MdRepeat, MdTimer } from 'react-icons/md';
import WeeklyProgressWidget from '@/components/widgets/WeeklyProgressWidget';
import { formatMinutes } from '@/lib/dates';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useFocusStore } from '@/store/focusStore';
import { useTaskStore } from '@/store/taskStore';

export default function InsightsPage() {
  const tasks = useTaskStore((state) => state.getTasks());
  const overdueTasks = useTaskStore((state) => state.getOverdueTasks());
  const sessions = useFocusStore((state) => state.getSessions());
  const totalFocusTime = useFocusStore((state) => state.getTotalFocusTime());
  const averageEnergy = useDailyLogStore((state) => state.getAverageEnergy());
  const logs = useDailyLogStore((state) => state.getLogs());

  const completed = tasks.filter((task) => task.status === 'completed').length;
  const active = tasks.filter((task) => task.status !== 'completed').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const postponed = tasks.filter((task) => task.postponedCount > 0).length;
  const recurring = tasks.filter((task) => task.recurrence && task.recurrence !== 'none').length;

  const stats = [
    {
      label: 'Completion',
      value: `${completionRate}%`,
      detail: `${completed} of ${tasks.length} tasks`,
      icon: MdInsights,
      tone: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-100',
    },
    {
      label: 'Focus time',
      value: formatMinutes(totalFocusTime),
      detail: `${sessions.length} sessions logged`,
      icon: MdTimer,
      tone: 'bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-100',
    },
    {
      label: 'Average energy',
      value: averageEnergy.toFixed(1),
      detail: `${logs.length} daily check-ins`,
      icon: MdBolt,
      tone: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100',
    },
    {
      label: 'Recurring',
      value: recurring,
      detail: `${postponed} postponed tasks`,
      icon: MdRepeat,
      tone: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
    },
  ];

  const coaching =
    overdueTasks.length > 0
      ? 'Overdue tasks are decisions, not character flaws. Decide whether each one still matters.'
      : active > 12
      ? 'Your backlog is getting loud. Promote fewer tasks into today and archive stale ones.'
      : completionRate >= 70
      ? 'Your system is producing follow-through. Keep capacity realistic.'
      : 'Look for friction, not failure. Break down the tasks that never seem to start.';

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
          Personal memory
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
          <MdInsights /> Insights
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Patterns help the planner adapt: energy, focus duration, postponement, and capacity.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <section key={stat.label} className={`rounded-lg p-5 ${stat.tone}`}>
              <Icon className="text-2xl" />
              <p className="mt-4 text-3xl font-black">{stat.value}</p>
              <p className="font-semibold">{stat.label}</p>
              <p className="mt-1 text-sm opacity-70">{stat.detail}</p>
            </section>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <WeeklyProgressWidget />
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
              Coach readout
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              What the pattern suggests
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {coaching}
            </p>
          </div>

          <div className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Risk queue
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              Needs a decision
            </h2>
            <div className="mt-4 space-y-2">
              {overdueTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-800 dark:bg-rose-950/30 dark:text-rose-100"
                >
                  {task.title}
                </div>
              ))}
              {!overdueTasks.length && (
                <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                  No overdue tasks right now.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
