'use client';

import { MdStar } from 'react-icons/md';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/store/taskStore';

export default function TopThreeWidget({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
            Protected focus
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <MdStar className="text-amber-500" /> Top 3 today
          </h2>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          {tasks.length}/3
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Add a task or run Smart Plan to choose a realistic Top 3.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} compact />
          ))}
        </div>
      )}
    </div>
  );
}
