// Test analyzePalace — อ่าน palace ทั้ง 4 เสา + spouse palace (day branch)
// เคสอ้างอิง: 1993-10-12 ลำปาง (丙) chart 癸酉·壬戌·丙寅·甲午
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzePalace } from '../src/lib/bazi/palace.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) pass++; else fail++;
}

const profile = {
  id: 'ref1993', name: 'เคสอ้างอิง', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', birthLongitude: 99.5, useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};
const chart = calculateBaZi(profile);
const p = analyzePalace(chart);

console.log('═══ Palace 1993 (丙) ═══');
for (const pal of p.palaces) {
  console.log(`${pal.position}: stem ${pal.stem.name}(${pal.stemTenGod}) | branch ${pal.branch.name} → primary ${pal.branchPrimaryTenGod} | ${pal.lifeDomain}`);
}

// ── โครงทั่วไป ──
check('1.1 มี 4 palace (year/month/day/hour)',
  p.palaces.map(x => x.position), ['year', 'month', 'day', 'hour']);
check('1.2 self = day stem = 丙', p.self.stem.name, '丙');

// ── Year palace (癸 酉) ──
const year = p.palaces.find(x => x.position === 'year');
check('1.3 year stem = 癸', year.stem.name, '癸');
check('1.4 year stem ten god = 正官 (癸水 คุม 丙火 → power diff polarity)', year.stemTenGod, '正官');
check('1.5 year branch = 酉', year.branch.name, '酉');
check('1.6 year branch primary = 正财 (酉 hidden 辛金 → wealth diff)', year.branchPrimaryTenGod, '正财');
check('1.7 year branch hidden count = 1 (酉 มีแค่ 辛)', year.branchHiddenStems.length, 1);

// ── Month palace (壬 戌) ──
const month = p.palaces.find(x => x.position === 'month');
check('1.8 month stem = 壬', month.stem.name, '壬');
check('1.9 month stem ten god = 七杀', month.stemTenGod, '七杀');
check('1.10 month branch = 戌', month.branch.name, '戌');
check('1.11 month branch primary = 食神 (戌 main hidden 戊土 → output same)', month.branchPrimaryTenGod, '食神');
check('1.12 month branch hidden count = 3', month.branchHiddenStems.length, 3);

// ── Day palace (丙 寅) — SELF + SPOUSE ──
const day = p.palaces.find(x => x.position === 'day');
check('1.13 day stem = 丙 (self)', day.stem.name, '丙');
check('1.14 day stem ten god = 比肩 (self same)', day.stemTenGod, '比肩');
check('1.15 day branch = 寅', day.branch.name, '寅');
check('1.16 day branch primary = 偏印 (寅 main hidden 甲木 → resource same)', day.branchPrimaryTenGod, '偏印');
check('1.17 day branch hidden count = 3', day.branchHiddenStems.length, 3);

// ── DOD หลัก: spouse palace ออกถูก ──
check('1.18 spouse.position = day', p.spouse.position, 'day');
check('1.19 spouse.branch = 寅 (day branch)', p.spouse.branch.name, '寅');
check('1.20 spouse.branchPrimaryTenGod = 偏印', p.spouse.branchPrimaryTenGod, '偏印');
check('1.21 spouse lifeDomain บอก คู่ครอง', p.spouse.lifeDomain.includes('คู่ครอง'), true);

// ── Hour palace (甲 午) ──
const hour = p.palaces.find(x => x.position === 'hour');
check('1.22 hour stem = 甲', hour.stem.name, '甲');
check('1.23 hour stem ten god = 偏印', hour.stemTenGod, '偏印');
check('1.24 hour branch primary = 劫财 (午 main hidden 丁火 → companion diff)', hour.branchPrimaryTenGod, '劫财');

// ── serializable ──
let serializable = true;
try { JSON.parse(JSON.stringify(p)); } catch { serializable = false; }
check('1.25 serializable', serializable, true);

// ── เคสไม่ทราบเวลา (hour null) — ต้องมี 3 palace ──
const profileNoHour = {
  id: 'nohour', name: 'ไม่รู้เวลา', gender: 'male',
  birthDate: '1993-10-12', birthTimeKnown: 'unknown',
  timezone: 'Asia/Bangkok', createdAt: '', updatedAt: '',
};
const chartNoHour = calculateBaZi(profileNoHour);
const pNoHour = analyzePalace(chartNoHour);
check('1.26 ไม่ทราบเวลา → 3 palace (year/month/day)', pNoHour.palaces.map(x => x.position), ['year', 'month', 'day']);

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
