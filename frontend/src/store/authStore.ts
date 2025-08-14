import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  // Exporting the User interface
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        // Socket connection is now handled by useNotifications hook
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Socket disconnection is now handled by useNotifications hook
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
