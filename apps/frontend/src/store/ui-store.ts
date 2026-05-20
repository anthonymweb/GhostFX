import { create } from 'zustand';

import type { ExperienceMode } from '@ghostfx/shared-types';

type UiState = {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mode: 'beginner',
  setMode: (mode) => set({ mode }),
}));
