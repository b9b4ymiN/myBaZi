/**
 * NatalChart component - แสดง 4 pillars ของ BaZi
 * Layout แบบตาราง 4 คอลัมน์ (Year/Month/Day/Hour)
 */

"use client";

import type { BaZiChart, Pillar } from "@/lib/bazi/types";
import { ElementBadge } from "./element-badge";
import { STEM_PINYIN, BRANCH_PINYIN, STEM_THAI, BRANCH_THAI, ZODIAC_THAI } from "@/lib/bazi/pinyin";
import { HIDDEN_STEM_TYPE_THAI } from "@/lib/bazi/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NatalChartProps {
  chart: BaZiChart;
}

/**
 * แสดง Pillar เดียว (Year/Month/Day/Hour)
 */
function PillarColumn({ pillar, label }: { pillar: Pillar | null; label: string }) {
  const isDay = label.startsWith("วัน");
  const wrapperClass = cn(
    "min-w-0 p-3 sm:p-4 rounded-lg border",
    isDay
      ? "bg-jade/5 border-jade/60 ring-2 ring-jade/25"
      : pillar
        ? "bg-card border-border"
        : "bg-muted/50 border-border",
  );

  if (!pillar) {
    return (
      <div className={wrapperClass}>
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-muted-foreground text-sm">ไม่ทราบเวลา</div>
        </div>
      </div>
    );
  }

  const { stem, branch, sixtyCycleName } = pillar;

  return (
    <div className={wrapperClass}>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-base sm:text-lg font-bold text-primary">{sixtyCycleName}</div>
        </div>

        {/* Heavenly Stem (天干) */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center">天干</div>
          <div className="space-y-1.5">
            <div className="flex justify-center">
              <span className="text-3xl font-bold">{stem.name}</span>
            </div>
            <div className="text-center text-xs space-y-0.5">
              <div className="font-medium">{STEM_PINYIN[stem.name]}</div>
              <div className="text-muted-foreground">{STEM_THAI[stem.name]}</div>
            </div>
            <div className="flex justify-center">
              <ElementBadge element={stem.element} size="sm" showThai={false} />
            </div>
          </div>
        </div>

        {/* Earthly Branch (地支) */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center">地支</div>
          <div className="space-y-1.5">
            <div className="flex justify-center">
              <span className="text-3xl font-bold">{branch.name}</span>
            </div>
            <div className="text-center text-xs space-y-0.5">
              <div className="font-medium">{BRANCH_PINYIN[branch.name]}</div>
              <div className="text-muted-foreground">{BRANCH_THAI[branch.name]}</div>
            </div>
            <div className="flex justify-center">
              <ElementBadge element={branch.element} size="sm" showThai={false} />
            </div>
            <div className="text-center text-xs text-muted-foreground">
              生肖: {ZODIAC_THAI[branch.zodiac]} ({branch.zodiac})
            </div>
          </div>
        </div>

        {/* Hidden Stems (藏干) */}
        {branch.hiddenStems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">藏干</div>
            <div className="space-y-1.5">
              {branch.hiddenStems.map((hs, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{hs.stem.name}</span>
                    <ElementBadge element={hs.stem.element} size="sm" showThai={false} />
                  </div>
                  <div className="text-muted-foreground">
                    {HIDDEN_STEM_TYPE_THAI[hs.type]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * แสดง 4 pillars แบบตาราง
 */
export function NatalChart({ chart }: NatalChartProps) {
  const pillars = [
    { pillar: chart.year, label: "ปี" },
    { pillar: chart.month, label: "เดือน" },
    { pillar: chart.day, label: "วัน (เจ้าวัน)" },
    { pillar: chart.hour, label: "ชั่วโมง" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ปาจื้อ 4 เสา (八字四柱)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: 2×2 grid (compact, no horizontal scroll) | Desktop: 4 columns */}
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-nowrap md:gap-3">
          {pillars.map((item, idx) => (
            <PillarColumn key={idx} pillar={item.pillar} label={item.label} />
          ))}
        </div>

        {/* Day Master Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-2">เจ้าวัน (Day Master)</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{chart.dayMaster.name}</span>
            <ElementBadge element={chart.dayMaster.element} size="md" />
            <div className="text-sm text-muted-foreground">
              {chart.dayMaster.yinYang === "阳" ? "หยาง" : "หยิน"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
