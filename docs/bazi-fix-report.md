# รายงานจุดที่ต้องแก้ — /bazi + หน้าหลัก (scoped)

> ผู้ใช้ระบุ: **ไม่แตะ core system · ปรับได้แค่ UI · ต้องการรายงานจุดที่ต้องแก้ · เป้าหมาย = เจาะปาจื้อแท้ (格局 เต็ม) ไม่หยาบ**
> รายงานนี้จัดจุดที่ต้องแก้เข้า layer + ชี้ว่าจุดไหนทำได้ในกรอบ "UI" จุดไหนติดข้อจำกัด

---

## ⚠️ ข้อค้นพบสำคัญ (ต้องตัดสินก่อนเริ่ม)

โค้ดนี้ **ไม่ได้แยก calculation / content / visual ออกจากกันเป็นชั้นๆ** — ไฟล์ engine ปน "ตัวเลข" กับ "ข้อความไทย" ในไฟล์เดียว. ผลคือ:

- **"ความหยาบ" ~80% ถูกปั้นใน `src/lib/` ไม่ใช่ใน `components/`** — component แค่ render string ที่ lib ส่งมา
- ถ้า **"แก้แค่ UI" = แตะแค่ `components/*`** → แก้ได้จริงแค่ ~20% (float, layout, split การแสดงผล) → **บรรลุเป้า "เจาะแท้" ไม่ได้**
- 格局 十神格 (正官格ฯลฯ) **ยังไม่มีในระบบเลย** — ต้องเพิ่ม interpretation logic ใหม่

## 3 Layers (เสนอนิยาม "core ห้ามแตะ")

| Layer | ไฟล์ | เนื้อหา | ข้อเสนอ |
|---|---|---|---|
| **L1 Calculation** (แม่น 100%, มี test/audit) | `calculate.ts` `strength.ts`(score) `luck.ts` `elements.ts`(นับ) `relationships.ts` `time.ts` `ten-gods.ts`(getTenGod) `stars.ts`(หาตำแหน่ง) `interactions.ts` `xkdg.ts` `structure.ts`(นับ+จัด 4 type) | ตรรกะคำนวณดวง | **🔒 ห้ามแตะ** (ผู้ใช้ lock — ถูกต้อง) |
| **L2 Content/Interpretation** | `narrative.ts` `archetypes.ts` + **string ไทย** ที่ฝังใน `types/bazi-gods-stars.ts`, `stars.ts`(nameTh), `useful-god.ts`(tips text), `structure.ts`(desc text) | แปลผล→ข้อความ | **นี่คือที่ "หยาบ" อยู่** — ต้องแก้ที่นี่ถึงจะได้ผล |
| **L3 Visual** | `components/bazi/*` `components/home/*` `app/bazi/page.tsx` | layout/render | แก้ได้ (float, split, จัดวาง) |

> **ประเด็นชี้ขาด:** เป้าหมาย "เจาะปาจื้อแท้ + 格局 เต็ม" **บังคับต้องแก้ L2** (และเพิ่ม interpretation ใหม่). ถ้ากรอบ "UI" = L3 เท่านั้น เป้าหมายเป็นไปไม่ได้

---

## จุดที่ต้องแก้ (Inventory)

### P0 — คุณภาพ/ถูกต้อง
| id | ปัญหา | ไฟล์:บรรทัด | Layer | แก้ใน L3-only ได้? |
|---|---|---|---|---|
| P0-1 | typo archetype เพียบ | `archetypes.ts` (ทั้งไฟล์) | L2 | ❌ ต้องแตะ L2 |
| P0-2 | 10 gods nameTh ผิด (正印/偏印="ทรัพย์สิน", 七杀 ตัวจีนหลุด) | `types/bazi-gods-stars.ts:98`, `ten-gods.ts:120` | L2 | ⚠️ override ใน component ได้ แต่ต้นตอที่ L2 |
| P0-3 | opening ซ้ำคำ | `narrative.ts:75-78` | L2 | ❌ |
| P0-4 | float ดิบ "3.599… ครั้ง" | `element-composition-view.tsx:73` | **L3** | ✅ **แก้ใน UI ล้วนได้** |
| P0-5 | applicationTips ยำบรรทัดเดียว | `useful-god.ts:375-401` (ปั้น), `useful-god-card.tsx:144` (แสดง) | L2+L3 | ⚠️ split แสดงใน L3 ได้ แต่ต้นตอ L2 |
| P0-6 | clash note ซ้ำ+รก โผล่ 3 ที่ | `strength.ts:261-325` | L1/L2 | ❌ |
| P0-7 | ดาวแปลผิด "เลื่อยควาย" | `stars.ts:135,147…` (nameTh) | L2 | ⚠️ override ใน L3 ได้ |
| P0-8 | structure desc ยัด summary + nested วงเล็บ | `structure.ts:403-411` | L2 | ⚠️ reformat L3 ได้บางส่วน |

### P1 — ตื้น/generic
| id | ปัญหา | ไฟล์ | Layer |
|---|---|---|---|
| P1-1 | บุคลิก/จุดแข็ง/อาชีพ = archetype ตาม day master ล้วน | `narrative.ts:80-131`, `archetypes.ts` | L2 |
| P1-2 | career intro ขัด bullets | `narrative.ts:116-131` | L2 |
| P1-3 | luck timeline ไม่ตีความดี/ร้าย | `luck-timeline.tsx` + ต้องมี favorability | L2(ใหม่)+L3 |

### P2 — ขาดหัวข้อ (ต้องเพิ่ม interpretation ใหม่)
ความรัก/คู่ครอง · การเงินเจาะ · สุขภาพ · จังหวะเวลา · ครอบครัว · **格局 十神格** → ทั้งหมดเป็น L2 (interpretation layer ใหม่)

---

## 格局 เต็ม + เจาะแท้ — ทำได้โดย "ไม่แตะ L1"

สร้าง **interpretation layer ใหม่** (ไฟล์ใหม่ เช่น `src/lib/bazi/reading/`) ที่ **อ่าน output ของ engine เดิม** (ten gods, month branch, structure, useful god, luck ที่ L1 คำนวณให้แล้ว) → classify 格局 + palace + life domains → ข้อความ. **ไม่แก้ไฟล์ L1 เลย → engine เดิมยังแม่น test ไม่พัง**. 格局 ที่ทำได้: 8 格 หลัก (正官/七杀/正偏财/正偏印/食神/伤官) + 建禄/羊刃

---

## 🔑 จุดที่ต้องให้คุณตัดสิน (ก่อนผมลงมือ/ทำรายงานละเอียดกว่านี้)

1. **นิยาม "UI/ไม่แตะ core" ที่แท้จริง:**
   - **(ก) แก้ L2+L3 ได้ ห้ามแตะ L1 (calculation)** → บรรลุเป้า "เจาะแท้" + engine แม่นเท่าเดิม ✅ *(ผมแนะนำ)*
   - **(ข) แก้ L3 เท่านั้น** → ได้แค่ float/layout/override บางคำ, "เจาะแท้/格局" ทำไม่ได้
2. **content strings ในไฟล์ L1 (เช่น `stars.ts` nameTh, `useful-god.ts` tips):** แก้ string ตรงๆ (ไม่แตะ logic คำนวณ — test ไม่พัง) หรือ override ใน L3?
3. **格局/depth เป็น interpretation layer ใหม่ (ไฟล์ใหม่ อ่าน engine):** โอเคไหม (ไม่นับเป็น "แตะ core")?
