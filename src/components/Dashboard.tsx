'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdAdd, MdClose, MdTune } from 'react-icons/md';
import { getOverloadReport } from '@/lib/productivity';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { DashboardWidget, usePlannerStore } from '@/store/plannerStore';
import { useFocusStore } from '@/store/focusStore';
import { useTaskStore } from '@/store/taskStore';
import BrainDumpWidget from './widgets/BrainDumpWidget';
import EnergyTrackerWidget from './widgets/EnergyTrackerWidget';
import HabitTrackerWidget from './widgets/HabitTrackerWidget';
import NotesWidget from './widgets/NotesWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import QuickStatsWidget from './widgets/QuickStatsWidget';
import RewardWidget from './widgets/RewardWidget';
import SmartAssistantWidget from './widgets/SmartAssistantWidget';
import StreakWidget from './widgets/StreakWidget';
import TimeBlocksWidget from './widgets/TimeBlocksWidget';
import TopThreeWidget from './widgets/TopThreeWidget';
import WeeklyProgressWidget from './widgets/WeeklyProgressWidget';
import WidgetFrame from './widgets/WidgetFrame';
import TaskForm from './TaskForm';

export default function Dashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget['id'] | null>(null);
  const tasksToday = useTaskStore((state) => state.getTodaysTasks());
  const tasksTodayWithCompleted = useTaskStore((state) => state.getTodaysTasks(true));
  const topThree = useTaskStore((state) => state.getTopThree());
  const sessions = useFocusStore((state) => state.getSessions());
  const todayFocusTime = useFocusStore((state) => state.getTodayFocusTime());
  const totalFocusTime = useFocusStore((state) => state.getTotalFocusTime());
  const todayLog = useDailyLogStore((state) => state.getTodayLog());
  const preferences = usePlannerStore((state) => state.preferences);
  const widgets = usePlannerStore((state) => state.widgets);
  const reorderWidgets = usePlannerStore((state) => state.reorderWidgets);
  const resizeWidget = usePlannerStore((state) => state.resizeWidget);
  const toggleWidget = usePlannerStore((state) => state.toggleWidget);

  const completedToday = tasksTodayWithCompleted.filter((task) => task.status === 'completed').length;
  const overload = getOverloadReport(tasksToday, preferences.dailyCapacityMinutes, todayLog);
  const visibleWidgets = widgets
    .filter((widget) => widget.visible)
    .sort((a, b) => a.order - b.order);

  const widgetContent = (id: DashboardWidget['id']) => {
    switch (id) {
      case 'assistant':
        return <SmartAssistantWidget />;
      case 'top3':
        return <TopThreeWidget tasks={topThree} />;
      case 'focus':
        return <PomodoroWidget />;
      case 'timeblocks':
        return <TimeBlocksWidget />;
      case 'energy':
        return <EnergyTrackerWidget />;
      case 'habits':
        return <HabitTrackerWidget />;
      case 'braindump':
        return <BrainDumpWidget />;
      case 'weekly':
        return <WeeklyProgressWidget />;
      case 'streak':
        return <StreakWidget sessions={sessions} />;
      case 'rewards':
        return <RewardWidget />;
      case 'notes':
        return <NotesWidget />;
      default:
        return null;
    }
  };

  const handleWidgetDrop = (targetId: DashboardWidget['id']) => {
    if (!draggedWidget || draggedWidget === targetId) return;
    reorderWidgets(draggedWidget, targetId);
    setDraggedWidget(null);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Daily command center
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Build enough momentum for today.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              A realistic plan beats a perfect backlog. Momentum protects the Top 3, catches
              loose thoughts, and helps you recover when the day gets noisy.
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
              onClick={() => setShowCustomize((value) => !value)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <MdTune /> Widgets
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1.3fr]">
          <div
            className={`rounded-lg p-4 ${
              overload.level === 'high'
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-100'
                : overload.level === 'medium'
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100'
            }`}
          >
            <p className="text-sm font-bold">Overwhelm guard</p>
            <p className="mt-1 text-sm leading-6">{overload.message}</p>
          </div>
          <QuickStatsWidget
            completedToday={completedToday}
            focusTime={todayFocusTime || totalFocusTime}
            sessions={sessions.length}
          />
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

      <AnimatePresence>
        {showCustomize && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-950 dark:text-white">Dashboard widgets</h2>
              <button
                type="button"
                onClick={() => setShowCustomize(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MdClose />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...widgets]
                .sort((a, b) => a.order - b.order)
                .map((widget) => (
                  <button
                    key={widget.id}
                    type="button"
                    onClick={() => toggleWidget(widget.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      widget.visible
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {widget.title}
                  </button>
                ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {visibleWidgets.map((widget) => (
          <WidgetFrame
            key={widget.id}
            widget={widget}
            onResize={resizeWidget}
            onDragStart={setDraggedWidget}
            onDrop={handleWidgetDrop}
          >
            {widgetContent(widget.id)}
          </WidgetFrame>
        ))}
      </div>
    </div>
  );
}
