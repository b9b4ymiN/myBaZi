"use client";

/**
 * CelestialBg — atmosphere background สำหรับหน้า天机
 *
 * Nebula (gold/jade radial glows) + 命 (destiny) calligraphy watermark จางๆ
 * + twinkling stars กระจายเบาๆ
 * เป็น layer หลังเนื้อหา (pointer-events-none, absolute inset-0)
 * Reduced motion: stars static ผ่าน CSS @media (ดู globals.css)
 *
 * Note: ใช้ CSS animation แทน motion lib เพราะเป็น infinite loop ของ stars
 * หลายดวง — เบากว่าและไม่กิน render thread บนมือถือเก่า
 */

import Image from "next/image";

// fixed positions (ไม่สุ่มตอน render — กัน hydration/layout shift)
const STARS = [
  { top: "8%", left: "15%", size: 2, delay: "0s" },
  { top: "18%", left: "78%", size: 3, delay: "1.4s" },
  { top: "32%", left: "42%", size: 2, delay: "0.8s" },
  { top: "48%", left: "88%", size: 2, delay: "2.1s" },
  { top: "62%", left: "12%", size: 3, delay: "0.4s" },
  { top: "75%", left: "65%", size: 2, delay: "1.8s" },
  { top: "85%", left: "35%", size: 2, delay: "2.6s" },
  { top: "12%", left: "52%", size: 2, delay: "1.1s" },
] as const;

export function CelestialBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Nebula — gold/jade radial glows (brand ตายตัว) */}
      <div className="celestial-nebula absolute inset-0" />
      {/* 命 (destiny) calligraphy watermark — theme ของ天机, จางมาก multiply ลง bg */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/brand/m5.webp"
          alt=""
          width={768}
          height={768}
          className="h-[150%] w-auto max-w-none object-contain opacity-[0.06] mix-blend-multiply"
        />
      </div>
      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="celestial-star absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
