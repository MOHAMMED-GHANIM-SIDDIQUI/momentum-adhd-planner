'use client';

import { motion } from 'framer-motion';
import { Mood, useDailyLogStore } from '@/store/dailyLogStore';
import { toDateKey } from '@/lib/dates';

const moods: Array<{ id: Mood; label: string; tone: string }> = [
  { id: 'happy', label: 'Bright', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200' },
  { id: 'calm', label: 'Calm', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200' },
  { id: 'neutral', label: 'Neutral', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'stressed', label: 'Tense', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200' },
  { id: 'tired', label: 'Low', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200' },
];

export default function EnergyTrackerWidget() {
  const todayLog = useDailyLogStore((state) => state.getTodayLog());
  const updateTodayLog = useDailyLogStore((state) => state.updateTodayLog);
  const log = todayLog ?? {
    id: 'preview',
    date: toDateKey(),
    energyLevel: 3 as const,
    mood: 'neutral' as Mood,
    tasksCompleted: 0,
    focusMinutes: 0,
    wins: [],
  };

  const setEnergy = (energyLevel: 1 | 2 | 3 | 4 | 5) => {
    updateTodayLog({ energyLevel });
  };

  const setMood = (mood: Mood) => {
    updateTodayLog({ mood });
  };

  const suggestion =
    log.energyLevel <= 2
      ? 'Choose admin, recovery, or a 10-minute start. High friction tasks can wait.'
      : log.energyLevel >= 4
      ? 'Great window for one deep task. Protect it from tiny distractions.'
      : 'A balanced plan works: one important task, one quick win, one buffer.';

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
          Body data
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
          Energy and mood
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Energy</span>
            <span>{log.energyLevel}/5</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                key={level}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setEnergy(level as 1 | 2 | 3 | 4 | 5)}
                className={`h-11 rounded-md text-sm font-bold transition ${
                  log.energyLevel === level
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => setMood(mood.id)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                log.mood === mood.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : mood.tone
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
          {suggestion}
        </div>
      </div>
    </div>
  );
}
