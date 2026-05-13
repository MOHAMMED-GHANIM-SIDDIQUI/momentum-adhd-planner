'use client';

import { useMemo, useState } from 'react';
import { MdSearch, MdTaskAlt } from 'react-icons/md';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Priority, TaskStatus, useTaskStore } from '@/store/taskStore';

type StatusFilter = 'all' | TaskStatus;
type PriorityFilter = 'all' | Priority;

export default function TasksPage() {
  const tasks = useTaskStore((state) => state.getTasks());
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = [task.title, task.description, task.category, ...task.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = status === 'all' || task.status === status;
      const matchesPriority = priority === 'all' || task.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priority, search, status, tasks]);

  const handleDrop = (targetId: string) => {
    if (!draggedTask || draggedTask === targetId) return;
    reorderTasks(draggedTask, targetId);
    setDraggedTask(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
          Task system
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
          <MdTaskAlt /> All tasks
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Keep every commitment visible, but only pull a realistic set into today.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <TaskForm />
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="relative">
                <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, tags, categories"
                  className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="all">All status</option>
                <option value="backlog">Backlog</option>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as PriorityFilter)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="all">All priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                draggable
                onDragStart={setDraggedTask}
                onDrop={handleDrop}
              />
            ))}

            {!filteredTasks.length && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                Nothing matches these filters.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
