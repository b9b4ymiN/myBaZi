/**
 * Personal Resonance Analysis (ความเข้ากันส่วนตัว)
 * Analyzes how a specific day resonates with user's BaZi chart
 */

import type { TongShuDayInfo } from "@/types/tongshu";
import type { ElementName } from "@/lib/bazi/types";
import type { PersonalResonance } from "@/types/tongshu";
import { getRelationshipType } from "@/lib/bazi/relationships";
import { getPillarElements } from "./element-maps";

/**
 * Thai labels for 10 God relationships (十神) */
const RELATIONSHIP_THAI: Record<PersonalResonance["stemRelationship"], string> = {
  resource: "印 (แหล่งพลังงาน)",
  companion: "比 (เพื่อนร่วมธาตุ)",
  output: "食伤 (การแสดงออก)",
  wealth: "财 (ทรัพย์สิน)",
  power: "官杀 (อำนาจ)",
};

/**
 * Thai labels for resonance ratings */
const RATING_THAI: Record<PersonalResonance["rating"], string> = {
  very_good: "เข้ากันมาก",
  good: "เข้ากันดี",
  neutral: "ปานกลาง",
  challenging: "ท้าทาย",
  very_challenging: "ท้าทายมาก",
};

/**
 * Analyze personal resonance between user and selected day
 *
 * @param dayInfo - Tong Shu day information
 * @param userDayMaster - User's day master (stem + element)
 * @param usefulGodElement - User's useful god element (from BaZi analysis)
 * @returns PersonalResonance analysis
 */
export function analyzePersonalResonance(
  dayInfo: TongShuDayInfo,
  userDayMaster: { stem: string; element: ElementName; },
  usefulGodElement: ElementName | null,
): PersonalResonance {
  // 1. Extract day pillar elements
  const dayPillarElements = getPillarElements(dayInfo.sixtyCycle);

  // 2. Analyze stem relationship (10 Gods)
  const stemRelationship = getRelationshipType(
    userDayMaster.element,
    dayPillarElements.stemElement
  );
  const stemRelationshipTh = RELATIONSHIP_THAI[stemRelationship];

  // 3. Calculate resonance score
  let score = 0;

  // Stem relationship (weighted more heavily)
  switch (stemRelationship) {
    case "resource":
      score += 4; // 生我 - supports day master
      break;
    case "companion":
      score += 4; // 同我 - strengthens day master
      break;
    case "wealth":
      score -= 2; // 我克 - drains energy
      break;
    case "power":
      score -= 2; // 克我 - pressure
      break;
    case "output":
      score -= 1; // 我生 - expression/drain
      break;
  }

  // Branch relationship (weighted less)
  const branchRelationship = getRelationshipType(
    userDayMaster.element,
    dayPillarElements.branchElement
  );
  switch (branchRelationship) {
    case "resource":
    case "companion":
      score += 2;
      break;
    case "wealth":
    case "power":
      score -= 1;
      break;
    case "output":
      score -= 1;
      break;
  }

  // 4. Element alignment with Useful God
  let alignsWithUsefulGod = false;
  let alignmentNote = "ไม่มีข้อมูล Useful God";

  if (usefulGodElement !== null) {
    const stemAligns = dayPillarElements.stemElement === usefulGodElement;
    const branchAligns = dayPillarElements.branchElement === usefulGodElement;

    alignsWithUsefulGod = stemAligns || branchAligns;

    if (alignsWithUsefulGod) {
      score += 3;
      alignmentNote = stemAligns
        ? `วันหลักสตร์ม (${dayPillarElements.stemElement}) ตรงกับ Useful God ของคุณ (${usefulGodElement})`
        : `วันหลักสาขา (${dayPillarElements.branchElement}) ตรงกับ Useful God ของคุณ (${usefulGodElement})`;
    } else {
      alignmentNote = `วันหลักไม่ตรงกับ Useful God (${usefulGodElement})`;
    }
  }

  // 5. Clamp score to -10..+10 range
  score = Math.max(-10, Math.min(10, score));

  // 6. Determine rating from score
  const rating = getRatingFromScore(score);

  // 7. Generate Thai summary
  const summary = generateSummary({
    stemRelationshipTh,
    alignsWithUsefulGod,
    alignmentNote,
    score,
    rating,
  });

  return {
    userDayMaster,
    dayPillar: {
      stem: dayInfo.sixtyCycle[0],
      branch: dayInfo.sixtyCycle[1],
      stemElement: dayPillarElements.stemElement,
      branchElement: dayPillarElements.branchElement,
    },
    stemRelationship,
    stemRelationshipTh,
    usefulGodElement,
    alignsWithUsefulGod,
    alignmentNote,
    resonanceScore: score,
    rating,
    summary,
  };
}

/**
 * Map resonance score to rating category */
function getRatingFromScore(score: number): PersonalResonance["rating"] {
  if (score >= 7) return "very_good";
  if (score >= 4) return "good";
  if (score >= -1) return "neutral";
  if (score >= -5) return "challenging";
  return "very_challenging";
}

/**
 * Generate Thai summary for personal resonance */
function generateSummary(params: {
  stemRelationshipTh: string;
  alignsWithUsefulGod: boolean;
  alignmentNote: string;
  score: number;
  rating: PersonalResonance["rating"];
}): string {
  const ratingText = RATING_THAI[params.rating];
  const alignText = params.alignsWithUsefulGod ? "✓ ตรงกับ Useful God" : "ไม่ตรงกับ Useful God";

  return `วันนี้${ratingText} (${params.score} คะแนน) - ` +
    `ความสัมพันธ์: ${params.stemRelationshipTh}. ${alignText}.`;
}
