'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdArrowForward, MdDelete, MdInbox } from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';
import { useTaskStore } from '@/store/taskStore';

export default function BrainDumpWidget() {
  const items = usePlannerStore((state) => state.brainDumpItems);
  const addBrainDumpItem = usePlannerStore((state) => state.addBrainDumpItem);
  const deleteBrainDumpItem = usePlannerStore((state) => state.deleteBrainDumpItem);
  const markBrainDumpProcessed = usePlannerStore((state) => state.markBrainDumpProcessed);
  const addTask = useTaskStore((state) => state.addTask);
  const [input, setInput] = useState('');

  const activeItems = items.filter((item) => !item.processedAt);

  const handleAdd = () => {
    addBrainDumpItem(input);
    setInput('');
  };

  const convertToTask = (id: string, text: string) => {
    addTask({
      title: text,
      priority: 'medium',
      status: 'backlog',
      tags: ['brain-dump'],
      estimatedMinutes: 15,
      friction: 2,
    });
    markBrainDumpProcessed(id);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600 dark:text-pink-300">
          Mental inbox
        </p>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
          <MdInbox /> Brain dump
        </h2>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAdd();
          }}
          placeholder="Capture it before it steals your focus"
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-pink-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-pink-600 text-white transition hover:bg-pink-700"
          title="Add thought"
        >
          <MdAdd />
        </button>
      </div>

      {activeItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Your mental inbox is clear.
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {activeItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center gap-2 rounded-md bg-pink-50 p-2 text-sm text-slate-700 dark:bg-pink-950/30 dark:text-slate-200"
            >
              <span className="min-w-0 flex-1 break-words">{item.text}</span>
              <button
                type="button"
                onClick={() => convertToTask(item.id, item.text)}
                className="rounded p-1 text-pink-700 opacity-70 transition hover:bg-pink-100 hover:opacity-100 dark:text-pink-200 dark:hover:bg-pink-900"
                title="Convert to task"
              >
                <MdArrowForward />
              </button>
              <button
                type="button"
                onClick={() => deleteBrainDumpItem(item.id)}
                className="rounded p-1 text-pink-700 opacity-70 transition hover:bg-pink-100 hover:opacity-100 dark:text-pink-200 dark:hover:bg-pink-900"
                title="Delete"
              >
                <MdDelete />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
