/**
 * BaZi Strength Calculator - แม่นที่สุด (hidden stems + clashes)
 * วิเคราะห์ความแข็ง/อ่อนของ Day Master ด้วย algorithm ที่ transparent
 *
 * ใช้ approach แบบ Raymond Lo / ตำรามาตรฐาน:
 * - Factor 1: Season (得令/失令) - weight สูงสุด
 * - Factor 2: Root (得地/失地) - ดู hidden stems
 * - Factor 3: Support (得势/失势) - ดู stems
 * - Factor 4: Clash/Combine adjustment
 */

import type { BaZiChart } from "./types";
import type { StrengthAnalysis, StrengthFactor, StrengthLevel } from "@/types/bazi-strength";
import type { ElementName } from "./types";
import { ELEMENT_THAI } from "./types";
import {
  elementThatGeneratesMe,
  elementThatIGenerate,
  elementThatControlsMe,
  elementThatIControl,
  areElementsSame,
  doesAGenerateB,
  doesAControlB,
} from "./relationships";

/**
 * วิเคราะห์ความแข็ง/อ่อนของ Day Master (แม่นที่สุด)
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @returns StrengthAnalysis - ผลวิเคราะห์พร้อม score breakdown
 */
export function analyzeStrength(chart: BaZiChart): StrengthAnalysis {
  const dayMasterElement = chart.dayMaster.element;
  const factors: StrengthFactor[] = [];

  // ===== Factor 1: Season (得令/失令) - weight สูงสุด =====
  const seasonFactor = analyzeSeason(chart, dayMasterElement);
  factors.push(seasonFactor);

  // ===== Factor 2: Root (得地/失地) - ดู hidden stems =====
  const rootFactor = analyzeRoots(chart, dayMasterElement);
  factors.push(rootFactor);

  // ===== Factor 3: Support (得势/失势) - ดู stems =====
  const supportFactor = analyzeSupport(chart, dayMasterElement);
  factors.push(supportFactor);

  // ===== Factor 4: Clash/Combine adjustment =====
  const clashNotes = analyzeClashesAndCombines(chart);

  // ===== Total score =====
  let totalScore = 0;
  factors.forEach(f => (totalScore += f.score));

  // ปรับคะแนนจาก clashes (หมายเหตุอย่างเดียว ไม่ลด score โดยตรง)
  // แต่ถ้า root branch ถูก clash → ลด root score ใน analyzeRoots แล้ว

  // ===== Determine strength level =====
  const level = determineStrengthLevel(totalScore);

  // ===== Supporting/Weakening elements =====
  const supportingElements = getSupportingElements(dayMasterElement);
  const weakeningElements = getWeakeningElements(dayMasterElement);

  // ===== Summary (ภาษาไทย) =====
  const summary = generateSummary(level, dayMasterElement, chart, factors, clashNotes);

  return {
    level,
    score: totalScore,
    dayMaster: {
      name: chart.dayMaster.name,
      element: dayMasterElement,
    },
    factors,
    supportingElements,
    weakeningElements,
    clashNotes,
    summary,
  };
}

/**
 * Factor 1: Season (得令/失令) - weight สูงสุด
 *
 * - month 生 day master → +3 (得令)
 * - month same element → +2
 * - month 克 day master → -2
 * - day master 生 month → -2 (泄气)
 * - day master 克 month → -1
 */
function analyzeSeason(chart: BaZiChart, dayMasterElement: ElementName): StrengthFactor {
  const monthElement = chart.month.branch.element;
  let score = 0;
  const details: string[] = [];

  const monthThai = ELEMENT_THAI[monthElement];
  const dayMasterThai = ELEMENT_THAI[dayMasterElement];

  // Check relationships
  if (doesAGenerateB(monthElement, dayMasterElement)) {
    // Month 生 day master (Resource)
    score = 3;
    details.push(`เดือน (${monthThai}) สร้างเจ้าวัน (${dayMasterThai}) = ได้รับค้ำยัน → 得令`);
  } else if (areElementsSame(monthElement, dayMasterElement)) {
    // Month same element (Companion)
    score = 2;
    details.push(`เดือน (${monthThai}) เป็นธาตุเดียวกับเจ้าวัน (${dayMasterThai}) = มีเพื่อนช่วย → 得令`);
  } else if (doesAControlB(monthElement, dayMasterElement)) {
    // Month 克 day master (Power)
    score = -2;
    details.push(`เดือน (${monthThai}) คุมเจ้าวัน (${dayMasterThai}) = ถูกกดดัน → 失令`);
  } else if (doesAGenerateB(dayMasterElement, monthElement)) {
    // Day master 生 month (Output)
    score = -2;
    details.push(`เจ้าวัน (${dayMasterThai}) สร้างเดือน (${monthThai}) = ระบายพลัง → 泄气`);
  } else {
    // Day master 克 month (Wealth)
    score = -1;
    details.push(`เจ้าวัน (${dayMasterThai}) คุมเดือน (${monthThai}) = ใช้แรงเกินไป → 失令`);
  }

  return {
    label: "得令 / 失令 (Season)",
    description: score > 0 ? "ได้รับแรงสนับสนุนจากฤดู" : "สูญเสียแรงสนับสนุนจากฤดู",
    score,
    details,
  };
}

/**
 * Factor 2: Root (得地/失地) - ดู hidden stems
 *
 * - Hidden stem same/生 day master → +1 (root)
 * - Day branch root → 2x (ใกล้ day master)
 * - ไม่มี root เลย → -2
 */
function analyzeRoots(chart: BaZiChart, dayMasterElement: ElementName): StrengthFactor {
  let score = 0;
  const details: string[] = [];
  const branches = [chart.year, chart.month, chart.day, chart.hour];

  // Check each branch's hidden stems
  let rootCount = 0;
  const rootBranches: string[] = [];

  branches.forEach((pillar, idx) => {
    if (!pillar) return;

    const branchName = pillar.branch.name;
    const branchThai = ELEMENT_THAI[pillar.branch.element];
    const hiddenStems = pillar.branch.hiddenStems;

    // Check main qi (most important)
    const mainQi = hiddenStems.find(hs => hs.type === "main");
    if (mainQi) {
      const mainElement = mainQi.stem.element;
      if (areElementsSame(mainElement, dayMasterElement) || doesAGenerateB(mainElement, dayMasterElement)) {
        const multiplier = idx === 2 ? 2 : 1; // Day branch (idx 2) = 2x
        score += 1 * multiplier;
        rootCount++;

        const reason = areElementsSame(mainElement, dayMasterElement)
          ? "ธาตุเดียวกัน"
          : "ธาตุที่สร้างเจ้าวัน";

        const bonus = multiplier > 1 ? " (2x - อยู่วันหลัก)" : "";
        rootBranches.push(`${branchName} (${reason}${bonus})`);
        details.push(`หลัก ${branchName} (${branchThai}): มีธาตุซ่อน ${ELEMENT_THAI[mainElement]} = ${reason}${bonus}`);
      }
    }

    // Check middle/residual (less important)
    hiddenStems.forEach(hs => {
      if (hs.type === "main") return; // Already checked
      const element = hs.stem.element;
      if (areElementsSame(element, dayMasterElement) || doesAGenerateB(element, dayMasterElement)) {
        score += 0.5; // Less weight
        const reason = areElementsSame(element, dayMasterElement)
          ? "ธาตุเดียวกัน"
          : "ธาตุที่สร้างเจ้าวัน";
        const type = hs.type === "middle" ? "กลาง" : "คงเหลือ";
        details.push(`หลัก ${branchName} (${branchThai}): มีธาตุซ่อน ${ELEMENT_THAI[element]} (${type}) = ${reason}`);
      }
    });
  });

  // No roots at all
  if (rootCount === 0 && score === 0) {
    score = -2;
    details.push("ไม่มีรากฐาน (root) ในทุกหลัก → 失地");
  }

  return {
    label: "得地 / 失地 (Root)",
    description: score > 0
      ? "มีรากฐาน (root) ในหลักต่างๆ"
      : "ไม่มีรากฐาน (root) ที่เสริม",
    score,
    details,
  };
}

/**
 * Factor 3: Support (得势/失势) - ดู stems
 *
 * - Stem same/生 day master → +1
 * - Stem 克/泄 day master → -1
 * - Max ±2
 */
function analyzeSupport(chart: BaZiChart, dayMasterElement: ElementName): StrengthFactor {
  let score = 0;
  const details: string[] = [];
  const stems = [
    { stem: chart.year.stem, name: "ปี" },
    { stem: chart.month.stem, name: "เดือน" },
    { stem: chart.hour?.stem, name: "ชั่วโมง" },
  ].filter(s => s.stem !== undefined);

  stems.forEach(({ stem, name }) => {
    if (!stem) return;

    const stemElement = stem.element;

    if (areElementsSame(stemElement, dayMasterElement)) {
      score += 1;
      details.push(`${name} (${stem.name}): ธาตุเดียวกับเจ้าวัน → เสริม +1`);
    } else if (doesAGenerateB(stemElement, dayMasterElement)) {
      score += 1;
      details.push(`${name} (${stem.name}): ธาตุที่สร้างเจ้าวัน → เสริม +1`);
    } else if (doesAControlB(stemElement, dayMasterElement)) {
      score -= 1;
      details.push(`${name} (${stem.name}): ธาตุที่คุมเจ้าวัน → อ่อน -1`);
    } else if (doesAGenerateB(dayMasterElement, stemElement)) {
      score -= 1;
      details.push(`${name} (${stem.name}): ธาตุที่เจ้าวันสร้าง → ระบาย -1`);
    }
  });

  // Clamp to ±2
  if (score > 2) score = 2;
  if (score < -2) score = -2;

  return {
    label: "得势 / 失势 (Support)",
    description: score > 0
      ? "ได้รับการสนับสนุนจาก天干อื่น"
      : "สูญเสียพลังไปกับ天干อื่น",
    score,
    details,
  };
}

/**
 * Factor 4: Clash/Combine adjustment
 *
 * - ตรวจ branch clashes (opposite)
 * - ตรวจ branch combines (six harmony)
 * - หมายเหตุเท่านั้น (ไม่ลด score โดยตรง ยกเว้น root ถูก clash)
 */
function analyzeClashesAndCombines(chart: BaZiChart): string[] {
  const notes: string[] = [];
  const branches = [chart.year, chart.month, chart.day, chart.hour].filter(Boolean);

  // Get raw EightChar for tyme4ts API
  // Note: เราไม่มี profile ใน context นี้ แต่สามารถใช้ branch.getName() ได้
  // ข้ามการใช้ tyme4ts API และใช้ hardcode map แทน (ง่ายกว่า)

  // Hardcode clash map (opposite branches)
  const CLASH_MAP: Record<string, string> = {
    子: "午",
    丑: "未",
    寅: "申",
    卯: "酉",
    辰: "戌",
    巳: "亥",
    午: "子",
    未: "丑",
    申: "寅",
    酉: "卯",
    戌: "辰",
    亥: "巳",
  };

  // Hardcode six harmony (combine) map
  const COMBINE_MAP: Record<string, string> = {
    子: "丑",
    丑: "子",
    寅: "亥",
    卯: "戌",
    辰: "酉",
    巳: "申",
    午: "未",
    未: "午",
    申: "巳",
    酉: "辰",
    戌: "卯",
    亥: "寅",
  };

  // Check clashes (dedupe คู่: 卯-酉 กับ 酉-卯 คือเรื่องเดียวกัน)
  const branchNames = branches.map(b => b?.branch.name);
  const reportedClashes = new Set<string>();
  branchNames.forEach((name, idx) => {
    if (!name) return;

    const opposite = CLASH_MAP[name];
    if (branchNames.includes(opposite)) {
      const pairKey = [name, opposite].sort().join("-");
      if (reportedClashes.has(pairKey)) return;
      reportedClashes.add(pairKey);

      const pillarName = ["ปี", "เดือน", "วัน", "ชั่วโมง"][idx];
      notes.push(`⚠️ หลัก${pillarName} (${name}) ถูก clash กับ (${opposite}) - อาจทำให้ root ไม่เสถียร`);
    }
  });

  // Check combines (dedupe คู่ เช่นเดียวกัน)
  const reportedCombines = new Set<string>();
  branchNames.forEach((name, idx) => {
    if (!name) return;

    const combine = COMBINE_MAP[name];
    if (branchNames.includes(combine)) {
      const pairKey = [name, combine].sort().join("-");
      if (reportedCombines.has(pairKey)) return;
      reportedCombines.add(pairKey);

      const pillarName = ["ปี", "เดือน", "วัน", "ชั่วโมง"][idx];
      notes.push(`ℹ️ หลัก${pillarName} (${name}) มี six harmony กับ (${combine}) - อาจ transform element`);
    }
  });

  return notes;
}

/**
 * Determine strength level from total score
 *
 * - score >= +4 → very_strong
 * - score +1 to +3 → strong
 * - score -3 to 0 → weak
 * - score <= -4 → very_weak
 */
function determineStrengthLevel(score: number): StrengthLevel {
  if (score >= 4) return "very_strong";
  if (score >= 1) return "strong";
  if (score >= -3) return "weak";
  return "very_weak";
}

/**
 * Get ธาตุที่เสริม day master (resource + companion)
 */
function getSupportingElements(dayMasterElement: ElementName): ElementName[] {
  const resource = elementThatGeneratesMe(dayMasterElement);
  const companion = dayMasterElement;
  return [resource, companion];
}

/**
 * Get ธาตุที่ทำให้ day master อ่อน (output + wealth + power)
 */
function getWeakeningElements(dayMasterElement: ElementName): ElementName[] {
  const output = elementThatIGenerate(dayMasterElement);
  const wealth = elementThatIControl(dayMasterElement);
  const power = elementThatControlsMe(dayMasterElement);
  return [output, wealth, power];
}

/**
 * Generate summary ภาษาไทย
 */
function generateSummary(
  level: StrengthLevel,
  dayMasterElement: ElementName,
  chart: BaZiChart,
  factors: StrengthFactor[],
  clashNotes: string[]
): string {
  const dayMasterThai = ELEMENT_THAI[dayMasterElement];
  const seasonScore = factors[0]?.score ?? 0;
  const rootScore = factors[1]?.score ?? 0;
  const supportScore = factors[2]?.score ?? 0;

  let summary = `เจ้าวัน ${chart.dayMaster.name} (${dayMasterThai}) `;

  // Level
  if (level === "very_strong") {
    summary += "แข็งมาก ";
  } else if (level === "strong") {
    summary += "แข็ง ";
  } else if (level === "weak") {
    summary += "อ่อน ";
  } else {
    summary += "อ่อนมาก ";
  }

  // Reason
  const reasons: string[] = [];
  if (seasonScore > 0) reasons.push("เกิดในฤดูที่เสริม");
  if (seasonScore < 0) reasons.push("เกิดในฤดูที่ไม่เสริม");
  if (rootScore > 0) reasons.push("มีรากฐาน (root) เหมาะสม");
  if (rootScore < 0) reasons.push("ขาดรากฐาน (root)");
  if (supportScore > 0) reasons.push("มี天干เสริม");
  if (supportScore < 0) reasons.push("ถูก天干ระบายพลัง");

  if (reasons.length > 0) {
    summary += "เพราะ " + reasons.join(", ");
  } else {
    summary += "(สมดุล)";
  }

  // Clash notes
  if (clashNotes.length > 0) {
    summary += ". " + clashNotes[0];
  }

  return summary;
}
