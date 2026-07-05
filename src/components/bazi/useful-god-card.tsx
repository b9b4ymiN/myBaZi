/**
 * UsefulGodCard component - แสดงธาตุที่เป็นประโยชน์ (用神 / Yong Shen)
 * แสดง primary element, secondary elements, avoid elements, และคำแนะนำ
 */

"use client";

import type { UsefulGodAnalysis } from "@/types/bazi-useful-god";
import { ElementBadge } from "./element-badge";
import { elementAssetPath } from "./element-asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/ui/rich-text";
import Image from "next/image";

interface UsefulGodCardProps {
  usefulGod: UsefulGodAnalysis;
}

/**
 * Map Relationship Type → ไทย (สั้น) สำหรับ UI
 */
const RELATIONSHIP_SHORT_THAI: Record<UsefulGodAnalysis["primaryRelationship"], string> = {
  resource: "ธาตุหนุน",
  companion: "ภราดร",
  output: "หน้าที่/การสร้าง",
  wealth: "ทรัพย์",
  power: "อำนาจ",
};

/**
 * แสดงธาตุที่เป็นประโยชน์ (用神)
 */
export function UsefulGodCard({ usefulGod }: UsefulGodCardProps) {
  const {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    labelCn,
    description,
    reasons,
    applicationTips,
  } = usefulGod;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ธาตุที่เป็นประโยชน์ (用神 / Yong Shen)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Element (用神) */}
        <div className="space-y-2">
          <div className="text-sm font-medium">ธาตุหลักที่เป็นประโยชน์ (用神)</div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <ElementBadge element={primaryElement} size="lg" />
              <Badge variant="outline" className="text-sm">
                {RELATIONSHIP_SHORT_THAI[primaryRelationship]}
              </Badge>
            </div>
            {/* Brand asset watermark */}
            <div className="relative h-20 w-20 flex-shrink-0 ml-auto">
              <Image
                src={elementAssetPath(primaryElement)}
                alt=""
                aria-hidden="true"
                fill
                className="object-contain opacity-30"
                sizes="80px"
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{labelCn}</div>
        </div>

        <Separator />

        {/* Secondary Elements (喜神) */}
        {secondaryElements.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-700 dark:text-green-400">
              ธาตุรองที่เป็นประโยชน์ (喜神)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {secondaryElements.map((el, idx) => (
                <ElementBadge key={idx} element={el} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* Avoid Elements (忌神) */}
        {avoidElements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-700 dark:text-red-400">
                ธาตุที่ควรหลีกเลี่ยง (忌神)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {avoidElements.map((el, idx) => (
                  <ElementBadge key={idx} element={el} size="md" />
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Description */}
        {description && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <RichText className="text-sm text-muted-foreground">{description}</RichText>
          </div>
        )}

        {/* Reasons (scrollable if long) */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">เหตุผล</div>
            <ScrollArea className={`h-24 w-full rounded-md border border-border ${reasons.length > 3 ? '' : 'h-auto'}`}>
              <div className="p-3 space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="font-medium text-primary">•</span>
                    <RichText>{reason}</RichText>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Application Tips */}
        {applicationTips && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">คำแนะนำการนำไปใช้</div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <RichText className="text-sm text-muted-foreground whitespace-pre-line">{applicationTips}</RichText>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
