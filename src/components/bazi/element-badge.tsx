/**
 * ElementBadge component - แสดงธาตุพร้อมสี
 * Reusable component สำหรับแสดงธาตุใน NatalChart และ components อื่นๆ
 */

import type { ElementName } from "@/lib/bazi/types";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { cn } from "@/lib/utils";

interface ElementBadgeProps {
  element: ElementName;
  size?: "sm" | "md" | "lg";
  showThai?: boolean;
  showEnglish?: boolean;
  className?: string;
}

/**
 * Map ธาตุ → สี (Tailwind classes)
 * 木=เขียว, 火=แดง, 土=เหลือง/น้ำตาล, 金=ขาว/ทอง, 水=ดำ/น้ำเงิน
 */
const ELEMENT_COLORS: Record<ElementName, { bg: string; text: string; border: string }> = {
  木: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
  },
  火: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
  },
  土: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  金: {
    bg: "bg-slate-100 dark:bg-slate-700/30",
    text: "text-slate-800 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-600",
  },
  水: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

/**
 * แสดง badge ธาตุพร้อมสี
 *
 * @example
 * <ElementBadge element="木" size="md" showThai />
 */
export function ElementBadge({
  element,
  size = "md",
  showThai = true,
  showEnglish = false,
  className,
}: ElementBadgeProps) {
  const colors = ELEMENT_COLORS[element];
  const thaiName = ELEMENT_THAI[element];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        colors.bg,
        colors.text,
        colors.border,
        SIZE_CLASSES[size],
        className
      )}
    >
      <span className="text-lg">{element}</span>
      {showThai && <span className="text-xs">{thaiName}</span>}
      {showEnglish && (
        <span className="text-xs opacity-75">
          {element === "木" && "Wood"}
          {element === "火" && "Fire"}
          {element === "土" && "Earth"}
          {element === "金" && "Metal"}
          {element === "水" && "Water"}
        </span>
      )}
    </span>
  );
}
