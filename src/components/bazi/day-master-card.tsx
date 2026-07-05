/**
 * DayMasterCard component - แสดงข้อมูลเจ้าวัน (Day Master)
 * แสดงชื่อจีน, พินอิน, ไทย, ธาตุ, หยิน/หยาง, และบุคลิกโดยย่อ
 */

"use client";

import type { StrengthAnalysis } from "@/types/bazi-strength";
import { ElementBadge } from "./element-badge";
import { elementAssetPath } from "./element-asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface DayMasterCardProps {
  strength: StrengthAnalysis;
}

/**
 * Lookup table: ธาตุ → บุคลิกเบื้องต้น (archetype)
 */
const ELEMENT_ARCHETYPE: Record<
  Parameters<typeof ElementBadge>[0]["element"],
  { emoji: string; traits: string; description: string }
> = {
  木: {
    emoji: "🌳",
    traits: "เติบโต / ความอดทน",
    description:
      "เจ้าวันธาตุไม้ เป็นคนมีความเติบโตอย่างต่อเนื่อง ยืดหยุ่นและทนทานต่อสถานการณ์ที่เปลี่ยนแปลง เหมือนไม้ที่โตขึ้นเรื่อยๆ มีชีวิตชีวาและสามารถปรับตัวได้ดี",
  },
  火: {
    emoji: "🔥",
    traits: "กระตือรือร้น / ส่องสว่าง",
    description:
      "เจ้าวันธาตุไฟ เป็นคนกระตือรือร้น มีพลังงานสูง รักการแสดงออกและเป็นศูนย์รวมความสนใจ เหมือนไฟที่ให้ความสว่างและความอบอุ่นแก่รอบข้าง",
  },
  土: {
    emoji: "⛰️",
    traits: "มั่นคง / เชื่อใจได้",
    description:
      "เจ้าวันธาตุดิน เป็นคนมั่นคง น่าเชื่อถือ และเป็นที่พึ่งพิงของคนอื่น เหมือนดินที่เป็นฐานที่มั่นคงและให้พืชพรรณธาตุต่างๆ เติบโตได้",
  },
  金: {
    emoji: "⚔️",
    traits: "เด็ดขาด / ยุติธรรม",
    description:
      "เจ้าวันธาตุโลหะ เป็นคนเด็ดขาด มีหลักการ รักความเป็นธรรมและมีวินัยสูง เหมือนโลหะที่แข็งแรง คมกริบและสามารถตัดสินใจได้อย่างชัดเจน",
  },
  水: {
    emoji: "💧",
    traits: "ลึกล้ำ / ยืดหยุ่น",
    description:
      "เจ้าวันธาตุน้ำ เป็นคนมีความคิดลึกซึ้ง ยืดหยุ่นและปรับตัวเก่ง เหมือนน้ำที่ไหลไปตามสถานการณ์ สามารถเจาะลึกและเข้าใจสิ่งต่างๆ ได้อย่างลงตัว",
  },
};

/**
 * แสดงข้อมูลเจ้าวัน (Day Master)
 */
export function DayMasterCard({ strength }: DayMasterCardProps) {
  const { dayMaster } = strength;
  const archetype = ELEMENT_ARCHETYPE[dayMaster.element];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">เจ้าวัน (Day Master)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ชื่อจีน + ธาตุ */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-bold">{dayMaster.name}</span>
          <ElementBadge element={dayMaster.element} size="lg" />
        </div>

        {/* Brand asset + Emoji + บุคลิก */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={elementAssetPath(dayMaster.element)}
              alt=""
              aria-hidden="true"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-medium text-sm flex items-center gap-2">
              {archetype.traits}
              <span className="text-2xl" aria-hidden="true">{archetype.emoji}</span>
            </div>
            <div className="text-sm text-muted-foreground">{archetype.description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
