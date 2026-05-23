import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@ghostfx/shared-types';

type AuthState = {
  session: Session | null;
  user: User | null;
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      bootstrapped: false,
      setBootstrapped: (value) => set({ bootstrapped: value }),
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ session: null, user: null }),
    }),
    {
      name: 'ghostfx-auth',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
      }),
    },
  ),
);
