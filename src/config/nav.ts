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

export const NAV_ITEMS: NavItem[] = [
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

export const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  label: "ตั้งค่า",
  labelCn: "設定",
  icon: Settings,
};
