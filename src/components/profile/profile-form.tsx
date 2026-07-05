"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Profile, Gender, BirthTimeKnown } from "@/types/profile";

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: Profile;
  onSave: (data: Omit<Profile, "id" | "createdAt" | "updatedAt">) => void;
}

const ASIAN_TIMEZONES = [
  { value: "Asia/Bangkok", label: "Bangkok (TH)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "Shanghai (CN)" },
  { value: "Asia/Taipei", label: "Taipei (TW)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo (JP)" },
  { value: "UTC", label: "UTC" },
];

export function ProfileForm({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gender: "male" as Gender,
    birthDate: "",
    birthTime: "",
    birthTimeKnown: "known" as BirthTimeKnown,
    timezone: "Asia/Bangkok",
    birthLongitude: "",
    useTrueSolarTime: true,
    note: "",
  });

  // Reset form when dialog opens/closes or profile changes
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: profile.name,
        gender: profile.gender,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime || "",
        birthTimeKnown: profile.birthTimeKnown,
        timezone: profile.timezone,
        birthLongitude: profile.birthLongitude?.toString() || "",
        useTrueSolarTime: profile.useTrueSolarTime ?? true,
        note: profile.note || "",
      });
    } else {
      setFormData({
        name: "",
        gender: "male",
        birthDate: "",
        birthTime: "",
        birthTimeKnown: "known",
        timezone: "Asia/Bangkok",
        birthLongitude: "",
        useTrueSolarTime: true,
        note: "",
      });
    }
  }, [profile, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    if (!formData.birthDate) {
      toast.error("กรุณากรอกวันเกิด");
      return;
    }

    const birthDate = new Date(formData.birthDate);
    if (isNaN(birthDate.getTime())) {
      toast.error("วันเกิดไม่ถูกต้อง");
      return;
    }

    if (formData.birthTimeKnown === "known" && !formData.birthTime) {
      toast.error("กรุณากรอกเวลาเกิด");
      return;
    }

    // Create profile data with client-side timestamp
    const now = new Date().toISOString();
    const profileData = {
      name: formData.name.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTimeKnown === "known" ? formData.birthTime : null,
      birthTimeKnown: formData.birthTimeKnown,
      timezone: formData.timezone,
      birthLongitude: formData.birthLongitude ? parseFloat(formData.birthLongitude) : undefined,
      useTrueSolarTime: formData.useTrueSolarTime,
      note: formData.note.trim() || undefined,
      createdAt: profile ? profile.createdAt : now,
      updatedAt: now,
    };

    onSave(profileData);
    onOpenChange(false);
    toast.success(profile ? "บันทึกโปรไฟล์เรียบร้อย" : "สร้างโปรไฟล์เรียบร้อย");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {profile ? "แก้ไขโปรไฟล์" : "สร้างโปรไฟล์ใหม่"}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลส่วนตัวเพื่อใช้ในการคำนวณ BaZi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="เช่น สมชาย หรือ น้องก้อง"
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: Gender) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">วันเกิด</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              required
            />
          </div>

          {/* Birth Time Known */}
          <div className="space-y-2">
            <Label>ทราบเวลาเกิดหรือไม่</Label>
            <Select
              value={formData.birthTimeKnown}
              onValueChange={(value: BirthTimeKnown) =>
                setFormData({ ...formData, birthTimeKnown: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="known">ทราบเวลาเกิด</SelectItem>
                <SelectItem value="unknown">ไม่ทราบเวลาเกิด</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Time */}
          {formData.birthTimeKnown === "known" && (
            <div className="space-y-2">
              <Label htmlFor="birthTime">เวลาเกิด</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) =>
                  setFormData({ ...formData, birthTime: e.target.value })
                }
                required
              />
            </div>
          )}

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">โซนเวลา</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) =>
                setFormData({ ...formData, timezone: value })
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASIAN_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* True Solar Time Toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useTrueSolarTime"
                checked={formData.useTrueSolarTime}
                onChange={(e) =>
                  setFormData({ ...formData, useTrueSolarTime: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="useTrueSolarTime" className="cursor-pointer">
                ใช้เวลาแท้ (True Solar Time)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              เวลาแท้ตามตำแหน่งดวงอาทิตย์จริง แม่นยำกว่ามาตรฐาน Beijing time
            </p>
          </div>

          {/* Birth Longitude */}
          {formData.useTrueSolarTime && (
            <div className="space-y-2">
              <Label htmlFor="birthLongitude">ลองจิจูดของสถานที่เกิด (ไม่บังคับ)</Label>
              <Input
                id="birthLongitude"
                type="number"
                step="0.1"
                value={formData.birthLongitude}
                onChange={(e) =>
                  setFormData({ ...formData, birthLongitude: e.target.value })
                }
                placeholder="100.5"
              />
              <p className="text-xs text-muted-foreground">
                ใส่ลองจิจูดเมืองเกิดเพื่อความแม่นยำสูงสุด (เช่น 100.5 สำหรับ กทม.)
                ค้นหาได้จาก Google Maps
              </p>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุ (ไม่บังคับ)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="เพิ่มหมายเหตุถ้าต้องการ"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">
              {profile ? "บันทึก" : "สร้างโปรไฟล์"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
