// Content Library test — ตรวจ structure และครบของ curated data
import { TEN_GOD_MEANINGS, PALACE_MEANINGS, ELEMENT_HEALTH, RELATIONSHIP_APPLICATION, LUCK_PHASE_MEANING } from '../src/lib/bazi/content/index.ts';

let pass = 0, fail = 0;
function checkTrue(label, ok) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (ok) pass++; else fail++;
}

const ALL_TEN_GODS = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];

console.log('═══ TEN_GOD_MEANINGS ═══');

// ครบ 10 ten gods
checkTrue('1.1 ครบ 10 ten gods',
  ALL_TEN_GODS.every(g => TEN_GOD_MEANINGS[g] !== undefined));

// แต่ละ ten god มี field ครบ + ไม่ว่าง
for (const g of ALL_TEN_GODS) {
  const m = TEN_GOD_MEANINGS[g];
  checkTrue(`1.x ${g} nameTh ไม่ว่าง`, !!m.nameTh && m.nameTh.length > 0);
  checkTrue(`1.x ${g} essence ไม่ว่าง`, !!m.essence && m.essence.length > 0);
  checkTrue(`1.x ${g} personality >= 2 ข้อ`, Array.isArray(m.personality) && m.personality.length >= 2);
  checkTrue(`1.x ${g} career >= 1 ข้อ`, Array.isArray(m.career) && m.career.length >= 1);
  checkTrue(`1.x ${g} wealth >= 1 ข้อ`, Array.isArray(m.wealth) && m.wealth.length >= 1);
  checkTrue(`1.x ${g} relationship >= 1 ข้อ`, Array.isArray(m.relationship) && m.relationship.length >= 1);
  checkTrue(`1.x ${g} representatives >= 1`, Array.isArray(m.representatives) && m.representatives.length >= 1);
  checkTrue(`1.x ${g} caution ไม่ว่าง`, !!m.caution && m.caution.length > 0);
}

// nameTh ไม่ซ้ำกัน (unique)
const nameThs = ALL_TEN_GODS.map(g => TEN_GOD_MEANINGS[g].nameTh);
checkTrue('1.x nameTh ทั้ง 10 ไม่ซ้ำกัน', new Set(nameThs).size === 10);

// serializable
let serializable = true;
try { JSON.parse(JSON.stringify(TEN_GOD_MEANINGS)); } catch { serializable = false; }
checkTrue('1.x serializable', serializable);

// ── PALACE_MEANINGS ───────────────────────────────────────────────────
console.log('\n═══ PALACE_MEANINGS ═══');
const POSITIONS = ['year', 'month', 'day', 'hour'];
checkTrue('2.1 มี 4 palace', POSITIONS.every(p => PALACE_MEANINGS[p] !== undefined));
for (const pos of POSITIONS) {
  const pm = PALACE_MEANINGS[pos];
  checkTrue(`2.x ${pos} lifeDomain ไม่ว่าง`, !!pm.lifeDomain && pm.lifeDomain.length > 0);
}

// day (spouse) palace ต้องมี byTenGod ครบ 10 — เป็น heart ของการอ่านความรัก
const spouseByTenGod = PALACE_MEANINGS.day.byTenGod;
checkTrue('2.x spouse (day) palace มี byTenGod ครบ 10',
  ALL_TEN_GODS.every(g => typeof spouseByTenGod[g] === 'string' && spouseByTenGod[g].length > 0));

// element-health
console.log('\n═══ ELEMENT_HEALTH ═══');
const ELEMENTS = ['木', '火', '土', '金', '水'];
checkTrue('3.1 มี 5 ธาตุ', ELEMENTS.every(e => ELEMENT_HEALTH[e] !== undefined));
for (const e of ELEMENTS) {
  const h = ELEMENT_HEALTH[e];
  checkTrue(`3.x ${e} organs >= 1`, Array.isArray(h.organs) && h.organs.length >= 1);
  checkTrue(`3.x ${e} whenImbalanced ไม่ว่าง`, !!h.whenImbalanced && h.whenImbalanced.length > 0);
  // DOD: ห้ามฟันธงโรคร้ายแรง — framing ต้องเป็น "มัก/สังเกต/ควร"
  checkTrue(`3.x ${e} whenImbalanced มี framing probabilistic (มัก/ควร/สังเกต)`,
    /มัก|ควร|สังเกต/.test(h.whenImbalanced));
}

// ── RELATIONSHIP_APPLICATION + LUCK_PHASE ─────────────────────────────
console.log('\n═══ RELATIONSHIP_APPLICATION ═══');
const RELS = ['resource', 'companion', 'output', 'wealth', 'power'];
checkTrue('4.1 มี 5 relationship', RELS.every(r => RELATIONSHIP_APPLICATION[r] !== undefined));
for (const r of RELS) {
  const a = RELATIONSHIP_APPLICATION[r];
  checkTrue(`4.x ${r} asUsefulGod ไม่ว่าง`, !!a.asUsefulGod && a.asUsefulGod.length > 0);
  checkTrue(`4.x ${r} timingNote ไม่ว่าง`, !!a.timingNote && a.timingNote.length > 0);
}

console.log('\n═══ LUCK_PHASE_MEANING ═══');
const FAVS = ['favorable', 'neutral', 'unfavorable'];
checkTrue('5.1 มี 3 favorability', FAVS.every(f => LUCK_PHASE_MEANING[f] !== undefined));
for (const f of FAVS) {
  const m = LUCK_PHASE_MEANING[f];
  checkTrue(`5.x ${f} description ไม่ว่าง`, !!m.description && m.description.length > 0);
  checkTrue(`5.x ${f} advice ไม่ว่าง`, !!m.advice && m.advice.length > 0);
}
// unfavorable advice ต้องไม่ฟันธงร้ายแรง (framing ผ่านช่วง)
checkTrue('5.x unfavorable ไม่ฟันธงร้ายแรง (มีคำว่า ผ่าน/ระวัง/เร็ว)',
  /ระวัง|ผ่าน|เร็ว|คอย/.test(LUCK_PHASE_MEANING.unfavorable.advice));

console.log(`\n═══ SUMMARY ═══\n✅ Passed: ${pass}\n❌ Failed: ${fail}\nTotal: ${pass + fail}`);
process.exit(fail > 0 ? 1 : 0);
