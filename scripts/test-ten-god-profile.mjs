// Test analyzeTenGodProfile — นับ 10 Gods ทั้งดวง + จัดอันดับเด่น/ขาด
// เคสอ้างอิง: ชาย 1993-10-12 12:55 ลำปาง (丙 day master) — chart 癸酉·壬戌·丙寅·甲午
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeTenGodProfile } from '../src/lib/bazi/ten-god-profile.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) pass++; else fail++;
}
function checkTrue(label, ok) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (ok) pass++; else fail++;
}

// ── เคส 1993 (丙 Yang Fire) ──────────────────────────────────────────
const profile1993 = {
  id: 'ref1993', name: 'เคสอ้างอิง', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', birthLongitude: 99.5, useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};
const chart1993 = calculateBaZi(profile1993);
const r1993 = analyzeTenGodProfile(chart1993);

console.log('═══ เคส 1993 (丙) ═══');
console.log(`Chart: ${chart1993.year.stem.name}${chart1993.year.branch.name} · ${chart1993.month.stem.name}${chart1993.month.branch.name} · ${chart1993.day.stem.name}${chart1993.day.branch.name} · ${chart1993.hour.stem.name}${chart1993.hour.branch.name}`);
console.log(`Day master: ${chart1993.dayMaster.name} (${chart1993.dayMaster.element}/${chart1993.dayMaster.yinYang})`);
console.log('Counts:', r1993.counts);
console.log('RelationshipCounts:', r1993.relationshipCounts);
console.log('DominantGods:', r1993.dominantGods);
console.log('Missing:', r1993.missingRelationships, '| PrimaryGroup:', r1993.primaryGroup);

// Verify chart (regression guard — ต้องตรง audit)
check('1.1 day master = 丙', chart1993.dayMaster.name, '丙');
check('1.2 chart = 癸酉·壬戌·丙寅·甲午',
  `${chart1993.year.stem.name}${chart1993.year.branch.name}·${chart1993.month.stem.name}${chart1993.month.branch.name}·${chart1993.day.stem.name}${chart1993.day.branch.name}·${chart1993.hour.stem.name}${chart1993.hour.branch.name}`,
  '癸酉·壬戌·丙寅·甲午');

// total entries = 3 stems (year/month/hour, ไม่นับ day) + 9 hidden (酉1 + 戌3 + 寅3 + 午2) = 12
check('1.3 total entries = 12', r1993.total, 12);

// counts (คำนวณมือ: ดู comment ใน plan)
check('1.4 比肩 = 1 (丙 寅-middle)', r1993.counts['比肩'], 1);
check('1.5 劫财 = 2 (丁 戌-residual, 丁 午-main)', r1993.counts['劫财'], 2);
check('1.6 食神 = 2 (戊 戌-main, 戊 寅-residual)', r1993.counts['食神'], 2);
check('1.7 伤官 = 1 (己 午-middle)', r1993.counts['伤官'], 1);
check('1.8 偏财 = 0', r1993.counts['偏财'], 0);
check('1.9 正财 = 2 (辛 酉-main, 辛 戌-middle)', r1993.counts['正财'], 2);
check('1.10 七杀 = 1 (壬 month-stem)', r1993.counts['七杀'], 1);
check('1.11 正官 = 1 (癸 year-stem)', r1993.counts['正官'], 1);
check('1.12 偏印 = 2 (甲 hour-stem, 甲 寅-main)', r1993.counts['偏印'], 2);
check('1.13 正印 = 0', r1993.counts['正印'], 0);

// relationshipCounts
check('1.14 companion = 3', r1993.relationshipCounts.companion, 3);
check('1.15 output = 3', r1993.relationshipCounts.output, 3);
check('1.16 wealth = 2', r1993.relationshipCounts.wealth, 2);
check('1.17 power = 2', r1993.relationshipCounts.power, 2);
check('1.18 resource = 2', r1993.relationshipCounts.resource, 2);

// dominantGods (>=2): 劫财, 食神, 正财, 偏印 (sort stable by ALL_TEN_GODS order)
check('1.19 dominantGods', r1993.dominantGods, ['劫财', '食神', '正财', '偏印']);
// missingRelationships: ไม่มี (ทุกกลุ่มมี >= 1)
check('1.20 missingRelationships = []', r1993.missingRelationships, []);
// primaryGroup: companion (tie 3-3 กับ output, companion มาก่อน)
check('1.21 primaryGroup = companion', r1993.primaryGroup, 'companion');

// serializable
let serializable = true;
try { JSON.parse(JSON.stringify(r1993)); } catch { serializable = false; }
checkTrue('1.22 serializable (JSON.stringify ผ่าน)', serializable);

// ── เคส 1994 (丁 — ต่างจาก 丙 เพราะ polarity สลับ 正/偏) ──────────────
const profile1994 = {
  id: 'fon', name: 'น้องฝน', gender: 'female',
  birthDate: '1994-03-22', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', createdAt: '', updatedAt: '',
};
const chart1994 = calculateBaZi(profile1994);
const r1994 = analyzeTenGodProfile(chart1994);

console.log('\n═══ เคส 1994 (丁) ═══');
console.log(`Day master: ${chart1994.dayMaster.name} (${chart1994.dayMaster.element}/${chart1994.dayMaster.yinYang})`);
console.log('DominantGods:', r1994.dominantGods, '| PrimaryGroup:', r1994.primaryGroup);

checkTrue('2.1 1994 day master ≠ 丙 (เป็นคนละ day master)', chart1994.dayMaster.name !== '丙');
// DOD หลัก: 丙 vs 丁 ต้องได้ profile ต่างกัน (จะเป็นอย่างไรก็ตาม)
checkTrue('2.2 profile 1994 ≠ profile 1993 (DOM ต่างกันจริง)',
  JSON.stringify({ d: r1994.dominantGods, g: r1994.primaryGroup, m: r1994.missingRelationships }) !==
  JSON.stringify({ d: r1993.dominantGods, g: r1993.primaryGroup, m: r1993.missingRelationships })
);

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
