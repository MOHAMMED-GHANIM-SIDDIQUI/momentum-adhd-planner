'use client';

import { MdEmojiEvents } from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';

export default function RewardWidget() {
  const rewardPoints = usePlannerStore((state) => state.rewardPoints);
  const level = Math.floor(rewardPoints / 100) + 1;
  const progress = rewardPoints % 100;

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
          Dopamine loop
        </p>
        <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
          <MdEmojiEvents className="text-amber-500" /> Rewards
        </h2>
      </div>

      <div className="rounded-lg bg-amber-50 p-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] opacity-70">
          Level {level}
        </p>
        <p className="mt-2 text-4xl font-black">{rewardPoints}</p>
        <p className="text-sm font-medium">momentum points</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-200/70 dark:bg-amber-900">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Points come from finishing tasks, logging focus, and tiny habits. No guilt reset.
      </p>
    </div>
  );
}
