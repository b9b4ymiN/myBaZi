"use client";

/**
 * DayDetailPanel — selected-day detail, organised into 4 tabs so it never
 * becomes one giant scroll. Renders BARE content (no outer Card/ScrollArea);
 * the page wraps it (sticky Card on desktop, BottomSheet on mobile).
 *
 * Tabs: สรุม (BaZi link + verdict) · โชคชะตา (宜忌/gods/officer/stars) ·
 *       ช่วงเวลา (scored hours) · ลึก (XKDG/score breakdown/reference)
 */

import { useState } from "react";
import type {
  TongShuDayInfo,
  TongShuHour,
  PersonalResonance,
  ScoredHour,
} from "@/types/tongshu";
import type { DayNatalInteraction, PersonalizedRecommend } from "@/lib/tongshu/day-bazi";
import { BaziDayLink } from "./bazi-day-link";
import { HoursView } from "./hours-view";
import { ReferenceLibrary } from "./reference-library";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DayDetailPanelProps {
  info: TongShuDayInfo | null;
  hours: TongShuHour[];
  personalResonance?: PersonalResonance | null;
  scoredHours?: ScoredHour[];
  dayInteractions?: DayNatalInteraction[];
  currentLuck?: { sixtyCycleName: string } | null;
  currentAnnual?: { year: number; sixtyCycleName: string } | null;
  personalizedRecommends?: PersonalizedRecommend[];
}

const TABS = [
  { id: "summary", label: "สรุม" },
  { id: "fortune", label: "โชคชะตา" },
  { id: "hours", label: "ช่วงเวลา" },
  { id: "deep", label: "ลึก" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const RATING_BADGE: Record<TongShuDayInfo["rating"], { label: string; className: string }> = {
  very_auspicious: { label: "มงคลมาก", className: "bg-jade text-primary-foreground" },
  auspicious: { label: "มงคล", className: "bg-jade/85 text-primary-foreground" },
  neutral: { label: "ปานกลาง", className: "bg-muted text-foreground" },
  inauspicious: { label: "อัปมงคล", className: "bg-orange-500/90 text-white" },
  very_inauspicious: { label: "อัปมงคลมาก", className: "bg-destructive text-primary-foreground" },
};

export function DayDetailPanel({
  info,
  hours,
  personalResonance,
  scoredHours,
  dayInteractions,
  currentLuck,
  currentAnnual,
  personalizedRecommends,
}: DayDetailPanelProps) {
  const [tab, setTab] = useState<TabId>("summary");
  const dayInteractionsNorm = dayInteractions ?? [];
  const personalizedRecommendsNorm = personalizedRecommends ?? [];

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <Image
          src="/assets/brand/mascot-rabbit-tongshu.png"
          alt=""
          aria-hidden="true"
          width={96}
          height={112}
          className="h-24 w-24 object-contain"
        />
        <p className="text-sm text-muted-foreground">
          เลือกวันจากปฏิทิน
          <br />
          เพื่อดูรายละเอียดและความเข้ากันกับดวงคุณ
        </p>
      </div>
    );
  }

  const rating = RATING_BADGE[info.rating];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">
            {info.solarDate.day}/{info.solarDate.month}/{info.solarDate.year + 543}
          </h3>
          <Badge className={cn("border", rating.className)}>{rating.label}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{info.lunarDate.monthName}{info.lunarDate.dayName}</span>
          <span>·</span>
          <span className="font-medium text-ink">{info.sixtyCycle}</span>
          {info.solarTerm && (
            <Badge variant="outline" className="text-[0.65rem]">节气 {info.solarTerm}</Badge>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="รายละเอียดวัน" className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              tab === t.id ? "bg-card text-ink shadow-sm" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "summary" && (
        <div className="space-y-3">
          <BaziDayLink
            resonance={personalResonance ?? null}
            dayInteractions={dayInteractionsNorm}
            currentLuck={currentLuck}
            currentAnnual={currentAnnual}
            recommends={personalizedRecommendsNorm}
            variant="full"
          />
          <Separator />
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
            <span className="text-muted-foreground">คะแนนพลังวัน</span>
            <span className="text-lg font-bold text-ink">
              {info.powerScore > 0 ? "+" : ""}
              {info.powerScore}
            </span>
          </div>
          {info.summary && <p className="text-xs leading-6 text-muted-foreground"><RichText>{info.summary}</RichText></p>}
        </div>
      )}

      {tab === "fortune" && (
        <div className="space-y-3">
          {/* Recommends / avoids (personalized highlights) */}
          <div className="grid gap-3">
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-jade">สิ่งที่ควรทำ (宜)</h4>
              <div className="flex flex-wrap gap-1.5">
                {personalizedRecommendsNorm.length > 0 ? (
                  personalizedRecommendsNorm.map((r, i) => (
                    <Badge
                      key={i}
                      variant={r.highlighted ? "default" : "outline"}
                      className={cn(
                        "text-xs",
                        r.highlighted && "bg-jade/15 text-jade border border-jade/30",
                      )}
                    >
                      {r.highlighted ? "★ " : ""}
                      {r.nameTh}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-destructive">สิ่งที่ควรหลีกเลี่ยง (忌)</h4>
              <div className="flex flex-wrap gap-1.5">
                {info.avoids.length > 0 ? (
                  info.avoids.map((a, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                      {a.nameTh}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Day officer / stars */}
          <div className="grid gap-2">
            <InfoRow label="ประจำวัน" value={info.dayOfficer.nameTh} good={info.dayOfficer.auspicious} />
            <InfoRow label="ดาวเหลือง/ดำ" value={info.yellowBlackStar.nameTh} good={info.yellowBlackStar.auspicious} />
            <InfoRow label="ดาว 28" value={info.constellation28.nameTh} good={info.constellation28.auspicious} />
          </div>

          {/* Gods */}
          {info.gods.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground">เทพเจ้าประจำวัน</h4>
                <div className="flex flex-wrap gap-1">
                  {info.gods.map((g, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "text-[0.65rem]",
                        g.auspicious ? "border-jade/40 text-jade" : "border-destructive/40 text-destructive",
                      )}
                    >
                      {g.nameTh}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "hours" && (
        <div className="space-y-2">
          {scoredHours && scoredHours.length > 0 ? (
            <HoursView hours={scoredHours} />
          ) : hours.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {hours.map((h, i) => (
                <HourBadge key={i} hour={h} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">ไม่มีข้อมูลช่วงเวลา</p>
          )}
        </div>
      )}

      {tab === "deep" && (
        <div className="space-y-3 text-xs">
          {/* XKDG */}
          <div className="rounded-lg border border-gold/40 bg-muted/30 p-3">
            <div className="mb-0.5 text-muted-foreground">XKDG (玄空大卦)</div>
            <div className="font-medium text-ink">{info.xkdg.sixtyCycle}</div>
            <div className="text-[0.65rem] text-muted-foreground">
              ซำ{info.xkdg.periodGroupName} (Period {info.xkdg.periodGroup})
            </div>
          </div>

          {/* Power score breakdown */}
          <div className="rounded-lg border border-border p-3">
            <div className="mb-1.5 font-medium text-ink">รายละเอียดคะแนนพลัง</div>
            <div className="space-y-1">
              <ScoreRow label="ประจำวัน" v={info.powerScoreBreakdown.dayOfficer} />
              <ScoreRow label="ดาวเหลือง/ดำ" v={info.powerScoreBreakdown.yellowBlackStar} />
              <ScoreRow label="ดาว 28" v={info.powerScoreBreakdown.constellation28} />
              <ScoreRow label="เทพเจ้า" v={info.powerScoreBreakdown.gods} />
              <Separator className="my-1" />
              <ScoreRow label="รวม" v={info.powerScoreBreakdown.total} bold />
            </div>
          </div>

          {/* Reference library */}
          <ReferenceLibrary
            selectedDayOfficer={info.dayOfficer.name}
            selectedYellowBlackStar={info.yellowBlackStar.name}
            selectedConstellation28={info.constellation28.name}
          />
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2",
        good ? "border-jade/30 bg-jade/5" : "border-destructive/30 bg-destructive/5",
      )}
    >
      <span className="text-[0.7rem] text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-medium", good ? "text-jade" : "text-destructive")}>
        {value}
      </span>
    </div>
  );
}

function ScoreRow({ label, v, bold }: { label: string; v: number; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "font-medium")}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(v >= 0 ? "text-jade" : "text-destructive")}>
        {v > 0 ? "+" : ""}
        {v}
      </span>
    </div>
  );
}

function HourBadge({ hour }: { hour: TongShuHour }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-1.5",
        hour.auspicious ? "border-jade/40 bg-jade/5" : "border-border bg-muted/30",
      )}
    >
      <div className="text-xs font-medium text-ink">{hour.nameTh}</div>
      <div className="text-[0.6rem] text-muted-foreground">{hour.timeRange}</div>
    </div>
  );
}
