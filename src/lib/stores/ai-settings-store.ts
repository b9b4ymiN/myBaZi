import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AiSettings } from '@/types/ai-settings';
import { DEFAULT_AI_SETTINGS } from '@/types/ai-settings';

interface AiSettingsState {
  settings: AiSettings;
  setSettings: (partial: Partial<AiSettings>) => void;
  reset: () => void;
}

export const useAiSettingsStoreBase = create<AiSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_AI_SETTINGS,

      setSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      reset: () => {
        set({ settings: DEFAULT_AI_SETTINGS });
      },
    }),
    {
      name: 'mybazi-ai-settings',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Convenience hook that returns AI settings only after hydration.
 * Use this in components to avoid hydration mismatch warnings.
 */
export function useAiSettings() {
  const settings = useAiSettingsStoreBase((state) => state.settings);
  const setSettings = useAiSettingsStoreBase((state) => state.setSettings);
  const reset = useAiSettingsStoreBase((state) => state.reset);

  return {
    settings,
    setSettings,
    reset,
  };
}
