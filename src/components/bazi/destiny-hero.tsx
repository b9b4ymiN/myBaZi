/**
 * DestinyHero component - Hero card สรุปกระชับด้านบนสุด
 * แสดง Day Master + Strength level + Structure + Useful God ใน card เดียว
 */

"use client";

import type { StrengthAnalysis } from "@/types/bazi-strength";
import type { StructureAnalysis } from "@/types/bazi-structure";
import type { UsefulGodAnalysis } from "@/types/bazi-useful-god";
import { STRENGTH_LEVEL_THAI } from "@/types/bazi-strength";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ElementBadge } from "@/components/bazi/element-badge";
import { formatThaiDate } from "@/lib/utils";

interface DestinyHeroProps {
  strength: StrengthAnalysis;
  structure: StructureAnalysis;
  usefulGod: UsefulGodAnalysis;
  profileName: string;
  birthDate: string;
}

/**
 * Element gradient backgrounds
 */
const ELEMENT_GRADIENTS: Record<
  Parameters<typeof ElementBadge>[0]["element"],
  string
> = {
  木: "from-green-500/20 to-emerald-600/20 border-green-500/30",
  火: "from-red-500/20 to-orange-600/20 border-red-500/30",
  土: "from-amber-500/20 to-yellow-600/20 border-amber-500/30",
  金: "from-slate-500/20 to-gray-600/20 border-slate-500/30",
  水: "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
};

/**
 * Hero card สรุปกระชับ
 */
export function DestinyHero({
  strength,
  structure,
  usefulGod,
  profileName,
  birthDate,
}: DestinyHeroProps) {
  const { dayMaster } = strength;
  const gradientClass = ELEMENT_GRADIENTS[dayMaster.element];

  return (
    <Card className={`bg-gradient-to-br ${gradientClass} border-2`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Profile info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-2xl font-bold">{profileName}</h2>
            <div className="text-sm text-muted-foreground sm:text-base">
              {formatThaiDate(birthDate)}
            </div>
          </div>

          {/* Day Master + Strength badge */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-5xl font-bold">{dayMaster.name}</span>
            <ElementBadge element={dayMaster.element} size="lg" />
            <Badge
              variant="outline"
              className="text-base px-3 py-1 border-2 font-medium"
            >
              {STRENGTH_LEVEL_THAI[strength.level]}
            </Badge>
          </div>

          {/* Structure + Useful God */}
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">โครงสร้าง:</span>
              <Badge variant="secondary">{structure.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">用神:</span>
              <Badge variant="secondary">
                {usefulGod.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
