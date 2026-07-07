"use client";

/**
 * TianJiOrb — signature visual ของหน้า天机
 *
 * Orb วงกลมเรืองแสง + float ช้า + ดาว orbit รอบ + element-tinted glow
 * (เปลี่ยนสีตาม Day Master ธาตุของ user — ดึงดวงเข้ามาเป็นส่วนตัว)
 *
 * ใช้ motion lib (signature moment เหมาะใช้ lib เต็ม) + transform/opacity only
 * เพื่อ GPU-friendly บนมือถือเก่า. Reduced motion: orb นิ่ง + ไม่มี orbit.
 */

import { motion, useReducedMotion } from "motion/react";
import type { ElementName } from "@/lib/bazi/types";

/** Glow shadow color ต่อธาตุ (rgba เพื่อใช้ใน box-shadow) */
const ELEMENT_GLOW: Record<ElementName, string> = {
  木: "rgba(74, 138, 92, 0.55)", // wood — green
  火: "rgba(206, 92, 62, 0.6)", // fire — red-orange
  土: "rgba(184, 148, 88, 0.55)", // earth — yellow-brown
  金: "rgba(180, 184, 196, 0.55)", // metal — silver
  水: "rgba(72, 122, 168, 0.55)", // water — blue
};

/** Gradient body ต่อธาตุ (Tailwind literal — v4 ต้องเห็นเต็ม) */
const ELEMENT_GRADIENT: Record<ElementName, string> = {
  木: "from-emerald-300 to-jade",
  火: "from-orange-300 to-rose-600",
  土: "from-amber-200 to-yellow-700",
  金: "from-slate-200 to-slate-500",
  水: "from-sky-300 to-blue-700",
};

const DEFAULT_GRADIENT = "from-gold to-jade";
const DEFAULT_GLOW = "rgba(47, 122, 104, 0.5)"; // jade

export interface TianJiOrbProps {
  /** Day Master element — tint orb ตามธาตุ (null = default jade-gold) */
  element?: ElementName | null;
  /** ขนาด orb px (welcome = 96, thinking = 48) */
  size?: number;
  /** แสดงตัวอักษร 天机 ข้างใน */
  showLabel?: boolean;
  className?: string;
}

export function TianJiOrb({
  element,
  size = 96,
  showLabel = true,
  className,
}: TianJiOrbProps) {
  const reduce = useReducedMotion();
  const glow = (element && ELEMENT_GLOW[element]) || DEFAULT_GLOW;
  const gradient = (element && ELEMENT_GRADIENT[element]) || DEFAULT_GRADIENT;
  const labelSize = Math.round(size * 0.3);

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: glow }}
        aria-hidden="true"
      />

      {/* Orbiting stars — parent rotate, children ที่ขอบ */}
      {!reduce && (
        <>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          >
            <span
              className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold"
              style={{ boxShadow: "0 0 8px var(--gold)" }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          >
            <span
              className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-jade"
              style={{ boxShadow: "0 0 6px var(--jade)" }}
            />
          </motion.div>
        </>
      )}

      {/* Orb body — float ช้าขึ้นลง */}
      <motion.div
        className={`relative rounded-full bg-gradient-to-br ${gradient}`}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 32px ${glow}, inset 0 0 20px rgba(255,255,255,0.25)`,
        }}
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Specular highlight — เส้นแสงบนขอบบน */}
        <div
          className="absolute left-1/4 top-[12%] h-[30%] w-1/2 rounded-full bg-white/40 blur-md"
          aria-hidden="true"
        />
        {/* 天机 label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-serif font-bold leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
              style={{ fontSize: `${labelSize}px` }}
            >
              天机
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
