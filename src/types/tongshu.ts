/**
 * Tong Shu (通勝/ปฏิทินมงคล) Type Definitions
 * Chinese almanac data structures for daily auspicious/inauspicious information
 */

import type { ElementName } from "@/lib/bazi/types";

export interface XkdgDayInfo {
  sixtyCycle: string;        // Day pillar (六十甲子) e.g., "丙辰"
  periodGroup: number;       // 1-6 (6 ซำ)
  periodGroupName: string;   // ซำ name (甲子, 甲戌, 甲申, 甲午, 甲辰, 甲寅)
  description: string;       // Thai description
}

export interface PowerScoreBreakdown {
  dayOfficer: number;        // ±5
  yellowBlackStar: number;   // ±5
  constellation28: number;   // ±3
  gods: number;              // sum ±1 each (capped at ±10)
  total: number;             // = powerScore
}

export interface TongShuDayInfo {
  // Solar and Lunar dates
  solarDate: {
    year: number;
    month: number;
    day: number;
    weekday: number; // 0-6 (Sunday-Saturday)
  };
  lunarDate: {
    dayName: string; // e.g., "十六" (16th day)
    monthName: string; // e.g., "五月" (5th month)
    yearName: string; // e.g., "甲辰年" (Jia Chen year)
  };

  // Sixty Cycle (Heavenly Stems and Earthly Branches)
  sixtyCycle: string; // Day pillar (e.g., "丙辰")
  yearPillar: string; // Year pillar (e.g., "甲辰")
  monthPillar: string; // Month pillar

  // Auspicious/Inauspicious indicators
  dayOfficer: {
    name: string; // Chinese name (e.g., "开")
    nameTh: string; // Thai translation
    auspicious: boolean;
    meaning: string; // Description in Thai
  };
  yellowBlackStar: {
    name: string; // One of 12 Yellow/Black Belt stars (e.g., "天牢")
    nameTh: string;
    auspicious: boolean; // true for Yellow (auspicious), false for Black (inauspicious)
  };
  constellation28: {
    name: string; // One of 28 constellations (e.g., "鬼")
    nameTh: string;
    auspicious: boolean;
  };
  nineStar: {
    name: string; // Nine Star name
    nameTh: string;
  };
  gods: Array<{
    name: string;
    nameTh: string;
    auspicious: boolean;
  }>; // All gods/spirits influencing the day

  // Activities
  recommends: Array<{
    name: string; // Chinese
    nameTh: string; // Thai
  }>; // Suitable activities (宜)
  avoids: Array<{
    name: string;
    nameTh: string;
  }>; // Activities to avoid (忌)

  // Solar term information
  solarTerm: string | null; // e.g., "夏至" if day is a jieqi, null otherwise

  // Scoring and rating
  powerScore: number; // Overall score -50 to +50
  powerScoreBreakdown: PowerScoreBreakdown; // Detailed breakdown
  rating: "very_auspicious" | "auspicious" | "neutral" | "inauspicious" | "very_inauspicious";

  // Thai summary
  summary: string; // Brief summary in Thai

  // XKDG information
  xkdg: XkdgDayInfo; // XKDG period group for the day
}

export interface TongShuHour {
  hourName: string; // Chinese hour name (子时, 丑时, etc.)
  nameTh: string; // Thai translation
  timeRange: string; // Time range (e.g., "23:00-01:00")
  sixtyCycle: string; // Hour pillar (e.g., "甲子")
  auspicious: boolean; // Overall auspicious for the hour
}

/**
 * Personal Resonance Analysis (ความเข้ากันส่วนตัว)
 * Compares user's day master with selected day's pillar
 */
export interface PersonalResonance {
  /** User's day master information */
  userDayMaster: {
    stem: string; // Stem character (丙, 丁, etc.)
    element: ElementName; // Element (木, 火, 土, 金, 水)
  };
  /** Day pillar information for the selected day */
  dayPillar: {
    stem: string; // Stem character
    branch: string; // Branch character
    stemElement: ElementName;
    branchElement: ElementName;
  };
  /** 10 God relationship between day master and day pillar stem */
  stemRelationship: "resource" | "companion" | "output" | "wealth" | "power";
  stemRelationshipTh: string; // Thai label for relationship
  /** Element Alignment with Useful God */
  usefulGodElement: ElementName | null;
  alignsWithUsefulGod: boolean; // true if day stem/branch element matches useful god
  alignmentNote: string; // Thai explanation
  /** Overall resonance score (-10 to +10) */
  resonanceScore: number;
  rating: "very_good" | "good" | "neutral" | "challenging" | "very_challenging";
  summary: string; // Thai summary
}

/**
 * Scored Hour with personal resonance
 */
export interface ScoredHour extends TongShuHour {
  /** Hour branch element */
  element: ElementName;
  /** Does this hour align with user's useful god? */
  alignsWithUsefulGod: boolean;
  /** Personal score for this hour (-3 to +3) */
  personalScore: number;
  /** Recommendation level */
  recommendation: "best" | "good" | "neutral" | "avoid";
}
