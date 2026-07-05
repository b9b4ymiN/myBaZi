import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/types/profile';

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  addProfile: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (id: string, data: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
}

export const useProfileStoreBase = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (data) => {
        const name = data.name.trim();
        if (!name) {
          throw new Error("Profile name is required");
        }
        const now = new Date().toISOString();
        const newProfile: Profile = {
          ...data,
          name, // เก็บชื่อที่ trim แล้ว
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          // Set as active if it's the first profile
          activeProfileId: state.profiles.length === 0 ? newProfile.id : state.activeProfileId,
        }));
      },

      updateProfile: (id, data) => {
        // trim name ถ้ามีการส่งมา
        const normalizedData =
          data.name !== undefined ? { ...data, name: data.name.trim() } : data;
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id
              ? { ...p, ...normalizedData, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProfile: (id) => {
        set((state) => {
          const newProfiles = state.profiles.filter((p) => p.id !== id);

          // Handle activeProfileId if deleted profile was active
          let newActiveProfileId = state.activeProfileId;
          if (state.activeProfileId === id) {
            // Set to null if no profiles left, or first profile otherwise
            newActiveProfileId = newProfiles.length > 0 ? newProfiles[0].id : null;
          }

          return {
            profiles: newProfiles,
            activeProfileId: newActiveProfileId,
          };
        });
      },

      setActiveProfile: (id) => {
        set({ activeProfileId: id });
      },
    }),
    {
      name: 'mybazi-profiles',
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

// Helper selector to get active profile
export const useActiveProfile = () => {
  const profiles = useProfileStoreBase((state) => state.profiles);
  const activeProfileId = useProfileStoreBase((state) => state.activeProfileId);

  return profiles.find((p) => p.id === activeProfileId) || null;
};
