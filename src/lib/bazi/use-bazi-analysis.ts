/**
 * useBaZiAnalysis hook - รวมการคำนวณทุก analyzer ไว้ในที่เดียว
 * Client-safe: ใช้ useMemo และ currentYear param แทน new Date() ใน module scope
 */

"use client";

import { useMemo } from "react";
import type { Profile } from "@/types/profile";
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
import { analyzeInteractions, type BranchInteraction } from "./interactions";
import { detectThreeHarmony, type ThreeHarmonyResult } from "./three-harmony";
import { analyzeStemCombinations, type StemCombinationMatch } from "./stem-combinations";
import type { BaZiChart } from "./types";
import type { StrengthAnalysis } from "@/types/bazi-strength";
import type { StructureAnalysis } from "@/types/bazi-structure";
import type { UsefulGodAnalysis } from "@/types/bazi-useful-god";
import type { GodsAndStarsAnalysis } from "@/types/bazi-gods-stars";
import type { LuckAnalysis } from "@/types/bazi-luck";
import type { XkdgAnalysis } from "@/types/bazi-xkdg";
import type { ElementComposition } from "@/types/bazi-elements";
import type { TenGodProfile } from "./ten-god-profile";
import type { PalaceAnalysis } from "./palace";
import type { LuckFavorabilityAnalysis } from "./luck-favorability";

/**
 * ผลการวิเคราะห์ BaZi ทั้งหมด (รวมทุก analysis)
 */
export interface BaZiAnalysis {
  chart: BaZiChart;
  strength: StrengthAnalysis;
  structure: StructureAnalysis;
  usefulGod: UsefulGodAnalysis;
  godsAndStars: GodsAndStarsAnalysis;
  luck: LuckAnalysis;
  xkdg: XkdgAnalysis;
  elements: ElementComposition;
  /** 子平 depth analyzers (Phase B) */
  tenGodProfile: TenGodProfile;
  palace: PalaceAnalysis;
  luckFavorability: LuckFavorabilityAnalysis;
  /** ปฏิสัมพันธ์ในดวง (Phase C — interactions/harmonies/combinations) */
  interactions: BranchInteraction[];
  threeHarmony: ThreeHarmonyResult;
  stemCombinations: StemCombinationMatch[];
}

/**
 * Hook รวมการคำนวณ BaZi ทั้งหมด
 *
 * ⚠️ SSR-safe: ต้องส่ง currentYear param เสมอ (ห้ามใช้ new Date() ใน module scope)
 * ใน client component ใช้ `new Date().getFullYear()` ใน useMemo ได้
 *
 * @param profile - ข้อมูลผู้ใช้ (null = ยังไม่ได้เลือก)
 * @param currentYear - ปีปัจจุบัน (default: ปีปัจจุบันจาก client)
 * @returns BaZiAnalysis | null - ผลวิเคราะห์ครบทุก analysis หรือ null ถ้าไม่มี profile
 */
export function useBaZiAnalysis(
  profile: Profile | null,
  currentYear?: number
): BaZiAnalysis | null {
  return useMemo(() => {
    if (!profile) return null;

    const chart = calculateBaZi(profile);
    const strength = analyzeStrength(chart);
    const structure = analyzeStructure(chart, strength);
    const usefulGod = analyzeUsefulGod(chart, strength, structure);
    const godsAndStars = analyzeGodsAndStars(chart);
    const luck = analyzeLuck(profile, chart, currentYear ?? new Date().getFullYear());
    const xkdg = analyzeXkdg(profile, chart);
    const elements = analyzeElements(chart);
    // 子平 depth analyzers (Phase B) — pure, derived from chart + usefulGod/luck
    const tenGodProfile = analyzeTenGodProfile(chart);
    const palace = analyzePalace(chart);
    const luckFavorability = analyzeLuckFavorability(luck, usefulGod);
    // ปฏิสัมพันธ์ในดวง (Phase C)
    const interactions = analyzeInteractions(chart);
    const branches = [chart.year.branch.name, chart.month.branch.name, chart.day.branch.name, chart.hour?.branch.name].filter(
      (b): b is string => Boolean(b)
    ) as ThreeHarmonyResult["presentBranches"];
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
  }, [profile, currentYear]);
}
