"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const mobileItems = [
    { href: "/", label: "หน้าหลัก", labelCn: "หลัก", icon: House },
    ...NAV_ITEMS,
  ];

  return (
    <nav
      className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t border-border bg-card/94 px-1 shadow-[0_-12px_32px_rgba(76,57,25,0.10)] backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-medium transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "surface-jade shadow-[0_10px_24px_rgba(47,122,104,0.22)]"
                : "text-muted-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-12 truncate">{item.labelCn}</span>
          </Link>
        );
      })}
    </nav>
  );
}
