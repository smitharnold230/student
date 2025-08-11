import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
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
        const SocketService = require('../services/socket').default;
        const socketService = SocketService.getInstance();
        socketService.connect(user.id);
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        const SocketService = require('../services/socket').default;
        const socketService = SocketService.getInstance();
        socketService.disconnect();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 