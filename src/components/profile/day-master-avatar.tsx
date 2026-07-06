/**
 * DayMasterAvatar — แสดง character avatar ของ day stem (เจ้าวัน) ของ profile
 * แทน gender avatar (man/woman.png) เดิม ด้วย avatar เฉพาะ stem (10 ตัว)
 * + gender badge (♂/♀) ซ้อนมุมขวาล่าง เพื่อยังเห็นเพศ
 *
 * day stem คำนวณจาก birthDate ผ่าน engine (รองรับ birthTime unknown)
 */
"use client";

import Image from "next/image";
import { characterAssetPath } from "@/components/bazi/character-asset";
import { calculateBaZi } from "@/lib/bazi/calculate";
import type { Profile } from "@/types/profile";

/** day stem name ของ profile (fallback 甲 ถ้า calc ไม่ได้) */
export function dayStemName(profile: Profile): string {
  try {
    return calculateBaZi(profile).dayMaster.name;
  } catch {
    return "甲";
  }
}

const GENDER_BADGE: Record<Profile["gender"], { symbol: string; className: string }> = {
  male: { symbol: "♂", className: "bg-blue-500/90 text-white" },
  female: { symbol: "♀", className: "bg-pink-500/90 text-white" },
};

interface DayMasterAvatarProps {
  profile: Profile;
  /** ขนาด avatar แบบ square (px). default 48 */
  size?: number;
  /** แสดง gender badge (default true) */
  showBadge?: boolean;
  className?: string;
}

export function DayMasterAvatar({
  profile,
  size = 48,
  showBadge = true,
  className,
}: DayMasterAvatarProps) {
  const stem = dayStemName(profile);
  const badge = GENDER_BADGE[profile.gender];
  // badge ขนาด ~40% ของ avatar, อย่างต่ำ 16px
  const badgeSize = Math.max(16, Math.round(size * 0.4));

  return (
    <div
      className={`relative flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={characterAssetPath(stem)}
        alt={`avatar ${profile.name} (เจ้าวัน ${stem})`}
        fill
        className="object-contain"
        sizes={`${size}px`}
      />
      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 flex items-center justify-center rounded-full ring-2 ring-background leading-none ${badge.className}`}
          style={{ width: badgeSize, height: badgeSize, fontSize: Math.round(badgeSize * 0.7) }}
          aria-label={profile.gender === "male" ? "ชาย" : "หญิง"}
        >
          {badge.symbol}
        </span>
      )}
    </div>
  );
}
