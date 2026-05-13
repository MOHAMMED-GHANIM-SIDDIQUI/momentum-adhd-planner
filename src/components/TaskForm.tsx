'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdAutoFixHigh, MdClose, MdKeyboardVoice } from 'react-icons/md';
import { createMicroSteps } from '@/lib/productivity';
import { Priority, Recurrence, TaskInput, useTaskStore } from '@/store/taskStore';

interface TaskFormProps {
  onClose?: () => void;
  initialTitle?: string;
}

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TaskForm({ onClose, initialTitle = '' }: TaskFormProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('25');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [scheduledDate, setScheduledDate] = useState(today());
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [energyRequired, setEnergyRequired] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [friction, setFriction] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [topThree, setTopThree] = useState(false);
  const [subtasksText, setSubtasksText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    const task: TaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'not_started',
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      category: category.trim() || undefined,
      scheduledDate: scheduledDate || undefined,
      dueDate: dueDate || undefined,
      recurrence,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : 25,
      energyRequired,
      friction,
      isTopThree: topThree,
      rewardPoints: priority === 'urgent' ? 25 : priority === 'high' ? 18 : 10,
      subtasks: subtasksText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ title: item, completed: false })),
    };

    addTask(task);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEstimatedMinutes('25');
    setTags('');
    setCategory('');
    setScheduledDate(today());
    setDueDate('');
    setRecurrence('none');
    setEnergyRequired(3);
    setFriction(3);
    setTopThree(false);
    setSubtasksText('');
    onClose?.();
  };

  const generateSteps = () => {
    if (!title.trim()) return;
    setSubtasksText(createMicroSteps(title).join('\n'));
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setTitle((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.start();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
            Quick capture
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
            Add a realistic task
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Close"
          >
            <MdClose className="text-xl" />
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Task title
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs your attention?"
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={startVoiceInput}
              className={`flex h-12 w-12 items-center justify-center rounded-md border transition ${
                isListening
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
              }`}
              title="Voice input"
            >
              <MdKeyboardVoice />
            </button>
          </div>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Context
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add detail only if it helps future you."
            rows={3}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Priority
          </span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Estimate
          </span>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(event) => setEstimatedMinutes(event.target.value)}
            min="1"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Scheduled
          </span>
          <input
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Due date
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Category
          </span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Work, life, health..."
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Repeats
          </span>
          <select
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value as Recurrence)}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Energy needed: {energyRequired}/5
          </span>
          <input
            type="range"
            min="1"
            max="5"
            value={energyRequired}
            onChange={(event) => setEnergyRequired(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
            className="w-full accent-blue-600"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Friction: {friction}/5
          </span>
          <input
            type="range"
            min="1"
            max="5"
            value={friction}
            onChange={(event) => setFriction(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
            className="w-full accent-violet-600"
          />
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tags
          </span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="admin, quick-win, deep-work"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Micro-steps
            <button
              type="button"
              onClick={generateSteps}
              className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2.5 py-1 text-xs text-violet-700 transition hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200"
            >
              <MdAutoFixHigh /> Generate
            </button>
          </span>
          <textarea
            value={subtasksText}
            onChange={(event) => setSubtasksText(event.target.value)}
            placeholder="One small step per line"
            rows={4}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={topThree}
            onChange={(event) => setTopThree(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          Mark as Top 3 candidate
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        >
          <MdAdd /> Add task
        </button>
      </div>
    </motion.form>
  );
}
