/**
 * BaZi Useful God Calculator (用神 / Yong Shen)
 * วิเคราะห์ธาตุที่เป็นประโยชน์ (用神) ตามตำรามาตรฐาน
 *
 * Algorithm (ตำรา 子平真诠):
 * 1. ตรวจ structure type ก่อน (special > follower > vibrant > normal)
 * 2. แยกตาม strength level (strong/weak) สำหรับ normal structure
 * 3. กำหนด primary useful god + secondary + avoid elements
 *
 * Scope: version พื้นฐานตาม strength + structure (advanced factors เช่น cold/hot/dry/wet ไว้ Phase ถัดไป)
 */

import type { BaZiChart } from "./types";
import type { StrengthAnalysis } from "@/types/bazi-strength";
import type { StructureAnalysis } from "@/types/bazi-structure";
import type {
  UsefulGodAnalysis,
  RelationshipType,
} from "@/types/bazi-useful-god";
import type { ElementName } from "./types";
import {
  getRelationshipType,
  elementThatGeneratesMe,
  elementThatIControl,
  elementThatControlsMe,
  elementThatIGenerate,
  areElementsSame,
} from "./relationships";
import { ELEMENT_THAI } from "./types";

/**
 * วิเคราะห์ธาตุที่เป็นประโยชน์ (用神 / Yong Shen)
 *
 * @param chart - BaZi chart ที่ calculateBaZi() คืนมา
 * @param strength - ผลวิเคราะห์ strength จาก analyzeStrength()
 * @param structure - ผลวิเคราะห์ structure จาก analyzeStructure()
 * @returns UsefulGodAnalysis - ผลวิเคราะห์ useful god ครบทุก field
 */
export function analyzeUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  // ===== 1. ตรวจ structure type ก่อน (priority: special > follower > vibrant > normal) =====
  if (structure.type === "follower") {
    return analyzeFollowerUsefulGod(chart, strength, structure);
  }

  if (structure.type === "vibrant") {
    return analyzeVibrantUsefulGod(chart, strength, structure);
  }

  if (structure.type === "special") {
    return analyzeSpecialUsefulGod(chart, strength, structure);
  }

  // ===== 2. Normal structure (正格) - แยกตาม strength =====
  return analyzeNormalUsefulGod(chart, strength, structure);
}

/**
 * Follower (从格) - day master อ่อนมาก ยอมตามธาตุที่แข็งสุด
 *
 * Logic:
 * - Primary useful = dominant element (ธาตุที่ครอบ chart)
 * - Secondary = element ที่ generate dominant
 * - Avoid = resource ของ day master (ทำให้ day master แข็งขึ้น → ทำลาย follower)
 */
function analyzeFollowerUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  const dayElement = chart.dayMaster.element;
  const dominantElement = structure.dominantElement ?? dayElement;

  // Primary = dominant element
  const primaryElement = dominantElement;
  const primaryRelationship = getRelationshipType(dayElement, primaryElement);

  // Secondary = element ที่ generate dominant
  const secondaryElements = [elementThatGeneratesMe(primaryElement)];

  // Avoid = resource ของ day master (ทำให้ day master แข็งขึ้น → ทำลาย follower)
  const dayMasterResource = elementThatGeneratesMe(dayElement);
  const avoidElements = [dayMasterResource, dayElement]; // resource + companion

  // สรุปภาษาไทย
  const elementThai = ELEMENT_THAI[primaryElement];
  const relationshipThai = RELATIONSHIP_TYPE_THAI[primaryRelationship];
  const label = `ธาตุ${elementThai} (${relationshipThai})`;
  const labelCn = `用神：${primaryElement}（${RELATIONSHIP_TYPE_CN[primaryRelationship]}）`;

  const description = `เจ้าวัน ${ELEMENT_THAI[dayElement]} (${
    chart.dayMaster.name
  }) อ่อนมาก ยอมตามธาตุที่แข็งสุดคือ ธาตุ${elementThai} (${structure.label})`;

  const reasons = [
    `โครงสร้างเป็น ${structure.label} — เจ้าวันอ่อนมาก ยอมตามธาตุที่แข็งสุด`,
    `ธาตุ${elementThai} ครอบ chart (dominant) → เป็น useful god หลัก`,
    `ธาตุ${ELEMENT_THAI[secondaryElements[0]]} (generate ${elementThai}) เป็น喜神รอง`,
    `ห้ามใช้ธาตุ${ELEMENT_THAI[dayMasterResource]} (resource) และ${ELEMENT_THAI[dayElement]} (companion) — ทำให้เจ้าวันแข็งขึ้น → ทำลาย follower`,
  ];

  const applicationTips = generateApplicationTips(primaryElement, secondaryElements, avoidElements);

  return {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    label,
    labelCn,
    description,
    reasons,
    applicationTips,
  };
}

/**
 * Vibrant (专旺格) - day master แข็งมาก ตามแรง
 *
 * Logic:
 * - Primary useful = resource (generate day master)
 * - Secondary = companion (same element)
 * - Avoid = wealth/power/output (ธาตุที่ drain/control day master)
 */
function analyzeVibrantUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  const dayElement = chart.dayMaster.element;

  // Primary = resource (生我)
  const primaryElement = elementThatGeneratesMe(dayElement);
  const primaryRelationship: RelationshipType = "resource";

  // Secondary = companion (同我)
  const secondaryElements = [dayElement];

  // Avoid = wealth + power + output (ทั้งหมดเป็นธาตุที่ drain/control day master)
  const avoidElements = [
    elementThatIControl(dayElement), // wealth
    elementThatControlsMe(dayElement), // power
    elementThatIGenerate(dayElement), // output
  ];

  // สรุปภาษาไทย
  const elementThai = ELEMENT_THAI[primaryElement];
  const label = `ธาตุ${elementThai} (${RELATIONSHIP_TYPE_THAI[primaryRelationship]})`;
  const labelCn = `用神：${primaryElement}（${RELATIONSHIP_TYPE_CN[primaryRelationship]}）`;

  const description = `เจ้าวัน ${ELEMENT_THAI[dayElement]} (${
    chart.dayMaster.name
  }) แข็งมาก (${structure.label}) → ต้องการ resource (แหล่งพลัง) เพื่อค้ำยัน`;

  const reasons = [
    `โครงสร้างเป็น ${structure.label} — เจ้าวันแข็งมาก ตามแรง`,
    `ธาตุ${elementThai} (resource) สร้างพลังให้เจ้าวัน → เป็น useful god หลัก`,
    `ธาตุ${ELEMENT_THAI[dayElement]} (companion) เสริมกำลัง → เป็น喜神รอง`,
    `ห้ามใช้ ${avoidElements.map((e) => ELEMENT_THAI[e]).join("、")} (wealth/power/output) — ทำให้เจ้าวันอ่อนลง`,
  ];

  const applicationTips = generateApplicationTips(primaryElement, secondaryElements, avoidElements);

  return {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    label,
    labelCn,
    description,
    reasons,
    applicationTips,
  };
}

/**
 * Special (特殊格局) - โครงสร้างพิเศษ เช่น Two-Element Harmony / Pure Element
 *
 * Logic:
 * - Primary useful = dominant element (ธาตุที่ครอบ chart)
 * - Secondary = element ที่ generate dominant
 * - Avoid = element ที่ control dominant
 */
function analyzeSpecialUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  const dominantElement = structure.dominantElement ?? chart.dayMaster.element;

  // Primary = dominant element
  const primaryElement = dominantElement;
  const primaryRelationship = getRelationshipType(chart.dayMaster.element, primaryElement);

  // Secondary = element ที่ generate dominant
  const secondaryElements = [elementThatGeneratesMe(primaryElement)];

  // Avoid = element ที่ control dominant
  const avoidElements = [elementThatControlsMe(primaryElement)];

  // สรุปภาษาไทย
  const elementThai = ELEMENT_THAI[primaryElement];
  const relationshipThai = RELATIONSHIP_TYPE_THAI[primaryRelationship];
  const label = `ธาตุ${elementThai} (${relationshipThai})`;
  const labelCn = `用神：${primaryElement}（${RELATIONSHIP_TYPE_CN[primaryRelationship]}）`;

  const description = `โครงสร้างพิเศษ ${structure.label} — ธาตุ${elementThai} ครอบ chart → เป็น useful god หลัก`;

  const reasons = [
    `โครงสร้างเป็น ${structure.label} — chart มีธาตุเด่นชัด`,
    `ธาตุ${elementThai} (dominant) เป็นหัวใจของ chart → เป็น useful god หลัก`,
    `ธาตุ${ELEMENT_THAI[secondaryElements[0]]} (generate ${elementThai}) เป็น喜神รอง`,
    `หลีกเลี่ยง ${avoidElements.map((e) => ELEMENT_THAI[e]).join("、")} (element ที่ control ${elementThai})`,
  ];

  const applicationTips = generateApplicationTips(primaryElement, secondaryElements, avoidElements);

  return {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    label,
    labelCn,
    description,
    reasons,
    applicationTips,
  };
}

/**
 * Normal (正格) - โครงสร้างปกติ ~80% แยกตาม strength
 *
 * Logic:
 * - Strong/Very Strong → ต้องการ weaken: wealth (priority) > power > output
 * - Weak/Very Weak → ต้องการ strengthen: resource (priority) > companion
 */
function analyzeNormalUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  // ===== Strong/Very Strong → ต้องการ weaken =====
  if (strength.level === "strong" || strength.level === "very_strong") {
    return analyzeStrongNormalUsefulGod(chart, strength, structure);
  }

  // ===== Weak/Very Weak → ต้องการ strengthen =====
  return analyzeWeakNormalUsefulGod(chart, strength, structure);
}

/**
 * Normal + Strong (正格 + 强) - ต้องการ weaken day master
 *
 * Logic:
 * - Primary = wealth (priority) — 我克
 * - Secondary = power — 克我
 * - Avoid = resource + companion
 */
function analyzeStrongNormalUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  const dayElement = chart.dayMaster.element;

  // Primary = wealth (我克) - priority #1
  const primaryElement = elementThatIControl(dayElement);
  const primaryRelationship: RelationshipType = "wealth";

  // Secondary = power (克我)
  const secondaryElements = [elementThatControlsMe(dayElement)];

  // Avoid = resource + companion
  const avoidElements = [elementThatGeneratesMe(dayElement), dayElement];

  // สรุปภาษาไทย
  const elementThai = ELEMENT_THAI[primaryElement];
  const label = `ธาตุ${elementThai} (${RELATIONSHIP_TYPE_THAI[primaryRelationship]})`;
  const labelCn = `用神：${primaryElement}（${RELATIONSHIP_TYPE_CN[primaryRelationship]}）`;

  const description = `เจ้าวัน ${ELEMENT_THAI[dayElement]} (${
    chart.dayMaster.name
  }) ${strength.level === "very_strong" ? "แข็งมาก" : "แข็ง"} (${structure.label}) → ต้องการ weaken: ธาตุ${elementThai} (wealth) เพื่อใช้พลัง`;

  const reasons = [
    `เจ้าวัน${strength.level === "very_strong" ? "แข็งมาก" : "แข็ง"} (strength score: ${strength.score})`,
    `ธาตุ${elementThai} (wealth 我克) ใช้พลังเจ้าวัน → เป็น useful god หลัก (priority #1)`,
    `ธาตุ${ELEMENT_THAI[secondaryElements[0]]} (power 克我) ช่วยคุมเจ้าวัน → เป็น喜神รอง`,
    `หลีกเลี่ยง ${avoidElements.map((e) => ELEMENT_THAI[e]).join("、")} (resource+companion) — ทำให้เจ้าวันแข็งขึ้นเกินไป`,
  ];

  const applicationTips = generateApplicationTips(primaryElement, secondaryElements, avoidElements);

  return {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    label,
    labelCn,
    description,
    reasons,
    applicationTips,
  };
}

/**
 * Normal + Weak (正格 + 弱) - ต้องการ strengthen day master
 *
 * Logic:
 * - Primary = resource (priority) — 生我
 * - Secondary = companion — 同我
 * - Avoid = wealth + power + output
 */
function analyzeWeakNormalUsefulGod(
  chart: BaZiChart,
  strength: StrengthAnalysis,
  structure: StructureAnalysis
): UsefulGodAnalysis {
  const dayElement = chart.dayMaster.element;

  // Primary = resource (生我) - priority #1
  const primaryElement = elementThatGeneratesMe(dayElement);
  const primaryRelationship: RelationshipType = "resource";

  // Secondary = companion (同我)
  const secondaryElements = [dayElement];

  // Avoid = wealth + power + output (ทั้งหมด drain day master)
  const avoidElements = [
    elementThatIControl(dayElement), // wealth
    elementThatControlsMe(dayElement), // power
    elementThatIGenerate(dayElement), // output
  ];

  // สรุปภาษาไทย
  const elementThai = ELEMENT_THAI[primaryElement];
  const label = `ธาตุ${elementThai} (${RELATIONSHIP_TYPE_THAI[primaryRelationship]})`;
  const labelCn = `用神：${primaryElement}（${RELATIONSHIP_TYPE_CN[primaryRelationship]}）`;

  const description = `เจ้าวัน ${ELEMENT_THAI[dayElement]} (${
    chart.dayMaster.name
  }) ${strength.level === "very_weak" ? "อ่อนมาก" : "อ่อน"} (${structure.label}) → ต้องการ strengthen: ธาตุ${elementThai} (resource) เพื่อค้ำยัน`;

  const reasons = [
    `เจ้าวัน${strength.level === "very_weak" ? "อ่อนมาก" : "อ่อน"} (strength score: ${strength.score})`,
    `ธาตุ${elementThai} (resource 生我) สร้างพลังให้เจ้าวัน → เป็น useful god หลัก (priority #1)`,
    `ธาตุ${ELEMENT_THAI[dayElement]} (companion 同我) เสริมกำลัง → เป็น喜神รอง`,
    `หลีกเลี่ยง ${avoidElements.map((e) => ELEMENT_THAI[e]).join("、")} (wealth+power+output) — ทำให้เจ้าวันอ่อนลง`,
  ];

  const applicationTips = generateApplicationTips(primaryElement, secondaryElements, avoidElements);

  return {
    primaryElement,
    primaryRelationship,
    secondaryElements,
    avoidElements,
    label,
    labelCn,
    description,
    reasons,
    applicationTips,
  };
}

/**
 * Generate application tips (สี/ทิศ/อาชีพ) จากธาตุ
 */
function generateApplicationTips(
  primaryElement: ElementName,
  secondaryElements: ElementName[],
  avoidElements: ElementName[]
): string {
  const tips: string[] = [];

  // เพิ่ม tips สำหรับ primary element
  const primaryTips = getElementTips(primaryElement);
  tips.push(primaryTips);

  // เพิ่ม tips สำหรับ secondary elements (ถ้าไม่ซ้ำ)
  for (const secondary of secondaryElements) {
    if (!areElementsSame(secondary, primaryElement)) {
      const secondaryTips = getElementTips(secondary);
      tips.push(secondaryTips);
    }
  }

  // คำแนะนำหลีกเลี่ยง
  if (avoidElements.length > 0) {
    const avoidThai = avoidElements.map((e) => ELEMENT_THAI[e]).join("、");
    tips.push(`หลีกเลี่ยง: ${avoidThai}`);
  }

  return tips.join(" | ");
}

/**
 * Map ธาตุ → tips (สี/ทิศ/อาชีพ)
 */
function getElementTips(element: ElementName): string {
  const tips: Record<ElementName, string> = {
    木: "สีเขียว/น้ำตาล | ทิศตะวันออก | อาชีพ: เกษตร, ไม้, การศึกษา, พิมพ์",
    火: "สีแดง/ม่วง/ชมพู | ทิศใต้ | อาชีพ: พลังงาน, เทคโนโลยี, อิเล็กทรอนิกส์, หุ้น",
    土: "สีเหลือง/น้ำตาล/ส้ม | ทิศกลาง/ตะวันออกเฉียงใต้-ตะวันตกเฉียงใต้ | อาชีพ: อสังหาฯ, ก่อสร้าง, โลจิสติกส์, บริการ",
    金: "สีขาว/ทอง/เงิน/เทา | ทิศตะวันตก | อาชีพ: การเงิน, ธนาคาร, กฎหมาย, วิศวกรรม",
    水: "สีดำ/น้ำเงิน/กรมท่า/เทาเข้ม | ทิศเหนือ | อาชีพ: สื่อสาร, การตลาด, ขนส่ง, ท่องเที่ยว, บันเทิง",
  };

  return tips[element];
}

/**
 * Map Relationship Type → ภาษาไทย (十神)
 */
const RELATIONSHIP_TYPE_THAI: Record<RelationshipType, string> = {
  resource: "印 (แหล่งพลังงาน)",
  companion: "比 (เพื่อนร่วมธาตุ)",
  output: "食伤 (การแสดงออก)",
  wealth: "财 (ทรัพย์สิน)",
  power: "官杀 (อำนาจ)",
};

/**
 * Map Relationship Type → ภาษาจีน (十神)
 */
const RELATIONSHIP_TYPE_CN: Record<RelationshipType, string> = {
  resource: "印",
  companion: "比",
  output: "食伤",
  wealth: "财",
  power: "官杀",
};
