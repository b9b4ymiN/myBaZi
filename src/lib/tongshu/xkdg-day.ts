/**
 * XKDG (玄空大卦 / Xuan Kong Da Gua) for Tong Shu Day Analysis
 * Calculate XKDG period group for a specific day (not for person's birth)
 */

import { SolarDay } from 'tyme4ts';

export interface XkdgDayInfo {
  sixtyCycle: string;        // Day pillar (六十甲子) e.g., "丙辰"
  periodGroup: number;       // 1-6 (6 ซำ)
  periodGroupName: string;   // ซำ name (甲子, 甲戌, 甲申, 甲午, 甲辰, 甲寅)
  description: string;       // Thai description
}

/**
 * Map 6 ซำ (10 stems) → period group (1-6)
 * 甲子=1, 甲戌=2, 甲申=3, 甲午=4, 甲辰=5, 甲寅=6
 */
const TEN_STEMS_TO_PERIOD_GROUP: Record<string, number> = {
  '甲子': 1,
  '甲戌': 2,
  '甲申': 3,
  '甲午': 4,
  '甲辰': 5,
  '甲寅': 6,
};

/**
 * Get XKDG information for a specific day
 *
 * @param year Solar year (Gregorian)
 * @param month Solar month (1-12)
 * @param day Solar day (1-31)
 * @returns XkdgDayInfo with period group and description
 */
export function getXkdgDay(year: number, month: number, day: number): XkdgDayInfo {
  const solarDay = SolarDay.fromYmd(year, month, day);
  const sixtyCycleDay = solarDay.getSixtyCycleDay();
  const sixtyCycle = sixtyCycleDay.getSixtyCycle();

  // Get day pillar (六十甲子)
  const sixtyCycleName = sixtyCycle.getName();

  // Use getTen() API to find period group (1-6)
  const ten = sixtyCycle.getTen();
  const tenName = ten.getName();

  // Map ซำ → period group (1-6)
  const periodGroup = TEN_STEMS_TO_PERIOD_GROUP[tenName] ?? 1;

  const description = `วันหลัก ${sixtyCycleName} (ซำ${tenName}, period ${periodGroup})`;

  return {
    sixtyCycle: sixtyCycleName,
    periodGroup,
    periodGroupName: tenName,
    description
  };
}
