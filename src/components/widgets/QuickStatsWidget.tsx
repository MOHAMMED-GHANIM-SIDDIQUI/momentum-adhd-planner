'use client';

import { MdCheckCircle, MdTimer, MdTrendingUp } from 'react-icons/md';
import { formatMinutes } from '@/lib/dates';

interface QuickStatsProps {
  completedToday: number;
  focusTime: number;
  sessions: number;
}

export default function QuickStatsWidget({
  completedToday,
  focusTime,
  sessions,
}: QuickStatsProps) {
  const stats = [
    {
      label: 'Finished',
      value: completedToday,
      icon: MdCheckCircle,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
    },
    {
      label: 'Focused',
      value: formatMinutes(focusTime),
      icon: MdTimer,
      tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200',
    },
    {
      label: 'Sessions',
      value: sessions,
      icon: MdTrendingUp,
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`rounded-lg p-4 ${stat.tone}`}>
            <Icon className="text-2xl" />
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
