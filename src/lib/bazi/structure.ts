/**
 * BaZi Structure Analysis (格局)
 * วิเคราะห์โครงสร้างของ BaZi Chart ตามตำรามาตรฐาน
 *
 * Algorithm: ตรวจพิเศษก่อน ปกติทีหลัง
 * 1. Special (Two-Element Harmony / Pure)
 * 2. Follower (从格) - เงื่อนไขเข้มงวด
 * 3. Vibrant (专旺格) - day master แข็งมาก
 * 4. Normal (正格) - fallback
 */

import type { BaZiChart } from "./types";
import type { StrengthAnalysis } from "@/types/bazi-strength";
import type {
  StructureAnalysis,
  FollowerSubType,
  SpecialSubType,
} from "@/types/bazi-structure";
import type { ElementName } from "./types";
import {
  ELEMENT_THAI,
  ELEMENT_EN,
} from "./types";
import {
  getRelationshipType,
  elementThatGeneratesMe,
  areElementsSame,
} from "./relationships";

/**
 * นับธาตุทั้งหมดใน chart (stems + branches + hidden stems)
 *
 * @param chart - BaZi chart
 * @returns Record<ElementName, number> - จำนวนแต่ละธาตุ
 */
function countElements(chart: BaZiChart): Record<ElementName, number> {
  const counts: Record<ElementName, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  // นับ stems (4 stems)
  const pillars = [chart.year, chart.month, chart.day];
  if (chart.hour) pillars.push(chart.hour);

  for (const pillar of pillars) {
    counts[pillar.stem.element] += 1.0; // main stem weight = 1.0
    counts[pillar.branch.element] += 1.0; // branch main element = 1.0

    // นับ hidden stems
    for (const hidden of pillar.branch.hiddenStems) {
      if (hidden.type === "main") {
        counts[hidden.stem.element] += 1.0; // main hidden = 1.0
      } else if (hidden.type === "middle") {
        counts[hidden.stem.element] += 0.5; // middle hidden = 0.5
      } else {
        counts[hidden.stem.element] += 0.3; // residual hidden = 0.3
      }
    }
  }

  return counts;
}

/**
 * ตรวจว่า day master มี root ใน day branch หรือไม่
 *
 * Root คือ hidden stem ที่เป็น same element หรือ resource element
 *
 * @param chart - BaZi chart
 * @param dayMasterElement - ธาตุของ day master
 * @returns true ถ้ามี root (same หรือ resource ใน day branch hidden stems)
 */
function hasRootInDayBranch(
  chart: BaZiChart,
  dayMasterElement: ElementName
): boolean {
  const resourceElement = elementThatGeneratesMe(dayMasterElement);

  for (const hidden of chart.day.branch.hiddenStems) {
    if (
      hidden.type === "main" &&
      (areElementsSame(hidden.stem.element, dayMasterElement) ||
        areElementsSame(hidden.stem.element, resourceElement))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * ตรวจว่ามี resource element เด่นใน chart หรือไม่
 *
 * Resource element "เด่น" ถ้ามีอย่างน้อย 1 ตัวใน stems หรือ main hidden stems
 *
 * @param counts - ผล from countElements()
 * @param dayMasterElement - ธาตุของ day master
 * @returns true ถ้ามี resource element เด่น
 */
function hasDominantResourceElement(
  counts: Record<ElementName, number>,
  dayMasterElement: ElementName
): boolean {
  const resourceElement = elementThatGeneratesMe(dayMasterElement);
  return counts[resourceElement] >= 1.0;
}

/**
 * หา dominant element ใน chart (ที่ไม่ใช่ day master)
 *
 * @param counts - ผล from countElements()
 * @param dayMasterElement - ธาตุของ day master
 * @returns ElementName | null - ธาตุที่ครอง chart ถ้าไม่มีชัดเจน
 */
function findDominantElement(
  counts: Record<ElementName, number>,
  dayMasterElement: ElementName
): ElementName | null {
  let maxCount = 0;
  let dominant: ElementName | null = null;

  for (const element of (Object.keys(counts) as ElementName[])) {
    if (areElementsSame(element, dayMasterElement)) continue; // skip day master

    if (counts[element] > maxCount) {
      maxCount = counts[element];
      dominant = element;
    }
  }

  // dominant ต้องมีอย่างน้อย 2 จำนวน (รวม hidden stems)
  if (dominant && maxCount >= 2.0) {
    return dominant;
  }

  return null;
}

/**
 * ตรวจ Special Structure (特殊格局)
 *
 * - Pure Element: ธาตุเดียว >90% ของ chart
 * - Two-Element Harmony: 2 ธาตุรวมกัน >90% ของ chart
 *
 * @param counts - ผล from countElements()
 * @returns StructureAnalysis | null - null ถ้าไม่ใช่ special
 */
function analyzeSpecialStructure(
  counts: Record<ElementName, number>
): StructureAnalysis | null {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  // ตรวจ Pure Element (ธาตุเดียว >90%)
  for (const element of (Object.keys(counts) as ElementName[])) {
    const percentage = counts[element] / total;
    if (percentage > 0.9) {
      return {
        type: "special",
        subtype: "pure_element" as SpecialSubType,
        label: `特殊格局 - ธาตุเดียวบริสุทธิ์ (${ELEMENT_THAI[element]})`,
        labelCn: "纯粹",
        description: `Chart มีธาตุ${ELEMENT_THAI[element]} (${ELEMENT_EN[element]}) เต็มไปด้วย (${(percentage * 100).toFixed(1)}%) เป็นโครงสร้างพิเศษที่หายาก`,
        dominantElement: element,
        reasons: [
          `ธาตุ${ELEMENT_THAI[element]} มี ${(percentage * 100).toFixed(1)}% ของทั้ง chart`,
          `ธาตุอื่นๆ มีน้อยมาก (${((1 - percentage) * 100).toFixed(1)}% รวมกัน)`,
          "เป็นโครงสร้าง Pure Element ตามตำรา",
        ],
        implications: `ชีวิตเป็นเอกฉันท์ มีความสามารถเฉพาะด้านที่เกี่ยวกับธาตุ${ELEMENT_THAI[element]} เป็นอย่างมาก`,
      };
    }
  }

  // ตรวจ Two-Element Harmony (2 ธาตุรวม >90%)
  const sortedElements = (Object.keys(counts) as ElementName[]).sort(
    (a, b) => counts[b] - counts[a]
  );

  const top2Sum = counts[sortedElements[0]] + counts[sortedElements[1]];
  const top2Percentage = top2Sum / total;

  if (top2Percentage > 0.9) {
    const elem1 = sortedElements[0];
    const elem2 = sortedElements[1];

    return {
      type: "special",
      subtype: "two_element_harmony" as SpecialSubType,
      label: `特殊格局 - สองธาตุสัมพันธ์ (${ELEMENT_THAI[elem1]} + ${ELEMENT_THAI[elem2]})`,
      labelCn: "两神成象",
      description: `Chart มีแค่ 2 ธาตุหลัก: ${ELEMENT_THAI[elem1]} (${ELEMENT_EN[elem1]}) และ ${ELEMENT_THAI[elem2]} (${ELEMENT_EN[elem2]}) รวมกัน ${(top2Percentage * 100).toFixed(1)}% เป็นโครงสร้างพิเศษ`,
      dominantElement: elem1,
      reasons: [
        `ธาตุ${ELEMENT_THAI[elem1]} และ ${ELEMENT_THAI[elem2]} รวมกัน ${(top2Percentage * 100).toFixed(1)}% ของ chart`,
        `ธาตุอื่นๆ มีน้อยมาก (${((1 - top2Percentage) * 100).toFixed(1)}% รวมกัน)`,
        "เป็นโครงสร้าง Two-Element Harmony ตามตำรา",
      ],
      implications: `ชีวิตมีความสัมพันธ์พิเศษระหว่างธาตุ${ELEMENT_THAI[elem1]}และ${ELEMENT_THAI[elem2]} มักมีความสามารถในด้านที่เกี่ยวข้องกับทั้งสองธาตุ`,
    };
  }

  return null;
}

/**
 * ตรวจ Follower Structure (从格)
 *
 * เงื่อนไขเข้มงวด:
 * - strength.level === "very_weak"
 * - ไม่มี root (hidden stem same/resource ใน day branch)
 * - ไม่มี resource element เด่นใน chart
 *
 * @param chart - BaZi chart
 * @param strength - ผล from analyzeStrength()
 * @param counts - ผล from countElements()
 * @returns StructureAnalysis | null - null ถ้าไม่ใช่ follower
 */
function analyzeFollowerStructure(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  counts: Record<ElementName, number>
): StructureAnalysis | null {
  // เงื่อนไข 1: ต้อง very_weak
  if (strength.level !== "very_weak") {
    return null;
  }

  const dayMasterElement = chart.dayMaster.element;

  // เงื่อนไข 2: ต้องไม่มี root
  if (hasRootInDayBranch(chart, dayMasterElement)) {
    return null;
  }

  // เงื่อนไข 3: ต้องไม่มี resource element เด่น
  if (hasDominantResourceElement(counts, dayMasterElement)) {
    return null;
  }

  // หา dominant element
  const dominantElement = findDominantElement(counts, dayMasterElement);

  if (!dominantElement) {
    return null; // ไม่มี dominant element → ไม่ใช่ follower
  }

  // หา subtype จาก dominant element
  const relationship = getRelationshipType(dayMasterElement, dominantElement);
  let subtype: FollowerSubType = null;
  let label = "";
  let labelCn = "";
  let description = "";

  switch (relationship) {
    case "wealth":
      subtype = "follow_wealth";
      label = `从格 - ตามทรัพย์สิน (从财)`;
      labelCn = "从财格";
      description = `Day master อ่อนมากและไม่มี root/support ยอมตามธาตุ Wealth (ทรัพย์สิน - ${ELEMENT_THAI[dominantElement]})`;
      break;
    case "power":
      subtype = "follow_power";
      label = `从格 - ตามอำนาจ (从杀)`;
      labelCn = "从杀格";
      description = `Day master อ่อนมากและไม่มี root/support ยอมตามธาตุ Power (อำนาจ - ${ELEMENT_THAI[dominantElement]})`;
      break;
    case "output":
      subtype = "follow_output";
      label = `从格 - ตามการแสดงออก (从儿)`;
      labelCn = "从儿格";
      description = `Day master อ่อนมากและไม่มี root/support ยอมตามธาตุ Output (การแสดงออก - ${ELEMENT_THAI[dominantElement]})`;
      break;
    case "companion":
      subtype = "follow_companion";
      label = `从格 - ตามเพื่อนร่วมธาตุ (从旺)`;
      labelCn = "从旺格";
      description = `Day master อ่อนมากและไม่มี root/support ยอมตามธาตุ Companion (เพื่อนร่วมธาตุ - ${ELEMENT_THAI[dominantElement]})`;
      break;
    default:
      // ไม่ควรเกิด (resource ถูก filter ไปแล้ว)
      return null;
  }

  return {
    type: "follower",
    subtype,
    label,
    labelCn,
    description,
    dominantElement,
    reasons: [
      `Day master อ่อนมาก (${strength.summary})`,
      "ไม่มี root ใน day branch (ไม่มี hidden stem same/resource)",
      "ไม่มี resource element เด่นใน chart",
      `ธาตุ${ELEMENT_THAI[dominantElement]} (${ELEMENT_EN[dominantElement]}) ครอบ chart เป็นธาตุที่แข็งที่สุด`,
    ],
    implications: `ชีวิตต้อง "ยอมตาม" ธาตุ${ELEMENT_THAI[dominantElement]} คือต้องเน้นหาความสำเร็จในด้านที่เกี่ยวข้องกับ${ELEMENT_THAI[dominantElement]} มากกว่าจะต่อสู้กับมัน`,
  };
}

/**
 * ตรวจ Vibrant Structure (专旺格/旺格)
 *
 * เงื่อนไข:
 * - strength.level === "very_strong"
 * - chart เต็มไปด้วย same/companion + resource element (>80%)
 *
 * @param chart - BaZi chart
 * @param strength - ผล from analyzeStrength()
 * @param counts - ผล from countElements()
 * @returns StructureAnalysis | null - null ถ้าไม่ใช่ vibrant
 */
function analyzeVibrantStructure(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  counts: Record<ElementName, number>
): StructureAnalysis | null {
  // เงื่อนไข 1: ต้อง very_strong
  if (strength.level !== "very_strong") {
    return null;
  }

  const dayMasterElement = chart.dayMaster.element;
  const resourceElement = elementThatGeneratesMe(dayMasterElement);

  // นับ same + resource elements
  const sameCount = counts[dayMasterElement];
  const resourceCount = counts[resourceElement];
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const sameResourcePercentage = (sameCount + resourceCount) / total;

  // เงื่อนไข 2: same + resource > 80%
  if (sameResourcePercentage <= 0.8) {
    return null;
  }

  return {
    type: "vibrant",
    subtype: null,
    label: `专旺格/旺格 - ธาตุ${ELEMENT_THAI[dayMasterElement]}แข็งมาก`,
    labelCn: "专旺格",
    description: `Day master แข็งมาก (${strength.summary}) และ chart เต็มไปด้วยธาตุเดียวกัน (${ELEMENT_THAI[dayMasterElement]}) และ resource (${ELEMENT_THAI[resourceElement]}) รวม ${(sameResourcePercentage * 100).toFixed(1)}%`,
    dominantElement: dayMasterElement,
    reasons: [
      `Day master แข็งมาก (${strength.summary})`,
      `ธาตุ${ELEMENT_THAI[dayMasterElement]} (same) + ${ELEMENT_THAI[resourceElement]} (resource) รวม ${(sameResourcePercentage * 100).toFixed(1)}% ของ chart`,
      "ไม่สามารถควบคุมได้ → follow the strength",
    ],
    implications: `ชีวิตมีพลังมาก ไม่ต้องพึ่งพาคนอื่น มักเป็นผู้นำหรือมีอำนาจในด้านที่เกี่ยวข้องกับธาตุ${ELEMENT_THAI[dayMasterElement]}`,
  };
}

/**
 * วิเคราะห์โครงสร้าง (格局) ของ BaZi Chart
 *
 * Algorithm: ตรวจพิเศษก่อน ปกติทีหลัง
 * 1. Special (Two-Element Harmony / Pure)
 * 2. Follower (从格) - เงื่อนไขเข้มงวด
 * 3. Vibrant (专旺格) - day master แข็งมาก
 * 4. Normal (正格) - fallback
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @param strength - ผล from analyzeStrength()
 * @returns StructureAnalysis - ผลวิเคราะห์โครงสร้าง
 */
export function analyzeStructure(
  chart: BaZiChart,
  strength: StrengthAnalysis
): StructureAnalysis {
  // Step 1: นับ element composition
  const counts = countElements(chart);

  // Step 2: ตรวจ Special (Two-Element Harmony / Pure)
  const specialResult = analyzeSpecialStructure(counts);
  if (specialResult) {
    return specialResult;
  }

  // Step 3: ตรวจ Follower (从格) - เงื่อนไขเข้มงวด
  const followerResult = analyzeFollowerStructure(chart, strength, counts);
  if (followerResult) {
    return followerResult;
  }

  // Step 4: ตรวจ Vibrant (专旺格)
  const vibrantResult = analyzeVibrantStructure(chart, strength, counts);
  if (vibrantResult) {
    return vibrantResult;
  }

  // Step 5: fallback Normal (正格)
  return {
    type: "normal",
    subtype: null,
    label: "格局ปกติ (正格)",
    labelCn: "正格",
    description: `Chart เป็นแบบปกติ (${strength.summary}) มีทั้ง support และ control สมดุลพอสมควร`,
    dominantElement: null,
    reasons: [
      `Day master ${strength.summary}`,
      "มีทั้งธาตุที่เสริมและธาตุที่ควบคุม",
      "ไม่เข้าเงื่อนไขโครงสร้างพิเศษ (Follower/Vibrant/Special)",
      "ใช้ Useful God ตาม strength (strong → need wealth/power/output; weak → need resource/companion)",
    ],
    implications: `ชีวิตสมดุลพอสมควร ต้องหา Useful God (ธาตุที่เป็นประโยชน์) ตามความแข็ง/อ่อนของ Day Master เพื่อเสริมชีวิตให้ดีขึ้น`,
  };
}
