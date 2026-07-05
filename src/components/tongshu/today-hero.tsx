"use client";

/**
 * TodayHero — the top "วันนี้ของคุณ" verdict card for /tongshu.
 * Answers first: "วันนี้เป็นยังไงสำหรับคุณ" before the calendar/detail.
 * Compact (single mobile viewport). No-profile → generic verdict + CTA.
 */

import type { TongShuDayInfo, PersonalResonance } from "@/types/tongshu";
import type { DayNatalInteraction, PersonalizedRecommend } from "@/lib/tongshu/day-bazi";
import { BaziDayLink } from "./bazi-day-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import Image from "next/image";

const WEEKDAYS_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];

const DAY_RATING: Record<TongShuDayInfo["rating"], { label: string; className: string }> = {
  very_auspicious: { label: "มงคลมาก", className: "bg-jade text-primary-foreground border-jade" },
  auspicious: { label: "มงคล", className: "bg-jade/85 text-primary-foreground border-jade" },
  neutral: { label: "ปานกลาง", className: "bg-muted text-foreground border-border" },
  inauspicious: { label: "อัปมงคล", className: "bg-orange-500/90 text-white border-orange-500" },
  very_inauspicious: { label: "อัปมงคลมาก", className: "bg-destructive text-primary-foreground border-destructive" },
};

interface TodayHeroProps {
  todayInfo: TongShuDayInfo;
  resonance: PersonalResonance | null;
  dayInteractions: DayNatalInteraction[];
  recommends: PersonalizedRecommend[];
  currentLuck?: { sixtyCycleName: string } | null;
  currentAnnual?: { year: number; sixtyCycleName: string } | null;
  profileName?: string;
}

export function TodayHero({
  todayInfo,
  resonance,
  dayInteractions,
  recommends,
  currentLuck,
  currentAnnual,
  profileName,
}: TodayHeroProps) {
  const s = todayInfo.solarDate;
  const dateLabel = `วัน${WEEKDAYS_TH[s.weekday]} ${s.day}/${s.month}/${s.year + 543}`;
  const rating = DAY_RATING[todayInfo.rating];
  const hasProfile = Boolean(resonance);

  return (
    <Card className="surface-paper border-gold/40">
      <CardContent className="space-y-3 p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {profileName ? `วันนี้ของ ${profileName}` : "วันนี้ของคุณ"}
            </div>
            <h2 className="font-heading text-lg font-semibold text-ink sm:text-xl">
              {dateLabel}
            </h2>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {todayInfo.lunarDate.monthName}
              {todayInfo.lunarDate.dayName} · {todayInfo.sixtyCycle}
              {todayInfo.solarTerm && (
                <span className="ml-1 text-jade">· ปลาย {todayInfo.solarTerm}</span>
              )}
            </div>
          </div>
          <Image
            src="/assets/brand/mascot-rabbit-tongshu.png"
            alt=""
            aria-hidden="true"
            width={56}
            height={66}
            className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
          />
        </div>

        {/* Day verdict */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card/70 p-3">
          <div>
            <div className="text-[0.7rem] text-muted-foreground">คะแนนวัน</div>
            <div className="text-xl font-bold text-ink">
              {todayInfo.powerScore > 0 ? "+" : ""}
              {todayInfo.powerScore}
            </div>
          </div>
          <Badge className={cn("border px-3 py-1 text-sm", rating.className)}>
            {rating.label}
          </Badge>
        </div>

        {/* BaZi link (compact) or no-profile CTA */}
        {hasProfile ? (
          <>
            <Separator />
            <BaziDayLink
              resonance={resonance}
              dayInteractions={dayInteractions}
              currentLuck={currentLuck}
              currentAnnual={currentAnnual}
              recommends={recommends}
              variant="compact"
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            เลือกโปรไฟล์เพื่อดู “วันนี้เข้ากับดวงคุณหรือไม่” + ตรวจ冲/合 สาดวง
          </div>
        )}

        {/* 1-line advice */}
        {todayInfo.summary && (
          <p className="text-xs leading-6 text-muted-foreground"><RichText>{todayInfo.summary}</RichText></p>
        )}
      </CardContent>
    </Card>
  );
}
