import { generateQiMenChart } from '../src/lib/qimen/chart.js';

const chart = generateQiMenChart(2024, 6, 21, 12, 0, 'hour');

console.log('\n═══ Qi Men Chart: 2024-06-21 12:00 (夏至 午时) ═══');
console.log(`\n定局: ${chart.dun} ${chart.ju}局 (${chart.yuan})`);
console.log(`节气: ${chart.term}`);
console.log(`时支: ${chart.hourBranch}`);
console.log(`旬首: ${chart.xunShou}`);
console.log(`值符: ${chart.zhiFuStem}`);
console.log(`值使: ${chart.zhiShiDoor}\n`);

console.log('═══ 九宫 ═══');
for (const palace of chart.palaces) {
  const zhiFu = palace.isZhiFu ? ' [值符]' : '';
  const zhiShi = palace.isZhiShi ? ' [值使]' : '';
  console.log(
    `宫${palace.palaceNumber} (${palace.bagua}): ` +
    `地${palace.earthStem || '空'} 天${palace.heavenStem || '空'} | ` +
    `星${palace.star} | 门${palace.door} | 神${palace.deity}` +
    `${zhiFu}${zhiShi}`
  );
}

console.log('\n═══ Rotation Verification ═══');
const zhiFuPalace = chart.palaces.find(p => p.isZhiFu);
const hourBranchPalace = { '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4, '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6 }[chart.hourBranch];
const earthAtHourPalace = chart.palaces.find(p => p.palaceNumber === hourBranchPalace);

console.log(`✓ 值符宫: ${zhiFuPalace.palaceNumber} (${zhiFuPalace.bagua})`);
console.log(`✓ 值符天干: ${zhiFuPalace.heavenStem}`);
console.log(`✓ 时支宫: ${hourBranchPalace}`);
console.log(`✓ 时支宫地盘: ${earthAtHourPalace.earthStem}`);
console.log(`✓ 天盘旋转验证: 值符天干 = 时支宫地盘 → ${zhiFuPalace.heavenStem === earthAtHourPalace.earthStem ? '✓ CORRECT' : '✗ ERROR'}`);

const zhiFuEarthPalace = chart.palaces.find(p => p.earthStem === chart.zhiFuStem);
console.log(`✓ 值符地盘宫: ${zhiFuEarthPalace.palaceNumber}`);
console.log(`✓ 值符星 (should be 天心 for 乾宫): ${zhiFuPalace.star}`);
