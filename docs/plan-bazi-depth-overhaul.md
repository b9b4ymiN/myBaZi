# แผนยกเครื่อง /bazi — จาก "ดูธาตุหยาบๆ" → "อ่านปาจื้อแท้ (子平)"

> **เป้าหมายสูงสุด (ผู้ใช้ระบุ):** แก้ให้ **เจาะปาจื้อแท้จริง** ไม่ใช่ข้อมูลหยาบๆ แบบปัจจุบัน
> Baseline (BEFORE) เก็บที่ `docs/baseline/` — problem inventory + engine snapshot เคสอ้างอิง

---

## 1. ทำไมปัจจุบัน "หยาบ" (root cause เชิงศาสตร์)

ระบบตอนนี้อ่านดวงจาก **day master element → archetype (10 แบบ)** เท่านั้น:
- คนเจ้าวัน 丙 ทุกคนได้คำอธิบายเดียวกันหมด ไม่ว่าเดือนเกิด/ธาตุอื่น/ความสัมพันธ์ในดวงจะต่างกันแค่ไหน
- นี่คือการดูดวง **ระดับตื้นสุด** (เทียบเท่า "ดูราศีเกิด") — ไม่ใช่การอ่านปาจื้อ
- Engine คำนวณ 10 gods / structure / useful god / stars ได้ **แต่ narrative แทบไม่ใช้** (ดู baseline P1)

**ปาจื้อแท้ (子平命理) อ่านจากอะไร:** นักปาจื้อไม่ได้ดู "ธาตุเจ้าวัน" เป็นหลัก แต่ดู **ความสัมพันธ์ทั้งดวง** ผ่าน 4 แกน:

| แกน | คืออะไร | บอกอะไร |
|---|---|---|
| **十神 Ten Gods** | ความสัมพันธ์ของทุก stem/branch กับเจ้าวัน (官/杀/财/印/食/伤/比/劫) | อาชีพ, เงิน, คู่, พ่อแม่, ลูก, อำนาจ, ความคิด — เป็น "แกนกลาง" ของการอ่าน |
| **格局 Structure** | รูปแบบดวงจาก 月令 (เดือน) + สิบเทพเด่น | เส้นทางชีวิต + วิธีใช้ดวง (正官格 ≠ 伤官格 ≠ 从财格) |
| **宫位 Palace** | ตำแหน่งเสาแทนด้านชีวิต | ปี=พ่อแม่/บรรพบุรุษ · เดือน=อาชีพ/พี่น้อง · **วัน(กิ่ง)=คู่ครอง** · ยาม=ลูก/บั้นปลาย |
| **用神 Useful God (ในบริบท)** | ธาตุที่ช่วยดวง + **ทำหน้าที่อะไร มีในดวงไหม แต่ละ 大运 เติมไหม** | จุดโฟกัสชีวิต + จังหวะรุ่ง/ระวัง |

→ ความ "แท้/ลึก" มาจากการ **อ่าน 4 แกนนี้เชื่อมกันเป็นเรื่องเดียว** ต่อ life domain — ไม่ใช่จากการแต่งคำให้สวย

---

## 2. "ทำแบบไหนดีที่สุด" — Architecture Decision

### เลือก: **Deterministic Interpretation Engine + Curated 子平 Content Library**
สร้าง **ชั้นตีความ (interpretation layer)** ใหม่ที่อ่าน chart features (สิบเทพเด่น, 格局, palace, 用神, ปฏิสัมพันธ์) แล้วประกอบข้อความจาก **library ที่เขียนอิงตำราปาจื้อ** (子平真诠/滴天髓 style) เป็น deterministic rules — **ไม่ใช่ AI generate**

### เทียบทางเลือก

| แนวทาง | ลึก/แท้ | Deterministic | Zero-halluc. | Offline/ไม่ต้อง key | ตัดสิน |
|---|:---:|:---:|:---:|:---:|:---:|
| **A. Rule-based interpretation engine + curated library** | ✅ สูง | ✅ | ✅ | ✅ | ✅ **เลือก** |
| B. Hybrid: engine facts → AI เรียบเรียง | ✅ สูง | ⚠️ | ⚠️ | ❌ | ต่อยอดที่ 天机 |
| C. Pure AI อ่านดวงเอง | ✅ | ❌ | ❌ เสี่ยงมาก | ❌ | ตัดทิ้ง |

**เหตุผลที่ A ดีที่สุดสำหรับหน้า /bazi:**
1. **ความลึกมาจาก "จำนวน rule/มิติการอ่าน" ไม่ใช่จาก AI** — นักปาจื้อเก่งเพราะรู้กฎเยอะ+ อ่านองค์รวม ซึ่งเลียนแบบด้วย rule engine ได้ 100% deterministic
2. หน้า natal analysis ต้อง **reproducible + เชื่อถือได้ + ใช้ทุกวัน (PWA offline)** — AI ให้ผลต่างทุกครั้ง ไม่เหมาะ
3. คุม **คุณภาพภาษาไทย 100%** (แก้ "หยาบ" ที่ต้นตอ ไม่เสี่ยง AI พิมพ์มั่ว)
4. คงหลัก **Zero Hallucination** ของโปรเจค (narrative.ts contract + CLAUDE.md)
5. **ต่อยอดได้:** engine ผลิต "structured interpretation facts" → 天机 (Level B) เอาไปเรียบเรียง holistic เชิงสนทนาได้ภายหลัง โดยไม่ต้องรื้อ

### แบ่งหน้าที่ให้ชัด
- **/bazi = การอ่านปาจื้อแท้ (deterministic, ครบ, เชื่อถือได้)** ← งานหลักของแผนนี้
- **/tianji (天机) = สนทนาเจาะลึกเฉพาะเรื่อง** (ต่อยอด รับ facts จาก engine) ← นอก scope แผนนี้

---

## 3. มิติความลึกที่จะเพิ่ม (จาก element → 子平)

1. **Ten Gods profiling ครบดวง** — นับ 10 เทพจากทุก stem + hidden stem ทุกกิ่ง, จัดอันดับเด่น/ขาด → "ดวงนี้หนักไปทาง 财/官/印/食伤/比劫 อะไร"
2. **格局 (十神格)** — ระบุ格จาก 月令 + เด่น (正官格 / 七杀格 / 正偏财格 / 正偏印格 / 食神格 / 伤官格 / 建禄羊刃) → บุคลิก + เส้นทาง + วิธีใช้
3. **宫位 Palace reading** — อ่าน ten god + ธาตุในแต่ละเสา → พ่อแม่/พี่น้อง/**คู่ครอง (วันกิ่ง)**/ลูก
4. **用神 in context** — 扶抑/调候, มีในดวงไหม, luck ไหนเติม
5. **大运流年 timing** — luck pillar เทียบ 用神/忌神 → ช่วงรุ่ง/ช่วงระวัง (ตอนนี้มีข้อมูลแต่ไม่ตีความ)
6. **刑冲合会** — ผลปฏิสัมพันธ์ต่อ palace/strength
7. **Holistic life-domain synthesis** — ร้อย 4 แกนเป็นเรื่องต่อด้าน: **บุคลิก · การงาน · การเงิน · ความรัก/คู่ · สุขภาพ · จังหวะเวลา · ครอบครัว**

> Core (ทำก่อน): 1,3,4,5,7 → ยกระดับ "แท้" ชัดทันที
> Advanced (เฟสถัดไป): 2 (格局เต็มทุกเคส), 6 (combinations ละเอียด)

---

## 4. Phases / Tasks / DOD  (priority = ความลึกก่อน)

**Execution:** ทำทีละ task · task ใหญ่/แยกได้ → spawn executor agent · **ผม verify DOD เองทุก task** (รัน test + เปิดหน้าจริงเทียบ baseline ไม่เชื่อ report agent) · error → ใช้เป็น feedback แก้จนผ่าน

### Phase A — Quick Quality Wins (P0 ที่เห็นผลทันที, ไม่รอ rebuild)
- **A.1** แก้คำแปล 10 Gods ให้ถูก (`TEN_GOD_THAI` + ลบ `getTenGodThai` ซ้ำ) — DOD: 正印/偏印=印(ตรา/ความรู้/อุปถัมภ์), 官杀=อำนาจ, ไม่มีตัวจีนหลุด, nameTh ตรง description
- **A.2** float round + opening ซ้ำคำ + clash dedupe + applicationTips จัดโครงสร้าง — DOD: หน้าจริงไม่มี "3.599…"/"แข็ง: แข็ง", tips อ่านเป็นระเบียบ
- **A.3** typo sweep `archetypes.ts` + `stars.ts` — DOD: อ่านทั้งไฟล์ไม่เจอคำมั่ว, 羊刃=Blade/คมดาบ

### Phase B — Engine Depth (pure functions, ไม่แตะ UI)
- **B.1** `analyzeTenGodProfile()` — นับครบดวง + จัดอันดับเด่น/ขาด/โครงเด่น (财/官/印/食伤/比劫) — DOD: unit test เคส 丙/丁 ให้ผลถูก + serializable
- **B.2** `analyzePalace()` — ten god + ธาตุต่อเสา + map life-domain (โดยเฉพาะ spouse palace = วันกิ่ง) — DOD: test คู่ครองจาก day branch ถูก
- **B.3** `analyzeLuckFavorability()` — เทียบ 用神/忌神 ต่อ pillar+annual → รุ่ง/กลาง/ระวัง — DOD: test เคสอ้างอิง 用神金 → ช่วงธาตุ金/水 = รุ่ง
- **B.4** `analyzeStructurePattern()` (格局 十神格) *[advanced — อาจเลื่อน]* — DOD: classify 8 格 หลัก + fallback

### Phase C — Curated 子平 Content Library (`src/lib/bazi/content/`)
- **C.1** schema + โครงสร้าง + index — DOD: typed, มี test harness
- **C.2** `ten-god-meanings` (10 เทพ × {บุคลิก, การงาน, การเงิน, ความสัมพันธ์, บุคคลตัวแทน}) อิงตำรา — DOD: ครบ 10, ผมรีวิว + คุณอนุมัติ sample
- **C.3** `palace-meanings` + `element-health` (ธาตุเสีย → อวัยวะ, กรอบระวังไม่ฟันธงโรค) — DOD: ครบ, ผ่านรีวิว
- **C.4** `useful-god-application` + `luck-phase` (คำอธิบายช่วงรุ่ง/ระวัง) — DOD: ครบ

### Phase D — Interpretation Engine + Narrative v2
- **D.1** `interpret.ts` — อ่าน engine features → เลือก/ประกอบ content blocks (deterministic) — DOD: pure, test
- **D.2** narrative v2 = **7 หัวข้อชีวิต** (บุคลิก/งาน/เงิน/รัก/สุขภาพ/จังหวะเวลา/ครอบครัว) ผูกดวงจริง — DOD: 丙 vs 丁 ได้เนื้อหา **ต่างกันจริง**, zero-halluc test ผ่าน, ไม่ฟันธงสุขภาพร้ายแรง
- **D.3** luck timeline ตีความรุ่ง/ระวังต่อ pillar — DOD: แต่ละ pillar มี label favorability

### Phase E — UI (/bazi + หน้าหลัก)
- **E.1** components หัวข้อชีวิตใหม่ + **E.2** HomeHub ดึง insight ใหม่ + **E.3** responsive/polish — DOD: หน้าจริงแสดงครบ, mobile/desktop ok, ไม่มี hydration error

### Phase F — Safety Net + Verify + Regression
- **F.1** Setup Playwright (`@playwright/test`, config baseURL, visual+smoke `/bazi` `/`) — DOD: `pnpm exec playwright test` ผ่าน, จับ snapshot ได้ *(หมายเหตุ: จับ before-snapshot ต้นเฟส E ถ้าจะเทียบภาพ)*
- **F.2** unit tests รวม (interpret/content/ten-god-profile) — DOD: เขียว
- **F.3** `the usual` (lint→typecheck→test→build) + เปิดหน้าจริงเทียบ baseline + rerun `capture-baseline` (after) — DOD: ทุก gate เขียว, engine เคส 1993 ยัง 丙寅 (ไม่ regress), before/after เทียบชัด

---

## 5. Non-goals / Risk / Security
- **Non-goals:** ไม่แตะ engine calculation หลัก (4 เสา/strength แม่นแล้ว), ไม่ AI-generate หน้า static, ไม่ทำ tongshu/qimen/tianji, ไม่เปลี่ยน storage/profile schema
- **Risk:** เนื้อหา 子平 ต้องแม่น → research ต่อ task + คุณรีวิว sample ก่อนขยาย · combinatorial → ใช้ building blocks (compose ไม่ใช่ full matrix) · Playwright บน WSL → task F.1 verify แยก
- **Security:** ไม่แตะ api_key/credential. Playwright = dev dependency เท่านั้น. เจอ risk จะแจ้งทันที

---

## 6. คำถามก่อนเริ่ม
1. ระดับความลึก: เอา **Core (B.1–B.3, D)** ก่อนให้เห็นผลไว แล้วค่อยเสริม 格局 (B.4) ทีหลัง — หรืออยากได้ 格局เต็มตั้งแต่แรก?
2. ลำดับ: เริ่ม **Phase A (quick wins เห็นผลทันที)** หรือกระโดดเข้า **Phase B (depth)** เลย?
