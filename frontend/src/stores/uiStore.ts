import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'rcr' | 'rcr-dark'

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  /** Bascule la sidebar entre étendue et réduite. */
  toggleSidebar: () => void;
  /** Définit explicitement l'état de la sidebar. */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Bascule entre le thème clair `rcr` et sombre `rcr-dark`. */
  toggleTheme: () => void;
  /** Définit explicitement le thème DaisyUI à appliquer. */
  setTheme: (theme: Theme) => void;
}

/**
 * Store Zustand pour l'état global de l'interface utilisateur.
 * Persisté dans le localStorage sous la clé `rcr-ui`.
 * Gère le thème DaisyUI et l'état de la sidebar.
 */
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
