/**
 * Pinyin + Thai label maps for BaZi components
 * Lookup tables สำหรับแสดงผลใน UI
 */

/**
 * Pinyin ของ 10 Heavenly Stems (天干)
 * 甲→"jiǎ", 乙→"yǐ", 丙→"bǐng", 丁→"dīng", 戊→"wù", 己→"jǐ", 庚→"gēng", 辛→"xīn", 壬→"rén", 癸→"guǐ"
 */
export const STEM_PINYIN: Record<string, string> = {
  甲: "jiǎ",
  乙: "yǐ",
  丙: "bǐng",
  丁: "dīng",
  戊: "wù",
  己: "jǐ",
  庚: "gēng",
  辛: "xīn",
  壬: "rén",
  癸: "guǐ",
};

/**
 * Pinyin ของ 12 Earthly Branches (地支)
 * 子→"zǐ", 丑→"chǒu", 寅→"yín", 卯→"mǎo", 辰→"chén", 巳→"sì", 午→"wǔ", 未→"wèi", 申→"shēn", 酉→"yǒu", 戌→"xū", 亥→"hài"
 */
export const BRANCH_PINYIN: Record<string, string> = {
  子: "zǐ",
  丑: "chǒu",
  寅: "yín",
  卯: "mǎo",
  辰: "chén",
  巳: "sì",
  午: "wǔ",
  未: "wèi",
  申: "shēn",
  酉: "yǒu",
  戌: "xū",
  亥: "hài",
};

/**
 * Thai transliteration ของ 10 Heavenly Stems (天干)
 * ใช้ Thai transliteration มาตรฐาน (RTGS)
 */
export const STEM_THAI: Record<string, string> = {
  甲: "เกีย",
  乙: "อี้",
  丙: "ปิ่ง",
  丁: "ติง",
  戊: "อู้",
  己: "จี้",
  庚: "เกิง",
  辛: "ซิน",
  壬: "เหริน",
  癸: "กุย",
};

/**
 * Thai transliteration ของ 12 Earthly Branches (地支)
 * ใช้ Thai transliteration มาตรฐาน (RTGS)
 */
export const BRANCH_THAI: Record<string, string> = {
  子: "จื้อ",
  丑: "โฉ่ว",
  寅: "อิม",
  卯: "เหมา",
  辰: "เฉิ่น",
  巳: "ซื่อ",
  午: "อู่",
  未: "เว่ย",
  申: "เสิน",
  酉: "โย่ว",
  戌: "สวี่",
  亥: "ไห้",
};

/**
 * Thai translation ของ 12 Zodiac Animals (生肖)
 */
export const ZODIAC_THAI: Record<string, string> = {
  鼠: "หนู",
  牛: "วัว",
  虎: "เสือ",
  兔: "กระต่าย",
  龙: "มังกร",
  蛇: "งู",
  马: "ม้า",
  羊: "แกะ",
  猴: "ลิง",
  鸡: "ไก่",
  狗: "หมา",
  猪: "หมู",
};
