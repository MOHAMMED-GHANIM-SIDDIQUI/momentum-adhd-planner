'use client';

import { MdDarkMode, MdLightMode, MdMenu, MdNotifications, MdSelfImprovement } from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';
import { useUIStore } from '@/store/uiStore';

export default function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
  const toggleCalmMode = useUIStore((state) => state.toggleCalmMode);
  const darkMode = useUIStore((state) => state.darkMode);
  const calmMode = useUIStore((state) => state.calmMode);
  const notificationsEnabled = usePlannerStore((state) => state.preferences.notificationsEnabled);
  const updatePreferences = usePlannerStore((state) => state.updatePreferences);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    updatePreferences({ notificationsEnabled: permission === 'granted' });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Toggle sidebar"
        >
          <MdMenu className="text-2xl" />
        </button>

        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            Plan gently. Focus clearly. Recover without guilt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestNotifications}
            className={`rounded-md p-2 transition ${
              notificationsEnabled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title="Enable gentle notifications"
          >
            <MdNotifications className="text-xl" />
          </button>
          <button
            type="button"
            onClick={toggleCalmMode}
            className={`rounded-md p-2 transition ${
              calmMode
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title="Reduce motion"
          >
            <MdSelfImprovement className="text-xl" />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {darkMode ? (
              <MdLightMode className="text-xl text-amber-400" />
            ) : (
              <MdDarkMode className="text-xl" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
