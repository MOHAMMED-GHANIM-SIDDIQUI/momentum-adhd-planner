import { addDays, toDateKey } from './dates';
import type { DailyLog } from '@/store/dailyLogStore';
import type { Task } from '@/store/taskStore';

const priorityScore = {
  urgent: 6,
  high: 4,
  medium: 2,
  low: 1,
};

export function getTaskScore(task: Task) {
  const today = toDateKey();
  const dueBoost = task.dueDate
    ? Math.max(0, 5 - daysBetween(today, task.dueDate))
    : 0;
  const topThreeBoost = task.isTopThree ? 5 : 0;
  const postponePenalty = Math.min(task.postponedCount ?? 0, 4);
  const frictionBoost = task.friction ? Math.max(0, task.friction - 2) : 0;

  return (
    priorityScore[task.priority] +
    dueBoost +
    topThreeBoost +
    frictionBoost +
    postponePenalty
  );
}

export function sortTasksForFocus(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const scoreDiff = getTaskScore(b) - getTaskScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export function createMicroSteps(title: string) {
  const cleaned = title.trim().replace(/\s+/g, ' ');
  const subject = cleaned || 'the task';

  return [
    `Open what you need for "${subject}"`,
    'Write the smallest possible next action',
    'Do a 5-minute first pass',
    'Check what is still unclear',
    'Finish or park the next step',
  ];
}

export function getStartSmallSuggestion(task?: Task) {
  if (!task) return 'Pick one tiny task that takes less than 5 minutes.';

  const incompleteSubtask = task.subtasks?.find((subtask) => !subtask.completed);
  if (incompleteSubtask) return incompleteSubtask.title;

  if ((task.estimatedMinutes ?? 0) > 45) {
    return `Set a 10-minute timer and only start "${task.title}".`;
  }

  return `Open "${task.title}" and complete the first visible step.`;
}

export function getOverloadReport(tasks: Task[], dailyCapacityMinutes: number, log?: DailyLog) {
  const activeTasks = tasks.filter((task) => task.status !== 'completed');
  const plannedMinutes = activeTasks.reduce(
    (total, task) => total + (task.estimatedMinutes ?? 25),
    0
  );
  const energyAdjustment = log ? (log.energyLevel - 3) * 30 : 0;
  const moodAdjustment =
    log?.mood === 'stressed' || log?.mood === 'tired' ? -35 : log?.mood === 'happy' ? 20 : 0;
  const capacity = Math.max(45, dailyCapacityMinutes + energyAdjustment + moodAdjustment);
  const ratio = plannedMinutes / capacity;

  const level = ratio >= 1.35 ? 'high' : ratio >= 1 ? 'medium' : 'calm';
  const message =
    level === 'high'
      ? 'This plan is too heavy for a real human day. Move a few tasks and protect the Top 3.'
      : level === 'medium'
      ? 'This is close to capacity. Keep breaks visible and make one task optional.'
      : 'This plan has breathing room. Nice conditions for steady momentum.';

  return {
    activeTasks,
    plannedMinutes,
    capacity,
    ratio,
    level,
    message,
  };
}

export function getCoachSuggestions(tasks: Task[], log: DailyLog | undefined, capacity: number) {
  const active = sortTasksForFocus(tasks.filter((task) => task.status !== 'completed'));
  const overdue = active.filter((task) => task.dueDate && task.dueDate < toDateKey());
  const frequentlyPostponed = active.filter((task) => (task.postponedCount ?? 0) >= 2);
  const highFriction = active.find((task) => (task.friction ?? 3) >= 4);
  const topTask = active[0];
  const overload = getOverloadReport(active, capacity, log);

  return [
    overload.level === 'high'
      ? 'Reduce the day before starting. A lighter plan usually gets more done.'
      : 'Keep the next action visible and avoid opening the whole backlog.',
    overdue.length
      ? `${overdue.length} overdue item${overdue.length === 1 ? '' : 's'} need a decision: do, delegate, delete, or defer.`
      : 'No overdue pressure detected.',
    frequentlyPostponed.length
      ? `Break down "${frequentlyPostponed[0].title}" because it has been postponed repeatedly.`
      : highFriction
      ? `Start small with "${highFriction.title}" to lower activation energy.`
      : getStartSmallSuggestion(topTask),
  ];
}

export function getNextRecurringDate(dateKey: string, recurrence: Task['recurrence']) {
  if (!recurrence || recurrence === 'none') return undefined;

  if (recurrence === 'daily') return addDays(dateKey, 1);
  if (recurrence === 'weekly') return addDays(dateKey, 7);
  if (recurrence === 'monthly') {
    const date = new Date(`${dateKey}T00:00:00`);
    date.setMonth(date.getMonth() + 1);
    return toDateKey(date);
  }

  let next = addDays(dateKey, 1);
  while ([0, 6].includes(new Date(`${next}T00:00:00`).getDay())) {
    next = addDays(next, 1);
  }
  return next;
}

function daysBetween(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00`).getTime();
  const toDate = new Date(`${to}T00:00:00`).getTime();
  return Math.ceil((toDate - fromDate) / 86400000);
}
