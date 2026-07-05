/**
 * Qi Men Dun Jia constants - lookup tables for Chai Bu 拆补 method
 * All hardcoded values from traditional Qi Men references
 */

/**
 * Lo Shu layout - 9 palaces grid order (row-major)
 * Grid layout:
 *   4 | 9 | 2
 *   3 | 5 | 7
 *   8 | 1 | 6
 */
export const PALACE_LO_SHU = [4, 9, 2, 3, 5, 7, 8, 1, 6];

/**
 * Bagua (八卦) for each palace
 * Palace 5 = 中宫 (Central Palace, no Bagua)
 */
export const PALACE_BAGUA: Record<number, string> = {
  1: "坎", // 坎水
  2: "坤", // 坤土
  3: "震", // 震木
  4: "巽", // 巽木
  5: "中", // 中宫 (Central)
  6: "乾", // 乾金
  7: "兑", // 兑金
  8: "艮", // 艮土
  9: "离", // 离火
};

/**
 * 9 Stars (九星) for each palace
 * Standard arrangement: 天蓬, 天芮, 天冲, 天辅, 天禽, 天心, 天柱, 天任, 天英
 * Note: 天禽 is at Central Palace (palace 5)
 */
export const STAR_BY_PALACE: Record<number, string> = {
  1: "天蓬",
  2: "天芮",
  3: "天冲",
  4: "天辅",
  5: "天禽", // 中宫
  6: "天心",
  7: "天柱",
  8: "天任",
  9: "天英",
};

/**
 * 8 Doors (八门) for each palace
 * Note: Palace 5 (中宫) uses 寄宫, typically borrows from palace 2 (坤)
 */
export const DOOR_BY_PALACE: Record<number, string> = {
  1: "休",
  2: "死",
  3: "伤",
  4: "杜",
  5: "寄", // 中宫寄宫
  6: "开",
  7: "惊",
  8: "生",
  9: "景",
};

/**
 * 6 Yi Qi order (六仪三奇) for earth plate placement
 * Order: 戊己庚辛壬癸丁丙乙
 * Used for clockwise/counterclockwise placement on earth plate
 */
export const YI_QI_ORDER = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];

/**
 * 8 Deities (八神) order
 * 值符 leads, followed by other 7 deities
 */
export const DEITY_ORDER = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];

/**
 * 6 旬 (旬首) to Yi (仪) mapping
 * Each 旬 starts with 甲X, corresponding to specific 仪
 * 甲子=戊, 甲戌=己, 甲申=庚, 甲午=辛, 甲辰=壬, 甲寅=癸
 */
export const XUN_TO_YI: Record<string, string> = {
  "甲子": "戊",
  "甲戌": "己",
  "甲申": "庚",
  "甲午": "辛",
  "甲辰": "壬",
  "甲寅": "癸",
};

/**
 * Palace traversal order for earth plate placement
 * 阳遁: 1→2→3→4→5→6→7→8→9 (skip 5)
 * 阴遁: 9→8→7→6→5→4→3→2→1 (skip 5)
 */

export const YANG_DUN_PALACE_ORDER = [1, 2, 3, 4, 6, 7, 8, 9]; // skip 5 (中宫)
export const YIN_DUN_PALACE_ORDER = [9, 8, 7, 6, 4, 3, 2, 1]; // skip 5 (中宫)

/**
 * Solar terms (节气) list for reference
 */
export const SOLAR_TERMS = [
  "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
  "春分", "清明", "谷雨", "立夏", "小满", "芒种",
  "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
  "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
];

/**
 * Yang Dun (阳遁) solar terms - 冬至 to 夏至
 */
export const YANG_DUN_TERMS = [
  "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
  "春分", "清明", "谷雨", "立夏", "小满", "芒种",
];

/**
 * Yin Dun (阴遁) solar terms - 夏至 to 冬至
 */
export const YIN_DUN_TERMS = [
  "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
  "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
];

/**
 * Earthly Branch (地支) to Palace (宫) mapping
 * Used for hour-based 天盘 rotation - hour branch determines palace
 * 子=1(坎), 丑/寅=8(艮), 卯=3(震), 辰/巳=4(巽), 午=9(离), 未/申=2(坤), 酉=7(兑), 戌/亥=6(乾)
 */
export const BRANCH_TO_PALACE: Record<string, number> = {
  "子": 1,  // 坎
  "丑": 8, "寅": 8,  // 艮
  "卯": 3,  // 震
  "辰": 4, "巳": 4,  // 巽
  "午": 9,  // 离
  "未": 2, "申": 2,  // 坤
  "酉": 7,  // 兑
  "戌": 6, "亥": 6,  // 乾
};

/**
 * Ju (局) table for Chai Bu method (阳遁)
 * Format: 上元/中元/下元 for each solar term
 */
export const YANG_DUN_JU_TABLE: Record<string, { upper: number; middle: number; lower: number }> = {
  "冬至": { upper: 1, middle: 7, lower: 4 },
  "小寒": { upper: 2, middle: 8, lower: 5 },
  "大寒": { upper: 3, middle: 9, lower: 6 },
  "立春": { upper: 8, middle: 5, lower: 2 },
  "雨水": { upper: 9, middle: 6, lower: 3 },
  "惊蛰": { upper: 1, middle: 7, lower: 4 },
  "春分": { upper: 3, middle: 9, lower: 6 },
  "清明": { upper: 4, middle: 1, lower: 7 },
  "谷雨": { upper: 5, middle: 2, lower: 8 },
  "立夏": { upper: 4, middle: 1, lower: 7 },
  "小满": { upper: 5, middle: 2, lower: 8 },
  "芒种": { upper: 6, middle: 3, lower: 9 },
};

/**
 * Ju (局) table for Chai Bu method (阴遁)
 * Format: 上元/中元/下元 for each solar term
 */
export const YIN_DUN_JU_TABLE: Record<string, { upper: number; middle: number; lower: number }> = {
  "夏至": { upper: 9, middle: 3, lower: 6 },
  "小暑": { upper: 8, middle: 2, lower: 5 },
  "大暑": { upper: 7, middle: 1, lower: 4 },
  "立秋": { upper: 2, middle: 5, lower: 8 },
  "处暑": { upper: 1, middle: 4, lower: 7 },
  "白露": { upper: 9, middle: 3, lower: 6 },
  "秋分": { upper: 7, middle: 1, lower: 4 },
  "寒露": { upper: 6, middle: 9, lower: 3 },
  "霜降": { upper: 5, middle: 8, lower: 2 },
  "立冬": { upper: 6, middle: 9, lower: 3 },
  "小雪": { upper: 5, middle: 8, lower: 2 },
  "大雪": { upper: 4, middle: 7, lower: 1 },
};
