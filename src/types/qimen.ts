/**
 * Qi Men Dun Jia types
 * Type definitions for Qi Men chart and related structures
 */

export type Yuan = "上元" | "中元" | "下元";
export type Dun = "阳遁" | "阴遁";

/**
 * Single palace in Qi Men chart
 * Contains all stems, stars, doors, and deities for one palace
 */
export interface QiMenPalace {
  palaceNumber: number; // 1-9
  bagua: string; // 八卦 name (坎/坤/震/巽/中/乾/兑/艮/离)

  // Stems (天干)
  earthStem: string; // 地盘 stem (六仪三奇: 戊己庚辛壬癸丁丙乙)
  heavenStem: string; // 天盘 stem (rotated based on hour)

  // 九星八门八神
  star: string; // 九星 (天蓬/天芮/天冲/天辅/天禽/天心/天柱/天任/天英)
  door: string; // 八门 (休/死/伤/杜/开/惊/生/景)
  deity: string; // 八神 (值符/腾蛇/太阴/六合/白虎/玄武/九地/九天)

  // Flags
  isZhiFu: boolean; // 值符 palace (天盘 + 九星带头)
  isZhiShi: boolean; // 值使 palace (八门带头)
}

/**
 * Complete Qi Men Dun Jia chart
 * Contains all 9 palaces and metadata
 */
export interface QiMenChart {
  // Metadata
  dun: Dun; // 阳遁 or 阴遁
  ju: number; // 局 number (1-9)
  yuan: Yuan; // 元 (上元/中元/下元)
  term: string; // Current solar term (节气)
  hourBranch: string; // 时支 of the chart (子/丑/寅/卯/辰/巳/午/未/申/酉/戌/亥)

  // 旬首 and 值符/值使
  xunShou: string; // 旬首 (甲子/甲戌/甲申/甲午/甲辰/甲寅)
  zhiFuStem: string; // 值符 (仪: 戊/己/庚/辛/壬/癸)
  zhiShiDoor: string; // 值使 (门: 休/死/伤/杜/开/惊/生/景)

  // 9 palaces
  palaces: QiMenPalace[]; // Array of 9 palaces (index 0-8 for palaces 1-9)

  // Validation flags
  isValid: boolean; // Chart is valid
  validationErrors?: string[]; // Any validation errors (if isValid = false)
}

/**
 * Chart type for Qi Men Dun Jia
 * - hour: 时家奇门 - standard, most accurate, uses hour pillar for rotation
 * - day: 日家奇门 - uses day pillar for rotation (定局 from month)
 * - month: 月家奇门 - uses month pillar for rotation
 * - year: 年家奇门 - uses year pillar for rotation
 */
export type ChartType = "hour" | "day" | "month" | "year";

/**
 * Qi Men calculation options
 */
export interface QiMenOptions {
  useTrueSolarTime?: boolean; // Use true solar time (default: true)
  longitude?: number; // Longitude for TST calculation (default: from profile)
  chartType?: ChartType; // Chart type (default: "hour")
}

/**
 * Raw Qi Men calculation result (before validation)
 * Internal use only
 */
export interface RawQiMenChart {
  dun: Dun;
  ju: number;
  yuan: Yuan;
  term: string;
  hourBranch: string;
  xunShou: string;
  zhiFuStem: string;
  zhiShiDoor: string;
  palaces: QiMenPalace[];
}
