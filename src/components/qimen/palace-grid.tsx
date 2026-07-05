"use client";

import type { QiMenChart } from "@/types/qimen";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PalaceGridProps {
  chart: QiMenChart;
}

/**
 * Lo Shu layout mapping (palace number → grid position)
 * 4 9 2
 * 3 5 7
 * 8 1 6
 */
const LO_SHU_LAYOUT: Record<number, { row: number; col: number }> = {
  4: { row: 0, col: 0 }, // 巽
  9: { row: 0, col: 1 }, // 离
  2: { row: 0, col: 2 }, // 坤
  3: { row: 1, col: 0 }, // 震
  5: { row: 1, col: 1 }, // 中
  7: { row: 1, col: 2 }, // 兑
  8: { row: 2, col: 0 }, // 艮
  1: { row: 2, col: 1 }, // 坎
  6: { row: 2, col: 2 }, // 乾
};

/**
 * 9-Palace Grid component displaying Qi Men chart in Lo Shu layout
 */
export function PalaceGrid({ chart }: PalaceGridProps) {
  // Create 3x3 grid array
  const grid: (QiMenChart["palaces"][number] | null)[][] = [[null, null, null], [null, null, null], [null, null, null]];

  // Fill grid based on Lo Shu layout
  chart.palaces.forEach((palace) => {
    const pos = LO_SHU_LAYOUT[palace.palaceNumber];
    if (pos) {
      grid[pos.row][pos.col] = palace;
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">九宮八卦 (Nine Palaces)</h3>

      {/* Desktop: 3x3 grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-3 max-w-2xl mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((palace, colIndex) => {
            if (!palace) return <div key={`${rowIndex}-${colIndex}`} />;

            return <PalaceCell key={palace.palaceNumber} palace={palace} />;
          })
        )}
      </div>

      {/* Mobile: Compact 3x3 grid */}
      <div className="md:hidden grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((palace, colIndex) => {
            if (!palace) return <div key={`${rowIndex}-${colIndex}`} />;

            return <PalaceCell key={palace.palaceNumber} palace={palace} compact />;
          })
        )}
      </div>
    </div>
  );
}

interface PalaceCellProps {
  palace: QiMenChart["palaces"][number];
  compact?: boolean;
}

function PalaceCell({ palace, compact }: PalaceCellProps) {
  const isZhongGong = palace.palaceNumber === 5;

  return (
    <Card
      className={cn(
        "relative p-3 space-y-2 transition-all",
        palace.isZhiFu && "border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
        !compact && "min-h-[140px]"
      )}
    >
      {/* 值符 badge */}
      {palace.isZhiFu && (
        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
          值符
        </Badge>
      )}

      {/* 值使 badge */}
      {palace.isZhiShi && (
        <Badge
          className={cn(
            "absolute top-2 right-2 bg-orange-500 hover:bg-orange-600",
            palace.isZhiFu && "top-8"
          )}
        >
          值使
        </Badge>
      )}

      <div className="space-y-1">
        {/* Palace Number + 八卦 */}
        <div className="flex items-center gap-1 text-sm">
          <span className="font-bold text-lg">{palace.palaceNumber}</span>
          <span className="text-muted-foreground">{palace.bagua}</span>
        </div>

        {/* Stems */}
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">
            地: {palace.earthStem || (isZhongGong ? "寄" : "-")}
          </div>
          <div className="text-sm font-bold">
            天: {palace.heavenStem || (isZhongGong ? "寄" : "-")}
          </div>
        </div>

        {/* 九星 */}
        <div className="text-xs">
          <span className="text-muted-foreground">星:</span> {palace.star}
        </div>

        {/* 八门 */}
        <div className="text-xs">
          <span className="text-muted-foreground">门:</span> {palace.door}
        </div>

        {/* 八神 */}
        <div className="text-xs">
          <span className="text-muted-foreground">神:</span> {palace.deity}
        </div>

        {/* 中宫 note */}
        {isZhongGong && (
          <div className="text-xs text-muted-foreground italic">(寄宫 - ไม่มีค่าตัวเอง)</div>
        )}
      </div>
    </Card>
  );
}
