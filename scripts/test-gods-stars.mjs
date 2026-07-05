// Test 10 Gods + Hidden Stems + Stars - independent assertions
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { analyzeGodsAndStars } from '../src/lib/bazi/gods-stars.ts';
import { getTenGod } from '../src/lib/bazi/ten-gods.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

function checkContains(label, actual, substring) {
  const ok = actual.includes(substring);
  console.log(`${ok ? '✅' : '❌'} ${label}: "${actual}"${ok ? '' : ` (ต้องมี "${substring}")`}`);
  if (ok) { pass++; } else { fail++; }
}

function checkNotNull(label, value) {
  const ok = value !== null && value !== undefined;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${ok ? 'มีค่า' : 'NULL/undefined'}`);
  if (ok) { pass++; } else { fail++; }
}

function checkArrayLength(label, arr, expectedLen) {
  const ok = arr.length === expectedLen;
  console.log(`${ok ? '✅' : '❌'} ${label}: length=${arr.length}${ok ? '' : ` (คาด ${expectedLen})`}`);
  if (ok) { pass++; } else { fail++; }
}

// เคสทดสอบ 1986-05-29 12:00 Asia/Shanghai (day master 癸阴水)
const profile1986 = {
  id: 'test1986', name: 'Test 1986', gender: 'male',
  birthDate: '1986-05-29', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Shanghai', createdAt: '', updatedAt: '',
};

const chart1986 = calculateBaZi(profile1986);
console.log('═══ Chart Info 1986-05-29 12:00 Shanghai ═══');
console.log(`Year: ${chart1986.year.stem.name}${chart1986.year.branch.name} (${chart1986.year.sixtyCycleName})`);
console.log(`Month: ${chart1986.month.stem.name}${chart1986.month.branch.name} (${chart1986.month.sixtyCycleName})`);
console.log(`Day: ${chart1986.day.stem.name}${chart1986.day.branch.name} (${chart1986.day.sixtyCycleName})`);
console.log(`Hour: ${chart1986.hour.stem.name}${chart1986.hour.branch.name} (${chart1986.hour.sixtyCycleName})`);
console.log(`Day Master: ${chart1986.dayMaster.name} (${chart1986.dayMaster.element}${chart1986.dayMaster.yinYang})`);

// TEST 1: 10 Gods ของ stems หลัก
console.log('\n═══ TEST 1: 10 Gods ของ stems หลัก (คำนวณจาก day master 癸阴水) ═══');

// Year stem 丙 (阳火): 水 克 火 = wealth (我克), different polarity (阴水 vs 阳火) → 正财
const yearTenGod = getTenGod(
  { element: '水', yinYang: '阴' },
  { element: '火', yinYang: '阳' }
);
check('1.1 Year stem 丙阳火 → 10 god', yearTenGod, '正财');

// Month stem 癸 (阴水): same element, same polarity (阴水 vs 阴水) → 比肩
const monthTenGod = getTenGod(
  { element: '水', yinYang: '阴' },
  { element: '水', yinYang: '阴' }
);
check('1.2 Month stem 癸阴水 → 10 god', monthTenGod, '比肩');

// Hour stem 戊 (阳土): 土 克 水 = power (克我), different polarity (阴水 vs 阳土) → 正官
const hourTenGod = getTenGod(
  { element: '水', yinYang: '阴' },
  { element: '土', yinYang: '阳' }
);
check('1.3 Hour stem 戊阳土 → 10 god', hourTenGod, '正官');

// TEST 2: 10 Gods ของ hidden stems ใน day branch
console.log('\n═══ TEST 2: 10 Gods ของ hidden stems (day branch 酉) ═══');
const dayBranch = chart1986.day.branch;
check('2.1 Day branch name', dayBranch.name, '酉');
checkArrayLength('2.2 Day branch hidden stems count', dayBranch.hiddenStems, 1);

if (dayBranch.hiddenStems.length > 0) {
  const hiddenStem = dayBranch.hiddenStems[0];
  check('2.3 Hidden stem name', hiddenStem.stem.name, '辛');
  check('2.4 Hidden stem element', hiddenStem.stem.element, '金');

  // 辛 (阴金): 金 生 水 = resource (生我), different polarity (阴金 vs 阴水) → 正印
  // Wait, 辛 is 阴金, day master is 癸阴水 → same polarity (阴 vs 阴)
  // So it should be 偏印 (Indirect Resource)
  const hiddenTenGod = getTenGod(
    { element: '水', yinYang: '阴' },
    { element: '金', yinYang: '阴' }
  );
  check('2.5 Hidden stem 辛阴金 → 10 god', hiddenTenGod, '偏印');
}

// TEST 3: Element cycle + yin/yang combinations
console.log('\n═══ TEST 3: Element cycle + yin/yang combinations ═══');

// Same element, same polarity → 比肩
check('3.1 木阳 vs 木阳 (same, same)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '木', yinYang: '阳' }
), '比肩');

// Same element, different polarity → 劫财
check('3.2 木阳 vs 木阴 (same, diff)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '木', yinYang: '阴' }
), '劫财');

// Resource (生我), same polarity → 偏印
check('3.3 木阳 vs 水阳 (生我, same)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '水', yinYang: '阳' }
), '偏印');

// Resource (生我), different polarity → 正印
check('3.4 木阳 vs 水阴 (生我, diff)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '水', yinYang: '阴' }
), '正印');

// Output (我生), same polarity → 食神
check('3.5 木阳 vs 火阳 (我生, same)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '火', yinYang: '阳' }
), '食神');

// Output (我生), different polarity → 伤官
check('3.6 木阳 vs 火阴 (我生, diff)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '火', yinYang: '阴' }
), '伤官');

// Wealth (我克), same polarity → 偏财
check('3.7 木阳 vs 土阳 (我克, same)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '土', yinYang: '阳' }
), '偏财');

// Wealth (我克), different polarity → 正财
check('3.8 木阳 vs 土阴 (我克, diff)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '土', yinYang: '阴' }
), '正财');

// Power (克我), same polarity → 七杀
check('3.9 木阳 vs 金阳 (克我, same)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '金', yinYang: '阳' }
), '七杀');

// Power (克我), different polarity → 正官
check('3.10 木阳 vs 金阴 (克我, diff)', getTenGod(
  { element: '木', yinYang: '阳' },
  { element: '金', yinYang: '阴' }
), '正官');

// TEST 4: analyzeGodsAndStars complete analysis
console.log('\n═══ TEST 4: analyzeGodsAndStars complete analysis ═══');
const analysis = analyzeGodsAndStars(chart1986);

checkNotNull('4.1 analysis.tenGods exists', analysis.tenGods);
checkNotNull('4.2 analysis.tenGods.year exists', analysis.tenGods.year);
checkNotNull('4.3 analysis.tenGods.month exists', analysis.tenGods.month);
checkNotNull('4.4 analysis.tenGods.hour exists', analysis.tenGods.hour);
checkNotNull('4.5 analysis.tenGods.dayHiddenStems exists', analysis.tenGods.dayHiddenStems);
checkNotNull('4.6 analysis.stars exists', analysis.stars);
checkNotNull('4.7 analysis.starsSummary exists', analysis.starsSummary);

check('4.8 Year ten god name', analysis.tenGods.year.name, '正财');
check('4.9 Month ten god name', analysis.tenGods.month.name, '比肩');
check('4.10 Hour ten god name', analysis.tenGods.hour.name, '正官');

checkContains('4.11 Year ten god Thai', analysis.tenGods.year.nameTh, 'ทรัพย์สิน');
checkContains('4.12 Month ten god Thai', analysis.tenGods.month.nameTh, 'เพื่อน');
checkContains('4.13 Hour ten god Thai', analysis.tenGods.hour.nameTh, 'นักการทูต');

check('4.14 Year relationship', analysis.tenGods.year.relationship, 'wealth');
check('4.15 Month relationship', analysis.tenGods.month.relationship, 'companion');
check('4.16 Hour relationship', analysis.tenGods.hour.relationship, 'power');

checkArrayLength('4.17 Day hidden stems', analysis.tenGods.dayHiddenStems, 1);
if (analysis.tenGods.dayHiddenStems.length > 0) {
  check('4.18 Hidden stem ten god', analysis.tenGods.dayHiddenStems[0].name, '偏印');
  check('4.19 Hidden stem relationship', analysis.tenGods.dayHiddenStems[0].relationship, 'resource');
  check('4.20 Hidden stem element', analysis.tenGods.dayHiddenStems[0].element, '金');
}

// TEST 5: Stars lookup
console.log('\n═══ TEST 5: Stars lookup (day master 癸, day branch 酉) ═══');

// 癸 → 羊刃 = 丑, ตรวจว่า branch 丑 ปรากฏไหม
// Chart 1986 branches: year=寅, month=巳, day=酉, hour=午
// ไม่มี 丑 → ไม่ควรมี 羊刃
const hasYangRen = analysis.stars.some(s => s.name === '羊刃');
check('5.1 羊刃 (癸→丑, not in chart)', hasYangRen, false);

// 癸 → 天乙贵人 = 卯 or 巳
// Chart has 巳 (month branch) → ควรมี天乙贵人 ที่ month
const tianYiStars = analysis.stars.filter(s => s.name === '天乙贵人');
checkArrayLength('5.2 天乙贵人 count', tianYiStars, 1);
if (tianYiStars.length > 0) {
  check('5.3 天乙贵人 position', tianYiStars[0].position, 'month');
  check('5.4 天乙贵人 category', tianYiStars[0].category, 'auspicious');
  checkContains('5.5 天乙贵人 Thai', tianYiStars[0].nameTh, 'ผู้ใหญ่');
}

// 癸 → 文昌 = 卯
// Chart ไม่มี 卯 → ไม่ควรมี文昌
const hasWenChang = analysis.stars.some(s => s.name === '文昌');
check('5.6 文昌 (癸→卯, not in chart)', hasWenChang, false);

// 酉 → 桃花 = 午 (巳酉丑→午)
// Chart has 午 (hour branch) → ควรมี桃花 ที่ hour
const peachBlossomStars = analysis.stars.filter(s => s.name === '桃花');
checkArrayLength('5.7 桃花 count', peachBlossomStars, 1);
if (peachBlossomStars.length > 0) {
  check('5.8 桃花 position', peachBlossomStars[0].position, 'hour');
  check('5.9 桃花 category', peachBlossomStars[0].category, 'auspicious');
  checkContains('5.10 桃花 Thai', peachBlossomStars[0].nameTh, 'ดอกท้อ');
}

// 酉 → 驿马 = 亥 (巳酉丑→亥)
// Chart ไม่มี 亥 → ไม่ควรมี驿马
const hasYiMa = analysis.stars.some(s => s.name === '驿马');
check('5.11 驿马 (酉→亥, not in chart)', hasYiMa, false);

// 酉 → 华盖 = 丑 (巳酉丑→丑)
// Chart ไม่มี 丑 → ไม่ควรมี华盖
const hasHuaGai = analysis.stars.some(s => s.name === '华盖');
check('5.12 华盖 (酉→丑, not in chart)', hasHuaGai, false);

// TEST 6: Stars summary
console.log('\n═══ TEST 6: Stars summary ═══');
check('6.1 Auspicious stars count', analysis.starsSummary.auspicious, 2); // 天乙贵人 + 桃花
check('6.2 Inauspicious stars count', analysis.starsSummary.inauspicious, 0);

// TEST 7: Unknown birth time
console.log('\n═══ TEST 7: Unknown birth time (hour = null) ═══');
const profileUnknown = {
  ...profile1986,
  birthTimeKnown: 'unknown',
  birthTime: null,
};

const chartUnknown = calculateBaZi(profileUnknown);
const analysisUnknown = analyzeGodsAndStars(chartUnknown);

check('7.1 Hour pillar should be null', chartUnknown.hour, null);
check('7.2 Hour ten god should be null', analysisUnknown.tenGods.hour, null);

// ดาวที่หา missing branch ได้ → ควรยังหาได้
// 天乙贵人 (癸→巳) อยู่ที่ month → ควรยังมี
const tianYiUnknown = analysisUnknown.stars.filter(s => s.name === '天乙贵人');
checkArrayLength('7.3 天乙贵人 still found', tianYiUnknown, 1);

// 桃花 (酉→午) ควร missing เพราะ hour = null
const peachBlossomUnknown = analysisUnknown.stars.filter(s => s.name === '桃花');
checkArrayLength('7.4 桃花 not found (no hour)', peachBlossomUnknown, 0);

// Final summary
console.log('\n═══ SUMMARY ═══');
console.log(`✅ Passed: ${pass}`);
console.log(`❌ Failed: ${fail}`);
console.log(`Total: ${pass + fail}`);

if (fail > 0) {
  process.exit(1);
}
