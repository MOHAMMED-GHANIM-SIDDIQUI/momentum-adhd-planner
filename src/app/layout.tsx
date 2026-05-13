import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppBootstrap from '@/components/AppBootstrap';
import ClientOnlyShell from '@/components/ClientOnlyShell';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Momentum - ADHD Daily Planner',
  description: 'A calm, realistic productivity companion for focus, planning, and recovery.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Momentum',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppBootstrap />
        <ClientOnlyShell>
          <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-white">
            <Sidebar />
            <main className="flex min-w-0 flex-1 flex-col">
              <Header />
              <div className="flex-1 overflow-auto">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 md:pb-5 lg:px-8">
                  {children}
                </div>
              </div>
            </main>
            <MobileNav />
          </div>
        </ClientOnlyShell>
      </body>
    </html>
  );
}
