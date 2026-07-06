// Test Six Relatives (六亲) - ดาวครอบครัวแบบมีเพศ
import { getSpouseStar, getRelativeStar, getSixRelatives } from '../src/lib/bazi/six-relatives.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST 1: getSpouseStar (ดาวคู่) ═══');
check('1.1 getSpouseStar("male")', getSpouseStar("male"), ["偏财", "正财"]);
check('1.2 getSpouseStar("female")', getSpouseStar("female"), ["七杀", "正官"]);

console.log('\n═══ TEST 2: getRelativeStar - father (ดาวบิดา) ═══');
check('2.1 getRelativeStar("father", "male")', getRelativeStar("father", "male"), ["偏财"]);
check('2.2 getRelativeStar("father", "female")', getRelativeStar("father", "female"), ["正财"]);

console.log('\n═══ TEST 3: getRelativeStar - mother (ดาวมารดา) ═══');
check('3.1 getRelativeStar("mother", "male")', getRelativeStar("mother", "male"), ["正印"]);
check('3.2 getRelativeStar("mother", "female")', getRelativeStar("mother", "female"), ["偏印"]);

console.log('\n═══ TEST 4: getRelativeStar - son (ดาวบุตรชาย) ═══');
check('4.1 getRelativeStar("son", "male")', getRelativeStar("son", "male"), ["七杀"]);
check('4.2 getRelativeStar("son", "female")', getRelativeStar("son", "female"), ["食神"]);

console.log('\n═══ TEST 5: getRelativeStar - daughter (ดาวบุตรี) ═══');
check('5.1 getRelativeStar("daughter", "male")', getRelativeStar("daughter", "male"), ["正官"]);
check('5.2 getRelativeStar("daughter", "female")', getRelativeStar("daughter", "female"), ["伤官"]);

console.log('\n═══ TEST 6: getRelativeStar - sibling (ดาวพี่น้อง) ═══');
check('6.1 getRelativeStar("sibling", "male")', getRelativeStar("sibling", "male"), ["比肩", "劫财"]);
check('6.2 getRelativeStar("sibling", "female")', getRelativeStar("sibling", "female"), ["比肩", "劫财"]);

console.log('\n═══ TEST 7: getSixRelatives("male") - ตารางครบ ═══');
const maleTable = getSixRelatives("male");
console.log('Male table:', JSON.stringify(maleTable, null, 2));
check('7.1 male.spouse', maleTable.spouse, ["偏财", "正财"]);
check('7.2 male.father', maleTable.father, ["偏财"]);
check('7.3 male.mother', maleTable.mother, ["正印"]);
check('7.4 male.son', maleTable.son, ["七杀"]);
check('7.5 male.daughter', maleTable.daughter, ["正官"]);
check('7.6 male.sibling', maleTable.sibling, ["比肩", "劫财"]);

console.log('\n═══ TEST 8: getSixRelatives("female") - ตารางครบ ═══');
const femaleTable = getSixRelatives("female");
console.log('Female table:', JSON.stringify(femaleTable, null, 2));
check('8.1 female.spouse', femaleTable.spouse, ["七杀", "正官"]);
check('8.2 female.father', femaleTable.father, ["正财"]);
check('8.3 female.mother', femaleTable.mother, ["偏印"]);
check('8.4 female.son', femaleTable.son, ["食神"]);
check('8.5 female.daughter', femaleTable.daughter, ["伤官"]);
check('8.6 female.sibling', femaleTable.sibling, ["比肩", "劫财"]);

console.log('\n═══ TEST 9: ตรวจจำนวน keys และความสมบูรณ์ ═══');
check('9.1 male table has 6 roles', Object.keys(maleTable).length, 6);
check('9.2 female table has 6 roles', Object.keys(femaleTable).length, 6);
check('9.3 all male roles present', JSON.stringify(Object.keys(maleTable).sort()), JSON.stringify(["spouse", "father", "mother", "son", "daughter", "sibling"].sort()));
check('9.4 all female roles present', JSON.stringify(Object.keys(femaleTable).sort()), JSON.stringify(["spouse", "father", "mother", "son", "daughter", "sibling"].sort()));

console.log('\n═══ TEST 10: ตรวจไม่เป็น reference เดียวกัน (immutability) ═══');
const spouse1 = getSpouseStar("male");
const spouse2 = getSpouseStar("male");
spouse1.push("TEST"); // แก้ไข array ตัวแรก
check('10.1 spouse arrays are independent (ค่าไม่แพร้กระจาย)', spouse2.includes("TEST"), false);

const relative1 = getRelativeStar("father", "male");
const relative2 = getRelativeStar("father", "male");
relative1.push("TEST");
check('10.2 relative arrays are independent', relative2.includes("TEST"), false);

const table1 = getSixRelatives("male");
const table2 = getSixRelatives("male");
table1.spouse.push("TEST");
check('10.3 table arrays are independent', table2.spouse.includes("TEST"), false);

console.log('\n═══ SUMMARY ═══');
console.log(`✅ ${pass}/${pass + fail} passed`);
if (fail > 0) {
  console.log(`❌ ${fail} failed`);
  process.exit(1);
}
