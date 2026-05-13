'use client';

import { MdCalendarMonth } from 'react-icons/md';
import TaskCard from '@/components/TaskCard';
import { formatShortDate, getWeekDays, toDateKey } from '@/lib/dates';
import { useTaskStore } from '@/store/taskStore';

export default function WeekPage() {
  const tasks = useTaskStore((state) => state.getTasks());
  const rescheduleTask = useTaskStore((state) => state.rescheduleTask);
  const week = getWeekDays();
  const backlog = tasks.filter((task) => task.status !== 'completed' && !task.scheduledDate).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
          Weekly planning
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
          <MdCalendarMonth /> Week map
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Spread work across the week before today becomes a pile-up.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {week.map((day) => {
            const dateKey = toDateKey(day);
            const dayTasks = tasks.filter((task) => task.scheduledDate === dateKey);
            return (
              <div
                key={dateKey}
                className="min-h-[280px] rounded-lg border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const taskId = event.dataTransfer.getData('text/plain');
                  if (taskId) rescheduleTask(taskId, dateKey);
                }}
              >
                <div className="mb-3">
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  <p className="text-xs font-medium text-slate-500">{formatShortDate(dateKey)}</p>
                </div>
                <div className="space-y-2">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
                    >
                      <TaskCard task={task} compact />
                    </div>
                  ))}
                  {!dayTasks.length && (
                    <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                      Open
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <aside className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Drag into week
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Backlog</h2>
          <div className="mt-4 space-y-2">
            {backlog.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', task.id)}
              >
                <TaskCard task={task} compact />
              </div>
            ))}
            {!backlog.length && (
              <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                No unscheduled backlog items.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
