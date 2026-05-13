'use client';

import { MdAdd, MdDelete, MdNotes } from 'react-icons/md';
import { usePlannerStore } from '@/store/plannerStore';

export default function NotesWidget() {
  const notes = usePlannerStore((state) => state.notes);
  const addNote = usePlannerStore((state) => state.addNote);
  const updateNote = usePlannerStore((state) => state.updateNote);
  const deleteNote = usePlannerStore((state) => state.deleteNote);
  const activeNote = notes[0];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Scratchpad
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <MdNotes /> Notes
          </h2>
        </div>
        <button
          type="button"
          onClick={() => addNote('New note')}
          className="rounded-md bg-slate-950 p-2 text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          title="Add note"
        >
          <MdAdd />
        </button>
      </div>

      {activeNote ? (
        <div className="space-y-3">
          <input
            value={activeNote.title}
            onChange={(event) => updateNote(activeNote.id, { title: event.target.value })}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
          />
          <textarea
            value={activeNote.body}
            onChange={(event) => updateNote(activeNote.id, { body: event.target.value })}
            rows={6}
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="button"
            onClick={() => deleteNote(activeNote.id)}
            className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <MdDelete /> Delete note
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
          No notes yet.
        </div>
      )}
    </div>
  );
}
