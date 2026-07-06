"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Scale,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/ui/markdown";
import {
  PageReveal,
  SectionReveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion";
import { TodayHero } from "@/components/home/today-hero";
import { useBaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { buildBaZiNarrativeV2 } from "@/lib/bazi/narrative-v2";
import { getArchetype } from "@/lib/bazi/archetypes";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { QIMEN_ENABLED } from "@/config/nav";
import type { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface HomeHubProps {
  profile: Profile;
}

const ELEMENT_KEY: Record<string, string> = {
  "木": "wood",
  "火": "fire",
  "土": "earth",
  "金": "metal",
  "水": "water",
};

/** Static element classes — Tailwind v4 ต้องเห็น literal เต็มจึงจะ generate */
const ELEMENT_TEXT: Record<string, string> = {
  wood: "text-element-wood",
  fire: "text-element-fire",
  earth: "text-element-earth",
  metal: "text-element-metal",
  water: "text-element-water",
};
const ELEMENT_GLOW: Record<string, string> = {
  wood: "bg-element-wood/25",
  fire: "bg-element-fire/25",
  earth: "bg-element-earth/25",
  metal: "bg-element-metal/25",
  water: "bg-element-water/25",
};

/** Module shortcut tiles. Qi Men is filtered out unless QIMEN_ENABLED. */
const SHORTCUTS = [
  {
    href: "/bazi",
    title: "八字 ปาจื้อ",
    desc: "แผนผัง 4 เสา",
    icon: "/assets/brand/element-mountain-ink.png",
    tint: "bg-element-fire/10",
  },
  {
    href: "/tongshu",
    title: "通勝 ปฏิทินมงคล",
    desc: "เลือกวันดี ชั่วโมงมงคล",
    icon: "/assets/brand/tool-calendar.png",
    tint: "bg-element-wood/10",
  },
  {
    href: "/qimen",
    title: "奇門遁甲 ฉีเหมือน",
    desc: "ทำนายเคลื่อนที่",
    icon: "/assets/brand/tool-compass-qimen.png",
    tint: "bg-element-metal/10",
  },
  {
    href: "/tianji",
    title: "天机 เทียนจี",
    desc: "AI ที่ปรึกษาดวง",
    icon: "/assets/brand/tool-tianji-star.png",
    tint: "bg-element-water/10",
  },
] as const;

export function HomeHub({ profile }: HomeHubProps) {
  const analysis = useBaZiAnalysis(profile);

  if (analysis === null) {
    return <HomeHubSkeleton />;
  }

  const archetype = getArchetype({
    name: analysis.strength.dayMaster.name,
    element: analysis.strength.dayMaster.element,
    yinYang: analysis.chart.dayMaster.yinYang === "阴" ? "yin" : "yang",
  });

  const narrative = buildBaZiNarrativeV2({
    profileName: profile.name,
    analysis,
    tenGodProfile: analysis.tenGodProfile,
    palace: analysis.palace,
    luckFavorability: analysis.luckFavorability,
    archetype,
  });

  const dayMasterElement = analysis.chart.dayMaster.element;
  const elementKey = ELEMENT_KEY[dayMasterElement] || "wood";

  const todayDate = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shortcuts = SHORTCUTS.filter(
    (s) => QIMEN_ENABLED || s.href !== "/qimen",
  );

  return (
    <PageReveal>
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-5 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          {/* Greeting — slim */}
          <div className="flex items-center gap-3">
            <Image
              src={profile.gender === "male" ? "/assets/brand/man.png" : "/assets/brand/woman.png"}
              alt=""
              aria-hidden="true"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border-2 border-gold/50 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{todayDate}</p>
              <h1 className="font-serif text-xl font-bold text-ink">
                สวัสดี, {profile.name}
              </h1>
            </div>
          </div>

          {/* TodayHero — ไฮไลต์ "วันนี้" */}
          <TodayHero
            userDayMaster={{
              stem: analysis.strength.dayMaster.name,
              element: dayMasterElement,
            }}
            usefulGodElement={analysis.usefulGod.primaryElement}
          />

          {/* Day Master — hero focal (日主) */}
          <SectionReveal>
            <Card className="relative overflow-hidden border-gold/50">
              {/* Tiangan char ใหญ่เป็น bg */}
              <Image
                src={`/assets/character/${analysis.strength.dayMaster.name}-512.webp`}
                alt=""
                aria-hidden="true"
                width={420}
                height={420}
                className="pointer-events-none absolute -right-6 -top-6 h-56 w-56 select-none object-contain opacity-[0.14] sm:h-72 sm:w-72 sm:opacity-[0.16]"
              />
              {/* element glow */}
              <div
                className={cn(
                  "pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl",
                  ELEMENT_GLOW[elementKey],
                )}
              />
              <CardContent className="relative p-5 sm:p-6">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  เจ้าวัน (日主)
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-serif text-5xl font-bold leading-none sm:text-6xl",
                      ELEMENT_TEXT[elementKey],
                    )}
                  >
                    {narrative.dayMasterName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · {narrative.yinYangThai}
                  </span>
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  ธาตุ{narrative.elementThai} เป็นแก่นของดวง
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                    {narrative.archetypeTitle}
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/70 line-clamp-3">
                  {analysis.strength.summary}
                </p>
              </CardContent>
            </Card>
          </SectionReveal>

          {/* Useful God — compact full width */}
          <SectionReveal>
            <Card className="border-gold/40">
              <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Scale className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      ธาตุประโยชน์
                    </span>
                    <span className="font-serif text-sm text-muted-foreground">用神</span>
                  </div>
                  <div className="font-semibold text-ink">{analysis.usefulGod.label}</div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-foreground/70">
                    {analysis.usefulGod.applicationTips}
                  </p>
                </div>
              </CardContent>
            </Card>
          </SectionReveal>

          {/* Luck pillar + Narrative — 2 columns */}
          <SectionReveal className="grid gap-4 md:grid-cols-2">
            {/* Luck pillar */}
            <Card className="border-gold/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-jade" />
                  รอบดวงปัจจุบัน (10 ปี)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.luck.currentPillar ? (
                  <div className="space-y-1.5">
                    <div className="font-serif text-xl font-semibold text-ink">
                      {analysis.luck.currentPillar.sixtyCycleName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      อายุ {analysis.luck.currentPillar.startAge}–{analysis.luck.currentPillar.endAge} ปี ·{" "}
                      <span className={cn("font-medium", ELEMENT_TEXT[ELEMENT_KEY[analysis.luck.currentPillar.stem.element]])}>
                        {ELEMENT_THAI[analysis.luck.currentPillar.stem.element]}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className={cn("font-medium", ELEMENT_TEXT[ELEMENT_KEY[analysis.luck.currentPillar.branch.element]])}>
                        {ELEMENT_THAI[analysis.luck.currentPillar.branch.element]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/bazi"
                    className="flex items-center gap-2 text-sm font-medium text-jade hover:underline"
                  >
                    <TrendingUp className="h-4 w-4" />
                    ดูไทม์ไลน์รอบดวงเต็มที่ /bazi
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Narrative */}
            <Card className="border-gold/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-jade" />
                  แนวโน้มของคุณ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={narrative.opening} />
                </div>
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <Link href="/bazi">ดูวิเคราะห์เต็ม →</Link>
                </Button>
              </CardContent>
            </Card>
          </SectionReveal>

          {/* Module shortcuts */}
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
            {shortcuts.map((s) => (
              <StaggerItem key={s.href}>
                <Link href={s.href} className="group block h-full">
                  <Card className="h-full border-gold/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3.5">
                      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", s.tint)}>
                        <Image
                          src={s.icon}
                          alt=""
                          aria-hidden="true"
                          width={40}
                          height={40}
                          className="h-9 w-9 object-contain opacity-90"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink group-hover:text-jade">
                          {s.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {s.desc}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </main>
    </PageReveal>
  );
}

function HomeHubSkeleton() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-5 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
