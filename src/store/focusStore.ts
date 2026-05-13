import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mood } from './dailyLogStore';

export type FocusMode = 'focus' | 'quick_win' | 'deep_work' | 'recovery';

export interface FocusSession {
  id: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  mood: Mood;
  mode: FocusMode;
  completed: boolean;
}

interface FocusStore {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;

  startSession: (taskId?: string, duration?: number, mode?: FocusMode) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (mood?: Mood, completed?: boolean) => FocusSession | undefined;
  tick: () => FocusSession | undefined;
  cancelSession: () => void;
  getSessions: () => FocusSession[];
  getTotalFocusTime: () => number;
  getTodayFocusTime: () => number;
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const todayKey = () => new Date().toISOString().split('T')[0];

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      isActive: false,
      isPaused: false,
      timeRemaining: 0,

      startSession: (taskId, duration = 25, mode = 'focus') => {
        const session: FocusSession = {
          id: makeId(),
          taskId,
          startedAt: new Date().toISOString(),
          duration,
          mood: 'neutral',
          mode,
          completed: false,
        };

        set({
          currentSession: session,
          isActive: true,
          isPaused: false,
          timeRemaining: duration * 60,
        });
      },

      pauseSession: () => set({ isPaused: true }),

      resumeSession: () => set({ isPaused: false }),

      endSession: (mood = 'neutral', completed = true) => {
        const current = get().currentSession;
        if (!current) return undefined;

        const finished: FocusSession = {
          ...current,
          endedAt: new Date().toISOString(),
          mood,
          completed,
        };

        set((state) => ({
          sessions: [...state.sessions, finished],
          currentSession: null,
          isActive: false,
          isPaused: false,
          timeRemaining: 0,
        }));

        return finished;
      },

      tick: () => {
        const state = get();
        if (!state.isActive || state.isPaused || !state.currentSession) return undefined;
        if (state.timeRemaining <= 1) {
          return get().endSession('neutral', true);
        }

        set({ timeRemaining: state.timeRemaining - 1 });
        return undefined;
      },

      cancelSession: () => {
        const current = get().currentSession;
        if (current) {
          get().endSession('neutral', false);
          return;
        }
        set({ currentSession: null, isActive: false, isPaused: false, timeRemaining: 0 });
      },

      getSessions: () => get().sessions,

      getTotalFocusTime: () =>
        get().sessions.reduce(
          (total, session) => total + (session.completed ? session.duration : 0),
          0
        ),

      getTodayFocusTime: () =>
        get()
          .sessions.filter((session) => session.startedAt.startsWith(todayKey()))
          .reduce((total, session) => total + (session.completed ? session.duration : 0), 0),
    }),
    {
      name: 'momentum-focus',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<FocusStore>;
        return {
          sessions: (state.sessions ?? []).map((session) => ({
            ...session,
            mood: session.mood ?? 'neutral',
            mode: session.mode ?? 'focus',
            completed: Boolean(session.completed),
          })),
          currentSession: null,
          isActive: false,
          isPaused: false,
          timeRemaining: 0,
        };
      },
    }
  )
);
