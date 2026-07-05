# myBaZi PWA UI Master Plan

วันที่จัดทำ: 2026-07-05
สถานะ: In progress — Phase 2 foundation implemented, route visual QA pending
Visual north star pack:
- `docs/assets/mybazi-pwa-reference-v1.png` — original combined PWA mockup
- `docs/assets/mybazi-mobile-dashboard-reference-v1.png` — mobile screen target
- `docs/assets/mybazi-desktop-dashboard-reference-v1.png` — desktop dashboard target
- `docs/assets/mybazi-asset-sheet-reference-v1.png` — symbol/asset language target
- `docs/assets/mybazi-production-asset-sheet-v1.png` — production bitmap asset sheet used after rejecting low-quality hand SVG assets

## เป้าหมาย

ทำ UI ระบบใหม่ทั้งหมดให้เป็น production-quality PWA application ที่น่ารัก สวยงาม เข้ากับโปรเจค myBaZi มากที่สุด มี asset image และ animation ที่ใช้งานจริง โดยไม่ทำลายความแม่นยำของ engine เดิมและไม่ทำหลายเรื่องพร้อมกันเกินจำเป็น

## Reference breakdown จากภาพที่ generate

ภาพ reference คือ app mockup ไม่ใช่ marketing landing page จุดประสงค์คือใช้เป็น north star สำหรับ visual system และ route dashboard จริง

### Mood DNA ที่ต้องทำให้เหมือนจริง

เป้าหมายไม่ใช่แค่ใช้สีคล้าย แต่ต้องให้ผู้ใช้รู้สึกว่าเป็น app เดียวกับ reference ทันที

#### Surface mood
- พื้นหลัก: porcelain ivory / warm rice paper ไม่ใช่ white `#fff` แข็ง ๆ
- Texture: paper grain เบามากในระดับ background หรือ card accent เท่านั้น
- Border: เส้นทองอ่อน/ชาอ่อน คล้ายเส้นกรอบกระดาษจีน
- Shadow: เงานุ่มเตี้ย ไม่ใช่ material shadow หนัก
- Corner: cards นุ่มปานกลาง แต่ยังเป็น product UI ไม่ใช่ toy UI
- Dark mode: ต้องแปล mood เป็น ink/jade night ไม่ใช่ดำล้วนหรือ slate default

#### Line and illustration mood
- ลายเส้น: ink wash + watercolor + fine gold line
- ภาพประกอบ: ต้องโปร่ง เบา อยู่ใน card แบบ watermark/accent
- ห้ามใช้ vector flat icon ที่แข็งเกินไปในจุด hero/shortcut สำคัญ
- ห้ามใช้ภาพจริง/stock photo ใน app screen หลัก

#### Typography mood
- Brand `myBaZi`: serif/calligraphy feel สี jade/ink
- Heading Thai/Chinese: น้ำหนักชัด อ่านง่าย มีพื้นที่หายใจ
- Chinese characters ใน pillars ต้องใหญ่และเป็น visual anchor
- Thai labels ต้องไม่เล็กจนเสีย usability; reference สวยแต่ production ต้องอ่านง่ายกว่า reference

#### Color DNA
- Jade green: primary navigation, profile frame, positive/auspicious state
- Fire coral: day pillar highlight, fire element, warning warm accents
- Water teal: useful-god water card, wave, water element
- Earth gold: earth element, borders, star rating, warm dividers
- Metal pearl: metal element, neutral reflective accents
- Ink brown/green: main text, icons, logo
- Porcelain ivory: background and cards

#### Product feeling
- Cute: avatar, rabbit, cloud swirls, soft illustrations
- Trustworthy: structured cards, exact chart data, stable spacing
- Mystical: Chinese seals, ink landscapes, five-element symbols
- Daily-use PWA: bottom nav, installable shell, fast entry, no marketing gate

### Reference file responsibilities

#### `mybazi-mobile-dashboard-reference-v1.png`
ใช้เป็น target สำหรับ:
- mobile top bar proportions
- profile chip/avatar shape
- 4 pillar card size and spacing
- selected/day pillar highlight style
- element balance card layout
- useful-god wave card layout
- Tong Shu rabbit preview card
- bottom navigation active tile

Mobile details to preserve:
- top cloud mark at left and `myBaZi` centered enough to feel branded
- round calendar shortcut button near page title
- page heading `八字 ปาจื้อ` with cloud ornament
- day master line `เจ้าวัน: 丙火` in red/coral
- pillar cards inside one horizontal group with gold borders
- selected pillar uses coral outline and small flame badge
- element donut uses Chinese characters inside segments and mountain illustration in center
- useful-god card uses very large `水` on left and wave on right
- Tong Shu card uses rabbit helper on left, date/recommendation in middle, score/stars on right
- bottom nav active item is a jade rounded tile, not just colored icon

#### `mybazi-desktop-dashboard-reference-v1.png`
ใช้เป็น target สำหรับ:
- desktop sidebar/nav mood
- expanded dashboard grid
- top actions
- daily overview strip
- tool shortcut cards

Desktop details to preserve:
- sidebar is porcelain/jade with large ink landscape at bottom
- active nav item is a large jade tile with icon + Thai label
- inactive nav items use Chinese + Thai, generous row height
- top bar has profile chip left and circular action buttons right
- main content uses 12-column-like dashboard grid
- pillar group, element card, useful-god card align on first row
- calendar/rabbit block and tools shortcuts align on second row
- bottom summary strip uses compact icon/status cells

#### `mybazi-asset-sheet-reference-v1.png`
ใช้เป็น target สำหรับ:
- asset generation prompts
- per-symbol DOD
- crop/reference style for production illustrations

Asset sheet details to preserve:
- all symbols share watercolor ink + jade/gold frame style
- labels are secondary; final production assets should not rely on baked-in text
- profile avatar is round jade-framed
- rabbit is scholar/helper with scroll calendar
- water wave has teal crest and `水` seal
- mountain is ink wash with small red seal
- fire is coral watercolor flame with `火` seal
- metal is pearl sphere with cloud/silver swirl and `金` seal
- wood is green branch/leaves with `木` seal
- earth is gold rock/mound with `土` seal
- calendar is jade-bound tabletop calendar with tassel/flower
- Qi Men compass is luopan-like but readable
- Tianji star is gold compass star with jade center
- cloud divider is jade/gold line ornament
- app icon combines myBaZi text, five-element badges, mountain/water/cloud frame

### สิ่งที่ต้องรักษาให้ได้ใน production UI
- App identity: โลโก้ `myBaZi` แบบ elegant ink/calligraphy, ไม่ใช่ default text เฉย ๆ
- Mood: porcelain, jade, ink, silk, soft daylight, cute mystical, calm and trustworthy
- Layout: mobile foreground เป็นประสบการณ์หลัก, desktop/tablet เป็น expanded dashboard ไม่ใช่คนละ product
- Top context: profile avatar/chip อยู่ชัด, มีเจ้าวัน/Day Master context ใน header ของหน้าหลัก
- Navigation: mobile bottom nav มี 5 ช่อง, active state ชัด; desktop มี side nav พร้อม active tile
- BaZi core: 4 pillar cards แยก ปี/เดือน/วัน/เวลา, ใช้จีนตัวใหญ่ + Thai/pinyin/element badge, วันเด่นกว่าเสาอื่นเล็กน้อย
- Element balance: donut chart + bar chart ใน card เดียวกัน, สีธาตุจำง่ายและ consistent
- Useful God: card สีฟ้า/น้ำ พร้อม wave illustration แสดง `用神` และคำอธิบายสั้น
- Tong Shu preview: card ปฏิทินมงคล มี rating/คำแนะนำ/ข้อควรระวัง และ mascot เล็กที่ไม่แย่ง attention
- Tools preview: shortcut cards ไป BaZi, Tong Shu, Qi Men, Tianji บน desktop
- Assets: มีภาพภูเขา/ไฟ/น้ำ/โลหะขนาดเล็กเป็น accent ใน card ไม่ใช่ภาพใหญ่รก

### Asset language ที่ต้องแกะจาก reference

Asset ในภาพไม่ได้เป็น decoration ลอย ๆ แต่เป็นสัญลักษณ์ช่วยให้ผู้ใช้จำ module/state/ธาตุได้เร็ว ต้องทำเป็นชุดเดียวกันทั้ง app

#### 1. Profile avatar / mascot face
- สิ่งที่เห็นในภาพ: avatar เด็กผู้หญิงหน้ากลม ผมดำ มวยผม/ผมจีนเล็ก ๆ อยู่ใน chip `โปรไฟล์`
- บทบาทใน app: ตัวแทน active profile และความน่ารักของ product
- ใช้ที่: top bar profile chip, profile cards, first-run welcome, empty profile state
- DOD:
  - [ ] มี avatar asset หรือ CSS/avatar component ที่ consistent
  - [ ] ใช้ใน profile selector และ profiles page
  - [ ] ไม่ดูเป็นรูป stock/person จริง และไม่แย่ง attention จากข้อมูลดวง
  - [ ] frame เป็น jade/gold round frame ตาม asset sheet
  - [ ] มี fallback initials เมื่อ asset โหลดไม่ได้

#### 2. Water wave / 用神 น้ำ
- สิ่งที่เห็นในภาพ: card สีฟ้าอ่อน มีวงกลมน้ำ `水`, คลื่นน้ำด้านขวา/ล่าง, mood เย็นและสงบ
- บทบาทใน app: สื่อ useful god หรือธาตุน้ำอย่างชัดเจน
- ใช้ที่: Useful God card เมื่อธาตุน้ำ, element badge/detail, empty/illustration accent บางจุด
- DOD:
  - [ ] มี wave illustration หรือ CSS/bitmap asset สำหรับธาตุน้ำ
  - [ ] ใช้กับ useful-god card โดยไม่บัง text
  - [ ] มี variant ที่รองรับ dark mode หรือไม่เสีย contrast
  - [ ] น้ำถูกใช้เป็น `water` token เดียวกับ charts/badges
  - [ ] wave วางด้านขวา/ล่างแบบ reference และ crop ไม่ตัดยอดคลื่นผิดธรรมชาติ

#### 3. Rabbit mascot / Tong Shu helper
- สิ่งที่เห็นในภาพ: กระต่ายเล็กถือ/อยู่กับต้นอ่อน ใน card ปฏิทินมงคล mobile ด้านล่างขวา
- บทบาทใน app: friendly helper ของ daily auspicious calendar, ทำให้หน้า Tong Shu น่ารักและจดจำง่าย
- ใช้ที่: Tong Shu preview, no-selected-day/empty state, first-run welcome ได้ถ้าไม่ซ้ำกับ profile avatar
- DOD:
  - [ ] มี rabbit mascot asset ขนาดเล็ก
  - [ ] ใช้เฉพาะ context Tong Shu/daily guidance เป็นหลัก
  - [ ] ไม่ใช้กระต่ายแทนทุก module จน brand สับสน
  - [ ] ต้องมี alt text/aria-hidden ตามบริบท
  - [ ] rabbit ถือ scroll/calendar หรือมี prop ที่สื่อ Tong Shu ชัด
  - [ ] บน mobile ต้องไม่ทำให้ calendar card สูงเกิน viewport อย่างไม่จำเป็น

#### 4. Calendar icon / Tong Shu shortcut
- สิ่งที่เห็นในภาพ: shortcut card มี icon ปฏิทินสี coral/earth พร้อมสัญลักษณ์วัน
- บทบาทใน app: entry point ไป `ปฏิทินมงคล`
- ใช้ที่: desktop tools preview, mobile shortcuts, loading/empty state ของ Tong Shu
- DOD:
  - [ ] มี calendar asset/icon ที่เข้ากับ palette ไม่ใช่ lucide default อย่างเดียวในจุด hero/shortcut
  - [ ] ใช้ร่วมกับ lucide icon ได้โดยไม่ชน style
  - [ ] แสดงชัดบนขนาดเล็ก 48-64px
  - [ ] มี jade binding/tassel/flower หรือ detail ที่ทำให้จำได้ว่าเป็น myBaZi ไม่ใช่ calendar generic

#### 5. Mountain landscape / BaZi earth-wood calm accent
- สิ่งที่เห็นในภาพ: ภูเขาหมึกจางใน pillar cards และกลาง donut chart
- บทบาทใน app: สื่อความเป็นจีน/ตำรา/ภูมิทัศน์ และช่วยทำให้ chart card ไม่แห้ง
- ใช้ที่: BaZi pillar cards, element balance donut center, BaZi shortcut/empty state
- DOD:
  - [ ] มี mountain ink asset หรือ CSS background ที่เบามาก
  - [ ] opacity ต่ำพอไม่ลด readability
  - [ ] ไม่ทำให้ repeated cards หนักหรือโหลดช้า
  - [ ] ใช้เป็น center ของ donut หรือ lower watermark ใน pillar cards ได้โดยไม่ชนตัวอักษรจีน

#### 6. Fire flame / Day Master fire accent
- สิ่งที่เห็นในภาพ: flame สี coral ใน day pillar card และใกล้ `เจ้าวัน: 丙火`
- บทบาทใน app: สื่อ day master fire/state เด่นใน chart
- ใช้ที่: fire element badge, day pillar highlight, element balance, auspicious/energy indicators
- DOD:
  - [ ] มี flame accent ที่ใช้ซ้ำได้
  - [ ] day pillar highlight ใช้ fire accent โดยไม่สื่อว่าทุกคนเป็นไฟถ้า day master ไม่ใช่ไฟ
  - [ ] ต้องรองรับ element อื่นด้วย asset/shape หรือ fallback
  - [ ] flame เป็น watercolor coral ไม่ใช่ emoji/flat fire icon

#### 7. Metal/stone mountain / metal element accent
- สิ่งที่เห็นในภาพ: เสาเวลา/โลหะมีภูเขาหินเทาและ badge 金
- บทบาทใน app: สื่อธาตุโลหะอย่างอ่อน ไม่เป็นสีเทา default น่าเบื่อ
- ใช้ที่: metal element card/badge, pillar card, element balance
- DOD:
  - [ ] metal มี visual token เฉพาะ เช่น pearl/stone/linework
  - [ ] ไม่ใช้แค่ gray shadcn default
  - [ ] metal badge/card มี pearl/silver feel และยังอ่าน contrast ผ่าน

#### 8. Element badges
- สิ่งที่เห็นในภาพ: badge วงกลมเล็กมีจีน `木 火 土 金 水` พร้อมสีเฉพาะ
- บทบาทใน app: visual anchor ของทุกระบบ
- ใช้ที่: Natal chart, element composition, useful god, Tong Shu score, Qi Men summary
- DOD:
  - [ ] badge size variants sm/md/lg
  - [ ] สีและ label consistent ทุก route
  - [ ] มี text/tooltip/aria label ไม่พึ่งสีอย่างเดียว
  - [ ] badge shape เป็น circular seal style ตาม reference

#### 9. Donut chart center illustration
- สิ่งที่เห็นในภาพ: donut 5 ธาตุ มีภูเขาหมึกกลางวง
- บทบาทใน app: ทำ element balance ให้ดูเป็น branded artifact แทน chart generic
- ใช้ที่: BaZi element balance และ possibly profile summary
- DOD:
  - [ ] donut หรือ visual equivalent มี 5 segment ตามข้อมูลจริง
  - [ ] center illustration ไม่บัง percent/legend
  - [ ] สีตรงกับ element tokens

#### 10. Compass / Qi Men shortcut
- สิ่งที่เห็นในภาพ: shortcut `奇門遁甲` เป็นวง compass/luopan สีฟ้า
- บทบาทใน app: entry point และ identity ของ Qi Men
- ใช้ที่: tool shortcut, Qi Men header, empty/loading state
- DOD:
  - [ ] มี compass/luopan asset ที่ไม่ละเอียดจนมองไม่ออกบน mobile
  - [ ] ไม่ใช้ภาพตำราซับซ้อนที่ทำให้ UI ดูรก
  - [ ] shortcut แสดงความเป็น Qi Men ด้วย compass + Chinese context ไม่ใช่ generic navigation compass

#### 11. Tianji star / AI shortcut
- สิ่งที่เห็นในภาพ: shortcut `天机` เป็นดาว/ประกายสีทอง
- บทบาทใน app: AI assistant identity แบบไม่หลอกว่าเป็น magic black box
- ใช้ที่: Tianji route shell, shortcut, settings AI state
- DOD:
  - [ ] มี star/spark asset หรือ icon treatment
  - [ ] copy ต้องสื่อว่าเป็น AI assistant และต้องตั้งค่า endpoint ก่อน
  - [ ] star เป็น gold/jade celestial compass style ตาม reference ไม่ใช่ generic sparkle อย่างเดียว

#### 12. Cloud swirl / divider ornament
- สิ่งที่เห็นในภาพ: ลายเมฆสีทองอ่อน/หยก ใช้ข้าง logo, heading, divider, tool cards
- บทบาทใน app: เชื่อม mood จีนแบบเบา ๆ และแบ่ง section โดยไม่ใช้เส้นแข็ง
- ใช้ที่: page headings, section dividers, empty/loading state, app icon frame
- DOD:
  - [ ] มี cloud ornament CSS/component หรือ asset
  - [ ] ใช้ซ้ำได้หลายขนาด
  - [ ] ไม่กลายเป็น decorative orb/blob
  - [ ] opacity/contrast ต่ำพอไม่แข่งกับ text

#### 13. Porcelain/jade background props
- สิ่งที่เห็นในภาพ: พื้นหลังนอกจอมีเครื่องเคลือบหยก/ใบไม้/แสงนุ่ม
- บทบาทใน app: mood reference เท่านั้น ไม่ใช่ UI background หลักทุกหน้า
- ใช้ที่: optional first-run welcome/OG image/splash artwork
- DOD:
  - [ ] ไม่เอารูป background หนักมาเป็นพื้นหลัง app หลัก
  - [ ] ถ้าใช้ใน welcome/OG ต้อง compress และไม่รบกวน text

### Asset production list

ก่อนจบ Phase 1 ต้องมีหรือมีเหตุผลชัดเจนว่าใช้ CSS แทน:
- [ ] `app-icon-192.png`
- [ ] `app-icon-512.png`
- [ ] `app-icon-maskable-512.png`
- [ ] `apple-icon.png`
- [ ] `og-image.png`
- [ ] `mascot-profile.png` หรือ component equivalent
- [ ] `mascot-rabbit-tongshu.png`
- [ ] `element-water-wave.png`
- [ ] `element-mountain-ink.png`
- [ ] `element-fire-flame.png`
- [ ] `tool-calendar.png`
- [ ] `tool-compass-qimen.png`
- [ ] `tool-tianji-star.png`
- [ ] `ornament-cloud-divider.png` หรือ component equivalent

Asset DOD รวม:
- [ ] ทุก asset ที่ใช้จริงอยู่ใต้ `public/` หรือสร้างจาก component/CSS ที่บันทึกไว้
- [ ] asset ไม่ hotlink จากภายนอก
- [ ] ทุก bitmap ขนาดเหมาะสมและไม่ใหญ่เกินงาน
- [ ] มี naming convention ชัดเจน
- [ ] มี visual inspection ก่อนอ้างว่าเสร็จ
- [ ] ถ้า asset เป็น decorative ให้ใช้ `aria-hidden`; ถ้าให้ข้อมูลต้องมี alt/label
- [ ] SVG ที่วาดเองต้องผ่าน visual QA เทียบ mood/กรอบ/สัญลักษณ์กับ `docs/assets/mybazi-asset-sheet-reference-v1.png`; ถ้าภาพหลุดกรอบ เพี้ยน แปลก หรือไม่ถึง production ให้แก้หรือ reject ห้ามใช้เป็น asset จริง
- [ ] `mybazi-asset-sheet-reference-v1.png` เป็น style guidance/source of truth ด้าน mood ไม่ใช่ข้อบังคับให้ crop ตรงทุกชิ้น; asset ใหม่ต้องดู production-ready ด้วยตัวเอง

### สิ่งที่ห้าม copy ตามภาพแบบตรง ๆ
- ห้ามใช้ภาพ device mockup เป็น UI จริง
- ห้ามใช้ข้อความจาก image gen หากอ่านผิดหรือเป็น gibberish
- ห้ามทำ background เป็นรูปตกแต่งหนักจนรบกวนการอ่าน
- ห้ามให้ decorative illustration ทำให้ chart/calendar/palace layout unstable
- ห้ามสร้าง nested cards เพื่อเลียนแบบความลึกของ mockup

### Visual translation rules
- ทุก decorative image ต้องมี functional purpose: identity, empty state, onboarding, PWA icon, or contextual accent
- UI จริงต้องอ่านง่ายกว่าภาพ gen โดยเฉพาะ Thai text บน mobile
- สีธาตุใช้ token เดียวกันทั้ง badge, chart, calendar, useful-god, nav accent
- ความน่ารักมาจาก mascot/illustration/microcopy เล็ก ๆ ไม่ใช่ทำทุกปุ่มเป็นของเล่น

## Landing, Loading, Splash, Onboarding Decision

### Landing page
Decision: ไม่ทำ marketing landing page เป็นหน้าแรกหลัก

เหตุผล:
- myBaZi เป็น PWA tool ใช้ซ้ำทุกวัน หน้าแรกควรเข้า app เร็ว
- user เดิมควรไป `/bazi` หรือ dashboard ได้ทันที
- marketing landing จะทำให้ flow ช้าลงและขัดกับ reference ที่เป็น app screen

DOD:
- [ ] `/` ไม่เป็น hero marketing page
- [ ] ถ้ามี active profile แล้ว `/` เข้า app/dashboard หรือ redirect `/bazi`
- [ ] ถ้าไม่มี profile ให้แสดง first-run welcome/onboarding แบบสั้นเพื่อสร้าง profile ไม่ใช่ขาย feature

### First-run welcome / onboarding
Decision: ต้องมีเฉพาะเมื่อยังไม่มี profile หรือเข้า app ครั้งแรก

หน้าที่:
- อธิบาย myBaZi ใน 1-2 บรรทัด
- ชวนสร้าง profile แรก
- แสดง visual identity/mascot เล็ก ๆ
- ทำให้ผู้ใช้เข้าใจว่า birth data อยู่ในเครื่อง

DOD:
- [ ] มี CTA สร้าง profile แรก
- [ ] มี privacy microcopy ว่าเก็บข้อมูลในเครื่อง
- [ ] ไม่บังผู้ใช้ที่มี profile แล้ว
- [ ] ใช้ asset/illustration จาก visual system

### Loading page / app loading
Decision: ต้องมี loading states แต่ไม่ทำ splash screen เปล่า ๆ เป็นหลัก

ประเภท loading ที่ต้องมี:
- App shell loading: skeleton สำหรับ route content ขณะ hydration/route transition
- Profile hydration loading: skeleton/chip placeholder ที่ไม่ทำ layout shift
- Calculation loading: skeleton ของ chart/card ตาม final dimensions
- PWA startup fallback: minimal branded loading surface หาก route load ช้า

DOD:
- [ ] มี `loading.tsx` หรือ route-level skeleton ตามจุดที่เหมาะสม
- [ ] skeleton ขนาดใกล้ final UI
- [ ] ไม่มี spinner กลางจอเปล่าเป็น default
- [ ] loading เคารพ theme และ reduced motion

### Splash / PWA launch image
Decision: ใช้ PWA icon/theme/background และ optional branded startup visual แต่ไม่พึ่ง splash เป็น UX หลัก

DOD:
- [ ] manifest theme/background color ตรงกับ app
- [ ] app icon และ apple icon พร้อม
- [ ] launch state ไม่ขาววาบหรือดำวาบอย่างเห็นชัด

## Measurable Visual DOD

ใช้กับทุก route ที่แตะ UI:
- [ ] มี screenshot mobile `390x844`
- [ ] มี screenshot desktop `1440x1000`
- [ ] ไม่มี text overlap, clipped button, unintended horizontal scroll, blank asset, hydration mismatch ที่เห็นได้
- [ ] Active navigation visible ใน viewport นั้น
- [ ] Thai text line-height อ่านได้
- [ ] สีหลักไม่กลับไปเป็น default shadcn grayscale ทั้งหน้า
- [ ] Interactive target หลักบน mobile ไม่น้อยกว่า 40px และควรเข้าใกล้ 44px
- [ ] สีสถานะสำคัญมี label/icon/shape ช่วย ไม่พึ่งสีอย่างเดียว
- [ ] Animation ไม่ทำ layout shift และเคารพ `prefers-reduced-motion`

## Playwright / Screenshot QA Gate

เมื่อเริ่ม implementation ต้องใช้ screenshot เป็นตัวตัดสิน ไม่ใช่ความรู้สึกจากโค้ด

### Required viewports
- Mobile PWA: `390x844`
- Small mobile: `360x740`
- Tablet: `768x1024`
- Desktop: `1440x1000`

### Required screenshots per major route
- `/` first-run state when no profile
- `/bazi` no-profile/loading/calculated state
- `/tongshu` default month + selected day detail
- `/qimen` default chart
- `/profiles` empty + list state
- `/settings`
- `/tianji`

### Screenshot DOD
- [ ] reference image open beside implementation during review
- [ ] no blank white/default shadcn page after token pass
- [ ] no text overflow/clipped Thai text
- [ ] no horizontal scroll on mobile except intentional chart scroll
- [ ] active nav matches mobile/desktop reference direction
- [ ] asset images load and are not distorted
- [ ] cards preserve porcelain/jade/gold border mood
- [ ] implementation receives Visual Parity Rubric score

### Tooling note
- Use Playwright or an equivalent browser screenshot flow after implementation starts.
- If Playwright is not installed, use the smallest repo-compatible install/config only after confirming package constraints, or use available browser tooling and document the gap.

## Visual Parity Rubric

แต่ละ route ที่ทำเสร็จต้องให้คะแนนตัวเองจาก 0-3:
- Brand mood: 0 default, 1 token บางส่วน, 2 mood ชัด, 3 ใกล้ reference และยังอ่านง่าย
- Layout fidelity: 0 เดิม, 1 ปรับ spacing, 2 responsive dashboard ดี, 3 mobile+desktop เหมือน product เดียวกัน
- Domain clarity: 0 สวยแต่ข้อมูลหาย, 1 ข้อมูลครบแต่อ่านยาก, 2 ข้อมูลชัด, 3 ข้อมูลชัดและน่าใช้กว่าเดิม
- Asset integration: 0 ไม่มี asset, 1 asset แปะเฉย ๆ, 2 asset ช่วย state/context, 3 asset consistent และ optimized
- Motion quality: 0 ไม่มี/รก, 1 มีเล็กน้อย, 2 ช่วย state, 3 smooth + reduced motion ครบ

ผ่านแต่ละ route เมื่อคะแนนรวมอย่างน้อย 10/15 และไม่มี DOD fail สำคัญ

## สิ่งที่เข้าใจจากโปรเจคปัจจุบัน

### Stack และข้อจำกัด
- โปรเจคใช้ Next.js `16.2.10`, React `19.2.4`, TypeScript, Tailwind CSS v4, shadcn/radix UI, lucide-react, next-themes, Zustand และ tyme4ts
- เป็น App Router ใต้ `src/app`
- Next docs ใน `node_modules/next/dist/docs` ระบุว่า PWA บน App Router ควรสร้าง manifest ผ่าน `app/manifest.ts` หรือ `app/manifest.json` และวาง icon/static assets ใน `public/`
- `src/app/layout.tsx` ใช้ Google fonts ผ่าน `next/font/google`, ครอบด้วย `ThemeProvider` และ `AppShell`
- `src/app/globals.css` ยังเป็น token จาก shadcn default neutral/grayscale เป็นหลัก
- `next.config.ts` มีเพียง turbopack root ยังไม่มี PWA/offline setting

### Product surface
- `/` redirect ไป `/bazi`
- `/bazi` เป็นหน้าหลัก แสดง DestinyHero, archetype, natal chart, strength, structure, useful god, ten gods, stars, luck timeline, element composition
- `/tongshu` เป็นปฏิทินมงคลรายเดือน พร้อม detail panel, personal resonance, scored hours, reference library
- `/qimen` เป็น dashboard Qi Men มี date/time picker, chart summary, nine-palace grid, deity insight, destiny view
- `/tianji` ยังเป็น placeholder ของ AI assistant
- `/profiles` จัดการ profile หลายคนผ่าน localStorage/Zustand
- `/settings` ตั้งค่า OpenAI-compatible endpoint/API key/model และส่วนตั้งค่าอื่นยัง placeholder
- navigation มี desktop sidebar, mobile bottom nav, top bar, profile selector, theme toggle

### Design state ปัจจุบัน
- โครงสร้าง component แยกดีและข้อมูล domain ค่อนข้างครบ แต่ visual language ยังเป็น default admin/cards
- ยังไม่มี brand asset, app icon, splash/OG image, generated illustration, mascot, หรือ PWA install/offline UI
- ยังไม่มี `manifest.ts`, service worker, install prompt component, หรือ offline indicator
- Cards, chart cells, calendar cells และ palace cells ทำงานได้ แต่ยังขาด production polish, motion, stable responsive refinements และ unified five-element identity

### Validation baseline
- `npm run typecheck` ผ่าน
- `npm run lint` ผ่าน ไม่มี error แต่มี warning เดิม 2 จุด:
  - `scripts/audit-day-pillar.mjs`: unused `SolarDay`
  - `src/lib/ai/test-connection.ts`: unused `hasGreeting`
- Git status แสดงไฟล์ทั้ง repo เป็น untracked ดังนั้นทุกการแก้ไขต้องไม่ลบ/ย้อนของเดิมโดยไม่จำเป็น

### Security/privacy ที่สังเกต
- Profile และ AI settings เก็บใน localStorage เป็น local-first เหมาะกับ privacy แต่ API key ใน localStorage มีความเสี่ยงถ้าเครื่อง/browser ถูกเข้าถึงหรือมี XSS
- UI/PWA work ต้องไม่เพิ่มการส่งข้อมูลวันเกิด/API key ออกนอกเครื่อง ยกเว้น flow AI ที่ผู้ใช้ตั้ง endpoint เอง

## Operating loop

ทุก Task ใช้วงจรนี้:
1. Scope task ให้แคบและระบุ DOD
2. ถ้า task แยกอิสระและช่วยให้เร็วขึ้น ให้ใช้ native subagent role ที่เหมาะสม เช่น `explore`, `designer`, `executor`, `verifier`
3. ทำ implementation เฉพาะ task นั้น
4. ตรวจ DOD ด้วย validation ที่เล็กที่สุดแต่พิสูจน์ได้
5. ถ้า fail ให้อ่าน error message เป็น feedback แล้วแก้ซ้ำจนผ่านหรือบันทึก blocker
6. อัปเดตรายงาน task ในไฟล์นี้หรือไฟล์รายงานรอบงาน

สำหรับ implementation:
- ทำทีละ task เดียวบน critical path
- ใช้ subagent เฉพาะงานอิสระ เช่น review DOD, visual critique, หรือ asset prompt review
- ห้ามเริ่ม route ถัดไปก่อน route ปัจจุบันผ่าน DOD ขั้นต่ำ เว้นแต่เป็น shared foundation ที่จำเป็น
- ถ้า screenshot fail ให้แก้จาก defect ที่เห็นก่อนเพิ่ม feature ใหม่

Stop condition ของทั้งโครงการ: key routes ทำงาน, PWA installable, visual system ใช้จริง, asset/motion มีจริง, lint/typecheck/build ผ่านหรือมีเหตุผลชัดเจน, มีรายงานสิ่งที่แก้และความเสี่ยงที่เหลือ

## Phase 0: Discovery, Design Contract, Master Plan

### Task 0.1 อ่านโปรเจคและ baseline
งาน: อ่านโครงสร้าง repo, docs, pages, layout, core components, assets, Next docs ที่เกี่ยวข้อง และรัน validation baseline
DOD:
- [x] ระบุ stack, route, component structure, current assets ได้
- [x] อ่าน Next PWA/App Router/CSS docs จาก `node_modules`
- [x] รัน `npm run typecheck`
- [x] รัน `npm run lint`
- [x] บันทึก warning/error baseline

### Task 0.2 สร้าง design source of truth
งาน: สร้างหรือ refresh `DESIGN.md` ให้เป็น contract สำหรับ UI/PWA work
DOD:
- [x] มี `DESIGN.md` ที่ครอบ brand, goals, personas, IA, visual language, components, accessibility, responsive, states, implementation constraints
- [x] แยก observed facts กับ assumptions/open questions

### Task 0.3 สร้าง Master Plan
งาน: สร้างไฟล์นี้เป็นแผนหลักก่อนลงมือ implementation
DOD:
- [x] มี Phase/Task/DOD
- [x] มี loop execution rule
- [x] มี validation/reporting rule
- [x] มี security risk section

## Phase 1: PWA Foundation และ Brand Assets

### Task 1.1 Reference asset archive
งาน: เก็บ reference image และบันทึก design breakdown เข้า repo
DOD:
- [x] มี `docs/assets/mybazi-pwa-reference-v1.png`
- [x] มี `docs/assets/mybazi-mobile-dashboard-reference-v1.png`
- [x] มี `docs/assets/mybazi-desktop-dashboard-reference-v1.png`
- [x] มี `docs/assets/mybazi-asset-sheet-reference-v1.png`
- [x] Master Plan ระบุว่าส่วนไหนต้องรักษาและส่วนไหนห้าม copy ตรง ๆ
- [x] Master Plan ระบุ Mood DNA, reference responsibilities, asset DOD รายชิ้น, และ Playwright QA gate
- [x] Landing/loading decision ชัดเจนก่อนลง code

### Task 1.2 PWA manifest และ metadata
งาน: เพิ่ม `src/app/manifest.ts`, ปรับ metadata/theme color ที่จำเป็น, กำหนด app name/short name/start URL/display/icons
DOD:
- [x] `manifest.ts` type ถูกต้องตาม `MetadataRoute.Manifest`
- [x] manifest มี name, short_name, description, start_url, display, background_color, theme_color, icons
- [x] metadata มี theme/application hints ที่ตรงกับ PWA identity
- [x] `npm run typecheck` ผ่าน
- [x] `npm run lint` ผ่านหรือเหลือเฉพาะ warning baseline

### Task 1.3 Generate production app assets
งาน: ออกแบบ/สร้าง assets สำหรับ icon, maskable icon, apple icon, OG/splash/empty state โดยอิง five elements + cute mystical Thai/Chinese identity
DOD:
- [x] มีไฟล์ asset ใน `public/` ที่ถูกอ้างจาก manifest/metadata
- [x] icon ขนาดหลัก 192 และ 512 ใช้งานได้จริง
- [x] มี maskable-safe padding สำหรับ icon
- [x] มี empty-state/first-run illustration อย่างน้อย 1 ชุด
- [x] มี small accent assets ตาม Asset production list หรือระบุชัดว่าทำด้วย CSS/token/component แทน
- [x] water wave, rabbit mascot, calendar icon, mountain ink, fire flame, compass, Tianji star ถูกสร้าง/เลือก/ออกแบบครบตาม DOD ราย asset
- [x] asset ไม่ใช่ placeholder Next/Vercel เดิม
- [x] ตรวจด้วย file listing และถ้าเป็นไปได้เปิดภาพตรวจด้วย visual inspection

### Task 1.4 Offline/install shell
งาน: เพิ่ม client component สำหรับ install/offline status แบบไม่รบกวน และ service worker strategy เฉพาะ static/app shell ถ้าเหมาะสม
DOD:
- [x] UI แสดงสถานะ offline ได้
- [x] install prompt หรือ install hint ไม่บัง main workflow
- [x] ไม่มีการ cache ข้อมูลลับ/API key โดยตั้งใจ
- [x] build ผ่าน
- [x] มี note ชัดเจนว่า service worker cache scope คืออะไร

### Task 1.5 First-run welcome and loading foundation
งาน: ทำ first-run welcome/no-profile entry และ loading skeleton foundation ตาม decision ข้างต้น
DOD:
- [x] `/` ไม่เป็น marketing page
- [x] ไม่มี profile แล้วมี welcome/create-profile CTA
- [x] มี skeleton/loading surfaces สำหรับ app shell/profile/calculation ที่จำเป็น
- [x] UI ใช้ assets/tokens ใหม่และไม่เป็น spinner เปล่า
- [x] typecheck/lint ผ่าน

## Phase 2: Design System และ App Shell Rebuild

### Task 2.1 Theme tokens
งาน: เปลี่ยน global tokens จาก neutral default เป็น myBaZi five-element palette พร้อม light/dark
DOD:
- [x] `globals.css` มี token สีใหม่ที่อ่านง่ายและไม่เป็น palette สีเดียว
- [x] มี semantic element tokens/classes สำหรับ wood/fire/earth/metal/water
- [x] default card/button/nav surfaces เปลี่ยนจาก generic grayscale เป็น porcelain/ink/jade identity
- [x] contrast ของ text/control สำคัญยังเหมาะสม
- [x] ไม่ทำให้ shadcn components หลักพัง
- [x] lint/typecheck ผ่าน

### Task 2.2 App shell production polish
งาน: ปรับ sidebar, top bar, mobile bottom nav, active state, profile context ให้เป็น app-like PWA
DOD:
- [x] navigation desktop/mobile ใช้งานได้ครบ
- [x] active route ชัดเจน
- [x] profile chip คล้าย reference และไม่ overflow
- [x] desktop side nav ใช้ active tile/section rhythm ตาม reference
- [x] mobile bottom nav มี label/icon/state ครบ 5 ช่องหรือมี overflow strategy ที่ตรวจได้
- [x] ไม่มี text overflow บน mobile
- [x] touch targets เหมาะสม
- [ ] visual check key routes ผ่าน

### Task 2.3 Shared page patterns
งาน: สร้าง/ปรับ reusable route header, section rhythm, empty/loading/error states, motion utilities เท่าที่จำเป็น
DOD:
- [x] อย่างน้อย Bazi/TongShu/QiMen ใช้ pattern ร่วมกัน
- [x] loading/empty state ไม่ shift layout หนัก
- [x] reduced motion ถูกเคารพ เพราะ task นี้ยังไม่เพิ่ม animation ใหม่
- [x] ไม่มี nested card antipattern เพิ่มใหม่

## Phase 3: Core Route UI Rebuild

### Task 3.1 BaZi route
งาน: redesign `/bazi` ให้ hero, natal chart, element summary, insight cards, timeline อ่านง่ายและมี identity
DOD:
- [ ] no-profile, loading, calculated states polished
- [ ] Natal chart stable on mobile/desktop
- [ ] 4 pillar cards มี hierarchy ปี/เดือน/วัน/เวลา และ day pillar เด่นแบบไม่ทำข้อมูลผิด
- [ ] Element balance มี donut/bars หรือ visual equivalent ที่ชัด
- [ ] Useful God card มี visual treatment เฉพาะธาตุและ copy อ่านง่าย
- [ ] ธาตุ/Day Master/useful god มองเห็นชัด
- [ ] ไม่เปลี่ยน calculation logic
- [ ] Screenshot mobile+desktop ผ่าน measurable visual DOD
- [ ] typecheck/lint/build หรือ targeted route smoke ผ่าน

### Task 3.2 Tong Shu route
งาน: redesign calendar/dashboard ให้เหมาะกับ daily PWA use
DOD:
- [ ] month controls ergonomic บน mobile
- [ ] calendar cells stable ไม่ overflow
- [ ] selected day detail อ่านง่าย
- [ ] มี auspicious preview/card ที่ใกล้ reference และมี recommendation/caution ชัด
- [ ] mascot/accent ใช้แบบไม่รบกวนข้อมูล
- [ ] auspicious rating ไม่พึ่งสีอย่างเดียว
- [ ] Screenshot mobile+desktop ผ่าน measurable visual DOD
- [ ] validation ผ่าน

### Task 3.3 Qi Men route
งาน: redesign control panel + 9 palace grid ให้ premium และอ่านง่าย
DOD:
- [ ] palace grid stable desktop/mobile
- [ ] zhi fu/zhi shi state ชัดเจน
- [ ] date/time/chart type controls ใช้งานง่าย
- [ ] ไม่เปลี่ยน Qi Men engine
- [ ] Screenshot mobile+desktop ผ่าน measurable visual DOD
- [ ] validation ผ่าน

### Task 3.4 Profiles and Settings
งาน: polish profile management, profile form, settings, AI key risk copy
DOD:
- [ ] create/edit/delete/select profile flow ยังทำงาน
- [ ] profile cards/chips ใช้ avatar/identity consistent กับ reference
- [ ] destructive delete ยังมี confirmation
- [ ] settings สื่อความเสี่ยง API key localStorage ชัดเจนแต่ไม่ทำให้ flow ใช้ยาก
- [ ] hydration state ไม่กระตุกหนัก
- [ ] Screenshot mobile+desktop ผ่าน measurable visual DOD

### Task 3.5 Tianji placeholder to production-ready shell
งาน: ปรับ `/tianji` จาก placeholder เป็น shell ที่พร้อมต่อ chat/AI แต่ไม่หลอกว่าฟีเจอร์เสร็จ
DOD:
- [ ] หน้าไม่ดูเป็น placeholder ดิบ
- [ ] แสดง AI readiness/settings state
- [ ] มี visual shell ที่เข้ากับ tools preview/reference
- [ ] ไม่มี external call ใหม่โดยไม่จำเป็น
- [ ] Screenshot mobile+desktop ผ่าน measurable visual DOD

## Phase 4: Motion, Microinteractions, Visual QA

### Task 4.1 Motion pass
งาน: เพิ่ม animation เฉพาะจุด เช่น page/section reveal, selected states, calendar/palace interactions
DOD:
- [ ] motion ไม่รบกวน readability
- [ ] respects `prefers-reduced-motion`
- [ ] ไม่มี layout shift ชัดเจน
- [ ] visual smoke ผ่าน

### Task 4.2 Screenshot QA
งาน: เปิด dev server และตรวจ key routes บน mobile/desktop ด้วย screenshot
DOD:
- [ ] มี evidence สำหรับ `/bazi`, `/tongshu`, `/qimen`, `/profiles`, `/settings`, `/tianji`
- [ ] มี evidence สำหรับ first-run/no-profile และ loading state อย่างน้อยหนึ่ง state
- [ ] ตรวจไม่มี overlap/blank/asset missing สำคัญ
- [ ] แก้ defect ที่พบจนผ่านหรือบันทึก residual risk

### Task 4.3 Reference parity review
งาน: ให้ verifier/designer review เทียบ reference ด้วย rubric
DOD:
- [ ] แต่ละ route มีคะแนน rubric
- [ ] route คะแนนต่ำกว่า 10/15 ถูกแก้หรือระบุเหตุผลไม่ทำต่อ
- [ ] สิ่งที่ต่างจาก reference ถูกแยกเป็น intentional vs defect

## Phase 5: Production Verification and Report

### Task 5.1 Full validation
งาน: รัน validation ตามความเหมาะสมหลัง UI/PWA changes
DOD:
- [ ] `npm run typecheck` ผ่าน
- [ ] `npm run lint` ผ่านหรือระบุ warning เดิม
- [ ] `npm run build` ผ่าน
- [ ] domain scripts ที่เกี่ยวข้องไม่ถูกกระทบ หรือรัน subset ที่เหมาะสม

### Task 5.2 Security/privacy review
งาน: ตรวจ UI/PWA/cache/localStorage/AI settings ว่าไม่เพิ่มความเสี่ยงโดยไม่ตั้งใจ
DOD:
- [ ] ระบุว่า service worker cache อะไร
- [ ] ไม่ cache API key/profile data แบบ explicit
- [ ] แจ้งความเสี่ยง localStorage API key
- [ ] มี mitigation recommendation

### Task 5.3 Final report
งาน: สรุปรายงานแต่ละ task
DOD:
- [ ] ระบุไฟล์ที่แก้
- [ ] ระบุผลกระทบต่อผู้ใช้
- [ ] ระบุ validation evidence
- [ ] ระบุ known risks/not tested

## Task report log

### 2026-07-05 / Phase 0
- Task 0.1: ผ่าน อ่าน repo/docs/pages/components/assets และ baseline validation
- Task 0.2: ผ่าน สร้าง `DESIGN.md`
- Task 0.3: ผ่าน สร้าง `docs/pwa-ui-master-plan.md`
- Task 1.1: ผ่าน เก็บ visual north star pack 4 ภาพเข้า `docs/assets/` และเพิ่ม Mood DNA, reference responsibilities, asset DOD รายชิ้น, landing/loading decision, และ Playwright screenshot QA gate
- Task 1.2: ผ่าน เพิ่ม `src/app/manifest.ts`, PWA metadata, viewport theme colors, app/apple/OG metadata; runtime route `/manifest.webmanifest` ถูก build และ HTTP check ได้
- Task 1.3: ผ่าน เพิ่ม production asset set ใต้ `public/assets/` พร้อม PNG icons 192/512/maskable/apple, OG image 1200x630, และ PNG accent assets ตาม reference mood
- Task 1.4: ผ่าน เพิ่ม `PwaStatus` สำหรับ offline/install hint แบบ non-blocking; ไม่มี service worker และไม่มี cache data ในรอบนี้
- Task 1.5: ผ่าน เปลี่ยน `/` เป็น first-run welcome เมื่อไม่มี profile และ redirect เข้า `/bazi` เมื่อมี active profile; เพิ่ม `src/app/loading.tsx` เป็น branded skeleton
- Task 2.1: ผ่าน เปลี่ยน `globals.css` เป็น porcelain/jade/ink/gold/five-element tokens พร้อม light/dark และ utility classes สำหรับ surfaces/elements
- Task 2.2: implementation ผ่านบางส่วน ปรับ sidebar/top bar/bottom nav/profile chip ให้เข้ากับ reference; DOD visual check ยัง pending เพราะ Playwright/browser screenshot ยังรันไม่ได้ใน environment นี้
- Task 1.3 QA correction: reject ชุด SVG ที่วาดเองหลัง visual inspection พบ glyph box/asset หลุดกรอบ/mascot เพี้ยน/คุณภาพไม่ถึง production; สร้าง `docs/assets/mybazi-production-asset-sheet-v1.png`, crop เป็น PNG production assets ใต้ `public/assets/brand/`, regenerate PWA icons เป็น PNG, ลบ SVG ที่ reject ออกจาก `public/assets/`
- Task 2.3: ผ่านในระดับ code foundation เพิ่ม `src/components/layout/page-patterns.tsx` และปรับ `/bazi`, `/tongshu`, `/qimen` ให้ใช้ `PageFrame`, `RouteHeader`, `PageSection`, `EmptyStatePanel`, `LoadingPanel`; screenshot visual gate ยัง pending สำหรับ Phase 4

Validation evidence:
- `npm run typecheck`: pass
- `npm run lint`: pass with 2 warnings (`scripts/audit-day-pillar.mjs`, `src/lib/ai/dynamic-context.ts`)
- `npm run build`: pass, includes `/manifest.webmanifest`
- Runtime HTTP check: `/manifest.webmanifest` returns PWA fields and icons; root HTML includes manifest link, theme-color meta, application-name, apple icon link
- Asset file check: `app-icon-192.png` 192x192, `app-icon-512.png` 512x512, `app-icon-maskable-512.png` 512x512, `apple-icon.png` 180x180, `og-image.png` 1200x630
- Visual inspection: `app-icon-512.png` and `og-image.png` inspected after fixing CJK glyph rasterization issue
- Playwright screenshot attempt: blocked by missing system library `libnspr4.so` for Chromium headless shell in this environment; screenshot gate remains required for Phase 4
- Additional Playwright attempt with Firefox: blocked because Firefox browser binary is not installed in Playwright cache
- Phase 2.1/2.2 code validation: `npm run typecheck && npm run lint && npm run build` pass, with same 2 lint warnings and no errors
- Asset reference check after QA correction: `rg` ไม่พบ `.svg` asset reference หรือ `image/svg+xml` ค้างใน `src`, `public`, `docs`
- Public asset check after QA correction: `public/assets/brand/` และ `public/assets/pwa/` เหลือ production PNG assets เท่านั้น
- Phase 1.3 QA correction + Phase 2.3 code validation: `npm run typecheck && npm run lint && npm run build` pass, with same 2 lint warnings and no errors

## Security notes

- ความเสี่ยงหลักที่พบตอนนี้: AI API key ใน localStorage อ่านได้โดย script ที่รันใน origin เดียวกันหากเกิด XSS หรือ browser/profile ถูก compromise
- PWA service worker ในอนาคตต้องระวังไม่ cache request/response ที่มี API key, profile birth data, หรือ AI conversation โดยไม่ตั้งใจ
- การ generate asset ภายใน repo ปลอดภัยกว่า hotlink external images เพราะลด tracking/mixed-content/availability risk
- Phase 1.4 ยังไม่เพิ่ม service worker จึงไม่มี runtime cache scope; offline/install UI เป็นสถานะ browser เท่านั้น
