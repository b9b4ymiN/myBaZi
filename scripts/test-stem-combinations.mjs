// Test 天干五合 (Five Stem Combinations) - การผนึกกันของ天干สิบตัว
import { detectStemCombination, stemsCombine } from '../src/lib/bazi/stem-combinations.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST 1: คู่ที่ผนึกกัน - 甲+己 (土) ═══');
check('1.1 甲+己', detectStemCombination("甲", "己"), { combines: true, transformElement: "土" });
check('1.2 己+甲 (order-independent)', detectStemCombination("己", "甲"), { combines: true, transformElement: "土" });

console.log('\n═══ TEST 2: คู่ที่ผนึกกัน - 乙+庚 (金) ═══');
check('2.1 乙+庚', detectStemCombination("乙", "庚"), { combines: true, transformElement: "金" });
check('2.2 庚+乙 (order-independent)', detectStemCombination("庚", "乙"), { combines: true, transformElement: "金" });

console.log('\n═══ TEST 3: คู่ที่ผนึกกัน - 丙+辛 (水) ═══');
check('3.1 丙+辛', detectStemCombination("丙", "辛"), { combines: true, transformElement: "水" });
check('3.2 辛+丙 (order-independent)', detectStemCombination("辛", "丙"), { combines: true, transformElement: "水" });

console.log('\n═══ TEST 4: คู่ที่ผนึกกัน - 丁+壬 (木) ═══');
check('4.1 丁+壬', detectStemCombination("丁", "壬"), { combines: true, transformElement: "木" });
check('4.2 壬+丁 (order-independent)', detectStemCombination("壬", "丁"), { combines: true, transformElement: "木" });

console.log('\n═══ TEST 5: คู่ที่ผนึกกัน - 戊+癸 (火) ═══');
check('5.1 戊+癸', detectStemCombination("戊", "癸"), { combines: true, transformElement: "火" });
check('5.2 癸+戊 (order-independent)', detectStemCombination("癸", "戊"), { combines: true, transformElement: "火" });

console.log('\n═══ TEST 6: คู่ที่ไม่ผนึกกัน - negative cases ═══');
check('6.1 甲+乙 (ไม่ผนึก)', detectStemCombination("甲", "乙"), { combines: false });
check('6.2 甲+丙 (ไม่ผนึก)', detectStemCombination("甲", "丙"), { combines: false });
check('6.3 甲+庚 (ไม่ผนึก)', detectStemCombination("甲", "庚"), { combines: false });
check('6.4 己+庚 (ไม่ผนึก)', detectStemCombination("己", "庚"), { combines: false });
check('6.5 丙+丁 (ไม่ผนึก)', detectStemCombination("丙", "丁"), { combines: false });
check('6.6 壬+癸 (ไม่ผนึก)', detectStemCombination("壬", "癸"), { combines: false });
check('6.7 乙+丙 (ไม่ผนึก)', detectStemCombination("乙", "丙"), { combines: false });
check('6.8 己+辛 (ไม่ผนึก)', detectStemCombination("己", "辛"), { combines: false });

console.log('\n═══ TEST 7: stemsCombine boolean wrapper ═══');
check('7.1 stemsCombine("甲", "己") === true', stemsCombine("甲", "己"), true);
check('7.2 stemsCombine("甲", "乙") === false', stemsCombine("甲", "乙"), false);
check('7.3 stemsCombine("乙", "庚") === true', stemsCombine("乙", "庚"), true);
check('7.4 stemsCombine("丙", "辛") === true', stemsCombine("丙", "辛"), true);
check('7.5 stemsCombine("丁", "壬") === true', stemsCombine("丁", "壬"), true);
check('7.6 stemsCombine("戊", "癸") === true', stemsCombine("戊", "癸"), true);
check('7.7 stemsCombine("己", "庚") === false', stemsCombine("己", "庚"), false);

console.log('\n═══ TEST 8: ตรวจสอบว่ามี exactly 5 combining pairs ═══');
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const combiningPairs = [];

for (let i = 0; i < stems.length; i++) {
  for (let j = i + 1; j < stems.length; j++) {
    const result = detectStemCombination(stems[i], stems[j]);
    if (result.combines) {
      combiningPairs.push({ stems: `${stems[i]}+${stems[j]}`, transform: result.transformElement });
    }
  }
}

console.log('Combining pairs found:', combiningPairs);
check('8.1 จำนวน combining pairs = 5', combiningPairs.length, 5);

// ตรวจว่าเป็นคู่ที่ถูกต้องทั้ง 5
const expectedPairs = [
  { stems: "甲+己", transform: "土" },
  { stems: "乙+庚", transform: "金" },
  { stems: "丙+辛", transform: "水" },
  { stems: "丁+壬", transform: "木" },
  { stems: "戊+癸", transform: "火" },
];

for (const expected of expectedPairs) {
  const found = combiningPairs.find(p => p.stems === expected.stems && p.transform === expected.transform);
  check(`8.2 คู่ ${expected.stems} (${expected.transform}) มีอยู่จริง`, !!found, true);
}

console.log('\n═══ SUMMARY ═══');
console.log(`✅ ${pass}/${pass + fail} passed`);
if (fail > 0) {
  console.log(`❌ ${fail} failed`);
  process.exit(1);
}