'use client';

import { FormEvent, useState } from 'react';
import { MdAdd, MdCheckCircle, MdDelete } from 'react-icons/md';
import { toDateKey } from '@/lib/dates';
import { usePlannerStore } from '@/store/plannerStore';

export default function HabitTrackerWidget() {
  const habits = usePlannerStore((state) => state.habits);
  const addHabit = usePlannerStore((state) => state.addHabit);
  const deleteHabit = usePlannerStore((state) => state.deleteHabit);
  const toggleHabit = usePlannerStore((state) => state.toggleHabit);
  const awardPoints = usePlannerStore((state) => state.awardPoints);
  const [name, setName] = useState('');
  const today = toDateKey();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addHabit(name);
    setName('');
  };

  const toggle = (id: string, completed: boolean) => {
    toggleHabit(id, today);
    if (!completed) awardPoints(3);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
          Consistency
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
          Tiny habits
        </h2>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const completed = habit.completions.includes(today);
          return (
            <div
              key={habit.id}
              className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-950"
            >
              <button
                type="button"
                onClick={() => toggle(habit.id, completed)}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                  completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-slate-300 hover:text-emerald-500 dark:bg-slate-900'
                }`}
                title="Toggle habit"
              >
                <MdCheckCircle />
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {habit.name}
              </span>
              <button
                type="button"
                onClick={() => deleteHabit(habit.id)}
                className="rounded p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                title="Delete habit"
              >
                <MdDelete />
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New tiny habit"
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
        />
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
          title="Add habit"
        >
          <MdAdd />
        </button>
      </form>
    </div>
  );
}
