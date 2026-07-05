/**
 * Gods and Stars Analysis - Main Entry Point
 * รวม 10 Gods + Hidden Stems + Stars
 */

import type { BaZiChart } from "./types";
import type { GodsAndStarsAnalysis } from "../../types/bazi-gods-stars";
import { getTenGod, toTenGodInfo } from "./ten-gods";
import { findStars } from "./stars";

/**
 * วิเคราะห์ 10 Gods + Stars จาก BaZi Chart
 *
 * @param chart - BaZiChart ที่ต้องการวิเคราะห์
 * @returns GodsAndStarsAnalysis - ผลวิเคราะห์ครบถ้วน
 *
 * @example
 * const chart = calculateBaZi(profile);
 * const analysis = analyzeGodsAndStars(chart);
 * console.log(analysis.tenGods.year); // 10 god ของ year stem
 * console.log(analysis.tenGods.dayHiddenStems); // 10 gods ของ hidden stems
 * console.log(analysis.stars); // ดาวทั้งหมด
 */
export function analyzeGodsAndStars(chart: BaZiChart): GodsAndStarsAnalysis {
  const dayMaster = chart.dayMaster;

  // 1. คำนวณ 10 Gods สำหรับ stems หลัก
  const yearTenGod = getTenGod(dayMaster, chart.year.stem);
  const monthTenGod = getTenGod(dayMaster, chart.month.stem);

  // 2. แปลงเป็น TenGodInfo
  const year: GodsAndStarsAnalysis["tenGods"]["year"] = toTenGodInfo(
    yearTenGod,
    chart.year.stem.element,
    chart.year.stem.yinYang
  );

  const month: GodsAndStarsAnalysis["tenGods"]["month"] = toTenGodInfo(
    monthTenGod,
    chart.month.stem.element,
    chart.month.stem.yinYang
  );

  const hour: GodsAndStarsAnalysis["tenGods"]["hour"] = chart.hour
    ? (() => {
        const god = getTenGod(dayMaster, chart.hour!.stem);
        return toTenGodInfo(
          god,
          chart.hour!.stem.element,
          chart.hour!.stem.yinYang
        );
      })()
    : null;

  // 3. คำนวณ 10 Gods สำหรับ hidden stems ใน day branch
  const dayHiddenStems = chart.day.branch.hiddenStems.map((hiddenStem) => {
    const tenGod = getTenGod(dayMaster, hiddenStem.stem);
    return toTenGodInfo(
      tenGod,
      hiddenStem.stem.element,
      hiddenStem.stem.yinYang
    );
  });

  // 4. หาดาวทั้งหมด
  const stars = findStars(chart);

  // 5. สรุปจำนวนดาว
  const starsSummary = {
    auspicious: stars.filter((s) => s.category === "auspicious").length,
    inauspicious: stars.filter((s) => s.category === "inauspicious").length,
  };

  return {
    tenGods: {
      year,
      month,
      hour,
      dayHiddenStems,
    },
    stars,
    starsSummary,
  };
}
