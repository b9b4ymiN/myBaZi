/**
 * Tong Shu (通勝/ปฏิทินมงคล) Engine
 * Main computation functions for Chinese almanac daily information
 */

import { SolarDay } from 'tyme4ts';
import type { TongShuDayInfo, TongShuHour, PowerScoreBreakdown } from '@/types/tongshu';
import {
  DAY_OFFICER_THAI,
  YELLOW_BLACK_STAR_THAI,
  CONSTELLATION_28_THAI,
  NINE_STAR_THAI,
  GODS_THAI,
  RECOMMEND_THAI,
  AVOID_THAI,
  HOUR_THAI
} from './thai-labels';
import { getXkdgDay } from './xkdg-day';

/**
 * Get comprehensive Tong Shu day information
 * @param year Solar year (Gregorian)
 * @param month Solar month (1-12)
 * @param day Solar day (1-31)
 * @returns Complete TongShuDayInfo with scoring and Thai labels
 */
export function getTongShuDayInfo(year: number, month: number, day: number): TongShuDayInfo {
  const solarDay = SolarDay.fromYmd(year, month, day);
  const lunarDay = solarDay.getLunarDay();
  const lunarMonth = lunarDay.getLunarMonth();
  const lunarYear = lunarMonth.getLunarYear();

  // Get weekday (0 = Sunday, 6 = Saturday)
  const weekday = new Date(year, month - 1, day).getDay();

  // Get day officer (12 Day Officers)
  const dutyName = lunarDay.getDuty().getName();
  const dayOfficerRaw = DAY_OFFICER_THAI[dutyName] || {
    nameTh: dutyName,
    auspicious: false,
    meaning: ''
  };

  // Get Yellow/Black Belt Star (from getTwelveStar, NOT getSixStar)
  const twelveStarName = lunarDay.getTwelveStar().getName();
  const yellowBlackStarRaw = YELLOW_BLACK_STAR_THAI[twelveStarName] || {
    nameTh: twelveStarName,
    auspicious: false
  };

  // Get 28 Constellation
  const constellation28Name = lunarDay.getTwentyEightStar().getName();
  const constellation28Raw = CONSTELLATION_28_THAI[constellation28Name] || {
    nameTh: constellation28Name,
    auspicious: false
  };

  // Get Nine Star
  const nineStarName = lunarDay.getNineStar().getName();
  const nineStarRaw = NINE_STAR_THAI[nineStarName] || { nameTh: nineStarName };

  // Get gods/spirits
  const gods = lunarDay.getGods().map(god => {
    const godName = god.getName();
    const godRaw = GODS_THAI[godName] || {
      nameTh: godName,
      auspicious: false
    };
    return {
      name: godName,
      nameTh: godRaw.nameTh,
      auspicious: godRaw.auspicious
    };
  });

  // Get recommended activities (宜)
  const recommends = lunarDay.getRecommends().map(rec => {
    const recName = rec.getName();
    const recRaw = RECOMMEND_THAI[recName] || { nameTh: recName };
    return {
      name: recName,
      nameTh: recRaw.nameTh
    };
  });

  // Get activities to avoid (忌)
  const avoids = lunarDay.getAvoids().map(avoid => {
    const avoidName = avoid.getName();
    const avoidRaw = AVOID_THAI[avoidName] || { nameTh: avoidName };
    return {
      name: avoidName,
      nameTh: avoidRaw.nameTh
    };
  });

  // Get solar term (节气) - null if not a jieqi day
  const term = solarDay.getTerm();
  const solarTerm = term ? term.getName() : null;

  // Calculate power score breakdown
  const powerScoreBreakdown = calculatePowerScoreBreakdown({
    dayOfficer: dayOfficerRaw,
    yellowBlackStar: yellowBlackStarRaw,
    constellation28: constellation28Raw,
    gods
  });
  const powerScore = powerScoreBreakdown.total;

  // Determine rating from power score
  const rating = getRatingFromScore(powerScore);

  // Get XKDG information for the day
  const xkdg = getXkdgDay(year, month, day);

  // Generate Thai summary
  const summary = generateThaiSummary({
    dayOfficer: dayOfficerRaw,
    yellowBlackStar: yellowBlackStarRaw,
    powerScore,
    rating,
    thaiMonth: lunarMonth.getName(),
    thaiDay: lunarDay.getName()
  });

  return {
    solarDate: {
      year,
      month,
      day,
      weekday
    },
    lunarDate: {
      dayName: lunarDay.getName(),
      monthName: lunarMonth.getName(),
      yearName: lunarYear.getSixtyCycle().getName()
    },
    sixtyCycle: lunarDay.getSixtyCycle().getName(),
    yearPillar: lunarYear.getSixtyCycle().getName(),
    monthPillar: lunarMonth.getSixtyCycle().getName(),
    dayOfficer: {
      name: dutyName,
      nameTh: dayOfficerRaw.nameTh,
      auspicious: dayOfficerRaw.auspicious,
      meaning: dayOfficerRaw.meaning
    },
    yellowBlackStar: {
      name: twelveStarName,
      nameTh: yellowBlackStarRaw.nameTh,
      auspicious: yellowBlackStarRaw.auspicious
    },
    constellation28: {
      name: constellation28Name,
      nameTh: constellation28Raw.nameTh,
      auspicious: constellation28Raw.auspicious
    },
    nineStar: {
      name: nineStarName,
      nameTh: nineStarRaw.nameTh
    },
    gods,
    recommends,
    avoids,
    solarTerm,
    powerScore,
    powerScoreBreakdown,
    rating,
    summary,
    xkdg
  };
}

/**
 * Get Tong Shu hours for a specific day
 * @param year Solar year
 * @param month Solar month
 * @param day Solar day
 * @returns Array of 12 (or 13) TongShuHour objects
 */
export function getTongShuHours(year: number, month: number, day: number): TongShuHour[] {
  const solarDay = SolarDay.fromYmd(year, month, day);
  const hours = solarDay.getLunarDay().getHours();

  return hours.map(hour => {
    const hourName = hour.getName();
    const hourRaw = HOUR_THAI[hourName] || {
      nameTh: hourName,
      timeRange: ''
    };

    // Get hour pillar (六十甲子)
    const sixtyCycle = hour.getSixtyCycle().getName();

    // Determine if hour is auspicious based on various factors
    // Simple heuristic: check if hour pillar has favorable elements
    const auspicious = isHourAuspicious(hour);

    return {
      hourName,
      nameTh: hourRaw.nameTh,
      timeRange: hourRaw.timeRange,
      sixtyCycle,
      auspicious
    };
  });
}

/**
 * Calculate power score breakdown from various auspicious/inauspicious indicators
 * Score range: -50 (very inauspicious) to +50 (very auspicious)
 */
function calculatePowerScoreBreakdown(params: {
  dayOfficer: { auspicious: boolean };
  yellowBlackStar: { auspicious: boolean };
  constellation28: { auspicious: boolean };
  gods: Array<{ auspicious: boolean }>;
}): PowerScoreBreakdown {
  // Day officer: ±5 points
  const dayOfficer = params.dayOfficer.auspicious ? 5 : -5;

  // Yellow/Black Belt Star: ±5 points
  const yellowBlackStar = params.yellowBlackStar.auspicious ? 5 : -5;

  // 28 Constellation: ±3 points
  const constellation28 = params.constellation28.auspicious ? 3 : -3;

  // Gods/spirits: ±1 point each (but cap total gods contribution)
  const godsRaw = params.gods.reduce((sum, god) => sum + (god.auspicious ? 1 : -1), 0);
  const gods = Math.max(-10, Math.min(10, godsRaw)); // Cap gods contribution at ±10

  // Calculate total
  const totalRaw = dayOfficer + yellowBlackStar + constellation28 + gods;

  // Normalize to -50..+50 range
  // The raw score ranges from about -23 to +23, so we normalize
  const total = Math.round((totalRaw / 23) * 50);
  const normalizedTotal = Math.max(-50, Math.min(50, total));

  return {
    dayOfficer,
    yellowBlackStar,
    constellation28,
    gods,
    total: normalizedTotal
  };
}

/**
 * Convert power score to rating category
 */
function getRatingFromScore(score: number): TongShuDayInfo['rating'] {
  if (score > 20) return 'very_auspicious';
  if (score >= 5) return 'auspicious';
  if (score >= -5) return 'neutral';
  if (score >= -20) return 'inauspicious';
  return 'very_inauspicious';
}

/**
 * Generate Thai summary text
 */
function generateThaiSummary(params: {
  dayOfficer: { nameTh: string; meaning: string };
  yellowBlackStar: { nameTh: string };
  powerScore: number;
  rating: TongShuDayInfo['rating'];
  thaiMonth: string;
  thaiDay: string;
}): string {
  const ratingText: Record<TongShuDayInfo['rating'], string> = {
    very_auspicious: 'วันนี้เป็นมงคลมาก',
    auspicious: 'วันนี้เป็นมงคล',
    neutral: 'วันนี้ปานกลาง',
    inauspicious: 'วันนี้อัปมงคล',
    very_inauspicious: 'วันนี้อัปมงคลมาก'
  };

  return `${ratingText[params.rating]} (${params.thaiMonth}${params.thaiDay}) ` +
    `ประจำวันคือ${params.dayOfficer.nameTh} (${params.dayOfficer.meaning}) ` +
    `ดาว${params.yellowBlackStar.nameTh} ` +
    `คะแนนพลัง ${params.powerScore}`;
}

/**
 * Determine if an hour is auspicious
 * Simple heuristic based on hour characteristics
 */
function isHourAuspicious(hour: { getTwelveStar?: () => { getName: () => string } | null }): boolean {
  // Get the twelve star (yellow/black belt) for the hour
  const twelveStar = hour.getTwelveStar?.();
  if (!twelveStar) return false;

  const starName = twelveStar.getName();
  const starInfo = YELLOW_BLACK_STAR_THAI[starName];

  // If we have Thai label info, use that
  if (starInfo) {
    return starInfo.auspicious;
  }

  // Default to false (inauspicious) if unknown
  return false;
}
