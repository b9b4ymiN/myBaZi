/**
 * TenGodsView - แสดง 10 เทพเจ้า (十神)
 * ตารางแสดง 10 gods ที่ตำแหน่ง Year/Month/Hour + Hidden Stems ใน Day Branch
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ElementBadge } from "@/components/bazi/element-badge";
import type { GodsAndStarsAnalysis, TenGodInfo, TenGodName } from "@/types/bazi-gods-stars";
import type { BaZiChart } from "@/lib/bazi/types";

interface TenGodsViewProps {
  godsAndStars: GodsAndStarsAnalysis;
  chart: BaZiChart;
}

/**
 * Lookup คำอธิบายสั้นๆ ของ 10 Gods (ไทย)
 */
const TEN_GOD_DESCRIPTIONS: Record<TenGodName, string> = {
  正官: "อำนาจ/วินัย - ความสุขุมเชื่อง",
  七杀: "อำนาจแรง - ความกดดัน/ความทะเยอทะยาน",
  正印: "การศึกษา/มารดา - ความเมตตา",
  偏印: "ความรู้นอกแบบ - ศิลปะ/ความคิดสร้างสรรค์",
  比肩: "เพื่อน/พี่น้อง - การสนับสนุน",
  劫财: "คู่แข่ง/เพื่อน - การแย่งชิง",
  食神: "ความสุข/ความสามารถ - การแสดงออก",
  伤官: "ความคิดสร้างสรรค์/ความดื้อ - นักสร้างสรรค์",
  正财: "ทรัพย์สิน/รายได้ - ความมั่งคั่ง",
  偏财: "ทรัพย์ลอย/ลุ้นรวย - โชคลาภ",
};

/**
 * ชื่อตำแหน่งภาษาไทย
 */
const POSITION_THAI: Record<string, string> = {
  year: "ปีชะตา",
  month: "เดือนชะตา",
  hour: "ชั่วโมงชะตา",
  dayHiddenStems: "ธาตุซ่อนในวันชะตา",
};

/**
 * แสดง 10 God แต่ละตัวพร้อม stem
 */
function TenGodRow({
  position,
  tenGod,
  stemName,
}: {
  position: string;
  tenGod: TenGodInfo | null;
  stemName?: string;
}) {
  if (!tenGod) {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-sm text-muted-foreground w-28">{POSITION_THAI[position]}</span>
        <span className="text-muted-foreground text-sm">ไม่ทราบเวลา</span>
      </div>
    );
  }

  const description = TEN_GOD_DESCRIPTIONS[tenGod.name];

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-sm font-medium w-28">{POSITION_THAI[position]}</span>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-bold">
            {tenGod.name}
          </Badge>
          <span className="text-sm text-muted-foreground">{tenGod.nameTh}</span>
          {stemName && (
            <span className="text-sm text-muted-foreground">
              (สวน: {stemName})
            </span>
          )}
          <ElementBadge element={tenGod.element} size="sm" showThai={false} />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * TenGodsView Component
 */
export function TenGodsView({ godsAndStars, chart }: TenGodsViewProps) {
  const { tenGods } = godsAndStars;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">10 เทพเจ้า (十神)</CardTitle>
        <CardDescription>
          ความสัมพันธ์ระหว่างเจ้าวันกับสวนอื่นๆ - บ่งบอกลักษณะนิสัยและชะตาชีวิต
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Stems - Year, Month, Hour */}
          <div className="space-y-1">
            <TenGodRow
              position="year"
              tenGod={tenGods.year}
              stemName={chart.year.stem.name}
            />
            <TenGodRow
              position="month"
              tenGod={tenGods.month}
              stemName={chart.month.stem.name}
            />
            <TenGodRow
              position="hour"
              tenGod={tenGods.hour}
              stemName={chart.hour?.stem.name}
            />
          </div>

          <Separator />

          {/* Hidden Stems in Day Branch */}
          <div>
            <h4 className="font-medium text-sm mb-2">
              {POSITION_THAI.dayHiddenStems}
            </h4>
            {tenGods.dayHiddenStems.length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่มีธาตุซ่อน</p>
            ) : (
              <div className="space-y-2">
                {tenGods.dayHiddenStems.map((god, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {god.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {god.nameTh}
                    </span>
                    <ElementBadge element={god.element} size="sm" showThai={false} />
                    <p className="text-xs text-muted-foreground">
                      {TEN_GOD_DESCRIPTIONS[god.name]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Legend — collapsible (เทคนิค ซ่อน default) */}
          <Separator />
          <Accordion type="single" collapsible>
            <AccordionItem value="legend" className="border-b-0">
              <AccordionTrigger className="text-xs text-muted-foreground py-2">
                ตารางสรุปความสัมพันธ์ 10 เทพเจ้า (十神)
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-xs text-muted-foreground space-y-1 pb-2">
                  <div className="grid grid-cols-2 gap-1">
                    <div>• 同我 (เพื่อน): 比肩, 劫财</div>
                    <div>• 我生 (ผลผลิต): 食神, 伤官</div>
                    <div>• 我克 (ทรัพย์): 偏财, 正财</div>
                    <div>• 克我 (อำนาจ): 七杀, 正官</div>
                    <div>• 生我 (ทรัพย์สิน): 偏印, 正印</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
