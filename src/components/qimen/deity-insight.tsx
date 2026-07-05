"use client";

import type { QiMenChart } from "@/types/qimen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/ui/rich-text";

interface DeityInsightProps {
  chart: QiMenChart;
}

/**
 * 8 Deities (八神) information with Thai meanings
 */
const DEITY_INFO: Record<string, { name: string; thai: string; description: string }> = {
  值符: {
    name: "值符",
    thai: "เทพนำโชค (ผู้นำ)",
    description:
      "ผู้นำสูงสุดของ 8 เทพ — แทนจิตวิญญาณแห่งความเป็นผู้นำ ความแข็งแกร่ง และโชคลาภ เมื่ออยู่ที่ palace ที่ดี จะนำพาความสำเร็จและความเป็นผู้นำ",
  },
  腾蛇: {
    name: "腾蛇",
    thai: "งูวิเศษ (ความสับสน/ปัญญา)",
    description:
      "งูที่บินได้ — แทนความหลากหลาย ความประหลาด และเรื่องเหนือธรรมชาติ สามารถหมายถึงความสับสน กลโกง หรือปัญญาที่ลึกซึ้ง",
  },
  太阴: {
    name: "太阴",
    thai: "ยินรักษา (ซ่อนเร้น)",
    description:
      "ดวงจันทร์ยามราตรี — แทนสิ่งที่ซ่อนเร้น ความลับ ความเงียบขรึม และพลังแห่งความรู้ที่ลึกซึ้ง และความสามารถในการปกป้องสิ่งที่มีค่า",
  },
  六合: {
    name: "六合",
    thai: "หกฮะ (การเจริญพูน/แต่งงาน)",
    description:
      "ความกลมกลืนและความสามัคคี — แทนการรวมตัว ความรัก การแต่งงาน ความสุขในครอบครัว และความร่วมมือที่ดี",
  },
  白虎: {
    name: "白虎",
    thai: "เสือขาว (ความดุ/อันตราย)",
    description:
      "เสือขาว — แทนพลังที่รุนแรง ความดุดัน ศัตรู ความอันตราย และการต่อสู้ ในทางบวกสามารถหมายถึงความกล้าหาญและพลังป้องกัน",
  },
  玄武: {
    name: "玄武",
    thai: "นักรบดำ (เล่ห์เหลี่ยม)",
    description:
      "เต่าที่มีงูพัน — แทนเล่ห์เหลี่ยม การวางแผน การหลีกเลี่ยง และความลับที่อาจเป็นอันตราย สามารถหมายถึงโจร สิ่งที่ซ่อนเร้น หรือกลอุบาย",
  },
  九地: {
    name: "九地",
    thai: "เก้าปฐพี (มั่นคง/รักษา)",
    description:
      "แผ่นดิน 9 ชั้น — แทนความมั่นคง ความคงทน การป้องกัน และพื้นฐานที่แน่นหนา เป็นเทพที่เกี่ยวข้องกับการรักษาและการเก็บรักษา",
  },
  九天: {
    name: "九天",
    thai: "เก้าสวรรค์ (สูงส่ง/กล้า)",
    description:
      "ท้องฟ้า 9 ชั้น — แทนความสูงส่ง ความยิ่งใหญ่ ความทะเยอทะยาน และความกล้าหาญ เป็นเทพที่เกี่ยวข้องกับเป้าหมายที่สูงและความสำเร็จอันยิ่งใหญ่",
  },
};

/**
 * Deity Insight component showing all 8 deities in the chart
 */
export function DeityInsight({ chart }: DeityInsightProps) {
  // Collect unique deities from the chart
  const deitiesInChart = Array.from(
    new Set(chart.palaces.map((p) => p.deity).filter((d) => d && d !== "寄"))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">八神 (8 Deities)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All 8 deities overview */}
        <div className="space-y-3">
          {deitiesInChart.map((deity) => {
            const info = DEITY_INFO[deity];
            if (!info) return null;

            const palace = chart.palaces.find((p) => p.deity === deity);

            return (
              <div
                key={deity}
                className="p-3 rounded-lg border border-gold/40 bg-card space-y-2"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold">{info.name}</div>
                    <div className="text-sm text-muted-foreground">{info.thai}</div>
                  </div>
                  <Badge variant="outline">
                    Palace {palace?.palaceNumber} ({palace?.bagua})
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <RichText>{info.description}</RichText>
                </p>
              </div>
            );
          })}
        </div>

        {/* Note about 值符 */}
        {chart.palaces.find((p) => p.isZhiFu) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">值符 (Zhi Fu)</span> เป็นเทพที่สำคัญที่สุด
              — เป็นจุดศูนย์กลางของแผนผัง และความสำเร็จในเรื่องต่างๆ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
