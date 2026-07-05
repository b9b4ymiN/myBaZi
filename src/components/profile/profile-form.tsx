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
import {
  BIRTH_LOCATIONS,
  findLocation,
  findLocationByName,
} from "@/lib/bazi/locations";

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

interface FormData {
  name: string;
  gender: Gender;
  birthDate: string;
  birthTime: string;
  birthTimeKnown: BirthTimeKnown;
  locationInput: string; // text ใน datalist (nameTh หรือที่ผู้ใช้พิมพ์)
  birthLocationKey: string; // "" = ยังไม่ match จังหวัดใน list
  useCustomLocation: boolean; // true = กรอก timezone + longitude เอง
  timezone: string; // ใช้ใน custom mode
  birthLongitude: string; // ใช้ใน custom mode
  useTrueSolarTime: boolean;
  note: string;
}

const DEFAULT_FORM: FormData = {
  name: "",
  gender: "male",
  birthDate: "",
  birthTime: "",
  birthTimeKnown: "known",
  locationInput: "กรุงเทพมหานคร",
  birthLocationKey: "bangkok",
  useCustomLocation: false,
  timezone: "Asia/Bangkok",
  birthLongitude: "",
  useTrueSolarTime: true,
  note: "",
};

export function ProfileForm({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  // Reset form when dialog opens/closes or profile changes
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore form ตอนเปิด/edit (dep = profile/open ไม่ loop)
      setFormData(buildFormFromProfile(profile));
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [profile, open]);

  /** ผู้ใช้พิมพ์/เลือกใน datalist → match จังหวัด แล้ว derive timezone+longitude */
  const handleLocationInput = (value: string) => {
    const loc = findLocationByName(value);
    setFormData((prev) => ({
      ...prev,
      locationInput: value,
      birthLocationKey: loc ? loc.key : "",
      // sync timezone/longitude เผื่อ user toggle ไป custom mode ภายหลัง
      timezone: loc ? loc.timezone : prev.timezone,
      birthLongitude: loc ? loc.longitude.toFixed(4) : prev.birthLongitude,
    }));
  };

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

    // Location validation
    if (!formData.useCustomLocation && !formData.birthLocationKey) {
      toast.error("กรุณาเลือกจังหวัด หรือเปิด 'กำหนดเอง'");
      return;
    }

    // Derive timezone + longitude ตาม mode
    let timezone: string;
    let birthLongitude: number | undefined;
    let birthLocationKey: string | undefined;

    if (formData.useCustomLocation) {
      timezone = formData.timezone;
      birthLongitude = formData.birthLongitude
        ? parseFloat(formData.birthLongitude)
        : undefined;
      birthLocationKey = undefined;
    } else {
      const loc = findLocation(formData.birthLocationKey);
      if (!loc) {
        toast.error("สถานที่เกิดไม่ถูกต้อง กรุณาเลือกใหม่");
        return;
      }
      timezone = loc.timezone;
      birthLongitude = loc.longitude;
      birthLocationKey = loc.key;
    }

    const now = new Date().toISOString();
    const profileData = {
      name: formData.name.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTimeKnown === "known" ? formData.birthTime : null,
      birthTimeKnown: formData.birthTimeKnown,
      timezone,
      birthLongitude,
      useTrueSolarTime: formData.useTrueSolarTime,
      birthLocationKey,
      note: formData.note.trim() || undefined,
      createdAt: profile ? profile.createdAt : now,
      updatedAt: now,
    };

    onSave(profileData);
    onOpenChange(false);
    toast.success(profile ? "บันทึกโปรไฟล์เรียบร้อย" : "สร้างโปรไฟล์เรียบร้อย");
    router.refresh();
  };

  // Location ที่ match ในปัจจุบัน (สำหรับแสดง preview)
  const matchedLocation = formData.birthLocationKey
    ? findLocation(formData.birthLocationKey)
    : undefined;

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

          {/* Birth Location — Custom toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useCustomLocation"
              checked={formData.useCustomLocation}
              onChange={(e) =>
                setFormData({ ...formData, useCustomLocation: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="useCustomLocation" className="cursor-pointer">
              เกิดต่างประเทศ / กำหนดเอง (timezone + ลองจิจูด)
            </Label>
          </div>

          {/* Birth Location — datalist (จังหวัด) OR custom inputs */}
          {!formData.useCustomLocation ? (
            <div className="space-y-2">
              <Label htmlFor="birthLocation">สถานที่เกิด (จังหวัด)</Label>
              <Input
                id="birthLocation"
                list="birth-locations"
                value={formData.locationInput}
                onChange={(e) => handleLocationInput(e.target.value)}
                placeholder="พิมพ์หรือเลือกจังหวัด เช่น กรุงเทพมหานคร"
              />
              <datalist id="birth-locations">
                {BIRTH_LOCATIONS.map((loc) => (
                  <option key={loc.key} value={loc.nameTh}>
                    {loc.nameEn}
                  </option>
                ))}
              </datalist>
              {matchedLocation ? (
                <p className="text-xs text-muted-foreground">
                  ลองจิจูด {matchedLocation.longitude.toFixed(2)}°E · เขตเวลา{" "}
                  {matchedLocation.timezone}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  พิมพ์ชื่อจังหวัดให้ตรง เช่น &ldquo;กรุงเทพมหานคร&rdquo; &ldquo;เชียงใหม่&rdquo;
                  &ldquo;ขอนแก่น&rdquo;
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Timezone (custom) */}
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

              {/* Birth Longitude (custom) */}
              <div className="space-y-2">
                <Label htmlFor="birthLongitude">
                  ลองจิจูดของสถานที่เกิด (ไม่บังคับ)
                </Label>
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
                  ใส่ลองจิจูดเมืองเกิดเพื่อความแม่นยำสูงสุด (เช่น 100.5 สำหรับ
                  กทม.) ค้นหาได้จาก Google Maps
                </p>
              </div>
            </>
          )}

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

/**
 * สร้าง form state จาก Profile ที่บันทึกไว้
 * - ถ้ามี birthLocationKey ที่ยัง valid → restore เป็นโหมดเลือกจังหวัด
 * - ถ้าไม่มี key หรือ key stale → restore เป็น custom mode (backward compat)
 */
function buildFormFromProfile(profile: Profile): FormData {
  const base: FormData = {
    ...DEFAULT_FORM,
    name: profile.name,
    gender: profile.gender,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime || "",
    birthTimeKnown: profile.birthTimeKnown,
    useTrueSolarTime: profile.useTrueSolarTime ?? true,
    note: profile.note || "",
  };

  if (profile.birthLocationKey) {
    const loc = findLocation(profile.birthLocationKey);
    if (loc) {
      // Restore เป็นโหมดเลือกจังหวัด
      return {
        ...base,
        locationInput: loc.nameTh,
        birthLocationKey: loc.key,
        useCustomLocation: false,
        timezone: loc.timezone,
        birthLongitude: loc.longitude.toFixed(4),
      };
    }
    // key stale (จังหวัดถูกลบจาก list) → fallback custom
  }

  // Profile เก่า (กรอก manual) หรือ key stale → custom mode แสดงค่าเดิม
  return {
    ...base,
    locationInput: "",
    birthLocationKey: "",
    useCustomLocation: true,
    timezone: profile.timezone,
    birthLongitude: profile.birthLongitude?.toString() || "",
  };
}
