import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'rcr' | 'rcr-dark'

interface UiState {
  sidebarCollapsed: boolean
  theme: Theme
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'rcr',

      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleTheme: () =>
        set({ theme: get().theme === 'rcr' ? 'rcr-dark' : 'rcr' }),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'rcr-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    },
  ),
)
