'use client';

import { ChangeEvent, useRef } from 'react';
import { MdDownload, MdNotifications, MdSettings, MdUpload } from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';

const storageKeys = ['momentum-tasks', 'momentum-focus', 'momentum-daily-logs', 'momentum-ui', 'momentum-planner'];

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const preferences = usePlannerStore((state) => state.preferences);
  const updatePreferences = usePlannerStore((state) => state.updatePreferences);

  const exportBackup = () => {
    const data = storageKeys.reduce<Record<string, string | null>>((backup, key) => {
      backup[key] = localStorage.getItem(key);
      return backup;
    }, {});

    const blob = new Blob(
      [
        JSON.stringify(
          {
            app: 'Momentum',
            exportedAt: new Date().toISOString(),
            data,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momentum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const backup = JSON.parse(text) as { data?: Record<string, string | null> };
    Object.entries(backup.data ?? {}).forEach(([key, value]) => {
      if (storageKeys.includes(key) && value) localStorage.setItem(key, value);
    });
    window.location.reload();
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    updatePreferences({ notificationsEnabled: permission === 'granted' });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Production controls
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
          <MdSettings /> Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Tune capacity, focus defaults, notifications, and local data portability.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Planning defaults</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Work starts
              </span>
              <input
                type="time"
                value={preferences.workStart}
                onChange={(event) => updatePreferences({ workStart: event.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Work ends
              </span>
              <input
                type="time"
                value={preferences.workEnd}
                onChange={(event) => updatePreferences({ workEnd: event.target.value })}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Daily capacity: {preferences.dailyCapacityMinutes}m
              </span>
              <input
                type="range"
                min="45"
                max="420"
                step="15"
                value={preferences.dailyCapacityMinutes}
                onChange={(event) => updatePreferences({ dailyCapacityMinutes: Number(event.target.value) })}
                className="w-full accent-blue-600"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Focus length: {preferences.focusMinutes}m
              </span>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={preferences.focusMinutes}
                onChange={(event) => updatePreferences({ focusMinutes: Number(event.target.value) })}
                className="w-full accent-violet-600"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Data and reminders</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestNotifications}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <MdNotifications /> {preferences.notificationsEnabled ? 'Notifications on' : 'Enable reminders'}
            </button>
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <MdDownload /> Export backup
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <MdUpload /> Import backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={importBackup}
              className="hidden"
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Data stays local in this build, with export/import for backup. The architecture is
            ready for Supabase or Firebase sync when you add cloud auth.
          </p>
        </section>
      </div>
    </div>
  );
}
