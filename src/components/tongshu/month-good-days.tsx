"use client";

/**
 * MonthGoodDays — proactively surfaces the best days of the month FOR THE
 * USER (derived from the BaZi link: no 冲 + good resonance + auspicious).
 * Saves scanning the calendar dot-by-dot. Tap a day → selects it.
 */

import type { TongShuDayInfo } from "@/types/tongshu";
import type { RankedDay } from "@/lib/tongshu/day-bazi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const TONE_DOT: Record<RankedDay["tone"], string> = {
  clash: "bg-destructive",
  good: "bg-jade",
  neutral: "bg-gold",
  caution: "bg-orange-500",
  bad: "bg-red-700",
  muted: "bg-muted-foreground/40",
};

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export interface GoodDayItem {
  date: Date;
  info: TongShuDayInfo;
  rank: RankedDay;
}

interface MonthGoodDaysProps {
  days: GoodDayItem[];
  onSelect: (date: Date) => void;
  hasProfile: boolean;
}

export function MonthGoodDays({ days, onSelect, hasProfile }: MonthGoodDaysProps) {
  const title = hasProfile ? "วันดีเดือนนี้สำหรับคุณ" : "วันดีเดือนนี้ (ทั่วไป)";
  const subtitle = hasProfile
    ? "เรียงตามความเข้ากันกับดวง · ไม่มีวัน 冲 สาดวง"
    : "เรียงตามคะแนนมงคล · เลือกโปรไฟล์เพื่อดูแบบส่วนตัว";

  return (
    <Card className="border-gold/40">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
        <p className="mb-3 text-[0.7rem] text-muted-foreground">{subtitle}</p>

        {days.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">
            เดือนนี้ไม่มีวันดีพิเศษ — ลองดูปฏิทินด้านล่าง
          </p>
        ) : (
          <ul className="space-y-1.5">
            {days.map((d, i) => {
              const date = d.date;
              const label = `${date.getDate()} ${WEEKDAYS_TH[date.getDay()]} · ${d.info.lunarDate.dayName}`;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onSelect(date)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors",
                      "hover:border-jade/50 hover:bg-jade/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <span
                      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TONE_DOT[d.rank.tone])}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{label}</span>
                      <span className="block text-[0.7rem] text-muted-foreground">
                        {d.info.sixtyCycle}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-jade/30 text-[0.65rem] text-jade"
                    >
                      {d.rank.reasonThai}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
