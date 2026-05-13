import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, toDateKey } from '@/lib/dates';

export type Mood = 'happy' | 'calm' | 'neutral' | 'stressed' | 'tired';

export interface DailyLog {
  id: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  mood: Mood;
  tasksCompleted: number;
  focusMinutes: number;
  notes?: string;
  wins: string[];
}

interface DailyLogStore {
  logs: DailyLog[];
  addLog: (log: Partial<Omit<DailyLog, 'id'>> & Pick<DailyLog, 'date'>) => void;
  ensureTodayLog: () => DailyLog;
  getTodayLog: () => DailyLog | undefined;
  updateTodayLog: (updates: Partial<DailyLog>) => void;
  incrementTasksCompleted: () => void;
  addFocusMinutes: (minutes: number) => void;
  addWin: (win: string) => void;
  getLogs: () => DailyLog[];
  getLastWeekLogs: () => DailyLog[];
  getAverageEnergy: () => number;
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const normalizeLog = (log: Partial<DailyLog> & Pick<DailyLog, 'date'>): DailyLog => ({
  id: log.id ?? makeId(),
  date: log.date,
  energyLevel: log.energyLevel ?? 3,
  mood: log.mood ?? 'neutral',
  tasksCompleted: log.tasksCompleted ?? 0,
  focusMinutes: log.focusMinutes ?? 0,
  notes: log.notes,
  wins: Array.isArray(log.wins) ? log.wins : [],
});

export const useDailyLogStore = create<DailyLogStore>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) => {
        const normalized = normalizeLog(log);
        set((state) => ({
          logs: [
            ...state.logs.filter((existing) => existing.date !== normalized.date),
            normalized,
          ],
        }));
      },

      ensureTodayLog: () => {
        const today = toDateKey();
        const existing = get().logs.find((log) => log.date === today);
        if (existing) return existing;

        const next = normalizeLog({ date: today });
        set((state) => ({ logs: [...state.logs, next] }));
        return next;
      },

      getTodayLog: () => {
        const today = toDateKey();
        return get().logs.find((log) => log.date === today);
      },

      updateTodayLog: (updates) => {
        const today = toDateKey();
        const existing = get().logs.find((log) => log.date === today);
        if (!existing) {
          get().addLog({ date: today, ...updates });
          return;
        }

        set((state) => ({
          logs: state.logs.map((log) =>
            log.date === today ? { ...log, ...updates } : log
          ),
        }));
      },

      incrementTasksCompleted: () => {
        const today = get().ensureTodayLog();
        get().updateTodayLog({ tasksCompleted: today.tasksCompleted + 1 });
      },

      addFocusMinutes: (minutes) => {
        const today = get().ensureTodayLog();
        get().updateTodayLog({ focusMinutes: today.focusMinutes + minutes });
      },

      addWin: (win) => {
        if (!win.trim()) return;
        const today = get().ensureTodayLog();
        get().updateTodayLog({ wins: [...today.wins, win.trim()] });
      },

      getLogs: () => [...get().logs].sort((a, b) => a.date.localeCompare(b.date)),

      getLastWeekLogs: () => {
        const today = toDateKey();
        const weekAgo = addDays(today, -6);
        return get()
          .logs.filter((log) => log.date >= weekAgo && log.date <= today)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getAverageEnergy: () => {
        const logs = get().getLastWeekLogs();
        if (!logs.length) return 3;
        return logs.reduce((total, log) => total + log.energyLevel, 0) / logs.length;
      },
    }),
    {
      name: 'momentum-daily-logs',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { logs?: Array<Partial<DailyLog> & Pick<DailyLog, 'date'>> };
        return {
          logs: (state.logs ?? []).filter(Boolean).map((log) => normalizeLog(log)),
        };
      },
    }
  )
);
