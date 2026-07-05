/**
 * 10 Gods (十神) Calculator - คำนวณ 10 Gods จาก day master + stems
 */

import type { ElementName, YinYang } from "./types";
import type { TenGodName, TenGodInfo, TenGodRelationship } from "../../types/bazi-gods-stars";
import { TEN_GOD_THAI } from "../../types/bazi-gods-stars";
import { getRelationshipType } from "./relationships";

/**
 * คำนวณ 10 God ของ stem หนึ่งเทียบกับ day master
 *
 * @param dayMaster - Day master (element + yinYang)
 * @param other - Stem ที่ต้องการคำนวณ 10 god
 * @returns TenGodName - ชื่อ 10 God (จีน)
 *
 * @example
 * // Day master = 癸阴水
 * // 丙阳火: 水 克 火 = wealth (我克), different polarity → 正财
 * getTenGod({ element: "水", yinYang: "阴" }, { element: "火", yinYang: "阳" }) // "正财"
 *
 * // 癸阴水: same element, same polarity → 比肩
 * getTenGod({ element: "水", yinYang: "阴" }, { element: "水", yinYang: "阴" }) // "比肩"
 */
export function getTenGod(
  dayMaster: { element: ElementName; yinYang: YinYang },
  other: { element: ElementName; yinYang: YinYang }
): TenGodName {
  // 1. หาความสัมพันธ์ธาตุ (resource/companion/output/wealth/power)
  const relationship = getRelationshipType(dayMaster.element, other.element);

  // 2. ตรวจ polarity (same หรือ different)
  const samePolarity = dayMaster.yinYang === other.yinYang;

  // 3. Map ไปยัง 10 God ตามตาราง
  return mapToTenGod(relationship, samePolarity);
}

/**
 * Map ความสัมพันธ์ + polarity → 10 God Name
 *
 * ตาราง:
 * | ความสัมพันธ์ | same polarity | different polarity |
 * |---|---|---|
 * | companion (同我) | 比肩 | 劫财 |
 * | resource (生我) | 偏印 | 正印 |
 * | output (我生) | 食神 | 伤官 |
 * | wealth (我克) | 偏财 | 正财 |
 * | power (克我) | 七杀 | 正官 |
 */
function mapToTenGod(
  relationship: TenGodRelationship,
  samePolarity: boolean
): TenGodName {
  switch (relationship) {
    case "companion":
      return samePolarity ? "比肩" : "劫财";

    case "resource":
      return samePolarity ? "偏印" : "正印";

    case "output":
      return samePolarity ? "食神" : "伤官";

    case "wealth":
      return samePolarity ? "偏财" : "正财";

    case "power":
      return samePolarity ? "七杀" : "正官";
  }
}

/**
 * แปลง TenGodName → TenGodInfo (พร้อม Thai name + element)
 *
 * @param name - ชื่อ 10 God (จีน)
 * @param element - ธาตุของ stem ที่เป็น god นี้
 * @param yinYang - หยิน-หยางของ stem ที่เป็น god นี้
 * @returns TenGodInfo - ข้อมูลครบ
 */
export function toTenGodInfo(
  name: TenGodName,
  element: ElementName,
  yinYang: YinYang
): TenGodInfo {
  // หา relationship จากชื่อ god
  const relationship = getRelationshipFromTenGod(name);

  return {
    name,
    nameTh: TEN_GOD_THAI[name],
    relationship,
    element,
    yinYang,
  };
}

/**
 * หา relationship จากชื่อ 10 God
 */
function getRelationshipFromTenGod(name: TenGodName): TenGodRelationship {
  const companion: TenGodName[] = ["比肩", "劫财"];
  const resource: TenGodName[] = ["偏印", "正印"];
  const output: TenGodName[] = ["食神", "伤官"];
  const wealth: TenGodName[] = ["偏财", "正财"];
  const power: TenGodName[] = ["七杀", "正官"];

  if (companion.includes(name)) return "companion";
  if (resource.includes(name)) return "resource";
  if (output.includes(name)) return "output";
  if (wealth.includes(name)) return "wealth";
  if (power.includes(name)) return "power";

  // Should never reach here (TypeScript ensures exhaustiveness)
  throw new Error(`Unknown TenGodName: ${name}`);
}
