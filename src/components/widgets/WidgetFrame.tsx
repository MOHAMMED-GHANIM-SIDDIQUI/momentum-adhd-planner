'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MdDragIndicator, MdOpenInFull } from 'react-icons/md';
import type { DashboardWidget } from '@/store/plannerStore';

interface WidgetFrameProps {
  widget: DashboardWidget;
  children: ReactNode;
  onResize: (id: DashboardWidget['id']) => void;
  onDragStart: (id: DashboardWidget['id']) => void;
  onDrop: (id: DashboardWidget['id']) => void;
}

const sizeClasses = {
  sm: 'lg:col-span-1',
  md: 'lg:col-span-2',
  lg: 'lg:col-span-3',
};

export default function WidgetFrame({
  widget,
  children,
  onResize,
  onDragStart,
  onDrop,
}: WidgetFrameProps) {
  return (
    <motion.section
      layout
      draggable
      onDragStart={() => onDragStart(widget.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(widget.id)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative min-h-[220px] rounded-lg border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 ${sizeClasses[widget.size]}`}
    >
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onResize(widget.id)}
          className="rounded-md border border-slate-200 bg-white/90 p-1.5 text-slate-500 shadow-sm transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Resize widget"
        >
          <MdOpenInFull />
        </button>
        <div
          className="cursor-grab rounded-md border border-slate-200 bg-white/90 p-1.5 text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Drag widget"
        >
          <MdDragIndicator />
        </div>
      </div>
      {children}
    </motion.section>
  );
}
