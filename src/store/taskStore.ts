import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, toDateKey } from '@/lib/dates';
import { createMicroSteps, getNextRecurringDate, sortTasksForFocus } from '@/lib/productivity';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'not_started' | 'in_progress' | 'completed' | 'rescheduled';
export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  scheduledDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  tags: string[];
  category?: string;
  estimatedMinutes?: number;
  energyRequired?: 1 | 2 | 3 | 4 | 5;
  friction?: 1 | 2 | 3 | 4 | 5;
  rewardPoints?: number;
  recurrence?: Recurrence;
  reminderAt?: string;
  subtasks: Subtask[];
  isTopThree?: boolean;
  order: number;
  postponedCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TaskInput = Partial<
  Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'postponedCount' | 'subtasks'>
> & {
  title: string;
  subtasks?: Array<Partial<Subtask> & Pick<Subtask, 'title'>>;
};

interface TaskStore {
  tasks: Task[];
  addTask: (task: TaskInput) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  startTask: (id: string) => void;
  rescheduleTask: (id: string, date: string) => void;
  snoozeTask: (id: string, days?: number) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  breakDownTask: (taskId: string) => void;
  reorderTasks: (draggedId: string, targetId: string) => void;
  markTopThree: (id: string, value?: boolean) => void;
  bulkReschedule: (ids: string[], date: string) => void;
  smartPlanToday: (capacityMinutes?: number) => Task[];
  getTodaysTasks: (includeCompleted?: boolean) => Task[];
  getTopThree: () => Task[];
  getWeeklyTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getTasks: () => Task[];
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const normalizeTask = (task: Partial<Task>, index: number): Task => {
  const now = new Date().toISOString();
  return {
    id: task.id ?? makeId(),
    title: task.title?.trim() || 'Untitled task',
    description: task.description,
    priority: task.priority ?? 'medium',
    status: task.status ?? 'not_started',
    dueDate: task.dueDate,
    scheduledDate: task.scheduledDate,
    scheduledStart: task.scheduledStart,
    scheduledEnd: task.scheduledEnd,
    tags: Array.isArray(task.tags) ? task.tags : [],
    category: task.category,
    estimatedMinutes: task.estimatedMinutes ?? 25,
    energyRequired: task.energyRequired ?? 3,
    friction: task.friction ?? 3,
    rewardPoints: task.rewardPoints ?? 10,
    recurrence: task.recurrence ?? 'none',
    reminderAt: task.reminderAt,
    subtasks: Array.isArray(task.subtasks)
      ? task.subtasks.map((subtask) => ({
          id: subtask.id ?? makeId(),
          title: subtask.title,
          completed: Boolean(subtask.completed),
          estimatedMinutes: subtask.estimatedMinutes,
        }))
      : [],
    isTopThree: Boolean(task.isTopThree),
    order: task.order ?? index,
    postponedCount: task.postponedCount ?? 0,
    createdAt: task.createdAt ?? now,
    updatedAt: task.updatedAt ?? now,
    completedAt: task.completedAt,
  };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        const normalized = normalizeTask(
          {
            ...task,
            subtasks: task.subtasks?.map((subtask) => ({
              id: subtask.id ?? makeId(),
              title: subtask.title,
              completed: Boolean(subtask.completed),
              estimatedMinutes: subtask.estimatedMinutes,
            })),
          },
          get().tasks.length
        );

        set((state) => ({ tasks: [...state.tasks, normalized] }));
        return normalized;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      },

      completeTask: (id) => {
        const taskToComplete = get().tasks.find((task) => task.id === id);
        const nextDate = taskToComplete
          ? getNextRecurringDate(taskToComplete.scheduledDate ?? toDateKey(), taskToComplete.recurrence)
          : undefined;

        set((state) => {
          const completedAt = new Date().toISOString();
          const updatedTasks = state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'completed' as TaskStatus,
                  completedAt,
                  updatedAt: completedAt,
                  subtasks: task.subtasks.map((subtask) => ({ ...subtask, completed: true })),
                }
              : task
          );

          if (!taskToComplete || !nextDate) return { tasks: updatedTasks };

          const recurringTask = normalizeTask(
            {
              ...taskToComplete,
              id: makeId(),
              status: 'not_started',
              scheduledDate: nextDate,
              dueDate: taskToComplete.dueDate ? nextDate : undefined,
              completedAt: undefined,
              subtasks: taskToComplete.subtasks.map((subtask) => ({
                ...subtask,
                id: makeId(),
                completed: false,
              })),
              createdAt: completedAt,
              updatedAt: completedAt,
              order: updatedTasks.length,
            },
            updatedTasks.length
          );

          return { tasks: [...updatedTasks, recurringTask] };
        });
      },

      startTask: (id) => {
        get().updateTask(id, { status: 'in_progress' });
      },

      rescheduleTask: (id, date) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  scheduledDate: date,
                  status: task.status === 'completed' ? task.status : 'rescheduled',
                  postponedCount: task.postponedCount + 1,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      snoozeTask: (id, days = 1) => {
        get().rescheduleTask(id, addDays(toDateKey(), days));
      },

      addSubtask: (taskId, title) => {
        if (!title.trim()) return;
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [
                    ...task.subtasks,
                    { id: makeId(), title: title.trim(), completed: false },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      breakDownTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            if (task.subtasks.length > 0) return task;

            return {
              ...task,
              subtasks: createMicroSteps(task.title).map((title) => ({
                id: makeId(),
                title,
                completed: false,
                estimatedMinutes: 5,
              })),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      reorderTasks: (draggedId, targetId) => {
        set((state) => {
          const tasks = [...state.tasks];
          const fromIndex = tasks.findIndex((task) => task.id === draggedId);
          const toIndex = tasks.findIndex((task) => task.id === targetId);
          if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return state;

          const [draggedTask] = tasks.splice(fromIndex, 1);
          tasks.splice(toIndex, 0, draggedTask);
          return {
            tasks: tasks.map((task, index) => ({
              ...task,
              order: index,
              updatedAt: new Date().toISOString(),
            })),
          };
        });
      },

      markTopThree: (id, value) => {
        set((state) => {
          const selectedCount = state.tasks.filter((task) => task.isTopThree && task.id !== id).length;
          return {
            tasks: state.tasks.map((task) => {
              if (task.id !== id) return task;
              const nextValue = value ?? !task.isTopThree;
              return {
                ...task,
                isTopThree: nextValue && selectedCount < 3,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      bulkReschedule: (ids, date) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            ids.includes(task.id)
              ? {
                  ...task,
                  scheduledDate: date,
                  status: task.status === 'completed' ? task.status : 'rescheduled',
                  postponedCount: task.postponedCount + 1,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      smartPlanToday: (capacityMinutes = 180) => {
        const today = toDateKey();
        let usedMinutes = 0;
        const candidates = sortTasksForFocus(
          get().tasks.filter((task) => task.status !== 'completed')
        );
        const selected = candidates.filter((task) => {
          const estimate = task.estimatedMinutes ?? 25;
          if (usedMinutes + estimate > capacityMinutes && usedMinutes > 0) return false;
          usedMinutes += estimate;
          return true;
        });

        set((state) => ({
          tasks: state.tasks.map((task) =>
            selected.some((selectedTask) => selectedTask.id === task.id)
              ? {
                  ...task,
                  scheduledDate: today,
                  isTopThree: selected.slice(0, 3).some((selectedTask) => selectedTask.id === task.id),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));

        return selected;
      },

      getTodaysTasks: (includeCompleted = false) => {
        const today = toDateKey();
        return sortTasksForFocus(
          get().tasks.filter((task) => {
            const scheduledForToday = !task.scheduledDate || task.scheduledDate === today;
            const completionMatch = includeCompleted || task.status !== 'completed';
            return scheduledForToday && completionMatch;
          })
        );
      },

      getTopThree: () => {
        const todaysTasks = get().getTodaysTasks();
        const pinned = todaysTasks.filter((task) => task.isTopThree).slice(0, 3);
        const remaining = todaysTasks.filter((task) => !pinned.some((pinnedTask) => pinnedTask.id === task.id));
        return [...pinned, ...remaining].slice(0, 3);
      },

      getWeeklyTasks: () => {
        const today = toDateKey();
        const end = addDays(today, 6);
        return sortTasksForFocus(
          get().tasks.filter((task) => {
            if (!task.scheduledDate) return false;
            return task.scheduledDate >= today && task.scheduledDate <= end;
          })
        );
      },

      getOverdueTasks: () => {
        const today = toDateKey();
        return sortTasksForFocus(
          get().tasks.filter(
            (task) => task.status !== 'completed' && Boolean(task.dueDate) && task.dueDate! < today
          )
        );
      },

      getTasks: () => sortTasksForFocus(get().tasks),
    }),
    {
      name: 'momentum-tasks',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { tasks?: Partial<Task>[] };
        return {
          tasks: (state.tasks ?? []).map((task, index) => normalizeTask(task, index)),
        };
      },
    }
  )
);
