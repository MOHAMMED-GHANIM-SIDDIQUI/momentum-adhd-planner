'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MdCalendarMonth,
  MdCheckCircle,
  MdDashboard,
  MdInsights,
  MdSettings,
  MdToday,
} from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';
import { useUIStore } from '@/store/uiStore';

const menuItems = [
  { name: 'Dashboard', icon: MdDashboard, path: '/' },
  { name: 'Today', icon: MdToday, path: '/today' },
  { name: 'Tasks', icon: MdCheckCircle, path: '/tasks' },
  { name: 'Week', icon: MdCalendarMonth, path: '/week' },
  { name: 'Insights', icon: MdInsights, path: '/insights' },
  { name: 'Settings', icon: MdSettings, path: '/settings' },
];

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const rewardPoints = usePlannerStore((state) => state.rewardPoints);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 276 : 76 }}
      className="sticky top-0 hidden h-screen shrink-0 border-r border-white/70 bg-white/75 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:flex md:flex-col"
    >
      <div className="border-b border-slate-200/70 p-5 dark:border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950">
            M
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="truncate text-lg font-black text-slate-950 dark:text-white">
                Momentum
              </p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                ADHD daily planner
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title={item.name}
            >
              <Icon className="shrink-0 text-xl" />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
        {sidebarOpen ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">
              Momentum
            </p>
            <p className="mt-1 text-2xl font-black">{rewardPoints}</p>
            <p className="text-xs opacity-70">points earned</p>
          </>
        ) : (
          <p className="text-center text-sm font-black">{rewardPoints}</p>
        )}
      </div>
    </motion.aside>
  );
}
