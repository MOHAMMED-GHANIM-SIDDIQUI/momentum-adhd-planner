'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdAdd, MdAutoAwesome, MdEmergency, MdToday } from 'react-icons/md';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import EnergyTrackerWidget from '@/components/widgets/EnergyTrackerWidget';
import SmartAssistantWidget from '@/components/widgets/SmartAssistantWidget';
import TimeBlocksWidget from '@/components/widgets/TimeBlocksWidget';
import { addDays, toDateKey } from '@/lib/dates';
import { getOverloadReport } from '@/lib/productivity';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useTaskStore } from '@/store/taskStore';

export default function TodayPage() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const todaysTasks = useTaskStore((state) => state.getTodaysTasks());
  const allTodayTasks = useTaskStore((state) => state.getTodaysTasks(true));
  const topThree = useTaskStore((state) => state.getTopThree());
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const bulkReschedule = useTaskStore((state) => state.bulkReschedule);
  const smartPlanToday = useTaskStore((state) => state.smartPlanToday);
  const autoPlanDay = usePlannerStore((state) => state.autoPlanDay);
  const preferences = usePlannerStore((state) => state.preferences);
  const todayLog = useDailyLogStore((state) => state.getTodayLog());

  const completed = allTodayTasks.filter((task) => task.status === 'completed').length;
  const completionRate = allTodayTasks.length
    ? Math.round((completed / allTodayTasks.length) * 100)
    : 0;
  const overload = getOverloadReport(todaysTasks, preferences.dailyCapacityMinutes, todayLog);

  const handleDrop = (targetId: string) => {
    if (!draggedTask || draggedTask === targetId) return;
    reorderTasks(draggedTask, targetId);
    setDraggedTask(null);
  };

  const runSmartPlan = () => {
    const planned = smartPlanToday(preferences.dailyCapacityMinutes);
    autoPlanDay(toDateKey(), planned);
  };

  const resetDay = () => {
    const protectedIds = new Set(topThree.map((task) => task.id));
    const moveIds = todaysTasks
      .filter((task) => !protectedIds.has(task.id))
      .map((task) => task.id);
    if (moveIds.length) bulkReschedule(moveIds, addDays(toDateKey(), 1));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Daily planner
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
              <MdToday /> Today
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Keep the list small enough to trust. Anything extra can wait without shame.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <MdAdd /> Add task
            </button>
            <button
              type="button"
              onClick={runSmartPlan}
              className="inline-flex items-center gap-2 rounded-md bg-violet-50 px-4 py-3 font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-200"
            >
              <MdAutoAwesome /> Smart plan
            </button>
            <button
              type="button"
              onClick={resetDay}
              className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <MdEmergency /> Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
              Complete
            </p>
            <p className="mt-2 text-3xl font-black">{completionRate}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20 dark:bg-slate-200">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
          <div
            className={`rounded-lg p-4 lg:col-span-2 ${
              overload.level === 'high'
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-100'
                : overload.level === 'medium'
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
            }`}
          >
            <p className="font-bold">Capacity check</p>
            <p className="mt-1 text-sm leading-6">{overload.message}</p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
          >
            <div className="mx-auto max-w-3xl py-8">
              <TaskForm onClose={() => setShowTaskForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          {todaysTasks.length ? (
            todaysTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                draggable
                onDragStart={setDraggedTask}
                onDrop={handleDrop}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              No active tasks for today. That is allowed.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
            <EnergyTrackerWidget />
          </section>
          <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
            <TimeBlocksWidget />
          </section>
        </aside>
      </div>

      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <SmartAssistantWidget />
      </section>
    </div>
  );
}
