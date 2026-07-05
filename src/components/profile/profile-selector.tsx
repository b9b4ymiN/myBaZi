"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Settings, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileStoreBase } from "@/lib/stores/profile-store";
import { useActiveProfileSafe, useHydratedProfileStore } from "@/lib/stores/use-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/types/profile";

export function ProfileSelector() {
  const router = useRouter();
  const activeProfile = useActiveProfileSafe();
  const profiles = useProfileStoreBase((state) => state.profiles);
  const setActiveProfile = useProfileStoreBase((state) => state.setActiveProfile);
  const { isHydrated } = useHydratedProfileStore();

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile.id);
    router.refresh();
  };

  // Show skeleton during hydration
  if (!isHydrated) {
    return (
      <Skeleton className="h-10 w-[180px] rounded-full" />
    );
  }

  // No profiles state
  if (!activeProfile) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/profiles")}
        className="h-10 gap-2 rounded-full border-border bg-card/80"
      >
        <Plus className="h-4 w-4" />
        เพิ่มโปรไฟล์
      </Button>
    );
  }

  // Has active profile - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full border-border bg-card/80 pl-1.5 pr-3">
          <div className="h-8 w-8 rounded-full border-2 border-gold/60 bg-jade/10 flex items-center justify-center overflow-hidden relative">
            <Image
              src={
                activeProfile.gender === "male"
                  ? "/assets/brand/man.png"
                  : activeProfile.gender === "female"
                    ? "/assets/brand/woman.png"
                    : "/assets/brand/logo.png"
              }
              alt={`avatar โปรไฟล์ ${activeProfile.name}`}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="max-w-[120px] truncate">{activeProfile.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">โปรไฟล์</p>
            <p className="text-xs text-muted-foreground">
              {activeProfile.name}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile list */}
        {profiles.length > 1 && (
          <>
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className="gap-2"
              >
                {profile.id === activeProfile.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                <span className={profile.id === activeProfile.id ? "font-medium" : ""}>
                  {profile.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Manage profiles */}
        <DropdownMenuItem onClick={() => router.push("/profiles")}>
          <Settings className="h-4 w-4 mr-2" />
          จัดการโปรไฟล์
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
