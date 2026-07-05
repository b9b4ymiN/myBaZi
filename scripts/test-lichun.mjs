import { SolarDay } from 'tyme4ts';

// Test Li Chun 2024
const solarDay = SolarDay.fromYmd(2024, 2, 4);
const lunarDay = solarDay.getLunarDay();
const lunarMonth = lunarDay.getLunarMonth();
const lunarYear = lunarMonth.getLunarYear();

console.log('Solar Date: 2024-02-04');
console.log('Term:', solarDay.getTerm()?.getName());
console.log('Lunar Year Sixty Cycle:', lunarYear.getSixtyCycle().getName());
console.log('Lunar Month:', lunarMonth.getName());
console.log('Lunar Day:', lunarDay.getName());

// Check the next day
const nextDay = SolarDay.fromYmd(2024, 2, 5);
const nextLunarDay = nextDay.getLunarDay();
const nextLunarMonth = nextLunarDay.getLunarMonth();
const nextLunarYear = nextLunarMonth.getLunarYear();

console.log('\nSolar Date: 2024-02-05');
console.log('Term:', nextDay.getTerm()?.getName());
console.log('Lunar Year Sixty Cycle:', nextLunarYear.getSixtyCycle().getName());

// Check after Li Chun
const afterDay = SolarDay.fromYmd(2024, 2, 10);
const afterLunarDay = afterDay.getLunarDay();
const afterLunarMonth = afterLunarDay.getLunarMonth();
const afterLunarYear = afterLunarMonth.getLunarYear();

console.log('\nSolar Date: 2024-02-10');
console.log('Term:', afterDay.getTerm()?.getName());
console.log('Lunar Year Sixty Cycle:', afterLunarYear.getSixtyCycle().getName());
