'use client';

import { ReactNode, useEffect, useState } from 'react';

export default function ClientOnlyShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
          Loading Momentum
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
