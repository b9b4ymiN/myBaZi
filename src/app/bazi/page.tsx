/**
 * BaZi Page - หน้าวิเคราะห์ปาจื้อ (八字)
 * แสดง Natal Chart + การวิเคราะห์ทั้งหมด
 */

"use client";

import { NatalChart } from "@/components/bazi/natal-chart";
import { DayMasterCard } from "@/components/bazi/day-master-card";
import { StrengthCard } from "@/components/bazi/strength-card";
import { StructureCard } from "@/components/bazi/structure-card";
import { UsefulGodCard } from "@/components/bazi/useful-god-card";
import { TenGodsView } from "@/components/bazi/ten-gods-view";
import { StarsView } from "@/components/bazi/stars-view";
import { LuckTimelineView } from "@/components/bazi/luck-timeline";
import { ElementCompositionView } from "@/components/bazi/element-composition-view";
import { DestinyHero } from "@/components/bazi/destiny-hero";
import { InsightNarrative } from "@/components/bazi/insight-narrative";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { useBaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { getArchetype } from "@/lib/bazi/archetypes";
import { buildBaZiNarrative } from "@/lib/bazi/narrative";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  EmptyStatePanel,
  LoadingPanel,
  PageFrame,
  PageSection,
  RouteHeader,
} from "@/components/layout/page-patterns";

export default function BaziPage() {
  const activeProfile = useActiveProfileSafe();
  const analysis = useBaZiAnalysis(activeProfile);

  // Hydration state - แสดง skeleton ระหว่างรอ
  if (activeProfile === null) {
    return (
      <PageFrame maxWidth="narrow">
        <RouteHeader
          eyebrow="八字"
          title="ปาจื้อ"
          description="โมดูลคำนวณปาจื้อและวิเคราะห์ดวงชะตา"
        />
        <EmptyStatePanel
          title="ยังไม่ได้เลือกโปรไฟล์"
          description="สร้างหรือเลือกโปรไฟล์ก่อนเริ่มวิเคราะห์ เพื่อให้แผนผัง 4 เสาและคำอธิบายอิงข้อมูลเกิดของคุณ"
        >
          <Button asChild size="lg">
            <Link href="/profiles">ไปที่หน้าโปรไฟล์</Link>
          </Button>
        </EmptyStatePanel>
      </PageFrame>
    );
  }

  // แสดง skeleton ระหว่างคำนวณ
  if (analysis === null) {
    return (
      <PageFrame maxWidth="narrow">
        <LoadingPanel title="ปาจื้อ (八字)" description="กำลังคำนวณแผนผังและสมดุลธาตุ..." />
      </PageFrame>
    );
  }

  const { chart, strength, structure, usefulGod, godsAndStars, luck, elements } = analysis;

  // Get archetype for day master
  const archetype = getArchetype({
    name: strength.dayMaster.name,
    element: strength.dayMaster.element,
    yinYang: chart.dayMaster.yinYang ? "yin" : "yang",
  });

  // Build narrative insight flow
  const narrative = buildBaZiNarrative({
    profileName: activeProfile.name,
    analysis,
    archetype,
  });

  return (
    <PageFrame>
      <RouteHeader
        eyebrow="八字"
        title="ปาจื้อ"
        description="วิเคราะห์ดวงชะตาจาก 4 เสา พร้อม Day Master, 用神, ดาว และเสาโชค"
        meta={
          <span className="text-sm font-medium text-element-fire">
            เจ้าวัน: {strength.dayMaster.name}
          </span>
        }
      />

      {/* SECTION 1: Destiny Hero - Summary กระชับด้านบน */}
      <PageSection>
        <DestinyHero
          strength={strength}
          structure={structure}
          usefulGod={usefulGod}
          profileName={activeProfile.name}
          birthDate={activeProfile.birthDate}
        />
      </PageSection>

      {/* SECTION 2: Insight Narrative - สิ่งที่คุณอยากรู้ */}
      <PageSection title="สิ่งที่คุณอยากรู้">
        <InsightNarrative narrative={narrative} />
      </PageSection>

      {/* SECTION 3: Natal Chart - แผนผัง 4 เสา */}
      <PageSection title="แผนผัง 4 เสา (Natal Chart)">
        <NatalChart chart={chart} />
      </PageSection>

      {/* SECTION 4: Detail Cards - การวิเคราะห์เชิงลึก */}
      <PageSection title="การวิเคราะห์เชิงลึก">
        <div className="grid gap-6 md:grid-cols-2">
          <DayMasterCard strength={strength} />
          <StrengthCard strength={strength} />
          <StructureCard structure={structure} />
          <UsefulGodCard usefulGod={usefulGod} />
        </div>
      </PageSection>

      {/* SECTION 5: Extended Views - รายละเอียดเพิ่มเติม */}
      <PageSection title="รายละเอียดเพิ่มเติม">
        <div className="grid gap-6 lg:grid-cols-2">
          <TenGodsView godsAndStars={godsAndStars} chart={chart} />
          <StarsView godsAndStars={godsAndStars} />
          <LuckTimelineView luck={luck} />
          <ElementCompositionView elements={elements} />
        </div>
      </PageSection>
    </PageFrame>
  );
}
