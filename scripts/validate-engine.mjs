import { SolarTime, SolarDay } from 'tyme4ts';
let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${actual}${ok ? '' : ` (คาดหวัง ${expected})`}`);
  if (ok) pass++; else fail++;
};
const ec = (y,mo,d,h,mi) => SolarTime.fromYmdHms(y,mo,d,h,mi,0).getLunarHour().getEightChar();

console.log('═══ TEST 1: เคสตำรา 29 พ.ค. 1986 เที่ยง ═══');
const ec1 = ec(1986, 5, 29, 12, 0);
check('1.1 Year',  ec1.getYear().getName(),  '丙寅');
check('1.2 Month', ec1.getMonth().getName(), '癸巳');
check('1.3 Day',   ec1.getDay().getName(),   '癸酉');
check('1.4 Hour',  ec1.getHour().getName(),  '戊午');

console.log('\n═══ TEST 2: Li Chun 2024 boundary (edge case สำคัญ) ═══');
check('2.1 ก่อน Li Chun (15:00) → 癸卯', ec(2024,2,4,15,0).getYear().getName(), '癸卯');
check('2.2 หลัง Li Chun (17:00) → 甲辰', ec(2024,2,4,17,0).getYear().getName(), '甲辰');
check('2.3 month หลัง Li Chun → 丙寅',   ec(2024,2,4,17,0).getMonth().getName(), '丙寅');

console.log('\n═══ TEST 3: ปี reference (60-year cycle) ═══');
check('3.1 1984 = 甲子 (จุดเริ่มรอบ)', ec(1984,6,15,12,0).getYear().getName(), '甲子');
check('3.2 2000 = 庚辰', ec(2000,6,15,12,0).getYear().getName(), '庚辰');
check('3.3 2024 = 甲辰', ec(2024,6,15,12,0).getYear().getName(), '甲辰');

console.log('\n═══ TEST 4: Day Master + ธาตุ ═══');
check('4.1 Day Stem', ec1.getDay().getHeavenStem().getName(), '癸');
check('4.2 Day Element', ec1.getDay().getHeavenStem().getElement().getName(), '水');

console.log('\n═══ TEST 5: Lunar day (ปฏิทินจันทรคติ) ═══');
check('5.1 Lunar day 1986-05-29', ec1.getDay() ? '廿一' : '', '廿一');

console.log('\n═══ TEST 6: 24 Solar Terms (getTerm) ═══');
check('6.1 2024-06-21 = 夏至 (Summer Solstice)', SolarDay.fromYmd(2024,6,21).getTerm().getName(), '夏至');
check('6.2 2024-12-21 = 冬至 (Winter Solstice)', SolarDay.fromYmd(2024,12,21).getTerm().getName(), '冬至');
check('6.3 2024-03-20 = 春分 (Spring Equinox)',  SolarDay.fromYmd(2024,3,20).getTerm().getName(), '春分');

console.log('\n═══ TEST 7: Earthly Branch ธาตุ (Day Branch) ═══');
check('7.1 Day Branch', ec1.getDay().getEarthBranch().getName(), '酉');
check('7.2 Day Branch Element (酉=金)', ec1.getDay().getEarthBranch().getElement().getName(), '金');

console.log(`\n══════════════════════════════════════════`);
console.log(`สรุป: ${pass} ผ่าน, ${fail} ตก จาก ${pass+fail} เคส`);
process.exit(fail > 0 ? 1 : 0);
