/**
 * Element & Relationship helpers - วงจรธาตุและความสัมพันธ์
 * ใช้สำหรับคำนวณ 10 Gods (十神) และ Strength analysis
 */

import type { ElementName } from "./types";

/**
 * Map ธาตุ → ธาตุที่ generate มัน (生我 - Resource/印)
 *
 * วงจร生成: 木→火→土→金→水→木
 * - แม่ของ Wood = Water
 * - แม่ของ Fire = Wood
 * - แม่ของ Earth = Fire
 * - แม่ของ Metal = Earth
 * - แม่ของ Water = Metal
 */
const MOTHER_MAP: Record<ElementName, ElementName> = {
  木: "水", // Water generates Wood
  火: "木", // Wood generates Fire
  土: "火", // Fire generates Earth
  金: "土", // Earth generates Metal
  水: "金", // Metal generates Water
};

/**
 * Map ธาตุ → ธาตุที่มัน generate (我生 - Output/食伤)
 *
 * วงจร生成: 木→火→土→金→水→木
 * - ลูกของ Wood = Fire
 * - ลูกของ Fire = Earth
 * - ลูกของ Earth = Metal
 * - ลูกของ Metal = Water
 * - ลูกของ Water = Wood
 */
const CHILD_MAP: Record<ElementName, ElementName> = {
  木: "火", // Wood generates Fire
  火: "土", // Fire generates Earth
  土: "金", // Earth generates Metal
  金: "水", // Metal generates Water
  水: "木", // Water generates Wood
};

/**
 * Map ธาตุ → ธาตุที่ control มัน (克我 - Power/官杀)
 *
 * วงจร控制: 木→土, 土→水, 水→火, 火→金, 金→木
 * - คน control Wood = Metal
 * - คน control Fire = Water
 * - คน control Earth = Wood
 * - คน control Metal = Fire
 * - คน control Water = Earth
 */
const CONTROLLER_MAP: Record<ElementName, ElementName> = {
  木: "金", // Metal controls Wood
  火: "水", // Water controls Fire
  土: "木", // Wood controls Earth
  金: "火", // Fire controls Metal
  水: "土", // Earth controls Water
};

/**
 * Map ธาตุ → ธาตุที่มัน control (我克 - Wealth/财)
 *
 * วงจร控制: 木→土, 土→水, 水→火, 火→金, 金→木
 * - Wood controls Earth
 * - Fire controls Metal
 * - Earth controls Water
 * - Metal controls Wood
 * - Water controls Fire
 */
const CONTROLLED_MAP: Record<ElementName, ElementName> = {
  木: "土", // Wood controls Earth
  火: "金", // Fire controls Metal
  土: "水", // Earth controls Water
  金: "木", // Metal controls Wood
  水: "火", // Water controls Fire
};

/**
 * หาธาตุที่ generate ธาตุที่กำหนด (生我 - Resource/印)
 *
 * @param element - ธาตุที่ต้องการหาแม่
 * @returns ธาตุที่เป็นแม่ (generate มัน)
 *
 * @example
 * elementThatGeneratesMe("木") // "水" (Water generates Wood)
 * elementThatGeneratesMe("火") // "木" (Wood generates Fire)
 */
export function elementThatGeneratesMe(element: ElementName): ElementName {
  return MOTHER_MAP[element];
}

/**
 * หาธาตุที่ธาตุที่กำหนด generate (我生 - Output/食伤)
 *
 * @param element - ธาตุที่ต้องการหาลูก
 * @returns ธาตุที่เป็นลูก (มัน generate)
 *
 * @example
 * elementThatIGenerate("木") // "火" (Wood generates Fire)
 * elementThatIGenerate("火") // "土" (Fire generates Earth)
 */
export function elementThatIGenerate(element: ElementName): ElementName {
  return CHILD_MAP[element];
}

/**
 * หาธาตุที่ control ธาตุที่กำหนด (克我 - Power/官杀)
 *
 * @param element - ธาตุที่ต้องการหาคน control
 * @returns ธาตุที่ control มัน
 *
 * @example
 * elementThatControlsMe("木") // "金" (Metal controls Wood)
 * elementThatControlsMe("火") // "水" (Water controls Fire)
 */
export function elementThatControlsMe(element: ElementName): ElementName {
  return CONTROLLER_MAP[element];
}

/**
 * หาธาตุที่ธาตุที่กำหนด control (我克 - Wealth/财)
 *
 * @param element - ธาตุที่ต้องการหาเป้าหมายที่ control
 * @returns ธาตุที่มัน control
 *
 * @example
 * elementThatIControl("木") // "土" (Wood controls Earth)
 * elementThatIControl("火") // "金" (Fire controls Metal)
 */
export function elementThatIControl(element: ElementName): ElementName {
  return CONTROLLED_MAP[element];
}

/**
 * ตรวจสอบว่าธาตุ A generate ธาตุ B หรือไม่ (生)
 *
 * @param a - ธาตุตัวตั้ง (แม่)
 * @param b - ธาตุตัวเป้าหมาย (ลูก)
 * @returns true ถ้า A 生 B
 *
 * @example
 * doesAGenerateB("木", "火") // true (Wood generates Fire)
 * doesAGenerateB("水", "木") // true (Water generates Wood)
 */
export function doesAGenerateB(a: ElementName, b: ElementName): boolean {
  return CHILD_MAP[a] === b;
}

/**
 * ตรวจสอบว่าธาตุ A control ธาตุ B หรือไม่ (克)
 *
 * @param a - ธาตุตัวตั้ง (ผู้คุม)
 * @param b - ธาตุตัวเป้าหมาย (ผู้ถูกคุม)
 * @returns true ถ้า A 克 B
 *
 * @example
 * doesAControlB("木", "土") // true (Wood controls Earth)
 * doesAControlB("金", "木") // true (Metal controls Wood)
 */
export function doesAControlB(a: ElementName, b: ElementName): boolean {
  return CONTROLLED_MAP[a] === b;
}

/**
 * ตรวจสอบว่าธาตุ A และ B เป็นธาตุเดียวกันหรือไม่ (同我 - Companion/比劫)
 *
 * @param a - ธาตุตัวแรก
 * @param b - ธาตุตัวสอง
 * @returns true ถ้าเป็นธาตุเดียวกัน
 *
 * @example
 * areElementsSame("木", "木") // true
 * areElementsSame("木", "火") // false
 */
export function areElementsSame(a: ElementName, b: ElementName): boolean {
  return a === b;
}

/**
 * หาความสัมพันธ์ระหว่าง day master กับ element ที่กำหนด (10 Gods)
 *
 * @param dayMasterElement - ธาตุของ Day Master
 * @param element - ธาตุที่ต้องการตรวจสอบความสัมพันธ์
 * @returns ประเภทความสัมพันธ์ (resource/companion/output/wealth/power)
 *
 * @example
 * getRelationshipType("木", "水") // "resource" (Water generates Wood - 印)
 * getRelationshipType("木", "木") // "companion" (Same element - 比)
 * getRelationshipType("木", "火") // "output" (Wood generates Fire - 食伤)
 * getRelationshipType("木", "土") // "wealth" (Wood controls Earth - 财)
 * getRelationshipType("木", "金") // "power" (Metal controls Wood - 官杀)
 */
export function getRelationshipType(
  dayMasterElement: ElementName,
  element: ElementName
): "resource" | "companion" | "output" | "wealth" | "power" {
  // Same element (同我 - Companion/比劫)
  if (areElementsSame(dayMasterElement, element)) {
    return "companion";
  }

  // 生我 (Resource/印)
  if (doesAGenerateB(element, dayMasterElement)) {
    return "resource";
  }

  // 我生 (Output/食伤)
  if (doesAGenerateB(dayMasterElement, element)) {
    return "output";
  }

  // 我克 (Wealth/财)
  if (doesAControlB(dayMasterElement, element)) {
    return "wealth";
  }

  // 克我 (Power/官杀)
  // (กรณีที่เหลือ ต้องเป็น element ที่ control day master)
  return "power";
}
