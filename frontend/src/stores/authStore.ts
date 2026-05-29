import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Persiste l'utilisateur et le token JWT après un login réussi. */
  login: (user: User, token: string) => void;
  /** Réinitialise la session (user, token, isAuthenticated). */
  logout: () => void;
  /** Met à jour les informations de l'utilisateur connecté sans changer le token. */
  setUser: (user: User) => void;
}

/**
 * Store Zustand pour la gestion de l'authentification.
 * Persisté dans le localStorage sous la clé `rcr-auth`.
 * Expose l'utilisateur courant, le token JWT et les actions login/logout/setUser.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setUser: (user) => set({ user }),
    }),
    {
      name: "rcr-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
