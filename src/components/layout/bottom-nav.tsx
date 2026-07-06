"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ScrollText,
  Calendar,
  Grid3x3,
  Sparkles,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QIMEN_ENABLED } from "@/config/nav";

interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// 7 ช่อง — 4 modules + หน้าแรก + โปรไฟล์ + ตั้งค่า (เข้า settings/profiles จาก mobile ได้)
const ALL_MOBILE_ITEMS: MobileNavItem[] = [
  { href: "/", label: "หน้าแรก", icon: House },
  { href: "/bazi", label: "ปาจื้อ", icon: ScrollText },
  { href: "/tongshu", label: "ปฏิทิน", icon: Calendar },
  { href: "/qimen", label: "ฉีเหมือน", icon: Grid3x3 },
  { href: "/tianji", label: "เทียนจี", icon: Sparkles },
  { href: "/profiles", label: "โปรไฟล์", icon: Users },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

const MOBILE_ITEMS: MobileNavItem[] = ALL_MOBILE_ITEMS.filter(
  (item) => QIMEN_ENABLED || item.href !== "/qimen",
);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-border bg-card/94 px-0.5 shadow-[0_-12px_32px_rgba(76,57,25,0.10)] backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[0.6rem] font-medium leading-tight transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "surface-jade shadow-[0_8px_20px_rgba(47,122,104,0.20)]"
                : "text-muted-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
