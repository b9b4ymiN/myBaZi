// Self-healing Service Worker — ทำความสะอาด SW เก่าที่ค้างใน browser
//
// myBaZi ไม่ได้ใช้ Service Worker อย่างเป็นทางการ แต่มี SW เก่าค้างอยู่ใน
// browser ของผู้ใช้บางคน (จากการทดลองก่อนหน้า) ทำให้ intercept request แล้ว
// เกิด ERR_FAILED เข้าเว็บไม่ได้ ไฟล์นี้แก้โดย:
//   1. browser ที่ค้าง SW จะ fetch /sw.js → ได้ script นี้
//   2. install → skipWaiting (activate ทันที ไม่รอ)
//   3. activate → ลบ cache ทั้งหมด + unregister ตัวเอง + reload หน้าที่เปิดอยู่
//   4. หลัง unregister browser จะเลิก fetch /sw.js → ทำงานครั้งเดียวแล้วจบ
//
// ถ้าอนาคตต้องการ SW จริง (PWA) ให้แทนที่ไฟล์นี้ด้วย SW จริง + เพิ่ม registration

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })()
  );
});
