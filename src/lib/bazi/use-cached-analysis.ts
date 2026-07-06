/**
 * use-cached-analysis.ts - React hook สำหรับ BaZi analysis พร้อม cache
 *
 * SSR-safe: ใช้ hydration gate pattern (เหมือน use-bazi-analysis.ts)
 * - ระหว่าง hydration → คืน null (ป้องกัน mismatch)
 * - หลัง hydration → ใช้ getAnalysis จาก cache module
 *
 * ⚠️ new Date().getFullYear() ใน client hook ได้ (browser runtime)
 * - hook นี้ client-only ("use client")
 * - ไม่มีผลกับ SSR หรือ engine purity
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import type { Profile } from "@/types/profile";
import type { BaZiAnalysis } from "./use-bazi-analysis";
import {
  getAnalysis,
  invalidateProfile,
  invalidateAll,
  peekAll,
  cacheSize,
} from "./analysis-cache";

// Import all analyzer functions สำหรับ computeFullAnalysis
import { calculateBaZi } from "./calculate";
import { analyzeStrength } from "./strength";
import { analyzeStructure } from "./structure";
import { analyzeUsefulGod } from "./useful-god";
import { analyzeGodsAndStars } from "./gods-stars";
import { analyzeLuck } from "./luck";
import { analyzeXkdg } from "./xkdg";
import { analyzeElements } from "./elements";
import { analyzeTenGodProfile } from "./ten-god-profile";
import { analyzePalace } from "./palace";
import { analyzeLuckFavorability } from "./luck-favorability";
import { analyzeInteractions } from "./interactions";
import { detectThreeHarmony, type BranchName } from "./three-harmony";
import { analyzeStemCombinations } from "./stem-combinations";
import type { BaZiChart } from "./types";

/**
 * Compute full BaZiAnalysis จาก profile + currentYear
 *
 * ฟังก์ชันนี้ replicate การคำนวณจาก use-bazi-analysis.ts
 * แต่เป็น pure function ไม่ใช่ hook (สำหรับใช้กับ cache)
 *
 * @param profile - ข้อมูลผู้ใช้
 * @param currentYear - ปีปัจจุบัน
 * @returns BaZiAnalysis ผลวิเคราะห์ครบทุก analysis
 */
export function computeFullAnalysis(
  profile: Profile,
  currentYear: number
): BaZiAnalysis {
  const chart: BaZiChart = calculateBaZi(profile);
  const strength = analyzeStrength(chart);
  const structure = analyzeStructure(chart, strength);
  const usefulGod = analyzeUsefulGod(chart, strength, structure);
  const godsAndStars = analyzeGodsAndStars(chart);
  const luck = analyzeLuck(profile, chart, currentYear);
  const xkdg = analyzeXkdg(profile, chart);
  const elements = analyzeElements(chart);
  // 子平 depth analyzers (Phase B)
  const tenGodProfile = analyzeTenGodProfile(chart);
  const palace = analyzePalace(chart);
  const luckFavorability = analyzeLuckFavorability(luck, usefulGod);
  // ปฏิสัมพันธ์ในดวง (Phase C)
  const interactions = analyzeInteractions(chart);
  const branches = [
    chart.year.branch.name,
    chart.month.branch.name,
    chart.day.branch.name,
    chart.hour?.branch.name,
  ].filter((b): b is BranchName => Boolean(b));
  const threeHarmony = detectThreeHarmony(branches);
  const stemCombinations = analyzeStemCombinations(chart);

  return {
    chart,
    strength,
    structure,
    usefulGod,
    godsAndStars,
    luck,
    xkdg,
    elements,
    tenGodProfile,
    palace,
    luckFavorability,
    interactions,
    threeHarmony,
    stemCombinations,
  };
}

/**
 * Hook สำหรับใช้ cached BaZi analysis
 *
 * Pattern ตรงกับ use-bazi-analysis.ts:
 * - คืน null ระหว่าง hydration
 * - คืน BaZiAnalysis หลัง hydration
 * - ใช้ cache เพื่อ avoid recompute ข้าม renders/components
 *
 * @param profile - ข้อมูลผู้ใช้ (null = ยังไม่ได้เลือก)
 * @param currentYear - ปีปัจจุบัน (default: ปีปัจจุบันจาก client)
 * @returns BaZiAnalysis | null
 */
export function useCachedAnalysis(
  profile: Profile | null,
  currentYear?: number
): BaZiAnalysis | null {
  // Hydration gate (same pattern as use-hydrated.ts)
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  return useMemo(() => {
    // ระหว่าง hydration → คืน null (SSR-safe)
    if (!isHydrated || !profile) {
      return null;
    }

    // หลัง hydration → ใช้ cache
    const year = currentYear ?? new Date().getFullYear();
    return getAnalysis(profile, year, computeFullAnalysis);
  }, [profile, currentYear, isHydrated]);
}

// Re-export cache utilities สำหรับ external use (เช่น หน้า settings ที่ต้องการ invalidate)
export {
  invalidateProfile,
  invalidateAll,
  peekAll,
  cacheSize,
};
