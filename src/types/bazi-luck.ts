/**
 * Luck Pillars (大运) + Annual (流年) + Transit - Types
 */

import type { ElementName } from "../lib/bazi/types";

/**
 * Luck Pillar (大运) - 1 pillar ครอบคลุม 10 ปี
 */
export interface LuckPillar {
  /** index 0-7 (8 decades total) */
  index: number;
  /** ชื่อ SixtyCycle (干支) เช่น "甲午" */
  sixtyCycleName: string;
  /** อายุเริ่ม (เช่น 3, 13, 23, ...) */
  startAge: number;
  /** อายุสิ้นสุด (startAge + 9) */
  endAge: number;
  /** Heavenly Stem ของ pillar */
  stem: {
    name: string;        // เช่น "甲"
    element: ElementName;
  };
  /** Earthly Branch ของ pillar */
  branch: {
    name: string;        // เช่น "午"
    element: ElementName;
  };
  /** 10 God ของ stem เทียบ day master (optional) */
  tenGod?: string;
  /** true ถ้าปัจจุบันอยู่ในช่วงนี้ */
  isCurrent: boolean;
}

/**
 * Annual Fortune (流年) - ดวงรายปี
 */
export interface AnnualFortune {
  /** ค.ศ. เช่น 2026 */
  year: number;
  /** ชื่อ SixtyCycle (干支) เช่น "丙午" */
  sixtyCycleName: string;
  /** 10 God ของ year stem เทียบ day master (optional) */
  tenGod?: string;
}

/**
 * Luck Analysis - ผลวิเคราะห์ Luck Pillars ทั้งหมด
 */
export interface LuckAnalysis {
  /** ทิศทางเดิน大运 (forward = ไปข้างหน้า, backward = ย้อนหลัง) */
  direction: "forward" | "backward";
  /** อายุเริ่มต้นของ luck pillar แรก (= cl.getEndAge()) */
  startAge: number;
  /** 8 luck pillars (ครอบคลุม ~80 ปี) */
  pillars: LuckPillar[];
  /** luck pillar ปัจจุบัน (null ถ้ายังไม่ถึง หรือเกินช่วง) */
  currentPillar: LuckPillar | null;
  /** ดวงรายปีปัจจุบัน */
  currentAnnual: AnnualFortune | null;
  /** เสาเปลี่ยน (transit) - 3 ครั้งถัดไปจากปัจจุบัน */
  upcomingTransitions: {
    age: number;           // อายุเมื่อเปลี่ยน pillar
    pillar: string;        // ชื่อ pillar ใหม่ (sixtyCycleName)
    yearsAway: number;     // อีกกี่ปีถึงเสาเปลี่ยน
  }[];
}
