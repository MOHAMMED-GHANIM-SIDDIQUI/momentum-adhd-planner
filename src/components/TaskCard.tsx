'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdAdd,
  MdAutoFixHigh,
  MdCheck,
  MdDelete,
  MdDragIndicator,
  MdFlag,
  MdPlayArrow,
  MdStar,
  MdToday,
} from 'react-icons/md';
import { formatMinutes } from '@/lib/dates';
import { useDailyLogStore } from '@/store/dailyLogStore';
import { useFocusStore } from '@/store/focusStore';
import { usePlannerStore } from '@/store/plannerStore';
import { Task, useTaskStore } from '@/store/taskStore';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (id: string) => void;
  onDrop?: (id: string) => void;
}

const priorityClasses = {
  urgent: 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200',
  high: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200',
  medium: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200',
  low: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200',
};

export default function TaskCard({
  task,
  compact = false,
  draggable = false,
  onDragStart,
  onDrop,
}: TaskCardProps) {
  const completeTask = useTaskStore((state) => state.completeTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const startTask = useTaskStore((state) => state.startTask);
  const snoozeTask = useTaskStore((state) => state.snoozeTask);
  const breakDownTask = useTaskStore((state) => state.breakDownTask);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const addSubtask = useTaskStore((state) => state.addSubtask);
  const markTopThree = useTaskStore((state) => state.markTopThree);
  const startSession = useFocusStore((state) => state.startSession);
  const awardPoints = usePlannerStore((state) => state.awardPoints);
  const incrementTasksCompleted = useDailyLogStore((state) => state.incrementTasksCompleted);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
  const subtaskProgress = task.subtasks.length
    ? Math.round((completedSubtasks / task.subtasks.length) * 100)
    : 0;

  const handleComplete = () => {
    completeTask(task.id);
    awardPoints(task.rewardPoints ?? 10);
    incrementTasksCompleted();
  };

  const handleStartFocus = () => {
    startTask(task.id);
    startSession(task.id, Math.min(task.estimatedMinutes ?? 25, 45), 'focus');
  };

  const handleAddSubtask = (event: FormEvent) => {
    event.preventDefault();
    addSubtask(task.id, subtaskTitle);
    setSubtaskTitle('');
  };

  return (
    <motion.article
      layout
      draggable={draggable}
      onDragStart={() => onDragStart?.(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop?.(task.id)}
      className={`rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
        task.status === 'completed' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {draggable && (
          <MdDragIndicator className="mt-1 shrink-0 cursor-grab text-xl text-slate-300" />
        )}
        <button
          type="button"
          onClick={handleComplete}
          disabled={task.status === 'completed'}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:hover:bg-emerald-950"
          title="Complete task"
        >
          <MdCheck />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`break-words text-base font-semibold text-slate-950 dark:text-white ${
                task.status === 'completed' ? 'line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            <button
              type="button"
              onClick={() => markTopThree(task.id)}
              className={`rounded-full p-1 transition ${
                task.isTopThree
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950'
                  : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-800'
              }`}
              title="Toggle Top 3"
            >
              <MdStar />
            </button>
          </div>

          {task.description && !compact && (
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <span className={`rounded-full border px-2.5 py-1 ${priorityClasses[task.priority]}`}>
              <MdFlag className="mr-1 inline" />
              {task.priority}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {formatMinutes(task.estimatedMinutes ?? 25)}
            </span>
            {task.scheduledDate && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
                <MdToday className="mr-1 inline" />
                {task.scheduledDate}
              </span>
            )}
            {task.category && (
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
                {task.category}
              </span>
            )}
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {task.subtasks.length > 0 && !compact && (
            <div className="mt-4 space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
              {task.subtasks.map((subtask) => (
                <label
                  key={subtask.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(task.id, subtask.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={subtask.completed ? 'line-through opacity-60' : ''}>
                    {subtask.title}
                  </span>
                </label>
              ))}
            </div>
          )}

          {!compact && (
            <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
              <input
                value={subtaskTitle}
                onChange={(event) => setSubtaskTitle(event.target.value)}
                placeholder="Add one small step"
                className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950"
                title="Add subtask"
              >
                <MdAdd />
              </button>
            </form>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={handleStartFocus}
            className="rounded-md bg-blue-600 p-2 text-white transition hover:bg-blue-700"
            title="Start focus session"
          >
            <MdPlayArrow />
          </button>
          <button
            type="button"
            onClick={() => breakDownTask(task.id)}
            className="rounded-md bg-violet-50 p-2 text-violet-600 transition hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200"
            title="Break into micro-steps"
          >
            <MdAutoFixHigh />
          </button>
          <button
            type="button"
            onClick={() => snoozeTask(task.id)}
            className="rounded-md bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            title="Snooze to tomorrow"
          >
            <MdToday />
          </button>
          <button
            type="button"
            onClick={() => deleteTask(task.id)}
            className="rounded-md bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
            title="Delete"
          >
            <MdDelete />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
