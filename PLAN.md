# 📜 แผนงานโปรเจค myBaZi — ระบบดวงจีนครบวงจร

> เป้าหมาย: **"เว็บปาจื้อแบบสมบูรณ์ — ระบบที่ดีที่สุด แม่นยำสุด ใช้งานได้ทุกวัน"**
> รวมทุกศาสตร์จีนในแอปเดียว: BaZi (ดวงจีน) + Tong Shu (ปฏิทินมงคล) + Qi Men Dun Jia (ฉีเหมือน) + 天机 (เทียนจี) AI

---

## 🧱 การตัดสินใจด้านสถาปัยกรรม (Architecture Decisions)

| ด้าน | ที่เลือก | เหตุผล |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + TypeScript | API Routes สำหรับ 天机 server-side calc (Zero Hallucination), SEO, deploy ง่าย |
| **UI** | Tailwind CSS + shadcn/ui | สวย คงที่ เร็ว |
| **BaZi/Tong Shu Engine** | `tyme4ts` (Tyme4 for TypeScript) | ไลบรารีคำนวณปฏิทินจีนที่แม่นที่สุด รองรับ BaZi + 24 solar terms + 28 กลุ่มดาว + 12 Day Officers + 12 Build Stars + Xuan Kong Da Gua ครบ — ครอบโมดูล 1 & 2 |
| **Qi Men Dun Jia Engine** | คำนวณเอง (เพราะ lib สำเร็จน้อย) + validate กับตำรา | รองรับ 4 chart types ครบ |
| **天机 (เทียนจี) AI** | OpenAI-compatible client (fetch `/chat/completions`) | ผู้ใช้ระบุ endpoint + api_key เอง |
| **Storage** | localStorage (+ IndexedDB สำหรับ cache ใหญ่) | หลายโปรไฟล์ ไม่ login เริ่มเร็ว ปลอดภัย (ข้อมูลไม่ออกจากเครื่อง) |
| **ภาษา UI** | ไทยเป็นหลัก + ตัวจีน + พินอิน | ตาม requirement |

---

## 🗺️ ภาพรวม Phase (6 Phase)

```
Phase 0: Foundation (พื้นฐาน + โครงสร้าง)
   ↓
Phase 1: BaZi Engine Core (หัวใจ — ต้องแม่น 100%)
   ↓
Phase 2: BaZi UI (หน้าตาโมดูล 1)
   ↓
Phase 3: Tong Shu (ปฏิทินมงคล — โมดูล 2)
   ↓
Phase 4: Qi Men Dun Jia (โมดูล 3)
   ↓
Phase 5: 天机 (เทียนจี) AI (โมดูล 4)
   ↓
Phase 6: Polish & Production (ทดสอบ + deploy)
```

**หลักการ:** ทำทีละ Phase ทีละ Task (ไม่ทำพร้อมกันเกินไป) — ทำเสร็จแต่ละ Task ต้องผ่าน DOD จริง ๆ ก่อนไปต่อ

---

## Phase 0: Foundation (พื้นฐาน)

### Task 0.1 — Init Next.js 15 project
**งาน:** สร้างโปรเจค Next.js 15 + TypeScript + Tailwind + ESLint
**DOD:**
- [ ] `pnpm dev` รันได้ ขึ้นหน้า default ที่ `localhost:3000`
- [ ] มี `tsconfig.json` strict mode
- [ ] มี `.gitignore`, `.editorconfig`
- [ ] โครงสร้างโฟลเดอร์ตามสถาปัยกรรม (`src/app`, `src/lib`, `src/components`)

### Task 0.2 — ติดตั้ง shadcn/ui + ไลบรารีหลัก
**งาน:** setup shadcn/ui, ติดตั้ง `tyme4ts`, `date-fns`, `lucide-react`, `zustand`
**DOD:**
- [ ] shadcn/ui CLI รันได้ เพิ่ม component Button/Card ได้
- [ ] `tyme4ts` import ได้ ทดสอบคำนวณวันง่าย ๆ ผ่าน
- [ ] มีไฟล์ theme (light/dark)

### Task 0.3 — Layout หลัก + Navigation + Theme
**งาน:** layout มี sidebar/tab สำหรับ 4 โมดูล + เลือก profile + dark/light mode
**DOD:**
- [ ] นำทางระหว่าง 4 โมดูลได้ (BaZi / Tong Shu / Qi Men / 天机)
- [ ] มีหน้า Settings (สำหรับใส่ AI endpoint + api_key ภายหลัง)
- [ ] responsive (มือถือ + desktop)

### Task 0.4 — Profile Management (หลายโปรไฟล์ ไม่ login)
**งาน:** ระบบสร้าง/แก้/ลบ/เลือก profile เก็บใน localStorage
**DOD:**
- [ ] สร้าง profile (ชื่อ + วันเวลาเกิด + เพศ + โซนเวลา)
- [ ] แก้/ลบ profile ได้
- [ ] เลือก profile ที่ active แล้ว persist ข้าม refresh
- [ ] มี type ที่ปลอดภัย (`Profile` interface)
- [ ] หน้า empty state ชวนสร้าง profile แรก

> ✅ เมื่อ Phase 0 เสร็จ = มี "กระดูกสันหลัง" พร้อมรับ BaZi engine

---

## Phase 1: BaZi Engine Core (หัวใจ — แม่น 100%)

> ⚠️ Phase นี้สำคัญที่สุด เพราะโมดูลอื่น (Tong Shu, 天机) อิงผลลัพธ์จาก BaZi
> ทุกฟังก์ชันต้องมี **unit test** เทียบกับเคสจริงที่รู้คำตอบ

### Task 1.1 — Validate `tyme4ts` แม่นยำ
**DOD:**
- [ ] ทดสอบ 4 pillars ของวันเวลาเกิดตัวอย่าง 5+ เคส เทียบกับที่ผู้เชี่ยวชาญยืนยัน
- [ ] ทดสอบ 24 solar terms (JieQi) แม่น
- [ ] ทดสอบการคำนวณ Luck Pillars (เสาโชค)
- [ ] บันทึกผล test ไว้ใน `docs/validation.md`

### Task 1.2 — BaZi calculator service
**งาน:** สร้าง `src/lib/bazi/calculate.ts` คำนวณ 4 pillars จาก profile
**DOD:**
- [ ] input: วันเวลาเกิด + เพศ + โซนเวลา
- [ ] output: Year/Month/Day/Hour pillar (Stem+Branch + Hidden Stems)
- [ ] จัดการโซนเวลาถูกต้อง (true solar time optional ในภายหลัง)
- [ ] unit test ครบ

### Task 1.3 — Day Master + Strength (4 ระดับ)
**DOD:** วิเคราะห์เจ้าวัน + ประเมินแข็ง/อ่อน (Very Strong/Strong/Weak/Very Weak) พร้อมเหตุผล (season/support/clashes)

### Task 1.4 — Structure Analysis
**DOD:** จำแนก Normal / Follower / Vibrant / Special + อธิบาย

### Task 1.5 — Useful God
**DOD:** คำนวณธาตุที่เป็นประโยชน์ + อธิบายเหตุผล (อิง strength + structure)

### Task 1.6 — Hidden Stems + 10 Gods + Stars
**DOD:** hidden stems ทั้งหมด, 10 Gods (十神) ในแต่ละตำแหน่ง, ดาวมงคล/อัปมงคล

### Task 1.7 — Luck Pillars + Annual + Transit
**DOD:** เสาโชค 10 ปี (เริ่มต้นตามเพศ+ปี), ดวงรายปี, transit pillars

### Task 1.8 — Xuan Kong Da Gua (64 Hexagrams) per pillar
**DOD:** hexagram ของแต่ละ pillar (number + ธาตุ + period)

### Task 1.9 — Element Composition (5 ธาตุ)
**DOD:** นับสัดส่วน 5 ธาตุ (木火土金水) ใน chart + คะแนน

> ✅ เมื่อ Phase 1 เสร็จ = มี engine ที่แม่น 100% พร้อมแสดงผล

---

## Phase 2: BaZi UI (โมดูล 1)

Tasks: Natal Chart, Day Master Insight (มีรูป), Strength detail, Structure detail, Useful God detail, Destiny Matrix (Archetypes + Elements), Luck Pillars view, Stars view, 64 Hexagrams view
**DOD รวม:** ทุกหน้าดึงข้อมูลจาก engine ของ Phase 1 แสดงภาษาไทย+จีน+พินอิน เข้าใจง่าย

---

## Phase 3: Tong Shu — ปฏิทินมงคล (โมดูล 2)

Tasks: Calendar view, 12 Day Officers, Day Stars + score, Yellow/Black Belt, 28 Constellations, XKDG per day, Personal Resonance, Element Alignment, Hour Pillars
**DOD รวม:** เลือกวันได้ แสดงข้อมูลครบ และ personal resonance กับ profile active

---

## Phase 4: Qi Men Dun Jia (โมดูล 3)

Tasks: 9-Palace engine (Star/Door/Deity/Stem), 4 chart types (hour/day/month/year), Date/Time picker, Destiny View, Deity Insight (มีรูป), Summary cards
**DOD รวม:** ผัง 9 ช่องครบถ้วน ถูกต้องตามตำรา สลับ chart type ได้

---

## Phase 5: 天机 (เทียนจี) AI (โมดูล 4)

### Task 5.1 — OpenAI-compatible client + Settings UI
**DOD:** ใส่ endpoint + api_key + model ใน Settings (เก็บ localStorage), ทดสอบเชื่อมจริง

### Task 5.2 — BaZi Context Builder (สำคัญมาก)
**งาน:** แปลงข้อมูลดวง (4 pillars + ธาตุ + 10 gods + stars + hidden stems + ปฏิสัมพันธ์ธาตุ ชง/รวม/ทำลาย) เป็น context ภาษาไทย
**DOD:** context ครบตาม requirement "Rich BaZi Context" + แปลไทยหมด

### Task 5.3 — Zero Hallucination Engine (3 ชั้น)
**ชั้นที่ 1:** ข้อมูลเสาวันนี้ฉีดตรงเข้า prompt
**ชั้นที่ 2:** ดวงวันอื่น ๆ ใช้เครื่องมือคำนวณ server-side (server action) ที่แม่น 100%
**ชั้นที่ 3:** system prompt สั่งชัด — ห้ามเดา ถ้าไม่แน่ใจให้บอก
**DOD:** ทดสอบ 3 เคสที่มัก hallucinate → AI ตอบถูก/ปฏิเสธตอบ

### Task 5.4 — Chat UI + Transit Forecasting
**DOD:** ถาม-ตอบได้ ถามเรื่องอนาคต (เดือนหน้า/ปี 2026) ได้ อ้างอิงดวงจริง

---

## Phase 6: Polish & Production

- Task 6.1: Regression test ความแม่นยำทั้งระบบ
- Task 6.2: PWA (ใช้งานได้ทุกวัน ทั้งออนไลน์/ออฟไลน์) + SEO + performance
- Task 6.3: 🔒 Security review (โดยเฉพาะการเก็บ api_key ใน localStorage — จะแจ้งความเสี่ยง)
- Task 6.4: Deploy (Vercel หรือตามที่คุณเลือก)

---

## 🔁 วงจรการทำงานต่อ Task (Loop Engineering)

```
สำหรับแต่ละ Task:
  1. spawn agent (executor) ทำงานตาม DOD
  2. ตรวจสอบ DOD จริง (verifier / ผมเอง)
  3. ถ้า fail → ใช้ error เป็น feedback → แก้ซ้ำจนผ่าน
  4. สรุปรายงาน Task
  5. ไป Task ถัดไป
```

## 🔒 หมายเหตุด้าน Security (จะแจ้งละเอียดตอนเจอ)
- เก็บ `api_key` ใน localStorage = **เสี่ยง** ถ้าเครื่องถูกแอบเข้า จะแนะนำทางลดความเสี่ยงใน Task 5.1
- ข้อมูล profile (วันเกิด) ไม่ส่งออกจากเครื่องยกเว้นไปยัง AI endpoint ที่คุณกำหนด
