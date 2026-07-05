/**
 * XKDG (玄空大卦 / Xuan Kong Da Gua) types
 * Phase 1.8 - Simplified implementation using period groups from tyme4ts
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * XKDG ข้อมูลของแต่ละ pillar
 * - ใช้ period group (6 ซำ) จาก tyme4ts getTen() API
 * - Full hexagram lookup (64 ก้าว) จะเพิ่มใน Phase ถัดไปเมื่อมี reference verified
 */
export interface XkdgInfo {
  /** ชื่อ SixtyCycle (干支) เช่น "丙寅" */
  sixtyCycleName: string;
  /** Period group 1-6 จาก 6 ซำ (甲子=1, 甲戌=2, 甲申=3, 甲午=4, 甲辰=5, 甲寅=6) */
  periodGroup: number;
  /** ชื่อซำ (10 stems) เช่น "甲子", "甲戌", "甲申", "甲午", "甲辰", "甲寅" */
  periodGroupName: string;
  /** ธาตุของ stem */
  stemElement: ElementName;
  /** ธาตุของ branch */
  branchElement: ElementName;
  /** คำอธิบายภาษาไทย */
  description: string;
  /** TODO: Phase ถัดไป - hexagramNumber (1-64), hexagramName, hexagramElement, upperTrigram, lowerTrigram */
}

/**
 * XKDG Analysis ทั้งหมด
 */
export interface XkdgAnalysis {
  /** ปีหลัก (Year Pillar) */
  year: XkdgInfo;
  /** เดือนหลัก (Month Pillar) */
  month: XkdgInfo;
  /** วันหลัก (Day Pillar) */
  day: XkdgInfo;
  /** ชั่วโมงหลัก (Hour Pillar) - null ถ้าไม่ทราบเวลา */
  hour: XkdgInfo | null;
  /** หมายเหตุเกี่ยวกับ approach */
  note: string;
}
