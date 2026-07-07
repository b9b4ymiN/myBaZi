"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  House,
  ScrollText,
  Calendar,
  Grid3x3,
  Sparkles,
  Heart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/components/ui/motion";
import { QIMEN_ENABLED } from "@/config/nav";

interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// 6 ช่อง (qimen + settings hidden) — home + bazi + tongshu + tianji + relationships + profiles
// เมื่อ qimen เปิดกลับมา = 7 ช่อง (toggle ใน nav.ts). settings เข้าผ่าน avatar/top-bar แทน
const ALL_MOBILE_ITEMS: MobileNavItem[] = [
  { href: "/", label: "หน้าแรก", icon: House },
  { href: "/bazi", label: "ปาจื้อ", icon: ScrollText },
  { href: "/tongshu", label: "ปฏิทิน", icon: Calendar },
  { href: "/qimen", label: "ฉีเหมือน", icon: Grid3x3 },
  { href: "/tianji", label: "เทียนจี", icon: Sparkles },
  { href: "/relationships", label: "ความสัมพันธ์", icon: Heart },
  { href: "/profiles", label: "โปรไฟล์", icon: Users },
];

const MOBILE_ITEMS: MobileNavItem[] = ALL_MOBILE_ITEMS.filter(
  (item) => QIMEN_ENABLED || item.href !== "/qimen",
);

/** spring นุ่มสำหรับ active pill + icon (จาก MOTION token) */
const SPRING = MOTION.spring.soft;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-border bg-card/94 px-1.5 pb-1 pt-1.5 shadow-[0_-12px_32px_rgba(76,57,25,0.10)] backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
      style={{ viewTransitionName: "site-nav" }}
    >
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-current={active ? "page" : undefined}
          >
            {/* Active pill — เลื่อนนุ่มนวลระหว่าง items (motion layoutId) */}
            {active && (
              <motion.span
                layoutId="bottom-nav-active-pill"
                className="absolute inset-0 surface-jade shadow-[0_8px_20px_rgba(47,122,104,0.25)] rounded-xl"
                transition={SPRING}
                initial={false}
              />
            )}
            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-1 px-1 py-2"
              animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
              transition={SPRING}
            >
              <Icon
                className={cn(
                  "h-[22px] w-[22px] shrink-0 transition-colors duration-200",
                  active
                    ? "text-white drop-shadow-sm"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span
                className={cn(
                  "max-w-full truncate text-[0.7rem] font-medium leading-tight transition-colors duration-200",
                  active
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
