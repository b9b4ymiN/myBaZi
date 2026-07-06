"use client";

/**
 * AtmosphereFrame — เลเยอร์ background "landscape frame" ตาม theme
 *
 * light → bg_wood (เขียวอบอุ่น), dark → bg_sea (ฟ้าเย็น). ภาพทั้งคู่เป็น
 * stylized landscape บนพื้นโปร่ง (กลางโปร่ง ขอบเป็นธรรมชาติ) เลยใช้เป็น
 * atmospheric layer หลัง content ด้วย opacity ต่ำ — กลางหน้ายังโล่งอ่านได้.
 *
 * Hydration/theme-flash safe: ใช้ useSyncExternalStore mounted-guard รบกวน
 * น้อย → ภาพ render เฉพาะหลัง client mount (ฝั่ง server และ first client render
 * = null เหมือนกัน → ไม่มี mismatch และไม่ flash ภาพผิด theme).
 */

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

const BG_LIGHT = "/assets/brand/bg_wood-Photoroom.png";
const BG_DARK = "/assets/brand/bg_sea-Photoroom.png";

export interface AtmosphereFrameProps {
  className?: string;
}

export function AtmosphereFrame({ className }: AtmosphereFrameProps) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientMounted,
    getServerMounted,
  );
  const { resolvedTheme } = useTheme();

  if (!mounted) return null;

  const src = resolvedTheme === "dark" ? BG_DARK : BG_LIGHT;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.16] dark:opacity-[0.22]"
      />
    </div>
  );
}
