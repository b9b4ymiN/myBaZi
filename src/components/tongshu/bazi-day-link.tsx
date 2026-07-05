"use client";

/**
 * BaziDayLink — the "ลิงค์ปาจื้อ" panel connecting a TongShu day to the user's
 * natal BaZi. Renders 4 layers:
 *   1. Personal resonance (day master × day pillar → 10-god + useful god score)
 *   2. 冲/合/害/刑 alerts — day branch vs natal branches (the classic 日冲 check)
 *   3. Current luck pillar / annual context
 *   4. Personalized 宜 highlights (activities matching the user's goal theme)
 *
 * variant="compact" → layers 1+2 only (used in TodayHero).
 * variant="full"    → all 4 layers (used in DayDetailPanel สรุป tab).
 */

import type { PersonalResonance } from "@/types/tongshu";
import type { DayNatalInteraction, PersonalizedRecommend } from "@/lib/tongshu/day-bazi";
import type { BranchInteractionType } from "@/lib/bazi/interactions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import { AlertTriangle, Sparkles, Check, Minus } from "lucide-react";

const RESONANCE_RATING: Record<PersonalResonance["rating"], { label: string; className: string }> = {
  very_good: { label: "เข้ากันมาก", className: "bg-jade/15 text-jade border-jade/40" },
  good: { label: "เข้ากันดี", className: "bg-jade/10 text-jade border-jade/30" },
  neutral: { label: "ปานกลาง", className: "bg-muted text-muted-foreground border-border" },
  challenging: { label: "ท้าทาย", className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  very_challenging: { label: "ท้าทายมาก", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const INTERACTION_STYLE: Record<BranchInteractionType, { label: string; className: string; icon: typeof AlertTriangle }> = {
  冲: { label: "冲 (ชง)", className: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
  刑: { label: "刑 (ลงโทษ)", className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30", icon: AlertTriangle },
  害: { label: "害 (ระยำ)", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30", icon: AlertTriangle },
  合: { label: "合 (ร่วม)", className: "bg-jade/10 text-jade border-jade/30", icon: Sparkles },
};

interface BaziDayLinkProps {
  resonance: PersonalResonance | null;
  dayInteractions: DayNatalInteraction[];
  currentLuck?: { sixtyCycleName: string } | null;
  currentAnnual?: { year: number; sixtyCycleName: string } | null;
  recommends: PersonalizedRecommend[];
  variant?: "compact" | "full";
}

export function BaziDayLink({
  resonance,
  dayInteractions,
  currentLuck,
  currentAnnual,
  recommends,
  variant = "full",
}: BaziDayLinkProps) {
  const hasClash = dayInteractions.some((d) => d.type === "冲");
  const highlighted = recommends.filter((r) => r.highlighted);
  const others = recommends.filter((r) => !r.highlighted);

  return (
    <div className="space-y-3">
      {/* Layer 1: resonance verdict */}
      {resonance ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">ความเข้ากันกับดวงคุณ</div>
            <div className="truncate text-sm font-medium text-ink">
              {resonance.stemRelationshipTh}
            </div>
          </div>
          <Badge className={cn("shrink-0 border", RESONANCE_RATING[resonance.rating].className)}>
            {RESONANCE_RATING[resonance.rating].label} · {resonance.resonanceScore > 0 ? "+" : ""}
            {resonance.resonanceScore}
          </Badge>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
          เลือกโปรไฟล์เพื่อดูความเข้ากันส่วนตัว + ตรวจ冲/合
        </div>
      )}

      {/* Layer 2: 冲/合/害/刑 alerts (the BaZi↔almanac link) */}
      {dayInteractions.length > 0 ? (
        <div className="space-y-1.5">
          {dayInteractions.map((d, i) => {
            const style = INTERACTION_STYLE[d.type];
            const Icon = style.icon;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2.5",
                  style.className,
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="font-semibold">
                    {style.label} {d.positionThai} ({d.natalBranch})
                  </span>
                  <span className="mt-0.5 block text-muted-foreground">
                    <RichText>{d.meaningThai}</RichText>
                  </span>
                </div>
              </div>
            );
          })}
          {hasClash && (
            <p className="px-1 text-[0.7rem] text-muted-foreground">
              ※ วันที่ 冲 สาดวงไม่ได้เวทนาเสมอไป — เหมาะกับการเคลียร์ปัญหาเก่า/ทำลายเพื่อสร้างใหม่ แต่ควรเลี่ยงริเริ่มเรื่องมงคลใหญ่
            </p>
          )}
        </div>
      ) : (
        resonance && (
          <div className="flex items-center gap-2 rounded-lg border border-jade/20 bg-jade/5 p-2.5 text-xs text-jade">
            <Check className="h-4 w-4 shrink-0" />
            <span>วันนี้ไม่冲/合/害/刑 กับสาดวงของคุณ — วันค่อนข้างสงบ</span>
          </div>
        )
      )}

      {variant === "full" && (
        <>
          {/* Layer 3: current luck / annual context */}
          {(currentLuck || currentAnnual) && (
            <>
              <Separator />
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <div className="mb-1 font-medium text-ink">บริบทรอบดวง/ปีของคุณ</div>
                <ul className="space-y-0.5 text-muted-foreground">
                  {currentLuck && (
                    <li>รอบดวงปัจจุบัน (10 ปี): <span className="font-medium text-ink">{currentLuck.sixtyCycleName}</span></li>
                  )}
                  {currentAnnual && (
                    <li>ดวงรายปี {currentAnnual.year}: <span className="font-medium text-ink">{currentAnnual.sixtyCycleName}</span></li>
                  )}
                </ul>
              </div>
            </>
          )}

          {/* Layer 4: personalized 宜 highlights */}
          {recommends.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-ink">ยืนยามที่เน้นกับดวงคุณ (宜)</div>
                {highlighted.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {highlighted.map((r, i) => (
                      <Badge key={`h-${i}`} className="bg-jade/15 text-jade border border-jade/30">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {r.nameTh}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.7rem] text-muted-foreground">
                    วันนี้ไม่มีกิจกรรมใน宜ที่ตรง goal ของดวงโดยเฉพาะ
                  </p>
                )}
                {others.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {others.map((r, i) => (
                      <Badge key={`o-${i}`} variant="outline" className="gap-1 text-muted-foreground">
                        <Minus className="h-3 w-3" />
                        {r.nameTh}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Convenience: derive the top headline alert for a day (used by TodayHero). */
export function topDayAlert(dayInteractions: DayNatalInteraction[]): {
  type: BranchInteractionType;
  text: string;
} | null {
  if (dayInteractions.length === 0) return null;
  const top = dayInteractions[0]; // already sorted by priority
  const style = INTERACTION_STYLE[top.type];
  return { type: top.type, text: `${style.label} ${top.positionThai} — ${top.meaningThai}` };
}
