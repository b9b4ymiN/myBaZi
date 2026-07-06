import type { LucideIcon } from "lucide-react";
import {
  ScrollText,
  Calendar,
  Grid3x3,
  Sparkles,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  labelCn: string;
  icon: LucideIcon;
}

/**
 * ฉีเหมือนยังไม่พร้อม — hide ออกจาก navigation/UI ชั่วคราว
 * route `/qimen` ยังเข้าได้ (URL ตรง) เพราะยังไม่ลบ page + components
 * พร้อมทำจริง → flip `true` แล้วจบ
 */
export const QIMEN_ENABLED = false;

const ALL_NAV_ITEMS: NavItem[] = [
  {
    href: "/bazi",
    label: "ปาจื้อ",
    labelCn: "八字",
    icon: ScrollText,
  },
  {
    href: "/tongshu",
    label: "ปฏิทินมงคล",
    labelCn: "通勝",
    icon: Calendar,
  },
  {
    href: "/qimen",
    label: "ฉีเหมือน",
    labelCn: "奇門遁甲",
    icon: Grid3x3,
  },
  {
    href: "/tianji",
    label: "เทียนจี",
    labelCn: "天机",
    icon: Sparkles,
  },
];

export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter(
  (item) => QIMEN_ENABLED || item.href !== "/qimen",
);

export const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  label: "ตั้งค่า",
  labelCn: "設定",
  icon: Settings,
};
