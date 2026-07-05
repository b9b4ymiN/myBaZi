"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/config/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 opacity-30">
        <Image
          src="/assets/brand/element-mountain-ink.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="240px"
          className="object-cover object-bottom"
        />
      </div>

      {/* Logo */}
      <div className="relative flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <Image
          src="/assets/pwa/app-icon-512.png"
          alt=""
          aria-hidden="true"
          width={38}
          height={38}
          className="h-10 w-10 rounded-2xl"
        />
        <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-jade">
          myBaZi
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex flex-1 flex-col gap-2 px-3 py-5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive(item.href)
                  ? "surface-jade shadow-[0_10px_28px_rgba(47,122,104,0.22)]"
                  : "text-sidebar-foreground/78"
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.labelCn}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="relative border-t border-sidebar-border p-3">
        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            "inline-flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            isActive(SETTINGS_ITEM.href)
              ? "surface-jade shadow-[0_10px_28px_rgba(47,122,104,0.22)]"
              : "text-sidebar-foreground/78"
          )}
          aria-current={isActive(SETTINGS_ITEM.href) ? "page" : undefined}
        >
          <SETTINGS_ITEM.icon className="h-5 w-5" />
          <span className="flex-1 text-left">{SETTINGS_ITEM.label}</span>
          <span className="text-xs text-muted-foreground">{SETTINGS_ITEM.labelCn}</span>
        </Link>
      </div>
    </aside>
  );
}
