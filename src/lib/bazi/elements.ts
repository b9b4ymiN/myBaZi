/**
 * BaZi Element Composition Analysis (สัดส่วน 5 ธาตุ)
 * วิเคราะห์สัดส่วนของ 5 ธาตุใน BaZi Chart ตามตำรามาตรฐาน
 *
 * Algorithm: Weighted counting
 * - Stems: weight 1.0 each
 * - Branches: weight 1.0 each
 * - Hidden Stems: main 1.0, middle 0.5, residual 0.3
 */

import type { BaZiChart } from "./types";
import type {
  ElementComposition,
  ElementCount,
  ElementLevel,
  BalanceStatus,
} from "@/types/bazi-elements";
import type { ElementName } from "./types";
import { ELEMENT_THAI } from "./types";

/**
 * แปลง weight เป็น level
 *
 * @param percentage - เปอร์เซ็นต์ (0-100)
 * @returns ElementLevel
 */
function percentageToLevel(percentage: number): ElementLevel {
  if (percentage === 0) return "none";
  if (percentage <= 10) return "low";
  if (percentage <= 25) return "medium";
  if (percentage <= 40) return "high";
  return "dominant";
}

/**
 * แปลง weight เป็น level จาก count
 *
 * @param count - จำนวน weighted
 * @param totalWeight - คะแนนรวมทั้งหมด
 * @returns ElementLevel
 */
function countToLevel(count: number, totalWeight: number): ElementLevel {
  const percentage = (count / totalWeight) * 100;
  return percentageToLevel(percentage);
}

/**
 * หาสถานะความสมดุลจากส่วนต่างระหว่าง dominant และ weakest
 *
 * @param dominantPercentage - เปอร์เซ็นต์ของธาตุเด่นสุด
 * @param weakestPercentage - เปอร์เซ็นต์ของธาตุอ่อนสุด
 * @returns BalanceStatus
 */
function determineBalanceStatus(
  dominantPercentage: number,
  weakestPercentage: number
): BalanceStatus {
  const diff = dominantPercentage - weakestPercentage;
  if (diff < 15) return "balanced";
  if (diff <= 30) return "slightly_imbalanced";
  return "imbalanced";
}

/**
 * สร้าง description ภาษาไทยสำหรับ element composition
 *
 * @param composition - ElementComposition
 * @returns string - description ภาษาไทย
 */
function buildDescription(composition: ElementComposition): string {
  const parts: string[] = [];

  // ธาตุเด่นสุด
  const dominant = composition.counts.find(
    (c) => c.element === composition.dominantElement
  );
  if (dominant && dominant.level === "dominant") {
    parts.push(`ธาตุ${ELEMENT_THAI[dominant.element]}เด่นมาก (${dominant.percentage.toFixed(1)}%)`);
  } else if (dominant) {
    parts.push(`ธาตุ${ELEMENT_THAI[dominant.element]}เด่น (${dominant.percentage.toFixed(1)}%)`);
  }

  // ธาตุที่ขาด
  if (composition.missingElements.length > 0) {
    const missingNames = composition.missingElements
      .map((e) => ELEMENT_THAI[e])
      .join(", ");
    parts.push(`ขาดธาตุ${missingNames}`);
  }

  // ธาตุอ่อนสุด
  if (composition.weakestElement) {
    const weakest = composition.counts.find(
      (c) => c.element === composition.weakestElement
    );
    if (weakest && weakest.level !== "none") {
      parts.push(`ธาตุ${ELEMENT_THAI[weakest.element]}น้อยที่สุด (${weakest.percentage.toFixed(1)}%)`);
    }
  }

  // ความสมดุล
  const balanceMap: Record<BalanceStatus, string> = {
    balanced: "สมดุลดี",
    slightly_imbalanced: "ค่อนข้างสมดุล",
    imbalanced: "ไม่สมดุล",
  };
  parts.push(balanceMap[composition.balanceStatus]);

  return parts.join(", ");
}

/**
 * วิเคราะห์สัดส่วน 5 ธาตุใน BaZi Chart
 *
 * Algorithm:
 * 1. นับ stems (weight 1.0 each) - 4 stems
 * 2. นับ branches (weight 1.0 each) - 4 branches
 * 3. นับ hidden stems (main 1.0, middle 0.5, residual 0.3)
 * 4. คำนวณ percentage, level, dominant, weakest, missing
 * 5. สรุป description และ balance status
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @returns ElementComposition - ผลวิเคราะห์สัดส่วน 5 ธาตุ
 */
export function analyzeElements(chart: BaZiChart): ElementComposition {
  // Step 1: Initialize counts for all 5 elements
  const weights: Record<ElementName, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // Step 2: นับ stems (1.0 each) + branches (1.0 each)
  const pillars = [chart.year, chart.month, chart.day];
  if (chart.hour) {
    pillars.push(chart.hour);
  }

  for (const pillar of pillars) {
    // Stem weight = 1.0
    weights[pillar.stem.element] += 1.0;

    // Branch main element weight = 1.0
    weights[pillar.branch.element] += 1.0;

    // Hidden stems weighted
    for (const hidden of pillar.branch.hiddenStems) {
      if (hidden.type === "main") {
        weights[hidden.stem.element] += 1.0;
      } else if (hidden.type === "middle") {
        weights[hidden.stem.element] += 0.5;
      } else {
        // residual
        weights[hidden.stem.element] += 0.3;
      }
    }
  }

  // Step 3: คำนวณ total weight
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  // Step 4: สร้าง ElementCount[] (เรียงตามลำดับ 木火土金水)
  const elementOrder: ElementName[] = ["木", "火", "土", "金", "水"];
  const counts: ElementCount[] = elementOrder.map((element) => {
    const weight = weights[element];
    const percentage = (weight / totalWeight) * 100;
    const level = countToLevel(weight, totalWeight);

    return {
      element,
      count: weight, // weighted count
      percentage: Math.round(percentage * 10) / 10, // 1 ทศนิยม
      weight,
      level,
    };
  });

  // Step 5: หา dominant element (weight สูงสุด)
  const dominantElement: ElementName = elementOrder.reduce((prev, current) =>
    weights[current] > weights[prev] ? current : prev
  );

  // Step 6: หา weakest element (ข้าม none)
  const nonNoneElements = counts.filter((c) => c.level !== "none");
  const weakestElement: ElementName | null = nonNoneElements.length > 0
    ? nonNoneElements.reduce((prev, current) =>
        current.count < prev.count ? current : prev
      ).element
    : null;

  // Step 7: หา missing elements (count = 0)
  const missingElements: ElementName[] = counts
    .filter((c) => c.count === 0)
    .map((c) => c.element);

  // Step 8: หา balance status
  const dominantCount = counts.find((c) => c.element === dominantElement);
  const weakestCount = weakestElement
    ? counts.find((c) => c.element === weakestElement)
    : null;
  const balanceStatus: BalanceStatus =
    dominantCount && weakestCount
      ? determineBalanceStatus(dominantCount.percentage, weakestCount.percentage)
      : "imbalanced";

  // Step 9: สร้าง composition
  const composition: ElementComposition = {
    counts,
    dominantElement,
    weakestElement,
    missingElements,
    totalWeight,
    description: "", // temporary
    balanceStatus,
  };

  // Step 10: Build description
  composition.description = buildDescription(composition);

  return composition;
}
