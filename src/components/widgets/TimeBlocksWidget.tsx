'use client';

import { FormEvent, useState } from 'react';
import { MdAdd, MdDelete, MdEvent } from 'react-icons/md';
import { minutesBetween, toDateKey } from '@/lib/dates';
import { usePlannerStore } from '@/store/plannerStore';
import { useTaskStore } from '@/store/taskStore';

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-100',
  amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-100',
  rose: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-100',
  slate: 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
  violet: 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950/30 dark:border-violet-900 dark:text-violet-100',
};

export default function TimeBlocksWidget() {
  const timeBlocks = usePlannerStore((state) => state.timeBlocks);
  const addTimeBlock = usePlannerStore((state) => state.addTimeBlock);
  const deleteTimeBlock = usePlannerStore((state) => state.deleteTimeBlock);
  const autoPlanDay = usePlannerStore((state) => state.autoPlanDay);
  const tasks = useTaskStore((state) => state.getTopThree());
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('14:25');

  const todayBlocks = timeBlocks
    .filter((block) => block.date === toDateKey())
    .sort((a, b) => a.start.localeCompare(b.start));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    addTimeBlock({
      date: toDateKey(),
      title,
      start,
      end,
      type: 'focus',
      color: 'violet',
    });
    setTitle('');
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-300">
            Calendar
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <MdEvent /> Time blocks
          </h2>
        </div>
        <button
          type="button"
          onClick={() => autoPlanDay(toDateKey(), tasks)}
          className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-200"
        >
          Auto-plan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Block title"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950"
        />
        <input
          type="time"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950"
        />
        <input
          type="time"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-cyan-600 px-3 py-2 text-white transition hover:bg-cyan-700"
          title="Add block"
        >
          <MdAdd />
        </button>
      </form>

      {todayBlocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No blocks yet. Auto-plan can convert your Top 3 into a gentle schedule.
        </div>
      ) : (
        <div className="space-y-2">
          {todayBlocks.map((block) => (
            <div
              key={block.id}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                colorClasses[block.color as keyof typeof colorClasses] ?? colorClasses.slate
              }`}
            >
              <div className="w-24 shrink-0 text-sm font-bold tabular-nums">
                {block.start}
                <span className="block text-xs font-medium opacity-70">{block.end}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{block.title}</p>
                <p className="text-xs opacity-70">
                  {Math.max(0, minutesBetween(block.start, block.end))} minutes
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteTimeBlock(block.id)}
                className="rounded p-2 opacity-60 transition hover:bg-white/60 hover:opacity-100 dark:hover:bg-slate-900/50"
                title="Delete block"
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
