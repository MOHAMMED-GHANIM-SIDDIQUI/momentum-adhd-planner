'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdCheckCircle, MdDashboard, MdInsights, MdToday } from 'react-icons/md';

const items = [
  { name: 'Home', icon: MdDashboard, path: '/' },
  { name: 'Today', icon: MdToday, path: '/today' },
  { name: 'Tasks', icon: MdCheckCircle, path: '/tasks' },
  { name: 'Insights', icon: MdInsights, path: '/insights' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-lg border border-white/70 bg-white/90 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold ${
              active
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-500'
            }`}
          >
            <Icon className="text-lg" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
