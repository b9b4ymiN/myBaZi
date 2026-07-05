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
import { PageReveal } from "@/components/ui/motion";
import { useBaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { buildBaZiNarrative } from "@/lib/bazi/narrative";
import { getArchetype } from "@/lib/bazi/archetypes";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import type { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface HomeHubProps {
  profile: Profile;
}

export function HomeHub({ profile }: HomeHubProps) {
  const analysis = useBaZiAnalysis(profile);

  // Show skeleton while computing analysis
  if (analysis === null) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // Compute archetype and narrative
  const archetype = getArchetype({
    name: analysis.strength.dayMaster.name,
    element: analysis.strength.dayMaster.element,
    yinYang: analysis.chart.dayMaster.yinYang === "阴" ? "yin" : "yang",
  });

  const narrative = buildBaZiNarrative({
    profileName: profile.name,
    analysis,
    archetype,
  });

  // Map Chinese element to English for Tailwind classes
  const elementMap: Record<string, string> = {
    "木": "wood",
    "火": "fire",
    "土": "earth",
    "金": "metal",
    "水": "water",
  };
  const elementKey = elementMap[analysis.chart.dayMaster.element] || "wood";
  const elementColorClass = `text-element-${elementKey}`;

  // Get today's date in Thai
  const todayDate = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageReveal>
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Greeting Strip */}
          <div className="flex items-center gap-4 rounded-2xl border border-gold/40 bg-card p-4 shadow-sm">
            <div className="relative">
              <Image
                src={profile.gender === "male" ? "/assets/brand/man.png" : "/assets/brand/woman.png"}
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-gold/60 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-jade text-xs font-bold text-white">
                ✓
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <Image
                src="/assets/brand/logo.png"
                alt=""
                aria-hidden="true"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <h1 className="font-serif text-2xl font-bold text-ink">
                สวัสดี, {profile.name}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">{todayDate}</p>
          </div>

          {/* Day Master Card - Compact Hero */}
          <Card className="relative overflow-hidden border-gold/40">
            <div className="absolute right-0 top-0 opacity-10">
              <Image
                src={`/assets/brand/element-${analysis.chart.dayMaster.element === "火" ? "fire-flame" :
                    analysis.chart.dayMaster.element === "木" ? "wood-leaf" :
                    analysis.chart.dayMaster.element === "土" ? "earth-gold" :
                    analysis.chart.dayMaster.element === "金" ? "metal-pearl" : "water-wave"}.png`}
                alt=""
                aria-hidden="true"
                width={200}
                height={200}
                className="h-48 w-48 object-contain"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">เจ้าวันของคุณวันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <div className={cn("font-serif text-4xl font-bold", elementColorClass)}>
                  {narrative.dayMasterName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {narrative.elementThai} ({narrative.yinYangThai})
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
                  {narrative.archetypeTitle}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {analysis.strength.summary}
              </p>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Current Luck Pillar Card */}
              {analysis.luck.currentPillar ? (
                <Card className="border-gold/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-jade" />
                      รอบดวงปัจจุบัน (10 ปี)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-serif text-xl font-semibold text-ink">
                        {analysis.luck.currentPillar.sixtyCycleName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>อายุ {analysis.luck.currentPillar.startAge}–{analysis.luck.currentPillar.endAge} ปี</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="font-medium">ธาตุเสา:</span>
                        <span className={cn("font-medium", `text-element-${elementMap[analysis.luck.currentPillar.stem.element]}`)}>
                          {ELEMENT_THAI[analysis.luck.currentPillar.stem.element]}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className={cn("font-medium", `text-element-${elementMap[analysis.luck.currentPillar.branch.element]}`)}>
                          {ELEMENT_THAI[analysis.luck.currentPillar.branch.element]}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gold/40">
                  <CardContent className="p-6">
                    <Link
                      href="/bazi"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-jade hover:underline"
                    >
                      <TrendingUp className="h-4 w-4" />
                      ดูไทม์ไลน์รอบดวงเต็มที่ /bazi
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Useful God One-Liner Card */}
              <Card className="border-gold/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="h-5 w-5 text-gold" />
                    ธาตุประโยชน์ (用神)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-semibold text-ink">
                      {analysis.usefulGod.label}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                      {analysis.usefulGod.applicationTips}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Narrative Preview */}
            <Card className="border-gold/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-jade" />
                  แนวโน้มของคุณ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={narrative.opening} />
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/bazi">
                      ดูวิเคราะห์เต็ม →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ornament Divider */}
          <div className="flex justify-center">
            <Image
              src="/assets/brand/ornament-cloud-divider.png"
              alt=""
              aria-hidden="true"
              width={296}
              height={160}
              className="h-16 w-auto object-contain opacity-60"
            />
          </div>

          {/* Module Shortcuts */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* BaZi */}
            <Link href="/bazi" className="group">
              <Card className="border-gold/40 transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-element-fire/10">
                      <Image
                        src="/assets/brand/element-mountain-ink.png"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-90"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink group-hover:text-jade">
                        八字 ปาจื้อ
                      </div>
                      <div className="text-xs text-muted-foreground">
                        แผนผัง 4 เสา
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Tong Shu */}
            <Link href="/tongshu" className="group">
              <Card className="border-gold/40 transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-element-wood/10">
                      <Image
                        src="/assets/brand/tool-calendar.png"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-90"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink group-hover:text-jade">
                        通勝 ปฏิทินมงคล
                      </div>
                      <div className="text-xs text-muted-foreground">
                        เลือกวันดี ชั่วโมงมงคล
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Qi Men */}
            <Link href="/qimen" className="group">
              <Card className="border-gold/40 transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-element-metal/10">
                      <Image
                        src="/assets/brand/tool-compass-qimen.png"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-90"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink group-hover:text-jade">
                        奇門遁甲 ฉีเหมือน
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ทำนายเคลื่อนที่
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Tianji */}
            <Link href="/tianji" className="group">
              <Card className="border-gold/40 transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-element-water/10">
                      <Image
                        src="/assets/brand/tool-tianji-star.png"
                        alt=""
                        aria-hidden="true"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain opacity-90"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-ink group-hover:text-jade">
                        天机 เทียนจี
                      </div>
                      <div className="text-xs text-muted-foreground">
                        AI ที่ปรึกษาดวง
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </PageReveal>
  );
}
