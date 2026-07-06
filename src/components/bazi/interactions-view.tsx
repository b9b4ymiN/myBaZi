/**
 * InteractionsView - แสดงปฏิสัมพันธ์ในดวง (Phase C depth)
 *
 * 3 ส่วน:
 * 1. 三合/半三合 (Three Harmony) - กิ่งที่ผนึกเป็นธาตุเดียวกัน
 * 2. 冲/合/害/刑 (Branch Interactions) - ปะทะ/ผสม/ทำร้าย/ลงโทษ
 * 3. 天干五合 (Stem Combinations) - ทวิผนึก แปรสภาพเป็นธาตุอื่น
 *
 * ZERO HALLUCINATION: ทุกข้อความมาจาก engine (interactions/three-harmony/stem-combinations)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ElementBadge } from "@/components/bazi/element-badge";
import { Sparkles, AlertTriangle, Swords, Link2, CloudRain } from "lucide-react";
import type { BranchInteraction, BranchInteractionType } from "@/lib/bazi/interactions";
import type { ThreeHarmonyResult } from "@/lib/bazi/three-harmony";
import type { StemCombinationMatch } from "@/lib/bazi/stem-combinations";
import { ELEMENT_THAI } from "@/lib/bazi/types";

const POSITION_THAI: Record<string, string> = {
  year: "ปี",
  month: "เดือน",
  day: "วัน",
  hour: "ยาม",
};

/** style ตามประเภท interaction */
const INTERACTION_STYLE: Record<
  BranchInteractionType,
  { icon: typeof AlertTriangle; tone: string; label: string }
> = {
  冲: { icon: Swords, tone: "text-red-600 dark:text-red-400", label: "ชน" },
  合: { icon: Link2, tone: "text-emerald-600 dark:text-emerald-400", label: "ผสม" },
  害: { icon: AlertTriangle, tone: "text-amber-600 dark:text-amber-400", label: "เบียดเบียน" },
  刑: { icon: Swords, tone: "text-rose-600 dark:text-rose-400", label: "ลงโทษ" },
};

interface InteractionsViewProps {
  interactions: BranchInteraction[];
  threeHarmony: ThreeHarmonyResult;
  stemCombinations: StemCombinationMatch[];
}

export function InteractionsView({
  interactions,
  threeHarmony,
  stemCombinations,
}: InteractionsViewProps) {
  const hasHarmony = threeHarmony.found;
  const hasInteractions = interactions.length > 0;
  const hasStems = stemCombinations.length > 0;
  const isEmpty = !hasHarmony && !hasInteractions && !hasStems;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          ปฏิสัมพันธ์ในดวง
        </CardTitle>
        <CardDescription>
          การผนึก/ปะทะระหว่างเสา — บอกพลังธาตุรวมและจุดตึงเครียดในดวง
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmpty && (
          <p className="text-sm text-muted-foreground">
            ดวงนี้ไม่มีคู่ที่ผนึกหรือปะทะกันโดยตรงระหว่าง 4 เสา ถือว่าสงบ อ่านเป็นเสาแยกกันได้ชัด
          </p>
        )}

        {/* 三合 / 半三合 */}
        {hasHarmony && threeHarmony.frame && threeHarmony.transformElement && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={threeHarmony.type === "full" ? "default" : "secondary"}>
                {threeHarmony.type === "full" ? "สามกิ่งผนึกครบ (三合)" : "ครึ่งสามกิ่ง (半三合)"}
              </Badge>
              <span className="text-lg font-semibold">{threeHarmony.frame}</span>
              <span className="text-sm text-muted-foreground">→</span>
              <ElementBadge element={threeHarmony.transformElement} />
              <span className="text-sm">
                แปรเป็นธาตุ{ELEMENT_THAI[threeHarmony.transformElement]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {threeHarmony.type === "full"
                ? `กิ่ง ${threeHarmony.frame} ผนึกกันครบสามตัว — พลังธาตุ${ELEMENT_THAI[threeHarmony.transformElement]}ในดวงแข็งแกร่งมาก`
                : threeHarmony.strength === "strong"
                ? `มีกิ่งกลาง (帝旺) อยู่ — พลังธาตุ${ELEMENT_THAI[threeHarmony.transformElement]}แข็งแกร่ง`
                : `ขาดกิ่งกลาง เป็นเพียงโค้ง (拱) — พลังธาตุ${ELEMENT_THAI[threeHarmony.transformElement]}ปานกลาง`}
              {threeHarmony.missingBranches.length > 0 &&
                ` · ยังขาด ${threeHarmony.missingBranches.join("、")}`}
            </p>
          </div>
        )}

        {/* 冲/合/害/刑 */}
        {hasInteractions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              ปะทะระหว่างกิ่ง (地支)
            </h4>
            {interactions.map((it, i) => {
              const style = INTERACTION_STYLE[it.type];
              const Icon = style.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 py-1">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.tone}`} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <span className="font-medium">
                        {it.branches[0]} ({POSITION_THAI[it.positions[0]]}){" "}
                        <span className={style.tone}>{style.label}</span>{" "}
                        {it.branches[1]} ({POSITION_THAI[it.positions[1]]})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{it.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 天干五合 */}
        {hasStems && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CloudRain className="h-4 w-4" />
              ทวิผนึกทวีป (天干五合)
            </h4>
            {stemCombinations.map((sc, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap text-sm py-0.5">
                <span className="font-medium">
                  {sc.pair[0]} ({POSITION_THAI[sc.positions[0]]}) + {sc.pair[1]} (
                  {POSITION_THAI[sc.positions[1]]})
                </span>
                <span className="text-muted-foreground">→</span>
                <ElementBadge element={sc.transformElement} />
                <span className="text-muted-foreground">
                  แปรเป็นธาตุ{ELEMENT_THAI[sc.transformElement]}
                </span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              ทวิส่วนผนึกกันแล้วแปรสภาพเป็นธาตุใหม่ — มักสื่อถึงความสัมพันธ์ที่ผูกพัน (ดู合婚)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
