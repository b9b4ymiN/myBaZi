"use client";

import { useEffect, useState } from 'react';
import { useProfileStoreBase } from './profile-store';
import { useAiSettingsStoreBase } from './ai-settings-store';

/**
 * Hook to safely use the profile store without hydration mismatches.
 * Returns the store only after client-side hydration is complete.
 */
export function useHydratedProfileStore() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first client-side render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Return the store (will be empty on server, populated on client after hydration)
  return {
    store: useProfileStoreBase,
    isHydrated,
  };
}

/**
 * Hook to safely use the AI settings store without hydration mismatches.
 * Returns the store only after client-side hydration is complete.
 */
export function useHydratedAiSettingsStore() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first client-side render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Return the store (will be empty on server, populated on client after hydration)
  return {
    store: useAiSettingsStoreBase,
    isHydrated,
  };
}

/**
 * Convenience hook that returns profiles and activeProfileId only after hydration.
 * Use this in components to avoid hydration mismatch warnings.
 */
export function useProfiles() {
  const { store, isHydrated } = useHydratedProfileStore();
  const profiles = store((state) => state.profiles);
  const activeProfileId = store((state) => state.activeProfileId);

  return {
    profiles: isHydrated ? profiles : [],
    activeProfileId: isHydrated ? activeProfileId : null,
    isHydrated,
  };
}

/**
 * Convenience hook that returns AI settings only after hydration.
 * Use this in components to avoid hydration mismatch warnings.
 */
export function useAiSettingsSafe() {
  const { store, isHydrated } = useHydratedAiSettingsStore();
  const settings = store((state) => state.settings);

  return {
    settings: isHydrated ? settings : null,
    isHydrated,
  };
}

/**
 * Convenience hook that returns active profile only after hydration.
 */
export function useActiveProfileSafe() {
  const { store, isHydrated } = useHydratedProfileStore();
  const profiles = store((state) => state.profiles);
  const activeProfileId = store((state) => state.activeProfileId);

  if (!isHydrated) {
    return null;
  }

  return profiles.find((p) => p.id === activeProfileId) || null;
}
