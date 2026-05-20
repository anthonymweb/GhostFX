import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@ghostfx/shared-types';

type AuthState = {
  token: string;
  refreshToken: string;
  user: User | null;
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setSession: (token: string, refreshToken: string, user: User) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      refreshToken: '',
      user: null,
      bootstrapped: false,
      setBootstrapped: (value) => set({ bootstrapped: value }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setSession: (token, refreshToken, user) => set({ token, refreshToken, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: '', refreshToken: '', user: null }),
    }),
    {
      name: 'ghostfx-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
