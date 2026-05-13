import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutesToClock, toDateKey } from '@/lib/dates';
import type { Priority } from './taskStore';

export interface BrainDumpItem {
  id: string;
  text: string;
  createdAt: string;
  processedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  completions: string[];
}

export interface TimeBlock {
  id: string;
  date: string;
  title: string;
  start: string;
  end: string;
  type: 'focus' | 'break' | 'admin' | 'reset';
  taskId?: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updatedAt: string;
}

export interface PlannerPreferences {
  workStart: string;
  workEnd: string;
  dailyCapacityMinutes: number;
  focusMinutes: number;
  breakMinutes: number;
  gentleMode: boolean;
  notificationsEnabled: boolean;
}

export interface DashboardWidget {
  id:
    | 'focus'
    | 'assistant'
    | 'top3'
    | 'timeblocks'
    | 'energy'
    | 'habits'
    | 'braindump'
    | 'weekly'
    | 'rewards'
    | 'streak'
    | 'notes';
  title: string;
  visible: boolean;
  size: 'sm' | 'md' | 'lg';
  order: number;
}

interface AutoPlanTask {
  id: string;
  title: string;
  estimatedMinutes?: number;
  priority: Priority;
}

interface PlannerStore {
  brainDumpItems: BrainDumpItem[];
  habits: Habit[];
  timeBlocks: TimeBlock[];
  notes: Note[];
  preferences: PlannerPreferences;
  widgets: DashboardWidget[];
  rewardPoints: number;

  addBrainDumpItem: (text: string) => void;
  deleteBrainDumpItem: (id: string) => void;
  markBrainDumpProcessed: (id: string) => void;
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date?: string) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  clearTimeBlocksForDate: (date: string) => void;
  autoPlanDay: (date: string, tasks: AutoPlanTask[]) => void;
  addNote: (title?: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updatePreferences: (updates: Partial<PlannerPreferences>) => void;
  reorderWidgets: (draggedId: DashboardWidget['id'], targetId: DashboardWidget['id']) => void;
  resizeWidget: (id: DashboardWidget['id']) => void;
  toggleWidget: (id: DashboardWidget['id']) => void;
  awardPoints: (points: number) => void;
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const defaultHabits: Habit[] = [
  { id: 'habit-water', name: 'Drink water', color: 'cyan', completions: [] },
  { id: 'habit-reset', name: '10-minute reset', color: 'emerald', completions: [] },
  { id: 'habit-plan', name: 'Plan tomorrow', color: 'violet', completions: [] },
];

const defaultWidgets: DashboardWidget[] = [
  { id: 'assistant', title: 'Coach', visible: true, size: 'lg', order: 0 },
  { id: 'top3', title: 'Top 3', visible: true, size: 'md', order: 1 },
  { id: 'focus', title: 'Focus', visible: true, size: 'md', order: 2 },
  { id: 'timeblocks', title: 'Time blocks', visible: true, size: 'lg', order: 3 },
  { id: 'energy', title: 'Energy', visible: true, size: 'sm', order: 4 },
  { id: 'habits', title: 'Habits', visible: true, size: 'sm', order: 5 },
  { id: 'braindump', title: 'Brain dump', visible: true, size: 'md', order: 6 },
  { id: 'weekly', title: 'Weekly progress', visible: true, size: 'md', order: 7 },
  { id: 'streak', title: 'Streak', visible: true, size: 'sm', order: 8 },
  { id: 'rewards', title: 'Rewards', visible: true, size: 'sm', order: 9 },
  { id: 'notes', title: 'Notes', visible: true, size: 'md', order: 10 },
];

const defaultPreferences: PlannerPreferences = {
  workStart: '09:00',
  workEnd: '17:00',
  dailyCapacityMinutes: 180,
  focusMinutes: 25,
  breakMinutes: 5,
  gentleMode: true,
  notificationsEnabled: false,
};

const mergeWidgets = (widgets?: DashboardWidget[]) => {
  const existing = widgets ?? [];
  const withDefaults = [
    ...existing,
    ...defaultWidgets.filter(
      (defaultWidget) => !existing.some((widget) => widget.id === defaultWidget.id)
    ),
  ];

  return withDefaults.map((widget, index) => ({ ...widget, order: widget.order ?? index }));
};

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set, get) => ({
      brainDumpItems: [],
      habits: defaultHabits,
      timeBlocks: [],
      notes: [
        {
          id: 'note-first',
          title: 'Parking lot',
          body: 'Drop thoughts here so they do not have to stay in your head.',
          pinned: true,
          updatedAt: new Date().toISOString(),
        },
      ],
      preferences: defaultPreferences,
      widgets: defaultWidgets,
      rewardPoints: 0,

      addBrainDumpItem: (text) => {
        if (!text.trim()) return;
        set((state) => ({
          brainDumpItems: [
            {
              id: makeId(),
              text: text.trim(),
              createdAt: new Date().toISOString(),
            },
            ...state.brainDumpItems,
          ],
        }));
      },

      deleteBrainDumpItem: (id) => {
        set((state) => ({
          brainDumpItems: state.brainDumpItems.filter((item) => item.id !== id),
        }));
      },

      markBrainDumpProcessed: (id) => {
        set((state) => ({
          brainDumpItems: state.brainDumpItems.map((item) =>
            item.id === id ? { ...item, processedAt: new Date().toISOString() } : item
          ),
        }));
      },

      addHabit: (name) => {
        if (!name.trim()) return;
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: makeId(),
              name: name.trim(),
              color: 'blue',
              completions: [],
            },
          ],
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },

      toggleHabit: (id, date = toDateKey()) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  completions: habit.completions.includes(date)
                    ? habit.completions.filter((completion) => completion !== date)
                    : [...habit.completions, date],
                }
              : habit
          ),
        }));
      },

      addTimeBlock: (block) => {
        set((state) => ({
          timeBlocks: [...state.timeBlocks, { ...block, id: makeId() }],
        }));
      },

      updateTimeBlock: (id, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },

      deleteTimeBlock: (id) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== id),
        }));
      },

      clearTimeBlocksForDate: (date) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.date !== date),
        }));
      },

      autoPlanDay: (date, tasks) => {
        const preferences = get().preferences;
        let cursor = preferences.workStart;
        const plannedBlocks: TimeBlock[] = [];

        tasks.slice(0, 6).forEach((task, index) => {
          const duration = Math.min(Math.max(task.estimatedMinutes ?? preferences.focusMinutes, 10), 90);
          const end = addMinutesToClock(cursor, duration);
          plannedBlocks.push({
            id: makeId(),
            date,
            title: task.title,
            start: cursor,
            end,
            type: 'focus',
            taskId: task.id,
            color:
              task.priority === 'urgent'
                ? 'rose'
                : task.priority === 'high'
                ? 'amber'
                : task.priority === 'medium'
                ? 'blue'
                : 'emerald',
          });

          cursor = addMinutesToClock(end, preferences.breakMinutes);
          if (index < tasks.length - 1) {
            plannedBlocks.push({
              id: makeId(),
              date,
              title: 'Recovery break',
              start: end,
              end: cursor,
              type: 'break',
              color: 'slate',
            });
          }
        });

        set((state) => ({
          timeBlocks: [
            ...state.timeBlocks.filter((block) => block.date !== date),
            ...plannedBlocks,
          ],
        }));
      },

      addNote: (title = 'Untitled note') => {
        set((state) => ({
          notes: [
            {
              id: makeId(),
              title,
              body: '',
              pinned: false,
              updatedAt: new Date().toISOString(),
            },
            ...state.notes,
          ],
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      reorderWidgets: (draggedId, targetId) => {
        set((state) => {
          const widgets = [...state.widgets].sort((a, b) => a.order - b.order);
          const from = widgets.findIndex((widget) => widget.id === draggedId);
          const to = widgets.findIndex((widget) => widget.id === targetId);
          if (from < 0 || to < 0 || from === to) return state;
          const [dragged] = widgets.splice(from, 1);
          widgets.splice(to, 0, dragged);
          return { widgets: widgets.map((widget, order) => ({ ...widget, order })) };
        });
      },

      resizeWidget: (id) => {
        const sizes: DashboardWidget['size'][] = ['sm', 'md', 'lg'];
        set((state) => ({
          widgets: state.widgets.map((widget) => {
            if (widget.id !== id) return widget;
            const nextSize = sizes[(sizes.indexOf(widget.size) + 1) % sizes.length];
            return { ...widget, size: nextSize };
          }),
        }));
      },

      toggleWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, visible: !widget.visible } : widget
          ),
        }));
      },

      awardPoints: (points) => {
        set((state) => ({ rewardPoints: Math.max(0, state.rewardPoints + points) }));
      },
    }),
    {
      name: 'momentum-planner',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<PlannerStore>;
        return {
          brainDumpItems: state.brainDumpItems ?? [],
          habits: state.habits?.length ? state.habits : defaultHabits,
          timeBlocks: state.timeBlocks ?? [],
          notes: state.notes?.length
            ? state.notes
            : [
                {
                  id: 'note-first',
                  title: 'Parking lot',
                  body: 'Drop thoughts here so they do not have to stay in your head.',
                  pinned: true,
                  updatedAt: new Date().toISOString(),
                },
              ],
          preferences: { ...defaultPreferences, ...(state.preferences ?? {}) },
          widgets: mergeWidgets(state.widgets),
          rewardPoints: state.rewardPoints ?? 0,
        };
      },
    }
  )
);
