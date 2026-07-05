/**
 * Qi Men Dun Jia - Ju (定局) determination
 * Implements Chai Bu 拆补 method for determining Ju (局)
 */

import { SolarDay } from 'tyme4ts';
import {
  YANG_DUN_TERMS,
  YIN_DUN_TERMS,
  YANG_DUN_JU_TABLE,
  YIN_DUN_JU_TABLE,
} from './constants';

export type Yuan = "上元" | "中元" | "下元";
export type Dun = "阳遁" | "阴遁";

export interface JuResult {
  dun: Dun;
  ju: number;
  yuan: Yuan;
  term: string;
  daysIntoTerm: number; // Days since solar term started (0-based)
}

/**
 * Determine Ju (局) from solar date using Chai Bu method
 *
 * Algorithm:
 * 1. Find current solar term and days into term
 * 2. Determine Yuan (元): 上元 (0-4 days), 中元 (5-9 days), 下元 (10-14 days)
 * 3. Determine Dun (遁): 阳遁 (冬至→夏至), 阴遁 (夏至→冬至)
 * 4. Look up Ju from table based on term, yuan, and dun
 *
 * @param year - Solar year
 * @param month - Solar month (1-12)
 * @param day - Solar day
 * @returns JuResult with dun, ju, yuan, term, and daysIntoTerm
 */
export function determineJu(year: number, month: number, day: number): JuResult {
  // 1. Get current solar term
  const solarDay = SolarDay.fromYmd(year, month, day);
  const term = solarDay.getTerm();
  const termName = term.getName();

  // 2. Calculate days into current term (0-based)
  // Find days since term started by subtracting Julian days
  const termJulianDay = Number(term.getJulianDay().toString());
  const currentJulianDay = Number(solarDay.getJulianDay().toString());
  let daysIntoTerm = Math.floor(currentJulianDay - termJulianDay);

  // Handle case where term starts later in the day
  // (e.g., 夏至 starts at 15:51, so morning of that day is day -1)
  if (daysIntoTerm < 0) {
    daysIntoTerm = 0;
  }

  // 3. Determine Yuan (元) based on 5-day cycles
  // Each 15-day solar term has 3 yuan (5 days each)
  // 上元: days 0-4, 中元: days 5-9, 下元: days 10-14
  // After day 14, cycle repeats: day 15 = 上元, day 16 = 上元, etc.
  const yuanIndex = Math.floor(daysIntoTerm / 5) % 3;
  let yuan: Yuan;

  if (yuanIndex === 0) {
    yuan = "上元";
  } else if (yuanIndex === 1) {
    yuan = "中元";
  } else {
    yuan = "下元";
  }

  // 4. Determine Dun (遁) based on solar term
  // 阳遁: 冬至 to 夏至 (inclusive)
  // 阴遁: 夏至 to 冬至 (inclusive)
  let dun: Dun;
  if (YANG_DUN_TERMS.includes(termName)) {
    dun = "阳遁";
  } else if (YIN_DUN_TERMS.includes(termName)) {
    dun = "阴遁";
  } else {
    // Fallback: should not happen with valid solar terms
    throw new Error(`Unknown solar term: ${termName}`);
  }

  // 5. Look up Ju from table
  let ju: number;
  if (dun === "阳遁") {
    const juEntry = YANG_DUN_JU_TABLE[termName];
    if (!juEntry) {
      throw new Error(`No Yang Dun Ju entry for term: ${termName}`);
    }
    // Map yuan to ju value
    if (yuan === "上元") {
      ju = juEntry.upper;
    } else if (yuan === "中元") {
      ju = juEntry.middle;
    } else {
      ju = juEntry.lower;
    }
  } else {
    // 阴遁
    const juEntry = YIN_DUN_JU_TABLE[termName];
    if (!juEntry) {
      throw new Error(`No Yin Dun Ju entry for term: ${termName}`);
    }
    // Map yuan to ju value
    if (yuan === "上元") {
      ju = juEntry.upper;
    } else if (yuan === "中元") {
      ju = juEntry.middle;
    } else {
      ju = juEntry.lower;
    }
  }

  return {
    dun,
    ju,
    yuan,
    term: termName,
    daysIntoTerm,
  };
}

/**
 * Get all 24 solar terms for a given year
 * Useful for testing and validation
 *
 * @param year - Solar year
 * @returns Array of solar term names in chronological order
 */
export function getSolarTermsForYear(year: number): string[] {
  const terms: string[] = [];
  const solarDay = SolarDay.fromYmd(year, 1, 1);

  // Get first term of the year
  let term = solarDay.getTerm();
  let termName = term.getName();
  terms.push(termName);

  // Navigate through all 24 terms
  for (let i = 1; i < 24; i++) {
    const nextTerm = term.next(1); // next(n) gets the nth next term
    termName = nextTerm.getName();
    terms.push(termName);
    term = nextTerm;
  }

  return terms;
}
