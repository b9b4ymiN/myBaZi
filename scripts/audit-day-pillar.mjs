// Day Pillar Deep Audit — verify 1993-10-12 ด้วย 4 methods อิสระ
import { SolarDay, SolarTime } from 'tyme4ts';

// ===== Method 1: tyme4ts โดยตรง =====
function method1_tyme4ts(y, m, d) {
  return SolarTime.fromYmdHms(y, m, d, 12, 0, 0).getLunarHour().getEightChar().getDay().getName();
}

// ===== Method 2: Julian Day Number → sexagenary cycle (anchor 2000-01-01 = 戊午 index 54) =====
function julianDayNumber(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const Y = y + 4800 - a;
  const M = m + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}
const SIXTY = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
function method2_jdn_anchor2000(y, m, d) {
  const jdn = julianDayNumber(y, m, d);
  const jdn2000 = julianDayNumber(2000, 1, 1); // = 戊午 index 54
  const idx = (((jdn - jdn2000) + 54) % 60 + 60) % 60;
  return SIXTY[idx];
}

// ===== Method 3: Julian Day → direct stem/branch formula (อิสระ, ไม่ใช้ anchor) =====
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
function method3_jdn_direct(y, m, d) {
  const jdn = julianDayNumber(y, m, d);
  const stemIdx = ((jdn + 9) % 10 + 10) % 10;
  const branchIdx = ((jdn + 1) % 12 + 12) % 12;
  return STEMS[stemIdx] + BRANCHES[branchIdx];
}

// ===== Method 4: count days from 1986-05-29 anchor (癸酉) =====
function method4_anchor1986(y, m, d) {
  const jdnTarget = julianDayNumber(y, m, d);
  const jdnAnchor = julianDayNumber(1986, 5, 29); // 癸酉 index 9
  const diff = jdnTarget - jdnAnchor;
  const idx = (((9 + diff) % 60) + 60) % 60;
  return SIXTY[idx];
}

// ===== TEST: หลายวันที่รู้ =====
const cases = [
  [1986, 5, 29, "癸酉", "anchor (verify engine)"],
  [2000, 1, 1, "戊午", "anchor (public known)"],
  [1993, 10, 12, "??", "เคสผู้ใช้ (บทความบอก 丙子)"],
  [2024, 2, 4, "??", "Li Chun 2024"],
  [2024, 6, 21, "??", "夏至 2024"],
  [2024, 2, 10, "??", "CNY 2024"],
];

console.log("วันที่            | Method1 tyme4ts | Method2 JDN+2000 | Method3 JDN direct | Method4 +1986 | expected");
console.log("-".repeat(110));
for (const [y, m, d, expected, note] of cases) {
  const r1 = method1_tyme4ts(y, m, d);
  const r2 = method2_jdn_anchor2000(y, m, d);
  const r3 = method3_jdn_direct(y, m, d);
  const r4 = method4_anchor1986(y, m, d);
  const allMatch = r1 === r2 && r2 === r3 && r3 === r4;
  const mark = expected !== "??" ? (r1 === expected ? "✅" : "❌") : (allMatch ? "✓4-method" : "❌MISMATCH");
  console.log(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} | ${r1.padEnd(15)} | ${r2.padEnd(16)} | ${r3.padEnd(18)} | ${r4.padEnd(13)} | ${expected} ${mark} (${note})`);
}
