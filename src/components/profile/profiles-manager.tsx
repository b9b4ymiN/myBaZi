"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteHeader } from "@/components/layout/page-patterns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfileForm } from "./profile-form";
import { useProfileStoreBase } from "@/lib/stores/profile-store";
import { useProfiles } from "@/lib/stores/use-hydrated";
import { Plus, MoreVertical, Edit, Trash2, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types/profile";
import { DayMasterAvatar } from "./day-master-avatar";
import { formatThaiDate } from "@/lib/utils";
import { relationshipLabel } from "@/lib/bazi/relationship-labels";

export function ProfilesManager() {
  const router = useRouter();
  const { profiles, activeProfileId, isHydrated } = useProfiles();
  const store = useProfileStoreBase();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | undefined>();

  const handleAddProfile = () => {
    setEditingProfile(undefined);
    setFormOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormOpen(true);
  };

  const handleDeleteProfile = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      store.deleteProfile(profileToDelete.id);
      toast.success("ลบโปรไฟล์เรียบร้อย");
      setDeleteDialogOpen(false);
      setProfileToDelete(undefined);
      router.refresh();
    }
  };

  const handleSetActiveProfile = (id: string) => {
    store.setActiveProfile(id);
    toast.success("ตั้งเป็นโปรไฟล์หลักเรียบร้อย");
    router.refresh();
  };

  const handleSaveProfile = (data: Omit<Profile, "id" | "createdAt" | "updatedAt">) => {
    if (editingProfile) {
      store.updateProfile(editingProfile.id, data);
    } else {
      store.addProfile(data);
    }
  };

  return (
    <div className="space-y-6">
      <RouteHeader
        eyebrow="ผู้ใช้"
        title="โปรไฟล์"
        description={
          isHydrated
            ? `จัดการข้อมูลสำหรับคำนวณ BaZi · ${profiles.length} โปรไฟล์`
            : "จัดการข้อมูลสำหรับคำนวณ BaZi"
        }
        actions={
          isHydrated && profiles.length > 0 ? (
            <Button onClick={handleAddProfile}>
              <Plus className="h-4 w-4 mr-1.5" />
              เพิ่มโปรไฟล์
            </Button>
          ) : undefined
        }
      />

      {/* Loading skeleton */}
      {!isHydrated && (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isHydrated && profiles.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-jade/10 p-4">
              <UserPlus className="h-8 w-8 text-jade" />
            </div>
            <h3 className="text-xl font-semibold mb-1">ยังไม่มีโปรไฟล์</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              สร้างโปรไฟล์แรกเพื่อเริ่มคำนวณดวงชะตา BaZi
            </p>
            <Button onClick={handleAddProfile} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              สร้างโปรไฟล์แรก
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile list */}
      {isHydrated && profiles.length > 0 && (
        <div className="grid gap-3">
          {profiles.map((profile) => {
            const active = activeProfileId === profile.id;
            return (
              <Card
                key={profile.id}
                className={
                  active
                    ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                    : ""
                }
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="shrink-0 rounded-full border-2 border-gold/60 bg-jade/10 p-0.5">
                    <DayMasterAvatar profile={profile} size={48} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold leading-tight">
                        {profile.name}
                      </span>
                      {profile.relationship && (
                        <Badge variant="outline" className="text-[0.65rem]">
                          {relationshipLabel(profile.relationship)}
                        </Badge>
                      )}
                      {active && (
                        <Badge className="gap-1 py-0 px-1.5 text-[0.65rem]">
                          <Check className="h-3 w-3" />
                          หลัก
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{profile.gender === "male" ? "ชาย" : "หญิง"}</span>
                      <span aria-hidden>·</span>
                      <span>เกิด {formatThaiDate(profile.birthDate)}</span>
                      {profile.birthTimeKnown === "known" && profile.birthTime && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{profile.birthTime} น.</span>
                        </>
                      )}
                    </div>

                    {profile.note && (
                      <p className="border-t pt-1.5 text-xs text-muted-foreground">
                        {profile.note}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!active && (
                        <DropdownMenuItem onClick={() => handleSetActiveProfile(profile.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          ตั้งเป็นโปรไฟล์หลัก
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                        <Edit className="h-4 w-4 mr-2" />
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProfile(profile)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProfileForm
        open={formOpen}
        onOpenChange={setFormOpen}
        profile={editingProfile}
        onSave={handleSaveProfile}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโปรไฟล์</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโปรไฟล์ &quot;{profileToDelete?.name}&quot; ใช่หรือไม่
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              ลบโปรไฟล์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
