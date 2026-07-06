"use client";

/**
 * TodayHero — ไฮไลต์ "วันนี้" ของหน้าแรก
 *
 * ดึงข้อมูลจาก Tong Shu engine (getTongShuDayInfo) แสดงวันที่ไทย + ปีจีนแบบไทย
 * (ปีม้า ธาตุไฟ) + rating + dot meter + ควรทำ/ควรหลีกเลี่ยง. ถ้าส่ง userDayMaster /
 * usefulGodElement มา จะคำนวณ personal resonance ("วันนี้เข้าดวงคุณแค่ไหน").
 *
 * SSR/hydration-safe: วันที่คำนวณ client-side เท่านั้น (หลัง mount) ผ่าน
 * useSyncExternalStore — กัน mismatch ระหว่าง build time กับเวลาจริงของผู้ใช้
 */

import { useMemo, useSyncExternalStore } from "react";
import { CalendarDays } from "lucide-react";
import { getTongShuDayInfo } from "@/lib/tongshu/day-info";
import { analyzePersonalResonance } from "@/lib/tongshu/personal-resonance";
import type { TongShuDayInfo, PersonalResonance } from "@/types/tongshu";
import type { ElementName } from "@/lib/bazi/types";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { CountUp } from "@/components/ui/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Client-only "today" — server snapshot is null (skeleton). */
interface TodayYMD {
  y: number;
  m: number;
  d: number;
}
let cachedToday: TodayYMD | null = null;
const subscribeNoop = () => () => {};
function getClientToday(): TodayYMD {
  if (cachedToday === null) {
    const dt = new Date();
    cachedToday = { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
  }
  return cachedToday;
}
function getServerToday(): null {
  return null;
}

type Rating = TongShuDayInfo["rating"];

const RATING_LABEL_TH: Record<Rating, string> = {
  very_auspicious: "มงคลมาก",
  auspicious: "มงคล",
  neutral: "ปานกลาง",
  inauspicious: "อัปมงคล",
  very_inauspicious: "อัปมงคลมาก",
};

const RATING_TONE: Record<Rating, string> = {
  very_auspicious: "text-emerald-600 dark:text-emerald-400",
  auspicious: "text-jade",
  neutral: "text-muted-foreground",
  inauspicious: "text-amber-600 dark:text-amber-400",
  very_inauspicious: "text-rose-600 dark:text-rose-400",
};

const RESONANCE_LABEL_TH: Record<PersonalResonance["rating"], string> = {
  very_good: "เข้าดวงมาก",
  good: "เข้าดวงดี",
  neutral: "ปานกลาง",
  challenging: "ท้าทาย",
  very_challenging: "ท้าทายมาก",
};

const RESONANCE_TONE: Record<PersonalResonance["rating"], string> = {
  very_good: "text-emerald-600 dark:text-emerald-400",
  good: "text-jade",
  neutral: "text-muted-foreground",
  challenging: "text-amber-600 dark:text-amber-400",
  very_challenging: "text-rose-600 dark:text-rose-400",
};

/** Heavenly Stem (天干) → ธาตุ */
const STEM_ELEMENT: Record<string, ElementName> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

/** Earthly Branch (地支) → ราศีจีนภาษาไทย */
const BRANCH_ZODIAC_TH: Record<string, string> = {
  子: "หนู", 丑: "วัว", 寅: "เสือ", 卯: "กระต่าย", 辰: "มังกร", 巳: "งู",
  午: "ม้า", 未: "แกะ", 申: "ลิง", 酉: "ไก่", 戌: "หมา", 亥: "หมู",
};

/** Map powerScore (-50..+50) → filled dots 0..5 */
function scoreToDots(score: number): number {
  const normalized = (score + 50) / 100; // 0..1
  return Math.max(0, Math.min(5, Math.round(normalized * 5)));
}

/** แปลง yearName จีน (เช่น "丙午") → "ปีม้า ธาตุไฟ" */
function yearNameToThai(yearName: string): string {
  const stem = yearName[0];
  const branch = yearName[1];
  const zodiac = BRANCH_ZODIAC_TH[branch];
  const element = STEM_ELEMENT[stem];
  if (!zodiac) return "";
  return element ? `ปี${zodiac} ธาตุ${ELEMENT_THAI[element]}` : `ปี${zodiac}`;
}

export interface TodayHeroProps {
  /** ถ้าส่งมา → แสดงแถบ resonance "วันนี้เข้าดวงคุณ" */
  userDayMaster?: { stem: string; element: ElementName } | null;
  usefulGodElement?: ElementName | null;
  className?: string;
}

export function TodayHero({ userDayMaster, usefulGodElement, className }: TodayHeroProps) {
  const today = useSyncExternalStore(subscribeNoop, getClientToday, getServerToday);
  const now = today ? new Date(today.y, today.m - 1, today.d) : null;

  const dayInfo = useMemo<TongShuDayInfo | null>(() => {
    if (!today) return null;
    return getTongShuDayInfo(today.y, today.m, today.d);
  }, [today]);

  const resonance = useMemo<PersonalResonance | null>(() => {
    if (!dayInfo || !userDayMaster) return null;
    try {
      return analyzePersonalResonance(dayInfo, userDayMaster, usefulGodElement ?? null);
    } catch {
      return null;
    }
  }, [dayInfo, userDayMaster, usefulGodElement]);

  if (!now || !dayInfo) {
    return <TodayHeroSkeleton className={className} />;
  }

  const dots = scoreToDots(dayInfo.powerScore);
  const weekdayTh = now.toLocaleDateString("th-TH", { weekday: "long" });
  const dateTh = now.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  const yearThai = yearNameToThai(dayInfo.lunarDate.yearName);
  const topRecommends = dayInfo.recommends.slice(0, 3).map((r) => r.nameTh);
  const topAvoids = dayInfo.avoids.slice(0, 3).map((a) => a.nameTh);

  return (
    <Card className={cn("overflow-hidden border-gold/40", className)}>
      <CardContent className="space-y-3 p-4 sm:p-5">
        {/* Header — วันนี้ + วันที่ไทย + ปีไทย */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-gold" />
              วันนี้
            </div>
            <div className="mt-0.5 font-serif text-base font-semibold text-foreground">
              {weekdayTh} · {dateTh}
            </div>
            <div className="text-sm text-muted-foreground">
              {yearThai && <span>{yearThai} </span>}
              <span className="font-serif text-foreground/60">{dayInfo.lunarDate.yearName}年</span>
            </div>
          </div>
          {dayInfo.solarTerm && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              รอบ{dayInfo.solarTerm}
            </span>
          )}
        </div>

        {/* Rating sentence + meter + score (one compact row) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-muted/40 px-3 py-2">
          <span className={cn("text-sm font-semibold", RATING_TONE[dayInfo.rating])}>
            เป็นวัน{RATING_LABEL_TH[dayInfo.rating]}
          </span>
          <DotMeter filled={dots} tone={dayInfo.rating} />
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            พลังวัน <CountUp value={dayInfo.powerScore} duration={1} prefix={dayInfo.powerScore > 0 ? "+" : ""} />
          </span>
        </div>

        {/* Meta — เจ้าวัน + ดาว (ไทย) */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            เจ้าวัน: <span className="text-foreground/80">{dayInfo.dayOfficer.nameTh}</span>
          </span>
          <span>
            ดาวประจำวัน: <span className="text-foreground/80">{dayInfo.yellowBlackStar.nameTh}</span>
          </span>
        </div>

        {/* ควรทำ / ควรหลีกเลี่ยง */}
        <div className="grid gap-2 sm:grid-cols-2">
          <ActivityChips
            label="ควรทำ"
            cn="宜"
            items={topRecommends}
            tone="good"
          />
          <ActivityChips
            label="ควรหลีกเลี่ยง"
            cn="忌"
            items={topAvoids}
            tone="bad"
          />
        </div>

        {/* Personal resonance band (เฉพาะมี profile) */}
        {resonance && userDayMaster && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-gold/30 bg-accent/5 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              วันนี้เข้าดวง{ELEMENT_THAI[userDayMaster.element]}ของคุณ:
            </span>
            <span className={cn("font-semibold", RESONANCE_TONE[resonance.rating])}>
              {RESONANCE_LABEL_TH[resonance.rating]}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              (<CountUp value={resonance.resonanceScore} prefix={resonance.resonanceScore > 0 ? "+" : ""} />)
            </span>
            {resonance.alignsWithUsefulGod && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                ตรงธาตุประโยชน์
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DotMeter({ filled, tone }: { filled: number; tone: Rating }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i < filled ? cn(RATING_TONE[tone], "bg-current") : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

function ActivityChips({
  label,
  cn: cnChar,
  items,
  tone,
}: {
  label: string;
  cn: string;
  items: string[];
  tone: "good" | "bad";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={cn("font-serif text-sm font-bold", tone === "good" ? "text-jade" : "text-rose-500")}>
          {cnChar}
        </span>
        <span className="text-xs font-medium text-foreground/70">{label}</span>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {items.map((it, i) => (
            <span
              key={`${it}-${i}`}
              className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] text-foreground/80"
            >
              {it}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[11px] text-muted-foreground">—</span>
      )}
    </div>
  );
}

function TodayHeroSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-gold/40", className)}>
      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
