/**
 * BaZi Structure Analysis Types (格局)
 * ประเภทข้อมูลสำหรับวิเคราะห์โครงสร้างของ BaZi Chart
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * ประเภทโครงสร้างหลัก 4 ประเภท
 * - normal: ปกติ (正格) - ส่วนใหญ่ ~80%
 * - vibrant: 专旺格/旺格 - day master แข็งมาก ตามแรง
 * - follower: 从格 - day master อ่อนมาก ยอมตามธาตุที่แข็งสุด
 * - special: 特殊格局 - โครงสร้างพิเศษ
 */
export type StructureType = "normal" | "vibrant" | "follower" | "special";

/**
 * ประเภทย่อยของ Follower (从格)
 * - follow_wealth: 从财 - ตามธาตุ wealth (ทรัพย์สิน)
 * - follow_power: 从杀 - ตามธาตุ power (อำนาจ)
 * - follow_output: 从儿 - ตามธาตุ output (การแสดงออก)
 * - follow_companion: 从旺 - ตามธาตุ companion (เพื่อนร่วมธาตุ)
 */
export type FollowerSubType =
  | "follow_wealth"
  | "follow_power"
  | "follow_output"
  | "follow_companion"
  | null;

/**
 * ประเภทย่อยของ Special (特殊格局)
 * - two_element_harmony: 两神成象 - chart มีแค่ 2 ธาตุหลัก
 * - pure_element: 纯粹 - ธาตุเดียวทั้ง chart
 */
export type SpecialSubType = "two_element_harmony" | "pure_element" | null;

/**
 * ผลการวิเคราะห์โครงสร้าง (格局)
 */
export interface StructureAnalysis {
  /** ประเภทโครงสร้างหลัก */
  type: StructureType;

  /** ประเภทย่อย (ถ้ามี) */
  subtype: FollowerSubType | SpecialSubType | null;

  /** ชื่อโครงสร้างภาษาไทย เช่น "格局ปกติ (正格)", "从格 (从财)" */
  label: string;

  /** ชื่อโครงสร้างภาษาจีน เช่น "正格", "从财格" */
  labelCn: string;

  /** คำอธิบายภาษาไทยว่าทำไมจึงเป็น type นี้ */
  description: string;

  /** ธาตุที่ครอบ chart (สำหรับ follower/special) */
  dominantElement: ElementName | null;

  /** เหตุผลรายละเอียดทีละข้อ (ภาษาไทย) */
  reasons: string[];

  /** ความหมายโดยรวมต่อชีวิต (สั้นๆ) */
  implications: string;
}

/**
 * Map Structure Type → ภาษาไทย
 */
export const STRUCTURE_TYPE_THAI: Record<StructureType, string> = {
  normal: "ปกติ (正格)",
  vibrant: "专旺格/旺格",
  follower: "从格",
  special: "特殊格局",
};

/**
 * Map Follower Sub Type → ภาษาจีน
 */
export const FOLLOWER_SUBTYPE_CN: Record<
  Exclude<FollowerSubType, null>,
  string
> = {
  follow_wealth: "从财格",
  follow_power: "从杀格",
  follow_output: "从儿格",
  follow_companion: "从旺格",
};

/**
 * Map Follower Sub Type → ภาษาไทย
 */
export const FOLLOWER_SUBTYPE_THAI: Record<
  Exclude<FollowerSubType, null>,
  string
> = {
  follow_wealth: "ตามทรัพย์สิน (从财)",
  follow_power: "ตามอำนาจ (从杀)",
  follow_output: "ตามการแสดงออก (从儿)",
  follow_companion: "ตามเพื่อนร่วมธาตุ (从旺)",
};

/**
 * Map Special Sub Type → ภาษาจีน
 */
export const SPECIAL_SUBTYPE_CN: Record<
  Exclude<SpecialSubType, null>,
  string
> = {
  two_element_harmony: "两神成象",
  pure_element: "纯粹",
};

/**
 * Map Special Sub Type → ภาษาไทย
 */
export const SPECIAL_SUBTYPE_THAI: Record<
  Exclude<SpecialSubType, null>,
  string
> = {
  two_element_harmony: "สองธาตุสัมพันธ์ (两神成象)",
  pure_element: "ธาตุเดียวบริสุทธิ์ (纯粹)",
};
