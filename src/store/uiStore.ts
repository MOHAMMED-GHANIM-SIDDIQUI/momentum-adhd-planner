import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  calmMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleCalmMode: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,
      calmMode: false,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleCalmMode: () => set((state) => ({ calmMode: !state.calmMode })),
    }),
    {
      name: 'momentum-ui',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<UIStore>;
        return {
          darkMode: Boolean(state.darkMode),
          sidebarOpen: state.sidebarOpen ?? true,
          calmMode: Boolean(state.calmMode),
        };
      },
    }
  )
);
