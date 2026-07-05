"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import Image from "next/image";
import type { Profile } from "@/types/profile";

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

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">จัดการโปรไฟล์</h1>
              <p className="text-muted-foreground">กำลังโหลด...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">จัดการโปรไฟล์</h1>
              <p className="text-muted-foreground">
                สร้างโปรไฟล์เพื่อเริ่มคำนวณ BaZi
              </p>
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">ยังไม่มีโปรไฟล์</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                สร้างโปรไฟล์แรกของคุณเพื่อเริ่มคำนวณดวงชะตา BaZi
              </p>
              <Button onClick={handleAddProfile} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                สร้างโปรไฟล์แรก
              </Button>
            </CardContent>
          </Card>
        </div>

        <ProfileForm
          open={formOpen}
          onOpenChange={setFormOpen}
          profile={editingProfile}
          onSave={handleSaveProfile}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">จัดการโปรไฟล์</h1>
            <p className="text-muted-foreground">
              จัดการข้อมูลส่วนตัวสำหรับคำนวณ BaZi ({profiles.length} โปรไฟล์)
            </p>
          </div>
          <Button onClick={handleAddProfile}>
            <Plus className="h-5 w-5 mr-2" />
            เพิ่มโปรไฟล์
          </Button>
        </div>

        <div className="grid gap-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={
                activeProfileId === profile.id
                  ? "border-primary bg-primary/5"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full border-2 border-gold/60 bg-jade/10 flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={
                          profile.gender === "male"
                            ? "/assets/brand/man.png"
                            : profile.gender === "female"
                              ? "/assets/brand/woman.png"
                              : "/assets/brand/logo.png"
                        }
                        alt={`avatar โปรไฟล์ ${profile.name}`}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {profile.name}
                        {activeProfileId === profile.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            โปรไฟล์หลัก
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {profile.gender === "male" ? "ชาย" : "หญิง"} • เกิด{" "}
                        {new Date(profile.birthDate).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {profile.birthTimeKnown === "known" && profile.birthTime && (
                          <> เวลา {profile.birthTime}</>
                        )}
                        {" • "}
                        {profile.timezone}
                      </CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {activeProfileId !== profile.id && (
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
                </div>
              </CardHeader>

              {profile.note && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{profile.note}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

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
